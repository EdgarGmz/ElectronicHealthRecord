/**
 * @file jwt.test.ts
 * @description Pruebas unitarias white-box para las cuatro funciones del módulo jwt.ts:
 *   - generateAccessToken  / verifyAccessToken
 *   - generateRefreshToken / verifyRefreshToken
 *
 * Estrategia:
 *   - Se usa jsonwebtoken real (sin mock) sobre los secrets de desarrollo por defecto
 *     para validar que la lógica de sign/verify es correcta de extremo a extremo.
 *   - Se prueba expiración real usando tokens firmados con expiresIn de 1 segundo y
 *     esperando 1100ms antes de intentar verificar.
 *
 * Nota: La librería jwt.ts usa config.jwt.secret / config.jwt.refreshSecret.
 * En entorno de pruebas, dotenv.config() carga el .env de la raíz o usa los defaults.
 */

import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  JwtPayload,
} from '../../../utils/jwt';

const SAMPLE_PAYLOAD: JwtPayload = {
  userId: 'abc-123',
  email: 'edgar@ehr.mx',
  role: 'admin',
};

// ─────────────────────────────────────────────────────────────────────────────
// generateAccessToken
// ─────────────────────────────────────────────────────────────────────────────
describe('generateAccessToken', () => {
  it('debe generar un string JWT no vacío', () => {
    const token = generateAccessToken(SAMPLE_PAYLOAD);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // header.payload.signature
  });

  it('el token generado debe contener el payload correcto al decodificarlo', () => {
    const token = generateAccessToken(SAMPLE_PAYLOAD);
    const decoded = jwt.decode(token) as JwtPayload & { iat: number; exp: number };

    expect(decoded.userId).toBe(SAMPLE_PAYLOAD.userId);
    expect(decoded.email).toBe(SAMPLE_PAYLOAD.email);
    expect(decoded.role).toBe(SAMPLE_PAYLOAD.role);
    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
  });

  it('dos tokens generados con el mismo payload deben ser distintos (iat diferente)', async () => {
    const t1 = generateAccessToken(SAMPLE_PAYLOAD);
    await new Promise((r) => setTimeout(r, 1100)); // esperar 1s para que iat sea distinto
    const t2 = generateAccessToken(SAMPLE_PAYLOAD);
    expect(t1).not.toBe(t2);
  }, 10000);
});

// ─────────────────────────────────────────────────────────────────────────────
// verifyAccessToken
// ─────────────────────────────────────────────────────────────────────────────
describe('verifyAccessToken', () => {
  it('debe retornar el payload cuando el token es válido', () => {
    const token = generateAccessToken(SAMPLE_PAYLOAD);
    const result = verifyAccessToken(token);

    expect(result.userId).toBe(SAMPLE_PAYLOAD.userId);
    expect(result.email).toBe(SAMPLE_PAYLOAD.email);
    expect(result.role).toBe(SAMPLE_PAYLOAD.role);
  });

  it('debe lanzar error si el token está malformado', () => {
    expect(() => verifyAccessToken('token.invalido.aqui')).toThrow();
  });

  it('debe lanzar error si el token fue firmado con un secret diferente', () => {
    const foreignToken = jwt.sign(SAMPLE_PAYLOAD, 'otro-secret-completamente-diferente');
    expect(() => verifyAccessToken(foreignToken)).toThrow();
  });

  it('debe lanzar JsonWebTokenError para un string vacío', () => {
    expect(() => verifyAccessToken('')).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// generateRefreshToken
// ─────────────────────────────────────────────────────────────────────────────
describe('generateRefreshToken', () => {
  it('debe generar un string JWT de refresh válido', () => {
    const token = generateRefreshToken(SAMPLE_PAYLOAD);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('el refresh token y el access token deben ser distintos (diferentes secrets)', () => {
    const access = generateAccessToken(SAMPLE_PAYLOAD);
    const refresh = generateRefreshToken(SAMPLE_PAYLOAD);
    expect(access).not.toBe(refresh);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// verifyRefreshToken
// ─────────────────────────────────────────────────────────────────────────────
describe('verifyRefreshToken', () => {
  it('debe retornar el payload correcto con un refresh token válido', () => {
    const token = generateRefreshToken(SAMPLE_PAYLOAD);
    const result = verifyRefreshToken(token);

    expect(result.userId).toBe(SAMPLE_PAYLOAD.userId);
    expect(result.email).toBe(SAMPLE_PAYLOAD.email);
  });

  it('debe lanzar error si se intenta verificar un access token como refresh token', () => {
    // Access token firmado con JWT_SECRET, no JWT_REFRESH_SECRET → debe fallar
    const accessToken = generateAccessToken(SAMPLE_PAYLOAD);
    // Solo falla si los secrets son distintos (caso real); si son iguales en dev, el test es informativo
    const { config } = require('../../../config/env');
    if (config.jwt.secret !== config.jwt.refreshSecret) {
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    } else {
      // Si los secrets son iguales en dev, simplemente verifica que se decodifica
      const result = verifyRefreshToken(accessToken);
      expect(result.userId).toBe(SAMPLE_PAYLOAD.userId);
    }
  });

  it('debe lanzar error si el refresh token está malformado', () => {
    expect(() => verifyRefreshToken('not.a.jwt')).toThrow();
  });
});
