import app from './app';
import type { Server } from 'http';
import { config } from './config/env';
import prisma from './config/database';
import logger from './utils/logger';

const listenOnPort = (port: number): Promise<Server> => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      resolve(server);
    });

    server.once('error', (error: NodeJS.ErrnoException) => {
      reject(error);
    });
  });
};

const startWithAvailablePort = async (
  preferredPort: number,
  maxAttempts = 10
): Promise<{ server: Server; port: number }> => {
  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const port = preferredPort + offset;
    try {
      const server = await listenOnPort(port);
      return { server, port };
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code !== 'EADDRINUSE' || offset === maxAttempts - 1) {
        throw error;
      }
      logger.warn(`Port ${port} is in use, trying port ${port + 1}`);
    }
  }

  throw new Error('No available port found');
};

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    const { server, port: activePort } = await startWithAvailablePort(config.port);

    logger.info(`Server is running on http://${config.host}:${activePort}`);
    logger.info(`API documentation available at http://${config.host}:${activePort}/api-docs`);
    logger.info(`Environment: ${config.env}`);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await prisma.$disconnect();
        logger.info('Database connection closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await prisma.$disconnect();
        logger.info('Database connection closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
