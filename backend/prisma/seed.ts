import { PrismaClient, Role, MealShift } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════
// Datos de Usuarios
// ═══════════════════════════════════════════

const usersData = [
  {
    universityId: 'ADMIN001',
    name: 'Carlos Mendoza',
    email: 'admin@unt.edu.pe',
    password: 'Admin123!',
    role: Role.ADMIN,
  },
  {
    universityId: 'ADMIN002',
    name: 'María Rodríguez',
    email: 'mrodriguez@unt.edu.pe',
    password: 'Admin123!',
    role: Role.ADMIN,
  },
  {
    universityId: '2020101001',
    name: 'Ana Lucía Paredes',
    email: 'aparedes@unitru.edu.pe',
    password: 'Student123!',
    role: Role.STUDENT,
  },
  {
    universityId: '2020101002',
    name: 'Jorge Luis Castillo',
    email: 'jcastillo@unitru.edu.pe',
    password: 'Student123!',
    role: Role.STUDENT,
  },
  {
    universityId: '2021102003',
    name: 'Rosa Elena Díaz',
    email: 'rdiaz@unitru.edu.pe',
    password: 'Student123!',
    role: Role.STUDENT,
  },
  {
    universityId: '2021102004',
    name: 'Pedro Sánchez Ríos',
    email: 'psanchez@unitru.edu.pe',
    password: 'Student123!',
    role: Role.STUDENT,
  },
  {
    universityId: '2022103005',
    name: 'Lucía Fernanda Torres',
    email: 'ltorres@unitru.edu.pe',
    password: 'Student123!',
    role: Role.STUDENT,
  },
  {
    universityId: '2022103006',
    name: 'Miguel Ángel Vargas',
    email: 'mvargas@unitru.edu.pe',
    password: 'Student123!',
    role: Role.STUDENT,
  },
  {
    universityId: '2023104007',
    name: 'Carmen Rosa Huamán',
    email: 'chuaman@unitru.edu.pe',
    password: 'Student123!',
    role: Role.STUDENT,
  },
  {
    universityId: '2023104008',
    name: 'Diego Alejandro Flores',
    email: 'dflores@unitru.edu.pe',
    password: 'Student123!',
    role: Role.STUDENT,
  },
];

// ═══════════════════════════════════════════
// Datos de Menús (2 semanas completas)
// ═══════════════════════════════════════════

interface MenuSeedData {
  dayOffset: number;
  shift: MealShift;
  startTime: string;
  endTime: string;
  description: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  iron: number;
  dishes: { name: string; category: string }[];
}

