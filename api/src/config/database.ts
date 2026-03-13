import { PrismaClient } from '@prisma/client';
import auditLogService from '../services/audit-log.service';
import { getAuditContext } from '../utils/audit-context';
import { AUDIT_ACTIONS } from '../utils/audit';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// System-wide audit logging for DB mutations (create/update/delete).
// Uses AsyncLocalStorage context set per request (see app.ts + auth.ts).
prisma.$use(async (params, next) => {
  // Avoid recursion
  if (params.model === 'AuditLog') return next(params);

  const isMutation =
    params.action === 'create' ||
    params.action === 'update' ||
    params.action === 'delete' ||
    params.action === 'upsert' ||
    params.action === 'createMany' ||
    params.action === 'updateMany' ||
    params.action === 'deleteMany';

  if (!isMutation) return next(params);

  const ctx = getAuditContext();
  const userId = ctx?.userId;
  if (!userId) return next(params); // only log authenticated actions

  const model = params.model || 'unknown';
  const tableName = model;

  let oldValues: unknown = undefined;
  if (params.action === 'update' || params.action === 'delete') {
    try {
      const where = (params.args as any)?.where;
      if (where && (prisma as any)[model]?.findUnique) {
        oldValues = await (prisma as any)[model].findUnique({ where });
      }
    } catch {
      // ignore - don't block main flow
    }
  }

  const result = await next(params);

  try {
    const recordId =
      (result && typeof result === 'object' && 'id' in (result as any) && String((result as any).id)) ||
      String((params.args as any)?.where?.id || (params.args as any)?.data?.id || 'unknown');

    const action =
      params.action === 'create' || params.action === 'createMany'
        ? AUDIT_ACTIONS.CREATE
        : params.action === 'delete' || params.action === 'deleteMany'
          ? AUDIT_ACTIONS.DELETE
          : params.action === 'update' || params.action === 'updateMany'
            ? AUDIT_ACTIONS.UPDATE
            : params.action === 'upsert'
              ? AUDIT_ACTIONS.UPDATE
              : AUDIT_ACTIONS.UPDATE;

    await auditLogService.createAuditLog({
      userId,
      action,
      tableName,
      recordId,
      oldValues: oldValues && typeof oldValues === 'object' ? (oldValues as object) : undefined,
      newValues: result && typeof result === 'object' ? (result as object) : undefined,
      ipAddress: ctx?.ipAddress,
      userAgent: ctx?.userAgent,
    });
  } catch {
    // never block
  }

  return result;
});

export default prisma;
