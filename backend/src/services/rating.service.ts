import { MealShift } from '@prisma/client';
import { RatingRepository } from '../repositories';
import { MenuRepository } from '../repositories';
import { NotFoundError, ConflictError } from '../utils/errors';
import type { CreateRatingInput } from '../validators';
import { prisma } from '../config';

const ratingRepository = new RatingRepository();
const menuRepository = new MenuRepository();

export class RatingService {
  async create(userId: string, data: CreateRatingInput) {
    // Verificar que el menú existe
    const menu = await menuRepository.findById(data.menuId);
    if (!menu) {
      throw new NotFoundError('Menú');
    }

    // Verificar que no haya valorado ya este menú
    const existing = await ratingRepository.findByMenuAndUser(data.menuId, userId);
    if (existing) {
      throw new ConflictError('Ya has valorado este menú');
    }

    return ratingRepository.create({
      menuId: data.menuId,
      userId,
      taste: data.taste,
      quantity: data.quantity,
      variety: data.variety,
      hygiene: data.hygiene,
      service: data.service,
      comment: data.comment,
    });
  }

  async getGlobalStats(query: {
    menuId?: string;
    dateFrom?: string;
    dateTo?: string;
    shift?: string;
  }) {
    return ratingRepository.getGlobalStats({
      menuId: query.menuId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      shift: query.shift as MealShift | undefined,
    });
  }

  async getStatsByShift(query: {
    dateFrom?: string;
    dateTo?: string;
  }) {
    return ratingRepository.getStatsByShift({
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
  }

  async getTrends(period: 'week' | 'month' | 'quarter' = 'week') {
    return ratingRepository.getTrends(period);
  }

  async getMenuStats(menuId: string) {
    const menu = await menuRepository.findById(menuId);
    if (!menu) {
      throw new NotFoundError('Menú');
    }
    return ratingRepository.getMenuStats(menuId);
  }

  async getMenuExtremes(days: number = 7) {
    return ratingRepository.getMenuExtremes(days);
  }

  async getShiftExtremes(days: number = 7) {
    return ratingRepository.getShiftExtremes(days);
  }

  async checkUserRating(menuId: string, userId: string) {
    const rating = await ratingRepository.findByMenuAndUser(menuId, userId);
    return { hasRated: !!rating, rating };
  }

  async exportRatings(query: { dateFrom?: string; dateTo?: string; shift?: string }) {
    const where: any = {};
    if (query.dateFrom || query.dateTo || query.shift) {
      where.menu = {};
      if (query.dateFrom) where.menu.date = { ...where.menu.date, gte: new Date(query.dateFrom) };
      if (query.dateTo) where.menu.date = { ...where.menu.date, lte: new Date(query.dateTo) };
      if (query.shift) where.menu.shift = query.shift;
    }

    const ratings = await prisma.rating.findMany({
      where,
      include: {
        menu: { select: { date: true, shift: true, description: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ratings.map((r) => ({
      fecha: r.menu.date.toISOString().split('T')[0],
      turno: r.menu.shift === 'BREAKFAST' ? 'Desayuno' : r.menu.shift === 'LUNCH' ? 'Almuerzo' : 'Cena',
      descripcion: r.menu.description || '',
      sabor: r.taste,
      cantidad: r.quantity,
      variedad: r.variety,
      higiene: r.hygiene,
      atencion: r.service,
      promedio: Number(((r.taste + r.quantity + r.variety + r.hygiene + r.service) / 5).toFixed(2)),
      comentario: r.comment || '',
      fecha_valoracion: r.createdAt.toISOString().split('T')[0],
    }));
  }
}
