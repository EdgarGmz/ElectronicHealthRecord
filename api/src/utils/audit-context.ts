import type { Request } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface AuditContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

const als = new AsyncLocalStorage<AuditContext>();

function getIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') return forwardedFor.split(',')[0].trim();
  if (Array.isArray(forwardedFor) && forwardedFor[0]) return forwardedFor[0].split(',')[0].trim();
  return req.ip || 'unknown';
}

export function runWithAuditContext(req: Request, fn: () => void) {
  const store: AuditContext = {
    ipAddress: getIp(req),
    userAgent: String(req.headers['user-agent'] || 'unknown'),
  };
  return als.run(store, fn);
}

export function getAuditContext(): AuditContext | undefined {
  return als.getStore();
}

export function setAuditUserId(userId: string | undefined) {
  const store = als.getStore();
  if (!store) return;
  store.userId = userId;
}

