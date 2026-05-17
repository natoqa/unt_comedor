import { prisma } from '../config';
import { UserRepository } from '../repositories';
import { Role } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';
import bcrypt from 'bcryptjs';

const userRepository = new UserRepository();

export class UserService {
  async getAll(query: { page?: string; limit?: string; search?: string; role?: string }) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.role) {
      where.role = query.role as Role;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          universityId: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: {
    universityId: string;
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const existing = await userRepository.findByUniversityId(data.universityId);
    if (existing) {
      throw Object.assign(new Error('El código universitario ya está registrado'), { statusCode: 400 });
    }

    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw Object.assign(new Error('El email ya está registrado'), { statusCode: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    return userRepository.create({
      universityId: data.universityId,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: (data.role as Role) || Role.STUDENT,
    });
  }

  async update(id: string, data: { name?: string; email?: string; role?: string; isActive?: boolean }) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw Object.assign(new Error('Usuario no encontrado'), { statusCode: 404 });
    }

    if (data.email && data.email !== user.email) {
      const existingEmail = await userRepository.findByEmail(data.email);
      if (existingEmail) {
        throw Object.assign(new Error('El email ya está registrado'), { statusCode: 400 });
      }
    }

    return userRepository.update(id, {
      name: data.name,
      email: data.email,
      role: data.role as Role | undefined,
      isActive: data.isActive,
    });
  }

  async delete(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw Object.assign(new Error('Usuario no encontrado'), { statusCode: 404 });
    }
    await userRepository.delete(id);
  }

  async getDashboardStats() {
    const now = new Date();
    const startOfToday = startOfDay(now);
    const endOfToday = endOfDay(now);

    const [activeStudents, groupedMenus, ratingsToday, allRatings] = await Promise.all([
      prisma.user.count({
        where: { role: 'STUDENT', isActive: true },
      }),
      prisma.menu.groupBy({
        by: ['date'],
      }),
      prisma.rating.count({
        where: {
          createdAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),
      prisma.rating.findMany({
        select: {
          taste: true,
          quantity: true,
          variety: true,
          hygiene: true,
          service: true,
          comment: true,
        },
      }),
    ]);

    let positiveRatingsCount = 0;
    let complaintsCount = 0;

    for (const rating of allRatings) {
      const average = (rating.taste + rating.quantity + rating.variety + rating.hygiene + rating.service) / 5;
      if (average >= 4) {
        positiveRatingsCount++;
      }
      if (average <= 2 && rating.comment && rating.comment.trim() !== '') {
        complaintsCount++;
      }
    }

    const positiveRatingsPercentage = allRatings.length > 0 
      ? Math.round((positiveRatingsCount / allRatings.length) * 100) 
      : 0;

    const totalMenus = groupedMenus.length;

    return {
      activeStudents,
      totalMenus,
      ratingsToday,
      positiveRatingsPercentage,
      complaints: complaintsCount,
    };
  }
}
