import { Response, NextFunction } from 'express';
import { TicketService } from '../services/ticket.service';
import { sendSuccess, sendPaginated } from '../utils';
import { AuthRequest, Role } from '../types';

const ticketService = new TicketService();

export class TicketController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.create(req.user!.userId, req.body);
      sendSuccess(res, ticket, 'Ticket creado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyTickets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query as Record<string, string>;
      const result = await ticketService.getMyTickets(req.user!.userId, {
        status,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      sendPaginated(res, result.data, result.total, result.page, result.limit, 'Tickets obtenidos');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, priority, category, page, limit } = req.query as Record<string, string>;
      const result = await ticketService.getAll({
        status,
        priority,
        category,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      sendPaginated(res, result.data, result.total, result.page, result.limit, 'Tickets obtenidos');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.getById(
        req.params.id as string,
        req.user!.userId,
        req.user!.role as Role
      );
      sendSuccess(res, ticket, 'Ticket obtenido');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.updateStatus(req.params.id as string, req.body.status);
      sendSuccess(res, ticket, 'Estado del ticket actualizado');
    } catch (error) {
      next(error);
    }
  }

  async addResponse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const response = await ticketService.addResponse(
        req.params.id as string,
        req.user!.userId,
        req.user!.role as Role,
        req.body.message
      );
      sendSuccess(res, response, 'Respuesta agregada', 201);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await ticketService.getStats();
      sendSuccess(res, stats, 'Estadísticas obtenidas');
    } catch (error) {
      next(error);
    }
  }
}
