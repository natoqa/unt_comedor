#!/bin/bash

# ═══════════════════════════════════════════
# UNT Comedor Backend - Script de Build (Render)
# ═══════════════════════════════════════════

echo "📦 Instalando dependencias..."
npm install

echo "🗄️  Generando cliente Prisma..."
npx prisma generate

echo "🔄 Ejecutando migraciones..."
npx prisma migrate deploy

echo "🔨 Compilando TypeScript..."
npm run build

echo "✅ Build completado"
