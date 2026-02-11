import { Request } from 'express';
import auditLogService from '../services/audit-log.service';
import logger from './logger';

/**
 * Helper function to create audit log entries
 * This can be used by other services to easily log actions
 */
export async function createAuditLog(params: {
  userId: string;
  action: string;
  tableName: string;
  recordId: string;
  oldValues?: object;
  newValues?: object;
  ipAddress?: string;
  userAgent?: string;
  req?: Request;
}): Promise<void> {
  try {
    const ipAddress = params.ipAddress || params.req?.ip || params.req?.headers['x-forwarded-for'] as string || 'unknown';
    const userAgent = params.userAgent || params.req?.headers['user-agent'] || 'unknown';

    await auditLogService.createAuditLog({
      userId: params.userId,
      action: params.action,
      tableName: params.tableName,
      recordId: params.recordId,
      oldValues: params.oldValues,
      newValues: params.newValues,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    // Log the error but don't throw - we don't want audit logging to break the main flow
    logger.error('Failed to create audit log:', error);
  }
}

/**
 * Common audit actions
 */
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  MFA_ENABLE: 'MFA_ENABLE',
  MFA_DISABLE: 'MFA_DISABLE',
  
  // CRUD Operations
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  
  // Data Access
  VIEW_RECORD: 'VIEW_RECORD',
  SEARCH: 'SEARCH',
  EXPORT: 'EXPORT',
  PRINT: 'PRINT',
  
  // Administration
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  ROLE_CHANGE: 'ROLE_CHANGE',
  PERMISSION_GRANT: 'PERMISSION_GRANT',
  PERMISSION_REVOKE: 'PERMISSION_REVOKE',
  CONFIG_CHANGE: 'CONFIG_CHANGE',
  
  // Medical Operations
  PRESCRIPTION_CREATE: 'PRESCRIPTION_CREATE',
  MEDICATION_ADMIN: 'MEDICATION_ADMIN',
  DIAGNOSIS_UPDATE: 'DIAGNOSIS_UPDATE',
  NOTE_CREATE: 'NOTE_CREATE',
  NOTE_UPDATE: 'NOTE_UPDATE',
};

/**
 * Common table names in the system
 */
export const AUDIT_TABLES = {
  USER: 'users',
  PATIENT: 'patients',
  MEDICAL_RECORD: 'medical_records',
  PSYCHOLOGY_RECORD: 'psychology_records',
  NURSING_CONSULTATION: 'nursing_consultations',
  PRESCRIPTION: 'prescriptions',
  MEDICATION_ADMINISTRATION: 'medication_administrations',
  APPOINTMENT: 'appointments',
  THERAPY_SESSION: 'therapy_sessions',
  TREATMENT_PLAN: 'treatment_plans',
  INTERCONSULTATION: 'interconsultations',
  MEDICATION: 'medications',
  SYSTEM_SETTING: 'system_settings',
};
