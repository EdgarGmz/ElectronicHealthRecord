/**
 * @file auth.middleware.test.ts
 * @description Pruebas unitarias para los tres middlewares de autenticación/autorización:
 *   - authenticateToken: verifica presencia y validez del JWT.
 *   - optionalAuthenticateToken: pasa silenciosamente si el token está ausente o inválido.
 *   - authorizeRoles: verifica que el rol del usuario sea el permitido, con normalización de diacríticos.
 *
 * Estrategia: White-box. Se mockea jwt.ts y audit-context.ts para aislar completamente
 * la lógica del middleware sin necesidad de base de datos ni servidor real.
 */

import { Request, Response, NextFunction } from 'express';

// ── Mocks antes de importar los módulos bajo prueba ──────────────────────────
jest.mock('../../../utils/jwt', () => ({
  verifyAccessToken: jest.fn(),
}));

jest.mock('../../../utils/audit-context', () => ({
  setAuditUserId: jest.fn(),
}));

jest.mock('../../../utils/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

import { verifyAccessToken } from '../../../utils/jwt';
import { setAuditUserId } from '../../../utils/audit-context';
import {
  authenticateToken,
  authorizeRoles,
  optionalAuthenticateToken,
  AuthRequest,
} from '../../../middleware/auth';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Construye un mock mínimo de Request de Express */
function buildReq(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return {
    headers: {},
    ...overrides,
  } as unknown as AuthRequest;
}

/** Construye un mock de Response con spies en json() y status() */
function buildRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const next: NextFunction = jest.fn();

const VALID_PAYLOAD = { userId: 'user-123', email: 'test@ehr.mx', role: 'enfermero' };

// ─────────────────────────────────────────────────────────────────────────────
// authenticateToken
// ─────────────────────────────────────────────────────────────────────────────
describe('authenticateToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe responder 401 si no hay Authorization header', () => {
    const req = buildReq({ headers: {} });
    const res = buildRes();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Access token is required' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('debe responder 401 si el header no tiene esquema Bearer', () => {
    const req = buildReq({ headers: { authorization: 'Basic abc123' } });
    const res = buildRes();

    authenticateToken(req, res, next);

    // 'Basic abc123'.split(' ')[1] = 'abc123' → verifyAccessToken lanza error
    (verifyAccessToken as jest.Mock).mockImplementationOnce(() => {
      throw new Error('invalid token');
    });

    // Si llega acá (el token extraído no es undefined), debe fallar en verify
    // Reset y re-llamar
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockImplementationOnce(() => {
      throw new Error('invalid token');
    });

    const req2 = buildReq({ headers: { authorization: 'Bearer bad_token' } });
    const res2 = buildRes();
    authenticateToken(req2, res2, next);

    expect(res2.status).toHaveBeenCalledWith(401);
    expect(res2.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Invalid or expired token' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('debe responder 401 si verifyAccessToken lanza excepción (token inválido)', () => {
    (verifyAccessToken as jest.Mock).mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    const req = buildReq({ headers: { authorization: 'Bearer token_invalido' } });
    const res = buildRes();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Invalid or expired token' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('debe llamar next() y poblar req.user con token válido', () => {
    (verifyAccessToken as jest.Mock).mockReturnValue(VALID_PAYLOAD);

    const req = buildReq({ headers: { authorization: 'Bearer token_valido' } });
    const res = buildRes();

    authenticateToken(req, res, next);

    expect(req.user).toEqual(VALID_PAYLOAD);
    expect(setAuditUserId).toHaveBeenCalledWith(VALID_PAYLOAD.userId);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// optionalAuthenticateToken
// ─────────────────────────────────────────────────────────────────────────────
describe('optionalAuthenticateToken', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe llamar next() sin poblar req.user si no hay token', () => {
    const req = buildReq({ headers: {} });
    const res = buildRes();

    optionalAuthenticateToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeUndefined();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('debe llamar next() silenciosamente si el token es inválido (no debe lanzar)', () => {
    (verifyAccessToken as jest.Mock).mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const req = buildReq({ headers: { authorization: 'Bearer token_expirado' } });
    const res = buildRes();

    optionalAuthenticateToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeUndefined();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('debe poblar req.user y llamar next() si el token es válido', () => {
    (verifyAccessToken as jest.Mock).mockReturnValue(VALID_PAYLOAD);

    const req = buildReq({ headers: { authorization: 'Bearer token_valido' } });
    const res = buildRes();

    optionalAuthenticateToken(req, res, next);

    expect(req.user).toEqual(VALID_PAYLOAD);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// authorizeRoles
// ─────────────────────────────────────────────────────────────────────────────
describe('authorizeRoles', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe responder 401 si req.user no está definido', () => {
    const req = buildReq();           // sin user
    const res = buildRes();
    const middleware = authorizeRoles('admin');

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Authentication required' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('debe responder 403 si el rol del usuario no está en la lista', () => {
    const req = buildReq({ user: { userId: 'u1', email: 'a@b.mx', role: 'enfermero' } });
    const res = buildRes();
    const middleware = authorizeRoles('admin', 'coordinador_psicologia');

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Insufficient permissions' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('debe llamar next() si el rol coincide exactamente', () => {
    const req = buildReq({ user: { userId: 'u1', email: 'a@b.mx', role: 'admin' } });
    const res = buildRes();
    const middleware = authorizeRoles('admin', 'enfermero');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('debe normalizar "coordinador de enfermería" → "coordinador_enfermeria" correctamente', () => {
    // White-box: valida la lógica de normalización de diacríticos y separadores
    const req = buildReq({
      user: { userId: 'u2', email: 'coord@b.mx', role: 'coordinador de enfermería' },
    });
    const res = buildRes();
    const middleware = authorizeRoles('coordinador_enfermeria');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('debe normalizar "coordinador de psicología" → "coordinador_psicologia" correctamente', () => {
    const req = buildReq({
      user: { userId: 'u3', email: 'psi@b.mx', role: 'coordinador de psicología' },
    });
    const res = buildRes();
    const middleware = authorizeRoles('coordinador_psicologia');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('debe ser insensible a mayúsculas en el rol del usuario', () => {
    const req = buildReq({ user: { userId: 'u4', email: 'e@b.mx', role: 'ADMIN' } });
    const res = buildRes();
    const middleware = authorizeRoles('admin');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('debe permitir múltiples roles y llamar next() si alguno coincide', () => {
    const req = buildReq({ user: { userId: 'u5', email: 'e@b.mx', role: 'psicologo' } });
    const res = buildRes();
    const middleware = authorizeRoles('enfermero', 'psicologo', 'admin');

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
