import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import logger from '../utils/logger';
import { setAuditUserId } from '../utils/audit-context';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    setAuditUserId(payload.userId);
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/** Same as authenticateToken but does not fail if token is missing or invalid; sets req.user only when token is valid. */
export const optionalAuthenticateToken = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      next();
      return;
    }
    const payload = verifyAccessToken(token);
    req.user = payload;
    setAuditUserId(payload.userId);
    next();
  } catch {
    next();
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const normalizeRole = (role: string): string => {
      // Soporta variaciones tipo "coordinador de enfermería" vs "coordinador_enfermeria"
      const withoutDiacritics = role
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()

      const underscored = withoutDiacritics.replace(/\s+/g, '_')

      // "coordinador_de_enfermeria" -> "coordinador_enfermeria"
      if (underscored === 'coordinador_de_enfermeria') return 'coordinador_enfermeria'
      if (underscored === 'coordinador_de_psicologia') return 'coordinador_psicologia'

      return underscored
    }

    const normalizedUserRole = normalizeRole(String(req.user.role))
    const normalizedAllowedRoles = roles.map(normalizeRole)

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};
