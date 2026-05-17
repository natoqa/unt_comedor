import { prisma } from '../config';
import { Role } from '@prisma/client';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
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
    });
  }

  async findByUniversityId(universityId: string) {
    return prisma.user.findUnique({
      where: { universityId },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: {
    universityId: string;
    name: string;
    email: string;
    password: string;
    role?: Role;
  }) {
    return prisma.user.create({
      data: {
        universityId: data.universityId,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || Role.STUDENT,
      },
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
    });
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
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
      prisma.user.count(),
    ]);
    return { users, total };
  }

  async updateStatus(id: string, isActive: boolean) {
    return prisma.user.update({
      where: { id },
      data: { isActive },
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
    });
  }

  async update(id: string, data: { name?: string; email?: string; role?: Role; isActive?: boolean }) {
    return prisma.user.update({
      where: { id },
      data,
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
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}
