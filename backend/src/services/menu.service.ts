import { MealShift } from '@prisma/client';
import { MenuRepository } from '../repositories';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { uploadMenuImage, deleteMenuImage, resolveMenuImageUrl } from '../utils/image-storage';
import { parseDateOnly } from '../utils/date';
import type { CreateMenuInput, UpdateMenuInput } from '../validators';

const menuRepository = new MenuRepository();

const MEAL_SHIFTS: MealShift[] = ['BREAKFAST', 'LUNCH', 'DINNER'];

const SHIFT_LABELS: Record<MealShift, string> = {
  BREAKFAST: 'desayuno',
  LUNCH: 'almuerzo',
  DINNER: 'cena',
};

type MenuWithImages = {
  images: { url: string; publicId: string }[];
};

function mapMenuImages<T extends MenuWithImages>(menu: T): T {
  return {
    ...menu,
    images: menu.images.map((img) => ({
      ...img,
      url: resolveMenuImageUrl(img),
    })),
  };
}

export class MenuService {
  private mapMenu<T extends MenuWithImages>(menu: T): T {
    return mapMenuImages(menu);
  }

  private mapMenus<T extends MenuWithImages>(menus: T[]): T[] {
    return menus.map((m) => this.mapMenu(m));
  }

  async getAll(query: {
    page?: number;
    limit?: number;
    date?: string;
    dateFrom?: string;
    dateTo?: string;
    shift?: string;
    search?: string;
  }) {
    const page = parseInt(query.page as unknown as string) || 1;
    const limit = parseInt(query.limit as unknown as string) || 10;

    const result = await menuRepository.findAll({
      page,
      limit,
      date: query.date,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      shift: query.shift as MealShift | undefined,
      search: query.search,
    });
    return {
      menus: this.mapMenus(result.menus),
      total: result.total,
    };
  }

  async getById(id: string) {
    const menu = await menuRepository.findById(id);
    if (!menu) throw new NotFoundError('Menú');
    return this.mapMenu(menu);
  }

  async getToday() {
    const menus = await menuRepository.findTodayMenus();
    return this.mapMenus(menus);
  }

  async create(data: CreateMenuInput) {
    const menuDate = parseDateOnly(data.date);

    const existing = await menuRepository.findByDateAndShift(
      menuDate,
      data.shift as MealShift
    );
    if (existing) {
      throw new ConflictError(
        `Ya existe un menú para esa fecha y turno`
      );
    }

    const menu = await menuRepository.create({
      date: menuDate,
      shift: data.shift as MealShift,
      startTime: data.startTime,
      endTime: data.endTime,
      description: data.description,
      calories: data.calories,
      proteins: data.proteins,
      carbs: data.carbs,
      fats: data.fats,
      iron: data.iron,
      dishes: data.dishes,
    });
    return this.mapMenu(menu);
  }

  async update(id: string, data: UpdateMenuInput) {
    const menu = await menuRepository.findById(id);
    if (!menu) throw new NotFoundError('Menú');

    const updateData: Record<string, unknown> = {};

    if (data.date) updateData.date = parseDateOnly(data.date);
    if (data.shift) updateData.shift = data.shift;
    if (data.startTime) updateData.startTime = data.startTime;
    if (data.endTime) updateData.endTime = data.endTime;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.calories !== undefined) updateData.calories = data.calories;
    if (data.proteins !== undefined) updateData.proteins = data.proteins;
    if (data.carbs !== undefined) updateData.carbs = data.carbs;
    if (data.fats !== undefined) updateData.fats = data.fats;
    if (data.iron !== undefined) updateData.iron = data.iron;
    if (data.dishes) updateData.dishes = data.dishes;

    const updated = await menuRepository.update(
      id,
      updateData as Parameters<typeof menuRepository.update>[1]
    );
    return this.mapMenu(updated);
  }

  async delete(id: string) {
    const menu = await menuRepository.findById(id);
    if (!menu) throw new NotFoundError('Menú');
    return menuRepository.softDelete(id);
  }

  async uploadImages(
    id: string,
    filesByShift: Partial<Record<MealShift, Express.Multer.File>>
  ) {
    const menu = await menuRepository.findById(id);
    if (!menu) throw new NotFoundError('Menú');

    const shift = menu.shift;
    const file = filesByShift[shift];
    if (!file) {
      throw new ValidationError(`Debes subir la imagen de ${SHIFT_LABELS[shift]}`);
    }

    const existing = menu.images.find((img) => img.shift === shift);
    const result = await uploadMenuImage(file);

    if (existing) {
      await deleteMenuImage(existing.publicId);
    }

    const image = await menuRepository.upsertImage(id, shift, result.url, result.publicId);
    return [{ ...image, url: resolveMenuImageUrl(image) }];
  }

  async deleteImage(menuId: string, imageId: string) {
    const menu = await menuRepository.findById(menuId);
    if (!menu) throw new NotFoundError('Menú');

    const image = menu.images.find((img) => img.id === imageId);
    if (!image) throw new NotFoundError('Imagen');

    await deleteMenuImage(image.publicId);
    await menuRepository.removeImage(imageId);
  }
}
