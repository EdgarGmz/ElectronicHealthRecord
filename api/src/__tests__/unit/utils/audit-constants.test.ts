/**
 * @file audit-constants.test.ts
 * @description Pruebas unitarias para las constantes y la función createAuditLog de audit.ts.
 *
 * Estrategia: White-box.
 *   - AUDIT_ACTIONS / AUDIT_TABLES: verifican que los contratos de constantes no se rompan
 *     al refactorizar (protección ante renombrados accidentales).
 *   - createAuditLog: se mockea auditLogService para probar la extracción de IP, userAgent
 *     y la tolerancia a fallos (no relanza si el servicio de auditoría falla).
 */

import { AUDIT_ACTIONS, AUDIT_TABLES, createAuditLog } from '../../../utils/audit';

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('../../../services/audit-log.service', () => ({
  __esModule: true,
  default: {
    createAuditLog: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../utils/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

import auditLogService from '../../../services/audit-log.service';

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT_ACTIONS — contrato de constantes
// ─────────────────────────────────────────────────────────────────────────────
describe('AUDIT_ACTIONS — contrato de constantes', () => {
  it('debe tener las acciones de autenticación críticas', () => {
    expect(AUDIT_ACTIONS.LOGIN).toBe('LOGIN');
    expect(AUDIT_ACTIONS.LOGOUT).toBe('LOGOUT');
    expect(AUDIT_ACTIONS.LOGIN_FAILED).toBe('LOGIN_FAILED');
    expect(AUDIT_ACTIONS.PASSWORD_CHANGE).toBe('PASSWORD_CHANGE');
  });

  it('debe tener las acciones CRUD básicas', () => {
    expect(AUDIT_ACTIONS.CREATE).toBe('CREATE');
    expect(AUDIT_ACTIONS.READ).toBe('READ');
    expect(AUDIT_ACTIONS.UPDATE).toBe('UPDATE');
    expect(AUDIT_ACTIONS.DELETE).toBe('DELETE');
  });

  it('debe tener las acciones médicas críticas', () => {
    expect(AUDIT_ACTIONS.PRESCRIPTION_CREATE).toBe('PRESCRIPTION_CREATE');
    expect(AUDIT_ACTIONS.MEDICATION_ADMIN).toBe('MEDICATION_ADMIN');
    expect(AUDIT_ACTIONS.DIAGNOSIS_UPDATE).toBe('DIAGNOSIS_UPDATE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT_TABLES — contrato de constantes
// ─────────────────────────────────────────────────────────────────────────────
describe('AUDIT_TABLES — contrato de constantes', () => {
  it('debe exponer las tablas clínicas más importantes', () => {
    expect(AUDIT_TABLES.USER).toBe('users');
    expect(AUDIT_TABLES.PATIENT).toBe('patients');
    expect(AUDIT_TABLES.MEDICAL_RECORD).toBe('medical_records');
    expect(AUDIT_TABLES.APPOINTMENT).toBe('appointments');
  });

  it('debe exponer las tablas de psicología', () => {
    expect(AUDIT_TABLES.PSYCHOLOGY_RECORD).toBe('psychology_records');
    expect(AUDIT_TABLES.THERAPY_SESSION).toBe('therapy_sessions');
  });

  it('debe exponer las tablas de medicación', () => {
    expect(AUDIT_TABLES.PRESCRIPTION).toBe('prescriptions');
    expect(AUDIT_TABLES.MEDICATION_ADMINISTRATION).toBe('medication_administrations');
    expect(AUDIT_TABLES.MEDICATION).toBe('medications');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// createAuditLog — comportamiento y tolerancia a fallos
// ─────────────────────────────────────────────────────────────────────────────
describe('createAuditLog', () => {
  beforeEach(() => jest.clearAllMocks());

  const BASE_PARAMS = {
    userId: 'user-001',
    action: AUDIT_ACTIONS.LOGIN,
    tableName: AUDIT_TABLES.USER,
    recordId: 'rec-001',
  };

  it('debe invocar auditLogService.createAuditLog con los parámetros correctos', async () => {
    await createAuditLog({
      ...BASE_PARAMS,
      ipAddress: '192.168.1.1',
      userAgent: 'Jest/1.0',
    });

    expect(auditLogService.createAuditLog).toHaveBeenCalledTimes(1);
    expect(auditLogService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-001',
        action: AUDIT_ACTIONS.LOGIN,
        tableName: AUDIT_TABLES.USER,
        ipAddress: '192.168.1.1',
        userAgent: 'Jest/1.0',
      })
    );
  });

  it('debe extraer la IP del objeto req si no se pasa ipAddress directamente', async () => {
    const mockReq = {
      headers: { 'user-agent': 'TestBrowser/2.0' },
      ip: '10.0.0.5',
    } as any;

    await createAuditLog({ ...BASE_PARAMS, req: mockReq });

    expect(auditLogService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ ipAddress: '10.0.0.5', userAgent: 'TestBrowser/2.0' })
    );
  });

  it('debe extraer la IP del header x-forwarded-for (primer IP en la lista)', async () => {
    const mockReq = {
      headers: {
        'x-forwarded-for': '203.0.113.10, 10.0.0.1',
        'user-agent': 'Proxy/1.0',
      },
      ip: '127.0.0.1',
    } as any;

    await createAuditLog({ ...BASE_PARAMS, req: mockReq });

    expect(auditLogService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ ipAddress: '203.0.113.10' })
    );
  });

  it('NO debe propagar la excepción si auditLogService.createAuditLog falla', async () => {
    (auditLogService.createAuditLog as jest.Mock).mockRejectedValueOnce(
      new Error('DB connection lost')
    );

    // No debe lanzar — el sistema principal no debe caer por una falla de auditoría
    await expect(createAuditLog({ ...BASE_PARAMS })).resolves.toBeUndefined();
  });

  it('debe usar "unknown" para ipAddress y userAgent si no se proporcionan', async () => {
    await createAuditLog({ ...BASE_PARAMS });

    expect(auditLogService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ ipAddress: 'unknown', userAgent: 'unknown' })
    );
  });
});
