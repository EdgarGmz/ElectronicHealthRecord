import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Validate required environment variables in production
if (isProduction) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in production environment');
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET must be set in production environment');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set in production environment');
  }
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || 'localhost',
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    /** Access token: 8h por turno. Override con JWT_EXPIRES_IN (ej. 8h, 1d). */
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  cors: {
    /** In development: allow any http://localhost:* . In production: use CORS_ORIGIN (comma-separated) or default 5173/5174 */
    allowedOrigins: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
      : ['http://localhost:5173', 'http://localhost:5174'],
  },
  
  rateLimit: {
    /** Ventana en ms (default 15 min). Aumentar para más tolerancia. */
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    /** Máximo de peticiones por IP en la ventana. Desarrollo: 2000 para evitar 429 con calendario/dashboard; producción: 400. */
    maxRequests: parseInt(
      process.env.RATE_LIMIT_MAX_REQUESTS || (isProduction ? '400' : '2000'),
      10
    ),
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    path: process.env.UPLOAD_PATH || './uploads',
  },
  
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
