#!/bin/bash

# ═══════════════════════════════════════════
# UNT Comedor - Script de Instalación
# ═══════════════════════════════════════════

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   🍽️  UNT Comedor - Instalación          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no encontrado. Instálalo desde https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo ""

# ── Backend ──
echo "📦 Instalando dependencias del backend..."
cd backend
cp .env.example .env
npm install
echo "✅ Backend listo"
echo ""

# ── Frontend ──
echo "📦 Instalando dependencias del frontend..."
cd ../frontend
cp .env.example .env.local
npm install
echo "✅ Frontend listo"
echo ""

# ── Prisma ──
echo "🗄️  Generando cliente de Prisma..."
cd ../backend
npx prisma generate
echo "✅ Prisma generado"
echo ""

echo "╔══════════════════════════════════════════╗"
echo "║   ✅ Instalación completada              ║"
echo "╠══════════════════════════════════════════╣"
echo "║                                          ║"
echo "║   Próximos pasos:                        ║"
echo "║                                          ║"
echo "║   1. Configura .env en backend/          ║"
echo "║      (DATABASE_URL, JWT_SECRET, etc.)    ║"
echo "║                                          ║"
echo "║   2. Crea la base de datos PostgreSQL    ║"
echo "║                                          ║"
echo "║   3. Ejecuta las migraciones:            ║"
echo "║      cd backend                          ║"
echo "║      npx prisma migrate dev              ║"
echo "║                                          ║"
echo "║   4. Inicia el backend:                  ║"
echo "║      npm run dev                         ║"
echo "║                                          ║"
echo "║   5. Inicia el frontend:                 ║"
echo "║      cd ../frontend                      ║"
echo "║      npm run dev                         ║"
echo "║                                          ║"
echo "╚══════════════════════════════════════════╝"
