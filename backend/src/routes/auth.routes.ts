import { Router } from 'express';
import { AuthController } from '../controllers';
import { validate, authenticate } from '../middlewares';
import { loginSchema, registerSchema } from '../validators';

const router = Router();
const authController = new AuthController();

// POST /api/auth/login
router.post(
  '/login',
  validate(loginSchema),
  authController.login.bind(authController)
);

// POST /api/auth/register
router.post(
  '/register',
  validate(registerSchema),
  authController.register.bind(authController)
);

// GET /api/auth/profile
router.get(
  '/profile',
  authenticate,
  authController.getProfile.bind(authController)
);

export default router;
