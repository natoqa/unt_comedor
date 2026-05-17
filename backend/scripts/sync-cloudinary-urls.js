/**
 * Actualiza registros con publicId local:* si el archivo existe en Cloudinary.
 * Uso: node scripts/sync-cloudinary-urls.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({ secure: true });

const prisma = new PrismaClient();

async function main() {
  const { resources } = await cloudinary.api.resources({
    type: 'upload',
    prefix: 'unt-comedor/menus',
    max_results: 500,
  });

  if (!resources?.length) {
    console.log('No hay imágenes en Cloudinary bajo unt-comedor/menus');
    return;
  }

  const byBaseName = new Map();
  for (const r of resources) {
    const base = r.public_id.split('/').pop();
    byBaseName.set(base, r);
    const withoutExt = base.replace(/\.[^.]+$/, '');
    if (!byBaseName.has(withoutExt)) byBaseName.set(withoutExt, r);
  }

  const localImages = await prisma.menuImage.findMany({
    where: { publicId: { startsWith: 'local:' } },
  });

  let updated = 0;
  for (const img of localImages) {
    const filename = img.publicId.replace(/^local:/, '');
    const base = filename.replace(/\.[^.]+$/, '');
    const match = byBaseName.get(filename) || byBaseName.get(base);
    if (!match) continue;

    await prisma.menuImage.update({
      where: { id: img.id },
      data: { url: match.secure_url, publicId: match.public_id },
    });
    console.log(`✓ ${img.shift} → ${match.public_id}`);
    updated++;
  }

  console.log(`\nActualizados: ${updated} de ${localImages.length} registros locales`);
}

main()
  .catch((e) => {
    console.error(e.message || e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
