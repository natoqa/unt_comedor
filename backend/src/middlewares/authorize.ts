import { Response, NextFunction } from 'express';
import { AuthRequest, Role } from '../types';
import { sendError } from '../utils';

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'No autenticado', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(
        res,
        'No tienes permisos para realizar esta acción',
        403
      );
      return;
    }

    next();
  };
};
