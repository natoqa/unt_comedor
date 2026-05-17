import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  console.error('Error no controlado:', err);
  sendError(res, 'Error interno del servidor', 500);
};
