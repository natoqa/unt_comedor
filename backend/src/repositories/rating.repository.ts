import { prisma } from '../config';
import { MealShift, Prisma } from '@prisma/client';
import { getTodayDateString, parseDateOnly } from '../utils/date';

interface StatsFilters {
  menuId?: string;
  dateFrom?: string;
  dateTo?: string;
  shift?: MealShift;
}

export class RatingRepository {
  async findByMenuAndUser(menuId: string, userId: string) {
    return prisma.rating.findUnique({
      where: { menuId_userId: { menuId, userId } },
    });
  }

  async create(data: {
    menuId: string;
    userId: string;
    taste: number;
    quantity: number;
    variety: number;
    hygiene: number;
    service: number;
    comment?: string | null;
  }) {
    return prisma.rating.create({
      data,
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
    });
  }

  async getGlobalStats(filters: StatsFilters) {
    const where = this.buildWhereClause(filters);

    const [aggregates, totalCount, recentComments] = await Promise.all([
      prisma.rating.aggregate({
        where,
        _avg: {
          taste: true,
          quantity: true,
          variety: true,
          hygiene: true,
          service: true,
        },
        _count: true,
      }),
      prisma.rating.count({ where }),
      prisma.rating.findMany({
        where: { ...where, comment: { not: null } },
        select: {
          comment: true,
          taste: true,
          quantity: true,
          variety: true,
          hygiene: true,
          service: true,
          createdAt: true,
          menu: {
            select: {
              date: true,
              shift: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    // Distribución de calificaciones (1-5)
    const distribution = await this.getDistribution(where);

    // Promedio general
    const avg = aggregates._avg;
    const overallAvg =
      avg.taste && avg.quantity && avg.variety && avg.hygiene && avg.service
        ? (avg.taste + avg.quantity + avg.variety + avg.hygiene + avg.service) / 5
        : null;

    return {
      totalRatings: totalCount,
      overallAverage: overallAvg ? Math.round(overallAvg * 100) / 100 : null,
      dimensions: {
        taste: avg.taste ? Math.round(avg.taste * 100) / 100 : null,
        quantity: avg.quantity ? Math.round(avg.quantity * 100) / 100 : null,
        variety: avg.variety ? Math.round(avg.variety * 100) / 100 : null,
        hygiene: avg.hygiene ? Math.round(avg.hygiene * 100) / 100 : null,
        service: avg.service ? Math.round(avg.service * 100) / 100 : null,
      },
      distribution,
      recentComments,
    };
  }

  async getStatsByShift(filters: StatsFilters) {
    const shifts: MealShift[] = ['BREAKFAST', 'LUNCH', 'DINNER'];
    const results = [];

    for (const shift of shifts) {
      const where = this.buildWhereClause({ ...filters, shift });
      const agg = await prisma.rating.aggregate({
        where,
        _avg: {
          taste: true,
          quantity: true,
          variety: true,
          hygiene: true,
          service: true,
        },
        _count: true,
      });

      const avg = agg._avg;
      const overallAvg =
        avg.taste && avg.quantity && avg.variety && avg.hygiene && avg.service
          ? (avg.taste + avg.quantity + avg.variety + avg.hygiene + avg.service) / 5
          : null;

      results.push({
        shift,
        totalRatings: agg._count,
        overallAverage: overallAvg ? Math.round(overallAvg * 100) / 100 : null,
        dimensions: {
          taste: avg.taste ? Math.round(avg.taste * 100) / 100 : null,
          quantity: avg.quantity ? Math.round(avg.quantity * 100) / 100 : null,
          variety: avg.variety ? Math.round(avg.variety * 100) / 100 : null,
          hygiene: avg.hygiene ? Math.round(avg.hygiene * 100) / 100 : null,
          service: avg.service ? Math.round(avg.service * 100) / 100 : null,
        },
      });
    }

    return results;
  }

  async getTrends(period: 'week' | 'month' | 'quarter' = 'week') {
    const todayStr = getTodayDateString(); // YYYY-MM-DD in America/Lima timezone
    const daysBack = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    
    // Calculate start date by subtracting days from today (in America/Lima timezone)
    const todayDate = parseDateOnly(todayStr);
    const startDate = new Date(todayDate);
    startDate.setUTCDate(startDate.getUTCDate() - daysBack);

    const menus = await prisma.menu.findMany({
      where: {
        date: { gte: startDate }
      },
      include: {
        ratings: {
          select: {
            taste: true,
            quantity: true,
            variety: true,
            hygiene: true,
            service: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Agrupar por fecha
    const grouped = new Map<string, {
      taste: number[];
      quantity: number[];
      variety: number[];
      hygiene: number[];
      service: number[];
    }>();

    for (const menu of menus) {
      const dateKey = menu.date.toISOString().split('T')[0];
      for (const r of menu.ratings) {
        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, {
            taste: [], quantity: [], variety: [], hygiene: [], service: [],
          });
        }
        const g = grouped.get(dateKey)!;
        g.taste.push(r.taste);
        g.quantity.push(r.quantity);
        g.variety.push(r.variety);
        g.hygiene.push(r.hygiene);
        g.service.push(r.service);
      }
    }

    const trends = Array.from(grouped.entries()).map(([date, vals]) => {
      const avg = (arr: number[]) =>
        arr.length > 0
          ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100
          : null;

      return {
        date,
        taste: avg(vals.taste),
        quantity: avg(vals.quantity),
        variety: avg(vals.variety),
        hygiene: avg(vals.hygiene),
        service: avg(vals.service),
        count: vals.taste.length,
      };
    });

    return trends;
  }

  async getMenuStats(menuId: string) {
    const [aggregates, ratings] = await Promise.all([
      prisma.rating.aggregate({
        where: { menuId },
        _avg: {
          taste: true,
          quantity: true,
          variety: true,
          hygiene: true,
          service: true,
        },
        _count: true,
      }),
      prisma.rating.findMany({
        where: { menuId, comment: { not: null } },
        select: {
          comment: true,
          taste: true,
          quantity: true,
          variety: true,
          hygiene: true,
          service: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      totalRatings: aggregates._count,
      dimensions: {
        taste: aggregates._avg.taste ? Math.round(aggregates._avg.taste * 100) / 100 : null,
        quantity: aggregates._avg.quantity ? Math.round(aggregates._avg.quantity * 100) / 100 : null,
        variety: aggregates._avg.variety ? Math.round(aggregates._avg.variety * 100) / 100 : null,
        hygiene: aggregates._avg.hygiene ? Math.round(aggregates._avg.hygiene * 100) / 100 : null,
        service: aggregates._avg.service ? Math.round(aggregates._avg.service * 100) / 100 : null,
      },
      comments: ratings,
    };
  }

  async getMenuExtremes(days: number = 7) {
    const todayStr = getTodayDateString(); // YYYY-MM-DD in America/Lima timezone
    
    // Calculate start date by subtracting days from today (in America/Lima timezone)
    const todayDate = parseDateOnly(todayStr);
    const startDate = new Date(todayDate);
    startDate.setUTCDate(startDate.getUTCDate() - days);

    // First, get all menus in the last 7 days with their ratings
    const menus = await prisma.menu.findMany({
      where: {
        date: { gte: startDate },
      },
      include: {
        ratings: {
          select: {
            taste: true,
            quantity: true,
            variety: true,
            hygiene: true,
            service: true,
          },
        },
      },
    });

    const dayStats = new Map<string, number[]>(); // date -> array of averages (1 per shift)

    for (const menu of menus) {
      if (menu.ratings.length === 0) continue;
      
      const total = menu.ratings.reduce((sum, r) => {
        return sum + (r.taste + r.quantity + r.variety + r.hygiene + r.service) / 5;
      }, 0);
      const avg = total / menu.ratings.length;

      const dateKey = menu.date.toISOString().split('T')[0];
      if (!dayStats.has(dateKey)) {
        dayStats.set(dateKey, []);
      }
      dayStats.get(dateKey)!.push(avg);
    }

    let bestDay = null;
    let worstDay = null;
    let maxAvg = -1;
    let minAvg = 6;

    for (const [date, avgs] of dayStats.entries()) {
      const dayAvg = avgs.reduce((a, b) => a + b, 0) / avgs.length;

      if (dayAvg > maxAvg) {
        maxAvg = dayAvg;
        bestDay = { date, average: Math.round(dayAvg * 100) / 100 };
      }
      if (dayAvg < minAvg) {
        minAvg = dayAvg;
        worstDay = { date, average: Math.round(dayAvg * 100) / 100 };
      }
    }

    return { bestMenu: bestDay, worstMenu: worstDay };
  }

  async getShiftExtremes(days: number = 7) {
    const todayStr = getTodayDateString();
    
    const todayDate = parseDateOnly(todayStr);
    const startDate = new Date(todayDate);
    startDate.setUTCDate(startDate.getUTCDate() - days);

    const menus = await prisma.menu.findMany({
      where: {
        date: { gte: startDate },
      },
      include: {
        ratings: {
          select: {
            taste: true,
            quantity: true,
            variety: true,
            hygiene: true,
            service: true,
          },
        },
      },
    });

    const extremes = {
      BREAKFAST: { best: null as any, worst: null as any, max: -1, min: 6 },
      LUNCH: { best: null as any, worst: null as any, max: -1, min: 6 },
      DINNER: { best: null as any, worst: null as any, max: -1, min: 6 },
    };

    for (const menu of menus) {
      if (menu.ratings.length === 0) continue;

      const total = menu.ratings.reduce((sum, r) => {
        return sum + (r.taste + r.quantity + r.variety + r.hygiene + r.service) / 5;
      }, 0);
      const avg = total / menu.ratings.length;

      const shiftEx = extremes[menu.shift];
      
      if (avg > shiftEx.max) {
        shiftEx.max = avg;
        shiftEx.best = { 
          id: menu.id, 
          date: menu.date.toISOString().split('T')[0], // ✅ Fix
          shift: menu.shift, 
          average: Math.round(avg * 100) / 100 
        };
      }
      if (avg < shiftEx.min) {
        shiftEx.min = avg;
        shiftEx.worst = { 
          id: menu.id, 
          date: menu.date.toISOString().split('T')[0], // ✅ Fix
          shift: menu.shift, 
          average: Math.round(avg * 100) / 100 
        };
      }
    }

    return {
      breakfast: { best: extremes.BREAKFAST.best, worst: extremes.BREAKFAST.worst },
      lunch: { best: extremes.LUNCH.best, worst: extremes.LUNCH.worst },
      dinner: { best: extremes.DINNER.best, worst: extremes.DINNER.worst },
    };
  }

  private buildWhereClause(filters: StatsFilters): Prisma.RatingWhereInput {
    const where: Prisma.RatingWhereInput = {};

    if (filters.menuId) {
      where.menuId = filters.menuId;
    }

    if (filters.shift || filters.dateFrom || filters.dateTo) {
      where.menu = {};
      if (filters.shift) where.menu.shift = filters.shift;
      if (filters.dateFrom || filters.dateTo) {
        where.menu.date = {};
        if (filters.dateFrom) (where.menu.date as Prisma.DateTimeFilter).gte = new Date(filters.dateFrom);
        if (filters.dateTo) (where.menu.date as Prisma.DateTimeFilter).lte = new Date(filters.dateTo);
      }
    }

    return where;
  }

  private async getDistribution(where: Prisma.RatingWhereInput) {
    const distribution: { stars: number; count: number }[] = [];

    for (let stars = 1; stars <= 5; stars++) {
      const count = await prisma.rating.count({
        where: {
          ...where,
          OR: [
            { taste: stars },
            { quantity: stars },
            { variety: stars },
            { hygiene: stars },
            { service: stars },
          ],
        },
      });
      distribution.push({ stars, count });
    }

    return distribution;
  }
}
