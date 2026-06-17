import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middlewares';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import menuRoutes from './routes/menu.routes';
import ratingRoutes from './routes/rating.routes';
import userRoutes from './routes/user.routes';
import ticketRoutes from './routes/ticket.routes';

const app = express();

// ── Seguridad ──
app.use(helmet()); // CORS fix for Vercel deployment
app.use(cors({
  origin: config.cors.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Archivos locales (fallback de imágenes) ──
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Health Check (sin rate limiting) ──
app.use('/api', healthRoutes);

// ── Rate Limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500,
  message: {
    success: false,
    message: 'Demasiadas solicitudes, intente de nuevo más tarde',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
});
app.use(limiter);

// ── Rutas restantes (con rate limiting) ──
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);

// ── Manejo de errores ──
app.use(errorHandler);

// ── Iniciar servidor ──
app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🍽️  UNT Comedor API                    ║
  ║   Puerto: ${config.port}                          ║
  ║   Entorno: ${config.nodeEnv.padEnd(28)}║
  ║   URL: http://localhost:${config.port}             ║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;