const menusData: MenuSeedData[] = [
  // ── Día 1 (Lunes) ──
  {
    dayOffset: 0,
    shift: MealShift.BREAKFAST,
    startTime: '07:00',
    endTime: '08:30',
    description: 'Desayuno energético para iniciar la semana',
    calories: 450,
    proteins: 18,
    carbs: 55,
    fats: 15,
    iron: 3.2,
    dishes: [
      { name: 'Pan con palta y huevo', category: 'Principal' },
      { name: 'Avena con canela', category: 'Bebida' },
      { name: 'Plátano de seda', category: 'Fruta' },
    ],
  },
  {
    dayOffset: 0,
    shift: MealShift.LUNCH,
    startTime: '12:00',
    endTime: '14:00',
    description: 'Almuerzo tradicional norteño',
    calories: 780,
    proteins: 35,
    carbs: 85,
    fats: 28,
    iron: 5.8,
    dishes: [
      { name: 'Sopa de res con verduras', category: 'Entrada' },
      { name: 'Arroz con pollo a la norteña', category: 'Principal' },
      { name: 'Ensalada de lechuga y tomate', category: 'Guarnición' },
      { name: 'Chicha morada', category: 'Bebida' },
      { name: 'Gelatina de fresa', category: 'Postre' },
    ],
  },
  {
    dayOffset: 0,
    shift: MealShift.DINNER,
    startTime: '18:00',
    endTime: '19:30',
    description: 'Cena ligera y nutritiva',
    calories: 520,
    proteins: 22,
    carbs: 60,
    fats: 18,
    iron: 3.5,
    dishes: [
      { name: 'Sopa de pollo con fideos', category: 'Entrada' },
      { name: 'Pan con tortilla de verduras', category: 'Principal' },
      { name: 'Infusión de manzanilla', category: 'Bebida' },
    ],
  },

  // ── Día 2 (Martes) ──
  {
    dayOffset: 1,
    shift: MealShift.BREAKFAST,
    startTime: '07:00',
    endTime: '08:30',
    description: 'Desayuno proteico',
    calories: 480,
    proteins: 22,
    carbs: 50,
    fats: 18,
    iron: 4.1,
    dishes: [
      { name: 'Pan con jamón y queso', category: 'Principal' },
      { name: 'Quinua con leche', category: 'Bebida' },
      { name: 'Mandarina', category: 'Fruta' },
    ],
  },
  {
    dayOffset: 1,
    shift: MealShift.LUNCH,
    startTime: '12:00',
    endTime: '14:00',
    description: 'Almuerzo criollo peruano',
    calories: 820,
    proteins: 40,
    carbs: 90,
    fats: 30,
    iron: 7.2,
    dishes: [
      { name: 'Crema de zapallo', category: 'Entrada' },
      { name: 'Lomo saltado con arroz', category: 'Principal' },
      { name: 'Ensalada mixta', category: 'Guarnición' },
      { name: 'Limonada', category: 'Bebida' },
      { name: 'Mazamorra morada', category: 'Postre' },
    ],
  },
  {
    dayOffset: 1,
    shift: MealShift.DINNER,
    startTime: '18:00',
    endTime: '19:30',
    description: 'Cena reconfortante',
    calories: 490,
    proteins: 20,
    carbs: 58,
    fats: 16,
    iron: 3.0,
    dishes: [
      { name: 'Sopa criolla', category: 'Entrada' },
      { name: 'Tamal con salsa criolla', category: 'Principal' },
      { name: 'Emoliente', category: 'Bebida' },
    ],
  },

  // ── Día 3 (Miércoles) ──
  {
    dayOffset: 2,
    shift: MealShift.BREAKFAST,
    startTime: '07:00',
    endTime: '08:30',
    description: 'Desayuno con cereales andinos',
    calories: 420,
    proteins: 16,
    carbs: 58,
    fats: 12,
    iron: 5.0,
    dishes: [
      { name: 'Pan con mantequilla y mermelada', category: 'Principal' },
      { name: 'Emoliente de cebada', category: 'Bebida' },
      { name: 'Manzana', category: 'Fruta' },
    ],
  },
  {
    dayOffset: 2,
    shift: MealShift.LUNCH,
    startTime: '12:00',
    endTime: '14:00',
    description: 'Almuerzo marino',
    calories: 750,
    proteins: 38,
    carbs: 80,
    fats: 25,
    iron: 4.5,
    dishes: [
      { name: 'Chupe de camarones', category: 'Entrada' },
      { name: 'Arroz con mariscos', category: 'Principal' },
      { name: 'Sarsa criolla', category: 'Guarnición' },
      { name: 'Refresco de maracuyá', category: 'Bebida' },
      { name: 'Arroz con leche', category: 'Postre' },
    ],
  },
  {
    dayOffset: 2,
    shift: MealShift.DINNER,
    startTime: '18:00',
    endTime: '19:30',
    description: 'Cena balanceada',
    calories: 480,
    proteins: 24,
    carbs: 52,
    fats: 17,
    iron: 3.8,
    dishes: [
      { name: 'Sopa de quinua', category: 'Entrada' },
      { name: 'Saltado de verduras con arroz', category: 'Principal' },
      { name: 'Infusión de hierba luisa', category: 'Bebida' },
    ],
  },

  // ── Día 4 (Jueves) ──
  {
    dayOffset: 3,
    shift: MealShift.BREAKFAST,
    startTime: '07:00',
    endTime: '08:30',
    description: 'Desayuno completo',
    calories: 500,
    proteins: 20,
    carbs: 60,
    fats: 18,
    iron: 3.6,
    dishes: [
      { name: 'Pan con pollo deshilachado', category: 'Principal' },
      { name: 'Leche con chocolate', category: 'Bebida' },
      { name: 'Papaya en trozos', category: 'Fruta' },
    ],
  },
  {
    dayOffset: 3,
    shift: MealShift.LUNCH,
    startTime: '12:00',
    endTime: '14:00',
    description: 'Almuerzo andino nutritivo',
    calories: 800,
    proteins: 42,
    carbs: 88,
    fats: 26,
    iron: 8.5,
    dishes: [
      { name: 'Sopa de morón', category: 'Entrada' },
      { name: 'Seco de res con frijoles', category: 'Principal' },
      { name: 'Yuca sancochada', category: 'Guarnición' },
      { name: 'Chicha morada', category: 'Bebida' },
      { name: 'Flan de vainilla', category: 'Postre' },
    ],
  },
  {
    dayOffset: 3,
    shift: MealShift.DINNER,
    startTime: '18:00',
    endTime: '19:30',
    description: 'Cena práctica',
    calories: 460,
    proteins: 18,
    carbs: 55,
    fats: 15,
    iron: 2.8,
    dishes: [
      { name: 'Sopa de verduras', category: 'Entrada' },
      { name: 'Arroz chaufa de pollo', category: 'Principal' },
      { name: 'Infusión de anís', category: 'Bebida' },
    ],
  },

  // ── Día 5 (Viernes) ──
  {
    dayOffset: 4,
    shift: MealShift.BREAKFAST,
    startTime: '07:00',
    endTime: '08:30',
    description: 'Desayuno de fin de semana',
    calories: 440,
    proteins: 17,
    carbs: 52,
    fats: 16,
    iron: 3.4,
    dishes: [
      { name: 'Pan con aceituna y queso fresco', category: 'Principal' },
      { name: 'Avena con maca', category: 'Bebida' },
      { name: 'Uvas', category: 'Fruta' },
    ],
  },
  {
    dayOffset: 4,
    shift: MealShift.LUNCH,
    startTime: '12:00',
    endTime: '14:00',
    description: 'Almuerzo especial de viernes',
    calories: 850,
    proteins: 45,
    carbs: 92,
    fats: 32,
    iron: 6.0,
    dishes: [
      { name: 'Shambar trujillano', category: 'Entrada' },
      { name: 'Cabrito a la norteña con arroz', category: 'Principal' },
      { name: 'Frijoles guisados', category: 'Guarnición' },
      { name: 'Refresco de carambola', category: 'Bebida' },
      { name: 'Picarones con miel', category: 'Postre' },
    ],
  },
  {
    dayOffset: 4,
    shift: MealShift.DINNER,
    startTime: '18:00',
    endTime: '19:30',
    description: 'Cena ligera de viernes',
    calories: 450,
    proteins: 19,
    carbs: 50,
    fats: 16,
    iron: 3.0,
    dishes: [
      { name: 'Sopa wantán', category: 'Entrada' },
      { name: 'Pan con lomo ahumado', category: 'Principal' },
      { name: 'Infusión de muña', category: 'Bebida' },
    ],
  },
];

