import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { AuditLayer } from '../../common/enums/audit-layer.enum';
import {
  AuditContextService,
  AuditStore,
} from '../services/audit-context.service';
import { AuditLogService } from '../services/audit-log.service';
import { redactForAudit } from '../helpers/audit-serialize.helper';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const READ_METHOD = 'GET';
const USER_AGENT_MAX = 2000;
const PATH_MAX = 2048;
const IP_MAX = 64;

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);
  private readonly auditReadRequests: boolean;

  constructor(
    configService: ConfigService,
    private readonly auditContext: AuditContextService,
    private readonly auditLogService: AuditLogService,
  ) {
    this.auditReadRequests =
      configService.get<string>('AUDIT_LOG_READ_REQUESTS') === 'true';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const method = (req.method || '').toUpperCase();

    const shouldAuditReadMethod =
      this.auditReadRequests && method === READ_METHOD;
    if (!MUTATING_METHODS.has(method) && !shouldAuditReadMethod) {
      return next.handle();
    }

    const store = this.buildStore(req, method);

    // Wrap the downstream subscription in the AsyncLocalStorage run() so the
    // TypeORM subscriber and any nested async work inherit the request store.
    return new Observable((subscriber) => {
      let didFinalize = false;
      const finalize = (
        status: number,
        commit: boolean,
        context: {
          errorName?: string;
        } = {},
      ) => {
        if (didFinalize) return;
        didFinalize = true;
        if (!commit) {
          // Failed request — drop any pending entity rows but still record the HTTP row.
          store.pendingRows = [];
        }
        this.flush(store, status, {
          responseSize: this.responseSize(res),
          errorName: context.errorName ?? null,
        }).catch((err) =>
          this.logger.error('audit flush failed', err as Error),
        );
      };

      const inner = this.auditContext.run(store, () => next.handle());
      const subscription = inner.subscribe({
        next: (value) => {
          // Capture userId set by downstream (e.g. auth flows that issue a session).
          const latest = this.auditContext.get();
          if (latest?.userId && !store.userId) store.userId = latest.userId;
          subscriber.next(value);
        },
        error: (err) => {
          finalize(
            res.statusCode && res.statusCode >= 400 ? res.statusCode : 500,
            false,
            {
              errorName: err instanceof Error ? err.name : undefined,
            },
          );
          subscriber.error(err);
        },
        complete: () => {
          finalize(res.statusCode || 200, true);
          subscriber.complete();
        },
      });
      return () => subscription.unsubscribe();
    });
  }

  private buildStore(req: Request, method: string): AuditStore {
    const correlationId =
      (req.headers['x-request-id'] as string) ||
      (req.headers['x-correlation-id'] as string) ||
      randomUUID();

    const path = (req.originalUrl || req.url || '')
      .split('?')[0]
      .slice(0, PATH_MAX);
    const userAgent =
      req.headers['user-agent']?.slice(0, USER_AGENT_MAX) ?? null;
    const ip = this.clientIp(req)?.slice(0, IP_MAX) ?? null;
    const body = req.body as unknown;
    const rawBody = body && typeof body === 'object' ? body : null;
    const bodySnapshot = rawBody
      ? (redactForAudit(rawBody) as Record<string, unknown>)
      : null;
    const query = req.query as unknown;
    const querySnapshot =
      query && typeof query === 'object'
        ? (redactForAudit(query) as Record<string, unknown>)
        : null;

    const existingUser = (
      req as Request & {
        user?: { sub?: string; tenantId?: string };
      }
    ).user;

    return {
      correlationId,
      userId: existingUser?.sub ?? null,
      tenantId: existingUser?.tenantId ?? null,
      ip,
      userAgent,
      httpMethod: method,
      httpPath: path,
      startedAt: Date.now(),
      bodySnapshot,
      querySnapshot,
      pendingRows: [],
      currentOperation: null,
    };
  }

  private clientIp(req: Request): string | undefined {
    const xf = req.headers['x-forwarded-for'];
    const fromForwarded =
      typeof xf === 'string'
        ? xf.split(',')[0]?.trim()
        : Array.isArray(xf)
          ? xf[0]
          : undefined;
    return fromForwarded || req.socket?.remoteAddress || undefined;
  }

  private responseSize(res: Response): number | null {
    const rawContentLength = res.getHeader('content-length');
    if (typeof rawContentLength !== 'string') return null;
    const parsed = Number(rawContentLength);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private async flush(
    store: AuditStore,
    status: number,
    responseContext: {
      responseSize: number | null;
      errorName: string | null;
    },
  ): Promise<void> {
    const durationMs = Date.now() - store.startedAt;
    const rows = store.pendingRows;
    const responseMetadata = {
      responseSize: responseContext.responseSize,
      errorName: responseContext.errorName,
    };

    const base = {
      correlationId: store.correlationId,
      httpMethod: store.httpMethod,
      httpPath: store.httpPath,
      httpStatus: status,
      durationMs,
      ip: store.ip,
      userAgent: store.userAgent,
      bodySnapshot: store.bodySnapshot,
      querySnapshot: store.querySnapshot,
      createdById: store.userId,
    };

    if (rows.length === 0) {
      await this.auditLogService.persist({
        ...base,
        action: AuditAction.HTTP,
        layer: AuditLayer.CONTROLLER,
        entityType: null,
        entityId: null,
        oldValues: null,
        newValues: null,
        operation: null,
        tenantId: store.tenantId,
        metadata: responseMetadata,
      });
      return;
    }

    await this.auditLogService.persistMany(
      rows.map((row) => ({
        ...base,
        action: row.action,
        layer: row.layer,
        entityType: row.entityType,
        entityId: row.entityId,
        oldValues: row.oldValues,
        newValues: row.newValues,
        operation: row.operation ?? null,
        tenantId: row.tenantId ?? store.tenantId,
        metadata: {
          ...responseMetadata,
          ...(row.metadata ?? {}),
        },
      })),
    );
  }
}
