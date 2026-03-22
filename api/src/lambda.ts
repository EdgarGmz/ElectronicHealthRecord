import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import serverlessHttp from 'serverless-http';
import app from './app';
import prisma from './config/database';
import logger from './utils/logger';

let cachedHandler:
  | ((event: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResult>)
  | null = null;

async function ensureDbConnected() {
  try {
    // Prisma mantiene pool; en Lambda se reutiliza si el contenedor sigue vivo.
    await prisma.$connect();
  } catch (err) {
    logger.error('Lambda: failed to connect DB', err);
    throw err;
  }
}

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  // Permite que Lambda retorne sin esperar a que Prisma cierre sockets.
  context.callbackWaitsForEmptyEventLoop = false;

  if (!cachedHandler) {
    cachedHandler = serverlessHttp(app) as unknown as (
      event: APIGatewayProxyEvent,
      context: Context
    ) => Promise<APIGatewayProxyResult>;
  }

  await ensureDbConnected();
  return cachedHandler(event, context);
};

