import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('\n🔍 Verificando estado de la base de datos...\n');

  const users = await prisma.user.count();
  const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
  const students = await prisma.user.count({ where: { role: 'STUDENT' } });
  const menus = await prisma.menu.count();
  const dishes = await prisma.dish.count();
  const images = await prisma.menuImage.count();
  const ratings = await prisma.rating.count();

  console.log('╔══════════════════════════════════════════╗');
  console.log('║   📊 Estado de la Base de Datos          ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║   👤 Total usuarios:    ${String(users).padStart(3)}               ║`);
  console.log(`║      🔑 Admins:         ${String(admins).padStart(3)}               ║`);
  console.log(`║      🎓 Estudiantes:    ${String(students).padStart(3)}               ║`);
  console.log(`║   📋 Menús:             ${String(menus).padStart(3)}               ║`);
  console.log(`║   🍽️  Platos:            ${String(dishes).padStart(3)}               ║`);
  console.log(`║   📸 Imágenes:          ${String(images).padStart(3)}               ║`);
  console.log(`║   ⭐ Valoraciones:      ${String(ratings).padStart(3)}               ║`);
  console.log('╚══════════════════════════════════════════╝');

  // Promedios de valoración
  if (ratings > 0) {
    const avgRatings = await prisma.rating.aggregate({
      _avg: {
        taste: true,
        quantity: true,
        variety: true,
        hygiene: true,
        service: true,
      },
    });

    console.log('\n📈 Promedios de valoración:');
    console.log(`   Sabor:    ${avgRatings._avg.taste?.toFixed(2) ?? 'N/A'} / 5`);
    console.log(`   Cantidad: ${avgRatings._avg.quantity?.toFixed(2) ?? 'N/A'} / 5`);
    console.log(`   Variedad: ${avgRatings._avg.variety?.toFixed(2) ?? 'N/A'} / 5`);
    console.log(`   Higiene:  ${avgRatings._avg.hygiene?.toFixed(2) ?? 'N/A'} / 5`);
    console.log(`   Atención: ${avgRatings._avg.service?.toFixed(2) ?? 'N/A'} / 5`);
  }

  // Últimos menús
  const recentMenus = await prisma.menu.findMany({
    take: 5,
    orderBy: { date: 'desc' },
    include: {
      dishes: true,
      _count: { select: { ratings: true } },
    },
  });

  if (recentMenus.length > 0) {
    console.log('\n📋 Últimos 5 menús:');
    for (const menu of recentMenus) {
      const shiftLabel =
        menu.shift === 'BREAKFAST'
          ? 'Desayuno'
          : menu.shift === 'LUNCH'
            ? 'Almuerzo'
            : 'Cena';
      const dateStr = menu.date.toISOString().split('T')[0];
      console.log(
        `   ${dateStr} | ${shiftLabel.padEnd(9)} | ${menu.dishes.length} platos | ${menu._count.ratings} valoraciones`
      );
    }
  }

  console.log('');
}

async function resetDatabase() {
  console.log('\n⚠️  Reseteando base de datos...');
  await prisma.rating.deleteMany();
  await prisma.menuImage.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Base de datos limpia\n');
}

// Ejecutar según el argumento
const command = process.argv[2];

async function run() {
  switch (command) {
    case 'check':
      await checkDatabase();
      break;
    case 'reset':
      await resetDatabase();
      break;
    default:
      console.log('\nUso: ts-node prisma/db-utils.ts [check|reset]\n');
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
