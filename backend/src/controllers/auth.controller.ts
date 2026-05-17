import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services';
import { sendSuccess } from '../utils';
import { AuthRequest } from '../types';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Inicio de sesión exitoso');
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, 'Registro exitoso', 201);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const user = await authService.getProfile(authReq.user!.userId);
      sendSuccess(res, user, 'Perfil obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }
}
