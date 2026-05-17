import { Router } from 'express';
import { MenuController } from '../controllers';
import { authenticate, authorize, validate, upload } from '../middlewares';
import { Role } from '../types';
import {
  createMenuSchema,
  updateMenuSchema,
  getMenuByIdSchema,
  getMenusQuerySchema,
} from '../validators';

const router = Router();
const menuController = new MenuController();

// ── Rutas públicas (requieren autenticación) ──

// GET /api/menus/today
router.get(
  '/today',
  authenticate,
  menuController.getToday.bind(menuController)
);

// GET /api/menus
router.get(
  '/',
  authenticate,
  validate(getMenusQuerySchema),
  menuController.getAll.bind(menuController)
);

// GET /api/menus/:id
router.get(
  '/:id',
  authenticate,
  validate(getMenuByIdSchema),
  menuController.getById.bind(menuController)
);

// ── Rutas de administrador ──

// POST /api/menus
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  validate(createMenuSchema),
  menuController.create.bind(menuController)
);

// PUT /api/menus/:id
router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate(updateMenuSchema),
  menuController.update.bind(menuController)
);

// DELETE /api/menus/:id
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  menuController.delete.bind(menuController)
);

// POST /api/menus/:id/images
router.post(
  '/:id/images',
  authenticate,
  authorize(Role.ADMIN),
  upload.fields([
    { name: 'BREAKFAST', maxCount: 1 },
    { name: 'LUNCH', maxCount: 1 },
    { name: 'DINNER', maxCount: 1 },
  ]),
  menuController.uploadImages.bind(menuController)
);

// DELETE /api/menus/:id/images/:imageId
router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorize(Role.ADMIN),
  menuController.deleteImage.bind(menuController)
);

export default router;