// ═══════════════════════════════════════════
// Datos de Valoraciones
// ═══════════════════════════════════════════

const commentsPool = [
  'Muy buena sazón, me gustó mucho el almuerzo de hoy.',
  'La sopa estaba un poco fría, pero el segundo estuvo bien.',
  'Excelente variedad, ojalá sigan así.',
  'La cantidad fue poca para lo que necesito.',
  'El arroz estaba muy bueno, la ensalada fresca.',
  'Me encantó el postre, hacía tiempo no lo servían.',
  'El servicio fue rápido y amable.',
  'Las mesas estaban limpias, buen ambiente.',
  'Le faltó un poco de sal al segundo.',
  'Todo estuvo delicioso, felicitaciones al equipo.',
  'La chicha morada estaba muy dulce.',
  'Podrían mejorar la variedad de frutas.',
  'El shambar estuvo espectacular, típico de Trujillo.',
  'Buena presentación de los platos.',
  null,
  null,
  null,
  null,
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ═══════════════════════════════════════════
// Función Principal de Seed
// ═══════════════════════════════════════════

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // Limpiar datos existentes
  console.log('🗑️  Limpiando datos anteriores...');
  await prisma.rating.deleteMany();
  await prisma.menuImage.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.user.deleteMany();

  // ── Crear Usuarios ──
  console.log('👤 Creando usuarios...');
  const createdUsers = [];

  for (const userData of usersData) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = await prisma.user.create({
      data: {
        universityId: userData.universityId,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      },
    });
    createdUsers.push(user);
    const roleLabel = user.role === 'ADMIN' ? '🔑 Admin' : '🎓 Estudiante';
    console.log(`   ${roleLabel}: ${user.name} (${user.universityId})`);
  }

  const students = createdUsers.filter((u) => u.role === 'STUDENT');

  // ── Crear Menús ──
  console.log('\n📋 Creando menús...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const createdMenus = [];

  for (const menuData of menusData) {
    const menuDate = new Date(today);
    menuDate.setDate(menuDate.getDate() - menuData.dayOffset);

    const menu = await prisma.menu.create({
      data: {
        date: menuDate,
        shift: menuData.shift,
        startTime: menuData.startTime,
        endTime: menuData.endTime,
        description: menuData.description,
        calories: menuData.calories,
        proteins: menuData.proteins,
        carbs: menuData.carbs,
        fats: menuData.fats,
        iron: menuData.iron,
        dishes: {
          create: menuData.dishes.map((dish) => ({
            name: dish.name,
            category: dish.category,
          })),
        },
        images: {
          create: [
            {
              shift: menuData.shift,
              url: `https://res.cloudinary.com/demo/image/upload/v1/unt-comedor/menu-${menuData.shift.toLowerCase()}-${menuData.dayOffset}.jpg`,
              publicId: `unt-comedor/menu-${menuData.shift.toLowerCase()}-${menuData.dayOffset}`,
            },
          ],
        },
      },
    });

    createdMenus.push(menu);
    const shiftLabel =
      menuData.shift === 'BREAKFAST'
        ? '🌅 Desayuno'
        : menuData.shift === 'LUNCH'
          ? '☀️ Almuerzo'
          : '🌙 Cena';
    console.log(
      `   ${shiftLabel} - ${menuDate.toISOString().split('T')[0]}: ${menuData.dishes[1]?.name || menuData.dishes[0].name}`
    );
  }

  // ── Crear Valoraciones ──
  console.log('\n⭐ Creando valoraciones...');
  let ratingCount = 0;

  for (const menu of createdMenus) {
    // Cada menú recibe entre 3 y 6 valoraciones aleatorias
    const numRatings = randomInt(3, Math.min(6, students.length));
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    const ratingStudents = shuffledStudents.slice(0, numRatings);

    for (const student of ratingStudents) {
      const baseScore = randomInt(3, 5);

      await prisma.rating.create({
        data: {
          menuId: menu.id,
          userId: student.id,
          taste: Math.min(5, Math.max(1, baseScore + randomInt(-1, 1))),
          quantity: Math.min(5, Math.max(1, baseScore + randomInt(-1, 1))),
          variety: Math.min(5, Math.max(1, baseScore + randomInt(-1, 0))),
          hygiene: Math.min(5, Math.max(1, baseScore + randomInt(0, 1))),
          service: Math.min(5, Math.max(1, baseScore + randomInt(-1, 1))),
          comment: randomChoice(commentsPool),
        },
      });
      ratingCount++;
    }
  }
  console.log(`   ✅ ${ratingCount} valoraciones creadas`);

  // ── Resumen ──
  const totalUsers = await prisma.user.count();
  const totalMenus = await prisma.menu.count();
  const totalDishes = await prisma.dish.count();
  const totalImages = await prisma.menuImage.count();
  const totalRatings = await prisma.rating.count();

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   🌱 Seed completado exitosamente        ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║   👤 Usuarios:     ${String(totalUsers).padStart(3)}                   ║`);
  console.log(`║   📋 Menús:        ${String(totalMenus).padStart(3)}                   ║`);
  console.log(`║   🍽️  Platos:       ${String(totalDishes).padStart(3)}                   ║`);
  console.log(`║   📸 Imágenes:     ${String(totalImages).padStart(3)}                   ║`);
  console.log(`║   ⭐ Valoraciones: ${String(totalRatings).padStart(3)}                   ║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('\n📌 Credenciales de prueba:');
  console.log('   Admin:      ADMIN001 / Admin123!');
  console.log('   Estudiante: 2020101001 / Student123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
