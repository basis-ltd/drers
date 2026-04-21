import 'reflect-metadata';

export const AUDITABLE_METADATA_KEY = 'audit:enabled';

export interface AuditableOptions {
  entityType?: string;
}

export function Auditable(options: AuditableOptions = {}): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(AUDITABLE_METADATA_KEY, true, target);
    if (options.entityType) {
      Reflect.defineMetadata('audit:entityType', options.entityType, target);
    }
  };
}

export function isAuditable(target: unknown): boolean {
  if (!target || typeof target !== 'function') return false;
  return Reflect.getMetadata(AUDITABLE_METADATA_KEY, target) === true;
}

export function getAuditEntityType(target: Function): string {
  return Reflect.getMetadata('audit:entityType', target) || target.name;
}
