import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares';
import { Role } from '../types';

const router = Router();
const userController = new UserController();

// Todas las rutas de usuarios requieren ser ADMIN
router.use(authenticate);
router.use(authorize(Role.ADMIN));

router.get('/stats', userController.getDashboardStats.bind(userController));
router.get('/export', userController.exportExcel.bind(userController));
router.get('/', userController.getAll.bind(userController));
router.post('/', userController.create.bind(userController));
router.put('/:id', userController.update.bind(userController));
router.delete('/:id', userController.delete.bind(userController));

export default router;
