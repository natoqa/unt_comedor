import { prisma } from '../config';
import { MealShift, Prisma } from '@prisma/client';
import { getTodayDateString, getDateOnlyRange, parseDateOnly } from '../utils/date';

interface FindAllOptions {
  page: number;
  limit: number;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  shift?: MealShift;
  search?: string;
}

const menuInclude = {
  dishes: {
    orderBy: { createdAt: 'asc' as const },
  },
  images: {
    orderBy: { shift: 'asc' as const },
  },
  _count: {
    select: { ratings: true },
  },
};

export class MenuRepository {
  async findAll(options: FindAllOptions) {
    const { page, limit, date, dateFrom, dateTo, shift, search } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.MenuWhereInput = { isActive: true };

    if (date) {
      where.date = getDateOnlyRange(date);
    } else {
      if (dateFrom) {
        where.date = { ...(where.date as object), gte: parseDateOnly(dateFrom) };
      }
      if (dateTo) {
        where.date = { ...(where.date as object), lte: parseDateOnly(dateTo) };
      }
    }

    if (shift) where.shift = shift;

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { dishes: { some: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [menus, total] = await Promise.all([
      prisma.menu.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ date: 'desc' }, { shift: 'asc' }],
        include: menuInclude,
      }),
      prisma.menu.count({ where }),
    ]);

    return { menus, total };
  }

  async findById(id: string) {
    return prisma.menu.findUnique({
      where: { id },
      include: {
        ...menuInclude,
        ratings: {
          select: {
            id: true,
            taste: true,
            quantity: true,
            variety: true,
            hygiene: true,
            service: true,
            comment: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByDateAndShift(date: Date, shift: MealShift) {
    return prisma.menu.findUnique({
      where: { date_shift: { date, shift } },
    });
  }

  async findTodayMenus() {
    return prisma.menu.findMany({
      where: { date: getDateOnlyRange(getTodayDateString()), isActive: true },
      orderBy: { shift: 'asc' },
      include: menuInclude,
    });
  }

  async create(data: {
    date: Date;
    shift: MealShift;
    startTime: string;
    endTime: string;
    description?: string;
    calories?: number;
    proteins?: number;
    carbs?: number;
    fats?: number;
    iron?: number;
    dishes: { name: string; category?: string }[];
  }) {
    return prisma.menu.create({
      data: {
        date: data.date,
        shift: data.shift,
        startTime: data.startTime,
        endTime: data.endTime,
        description: data.description,
        calories: data.calories,
        proteins: data.proteins,
        carbs: data.carbs,
        fats: data.fats,
        iron: data.iron,
        dishes: {
          create: data.dishes.map((d) => ({
            name: d.name,
            category: d.category,
          })),
        },
      },
      include: menuInclude,
    });
  }

  async update(
    id: string,
    data: {
      date?: Date;
      shift?: MealShift;
      startTime?: string;
      endTime?: string;
      description?: string;
      calories?: number;
      proteins?: number;
      carbs?: number;
      fats?: number;
      iron?: number;
      dishes?: { name: string; category?: string }[];
    }
  ) {
    const { dishes, ...menuData } = data;

    return prisma.$transaction(async (tx) => {
      if (dishes) {
        await tx.dish.deleteMany({ where: { menuId: id } });
      }

      return tx.menu.update({
        where: { id },
        data: {
          ...menuData,
          ...(dishes && {
            dishes: {
              create: dishes.map((d) => ({
                name: d.name,
                category: d.category,
              })),
            },
          }),
        },
        include: menuInclude,
      });
    });
  }

  async softDelete(id: string) {
    return prisma.menu.delete({
      where: { id },
    });
  }

  async upsertImage(
    menuId: string,
    shift: MealShift,
    url: string,
    publicId: string
  ) {
    return prisma.menuImage.upsert({
      where: { menuId_shift: { menuId, shift } },
      create: { menuId, shift, url, publicId },
      update: { url, publicId },
    });
  }

  async findImageByShift(menuId: string, shift: MealShift) {
    return prisma.menuImage.findUnique({
      where: { menuId_shift: { menuId, shift } },
    });
  }

  async removeImage(imageId: string) {
    return prisma.menuImage.delete({
      where: { id: imageId },
    });
  }

  async countImages(menuId: string) {
    return prisma.menuImage.count({ where: { menuId } });
  }
}
