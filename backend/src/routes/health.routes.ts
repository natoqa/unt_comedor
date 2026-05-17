import { Router, Request, Response } from 'express';
import { prisma } from '../config';
import { sendSuccess, sendError } from '../utils';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    sendSuccess(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    }, 'Servidor funcionando correctamente');
  } catch {
    sendError(res, 'Error de conexión con la base de datos', 503);
  }
});

export default router;
