import { AuditLayer } from '../../common/enums/audit-layer.enum';
import { AuditContextService } from '../services/audit-context.service';

export interface AuditOptions {
  operation: string;
}

/**
 * Tags a service method with a business-operation name. Any audit rows
 * emitted by the TypeORM subscriber while this method runs will be labelled
 * with `layer = SERVICE` and `operation = options.operation`.
 *
 * Requires the containing class to have `auditContext: AuditContextService`
 * injected (the decorator reads it off `this`).
 */
export function Audit(options: AuditOptions): MethodDecorator {
  return (_target, _propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      const ctx = (this as { auditContext?: AuditContextService })
        ?.auditContext;
      if (!ctx) return original.apply(this, args);
      const previous = ctx.get()?.currentOperation ?? null;
      ctx.setOperation(options.operation);
      try {
        const result = await original.apply(this, args);
        const store = ctx.get();
        if (store) {
          for (const row of store.pendingRows) {
            if (!row.operation) {
              row.operation = options.operation;
              row.layer = AuditLayer.SERVICE;
            }
          }
        }
        return result;
      } finally {
        ctx.setOperation(previous);
      }
    };
    return descriptor;
  };
}
