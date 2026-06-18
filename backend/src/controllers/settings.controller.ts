import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../services/settings.service';
import { sendSuccess } from '../utils';

const settingsService = new SettingsService();

export class SettingsController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.get();
      sendSuccess(res, settings, 'Configuraciones obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.update(req.body);
      sendSuccess(res, settings, 'Configuraciones actualizadas exitosamente');
    } catch (error) {
      next(error);
    }
  }
}
