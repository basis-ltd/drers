import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { AuditLayer } from '../../common/enums/audit-layer.enum';

function toOptionalStringArray(value: unknown): string[] | undefined {
  const asString = (input: unknown): string => {
    if (typeof input === 'string') return input;
    const json = JSON.stringify(input);
    return json ?? '';
  };

  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) =>
      asString(entry)
        .split(',')
        .map((segment) => segment.trim())
        .filter(Boolean),
    );
  }
  return asString(value)
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export enum AuditSortBy {
  CREATED_AT = 'createdAt',
  DURATION_MS = 'durationMs',
  HTTP_STATUS = 'httpStatus',
}

export enum AuditSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class AuditLogQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  size?: number = 20;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @Transform(({ value }) => toOptionalStringArray(value))
  @IsArray()
  @IsEnum(AuditAction, { each: true })
  actions?: AuditAction[];

  @IsOptional()
  @IsUUID()
  createdById?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsString()
  correlationId?: string;

  @IsOptional()
  @IsEnum(AuditLayer)
  layer?: AuditLayer;

  @IsOptional()
  @IsString()
  operation?: string;

  @IsOptional()
  @IsString()
  httpMethod?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  @Max(599)
  httpStatus?: number;

  @IsOptional()
  @IsString()
  pathPrefix?: string;

  @IsOptional()
  @Transform(({ value }) => toOptionalStringArray(value))
  @IsArray()
  @IsString({ each: true })
  entityTypes?: string[];

  @IsOptional()
  @IsEnum(AuditSortBy)
  sortBy?: AuditSortBy = AuditSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(AuditSortOrder)
  sortOrder?: AuditSortOrder = AuditSortOrder.DESC;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100)
  top?: number = 10;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
