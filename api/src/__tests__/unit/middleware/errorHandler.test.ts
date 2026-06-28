/**
 * @file errorHandler.test.ts
 * @description Pruebas unitarias para AppError, errorHandler y notFoundHandler.
 *
 * Estrategia: White-box.
 *   - AppError: verifica que expone statusCode, isOperational y details.
 *   - errorHandler: rama AppError vs Error genérico, modo dev vs producción.
 *   - notFoundHandler: verifica 404 con el path correcto en el mensaje.
 *
 * No se requiere conexión a DB ni servidor real.
 */

import { Request, Response, NextFunction } from 'express';
import {
  AppError,
  errorHandler,
  notFoundHandler,
} from '../../../middleware/errorHandler';

// Silenciar el logger en tests
jest.mock('../../../utils/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildReq(overrides: Partial<Request> = {}): Request {
  return {
    url: '/test',
    originalUrl: '/test',
    method: 'GET',
    headers: {},
    ...overrides,
  } as unknown as Request;
}

function buildRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const next: NextFunction = jest.fn();

// ─────────────────────────────────────────────────────────────────────────────
// AppError
// ─────────────────────────────────────────────────────────────────────────────
describe('AppError', () => {
  it('debe crear un error con statusCode e isOperational = true', () => {
    const err = new AppError('Recurso no encontrado', 404);

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('Recurso no encontrado');
    expect(err.statusCode).toBe(404);
    expect(err.isOperational).toBe(true);
    expect(err.details).toBeUndefined();
  });

  it('debe preservar el campo details cuando se proporciona', () => {
    const details = { field: 'email', issue: 'duplicado' };
    const err = new AppError('Conflict', 409, details);

    expect(err.details).toEqual(details);
  });

  it('debe capturar el stack trace correctamente', () => {
    const err = new AppError('Test error', 500);
    expect(err.stack).toBeDefined();
    // El stack trace contiene la referencia al archivo o al mensaje del error
    expect(err.stack).toContain('Test error');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// errorHandler — instancias de AppError
// ─────────────────────────────────────────────────────────────────────────────
describe('errorHandler — AppError', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe responder con el statusCode y message del AppError', () => {
    const err = new AppError('No autorizado', 401);
    const res = buildRes();

    errorHandler(err, buildReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'No autorizado' })
    );
  });

  it('debe incluir details en la respuesta cuando AppError los lleva', () => {
    const details = { campo: 'username' };
    const err = new AppError('Validación fallida', 422, details);
    const res = buildRes();

    errorHandler(err, buildReq(), res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ details })
    );
  });

  it('NO debe incluir la clave details cuando AppError no los lleva', () => {
    const err = new AppError('Simple error', 400);
    const res = buildRes();

    errorHandler(err, buildReq(), res, next);

    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall).not.toHaveProperty('details');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// errorHandler — errores genéricos (non-AppError)
// ─────────────────────────────────────────────────────────────────────────────
describe('errorHandler — Error genérico', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe responder 500 con mensaje genérico en producción', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const err = new Error('Error interno sensible');
    const res = buildRes();

    errorHandler(err, buildReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.message).toBe('Internal server error');
    expect(body.stack).toBeUndefined();   // No exponer stack en prod

    process.env.NODE_ENV = originalEnv;
  });

  it('debe exponer el mensaje real y el stack en desarrollo', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const err = new Error('Detalle del error en dev');
    const res = buildRes();

    errorHandler(err, buildReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.message).toBe('Detalle del error en dev');
    expect(body.stack).toBeDefined();    // Stack debe ser visible en dev

    process.env.NODE_ENV = originalEnv;
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// notFoundHandler
// ─────────────────────────────────────────────────────────────────────────────
describe('notFoundHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe responder 404 con el path de la ruta no encontrada', () => {
    const req = buildReq({ originalUrl: '/api/ruta-inexistente' });
    const res = buildRes();

    notFoundHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('/api/ruta-inexistente'),
      })
    );
  });
});
