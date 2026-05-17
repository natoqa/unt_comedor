import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest, JwtPayload } from '../types';
import { sendError } from '../utils';

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Token de autenticación no proporcionado', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 'El token ha expirado. Inicia sesión nuevamente', 401);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, 'Token inválido', 401);
      return;
    }
    sendError(res, 'Error de autenticación', 401);
  }
};
