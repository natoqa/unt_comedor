import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';
import { TicketRepository } from '../repositories';
import { NotFoundError, AppError } from '../utils/errors';
import type { CreateTicketInput, CreateTicketResponseInput } from '../validators/ticket.validator';
import { Role } from '../types';

const ticketRepository = new TicketRepository();

export class TicketService {
  async create(userId: string, data: CreateTicketInput) {
    return ticketRepository.create({
      userId,
      category: data.category as TicketCategory,
      priority: (data.priority as TicketPriority) || undefined,
      subject: data.subject,
      description: data.description,
    });
  }

  async getById(ticketId: string, userId: string, role: Role) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket');
    if (role === Role.STUDENT && ticket.userId !== userId) {
      throw new AppError('No tienes acceso a este ticket', 403);
    }
    return ticket;
  }

  async getMyTickets(userId: string, filters: { status?: string; page?: number; limit?: number }) {
    return ticketRepository.findByUserId(userId, {
      status: filters.status as TicketStatus | undefined,
      page: filters.page,
      limit: filters.limit,
    });
  }

  async getAll(filters: { status?: string; priority?: string; category?: string; page?: number; limit?: number }) {
    return ticketRepository.findAll({
      status: filters.status as TicketStatus | undefined,
      priority: filters.priority as TicketPriority | undefined,
      category: filters.category as TicketCategory | undefined,
      page: filters.page,
      limit: filters.limit,
    });
  }

  async updateStatus(ticketId: string, status: string) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket');

    const validTransitions: Record<string, string[]> = {
      OPEN: ['IN_REVIEW', 'CLOSED'],
      IN_REVIEW: ['RESOLVED', 'OPEN', 'CLOSED'],
      RESOLVED: ['CLOSED', 'IN_REVIEW'],
      CLOSED: [],
    };

    if (!validTransitions[ticket.status]?.includes(status)) {
      throw new AppError(`No se puede cambiar de ${ticket.status} a ${status}`, 400);
    }

    return ticketRepository.updateStatus(ticketId, status as TicketStatus);
  }

  async addResponse(ticketId: string, userId: string, role: Role, message: string) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket');
    if (ticket.status === 'CLOSED') {
      throw new AppError('No se puede responder a un ticket cerrado', 400);
    }
    if (role === Role.STUDENT && ticket.userId !== userId) {
      throw new AppError('No tienes acceso a este ticket', 403);
    }

    return ticketRepository.addResponse({ ticketId, userId, message });
  }

  async getStats() {
    return ticketRepository.getStats();
  }
}
