import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';
import { prisma } from '../config';

export class TicketRepository {
  async create(data: {
    userId: string;
    category: TicketCategory;
    priority?: TicketPriority;
    subject: string;
    description: string;
  }) {
    return prisma.ticket.create({
      data,
      include: { user: { select: { name: true, universityId: true } } },
    });
  }

  async findById(id: string) {
    return prisma.ticket.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, universityId: true, role: true } },
        responses: {
          include: { user: { select: { name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findByUserId(userId: string, filters: { status?: TicketStatus; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const where: any = { userId };
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: { _count: { select: { responses: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findAll(filters: {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.category) where.category = filters.category;

    const [data, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          user: { select: { name: true, universityId: true } },
          _count: { select: { responses: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async updateStatus(id: string, status: TicketStatus) {
    const updateData: any = { status };
    if (status === 'RESOLVED') updateData.resolvedAt = new Date();
    if (status === 'CLOSED') updateData.closedAt = new Date();

    return prisma.ticket.update({
      where: { id },
      data: updateData,
      include: { user: { select: { name: true, universityId: true } } },
    });
  }

  async addResponse(data: { ticketId: string; userId: string; message: string }) {
    return prisma.ticketResponse.create({
      data,
      include: { user: { select: { name: true, role: true } } },
    });
  }

  async getStats() {
    const [total, byStatus, byPriority, resolved] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.groupBy({ by: ['status'], _count: true }),
      prisma.ticket.groupBy({ by: ['priority'], _count: true }),
      prisma.ticket.findMany({
        where: { resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true },
      }),
    ]);

    const statusCounts: Record<string, number> = { OPEN: 0, IN_REVIEW: 0, RESOLVED: 0, CLOSED: 0 };
    byStatus.forEach((s) => { statusCounts[s.status] = s._count; });

    const priorityCounts: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };
    byPriority.forEach((p) => { priorityCounts[p.priority] = p._count; });

    let averageResolutionHours: number | null = null;
    if (resolved.length > 0) {
      const totalHours = resolved.reduce((sum, t) => {
        const diff = (t.resolvedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
        return sum + diff;
      }, 0);
      averageResolutionHours = Math.round((totalHours / resolved.length) * 10) / 10;
    }

    return { total, byStatus: statusCounts, byPriority: priorityCounts, averageResolutionHours };
  }
}
