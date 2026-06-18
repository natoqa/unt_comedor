import { Router } from 'express';
import { SettingsController } from '../controllers';
import { authenticate, authorize } from '../middlewares';
import { Role } from '../types';

const router = Router();
const settingsController = new SettingsController();

// Todas las rutas de configuraciones requieren ser ADMIN
router.use(authenticate);
router.use(authorize(Role.ADMIN));

router.get('/', settingsController.get.bind(settingsController));
router.put('/', settingsController.update.bind(settingsController));

export default router;
