import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middlewares';
import routes from './routes';

const app = express();

// ── Seguridad ──
app.use(helmet()); // CORS fix for Vercel deployment
app.use(cors({
  origin: config.cors.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate Limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    success: false,
    message: 'Demasiadas solicitudes, intente de nuevo más tarde',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ── Body Parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Archivos locales (fallback de imágenes) ──
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Rutas ──
app.use('/api', routes);

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
