import { Request, Response, NextFunction } from 'express';
import { MealShift } from '@prisma/client';
import { MenuService } from '../services';
import { sendSuccess, sendPaginated } from '../utils';
import { ValidationError } from '../utils/errors';

const MEAL_SHIFTS: MealShift[] = ['BREAKFAST', 'LUNCH', 'DINNER'];

const menuService = new MenuService();

export class MenuController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { menus, total } = await menuService.getAll(req.query);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      sendPaginated(res, menus, total, page, limit, 'Menús obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const menu = await menuService.getById(req.params.id);
      sendSuccess(res, menu, 'Menú obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getToday(_req: Request, res: Response, next: NextFunction) {
    try {
      const menus = await menuService.getToday();
      sendSuccess(res, menus, 'Menús de hoy obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const menu = await menuService.create(req.body);
      sendSuccess(res, menu, 'Menú creado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const menu = await menuService.update(req.params.id, req.body);
      sendSuccess(res, menu, 'Menú actualizado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await menuService.delete(req.params.id);
      sendSuccess(res, null, 'Menú eliminado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      const filesByShift: Partial<Record<MealShift, Express.Multer.File>> = {};
      for (const shift of MEAL_SHIFTS) {
        const file = files?.[shift]?.[0];
        if (file) filesByShift[shift] = file;
      }

      if (Object.keys(filesByShift).length === 0) {
        throw new ValidationError('No se proporcionaron imágenes');
      }

      const images = await menuService.uploadImages(req.params.id, filesByShift);
      sendSuccess(res, images, 'Imágenes subidas exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      await menuService.deleteImage(req.params.id, req.params.imageId);
      sendSuccess(res, null, 'Imagen eliminada exitosamente');
    } catch (error) {
      next(error);
    }
  }
}
