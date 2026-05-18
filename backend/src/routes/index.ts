import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import menuRoutes from './menu.routes';
import ratingRoutes from './rating.routes';
import userRoutes from './user.routes';
import ticketRoutes from './ticket.routes';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/menus', menuRoutes);
router.use('/ratings', ratingRoutes);
router.use('/users', userRoutes);
router.use('/tickets', ticketRoutes);

export default router;
