#!/bin/bash

# ═══════════════════════════════════════════
# UNT Comedor Backend - Script de Build (Render)
# ═══════════════════════════════════════════

echo "📦 Instalando dependencias (incluye dev para compilar TypeScript)..."
npm install --include=dev

echo "🗄️  Generando cliente Prisma..."
npx prisma generate

echo "🔄 Ejecutando migraciones..."
npx prisma migrate deploy

echo "🔨 Compilando TypeScript..."
npm run build

echo "✅ Build completado"
