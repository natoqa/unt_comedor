import { Router } from 'express';
import { RatingController } from '../controllers';
import { authenticate, authorize, validate } from '../middlewares';
import { Role } from '../types';
import { createRatingSchema, ratingStatsQuerySchema } from '../validators';

const router = Router();
const ratingController = new RatingController();

// ── Rutas de estudiantes ──

// POST /api/ratings - Crear valoración
router.post(
  '/',
  authenticate,
  validate(createRatingSchema),
  ratingController.create.bind(ratingController)
);

// GET /api/ratings/check/:menuId - Verificar si ya valoró
router.get(
  '/check/:menuId',
  authenticate,
  ratingController.checkUserRating.bind(ratingController)
);

// ── Rutas de estadísticas (admin) ──

// GET /api/ratings/stats - Estadísticas globales
router.get(
  '/stats',
  authenticate,
  authorize(Role.ADMIN),
  validate(ratingStatsQuerySchema),
  ratingController.getGlobalStats.bind(ratingController)
);

// GET /api/ratings/stats/shifts - Estadísticas por turno
router.get(
  '/stats/shifts',
  authenticate,
  authorize(Role.ADMIN),
  ratingController.getStatsByShift.bind(ratingController)
);

// GET /api/ratings/stats/trends - Tendencias temporales
router.get(
  '/stats/trends',
  authenticate,
  authorize(Role.ADMIN),
  ratingController.getTrends.bind(ratingController)
);

// GET /api/ratings/stats/extremes - Mejor y peor menú (Día)
router.get(
  '/stats/extremes',
  authenticate,
  authorize(Role.ADMIN),
  ratingController.getMenuExtremes.bind(ratingController)
);

// GET /api/ratings/stats/shifts/extremes - Mejor y peor por turno
router.get(
  '/stats/shifts/extremes',
  authenticate,
  authorize(Role.ADMIN),
  ratingController.getShiftExtremes.bind(ratingController)
);

// GET /api/ratings/stats/menu/:menuId - Stats de un menú específico
router.get(
  '/stats/menu/:menuId',
  authenticate,
  authorize(Role.ADMIN),
  ratingController.getMenuStats.bind(ratingController)
);

// GET /api/ratings/export - Exportar valoraciones a Excel
router.get(
  '/export',
  authenticate,
  authorize(Role.ADMIN),
  ratingController.exportExcel.bind(ratingController)
);

export default router;
