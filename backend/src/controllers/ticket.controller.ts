import { Response, NextFunction } from 'express';
import ExcelJS from 'exceljs';
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

  async exportExcel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, priority, category } = req.query as Record<string, string>;
      const result = await ticketService.getAll({ status, priority, category, limit: 10000 });
      const tickets = result.data;

      const statusLabels: Record<string, string> = { OPEN: 'Abierto', IN_REVIEW: 'En Revisión', RESOLVED: 'Resuelto', CLOSED: 'Cerrado' };
      const priorityLabels: Record<string, string> = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', URGENT: 'Urgente' };
      const categoryLabels: Record<string, string> = { FOOD_QUALITY: 'Calidad de Comida', HYGIENE: 'Higiene', SERVICE: 'Atención', INFRASTRUCTURE: 'Infraestructura', SCHEDULE: 'Horarios', OTHER: 'Otro' };
      const statusColors: Record<string, string> = { OPEN: 'FF2563EB', IN_REVIEW: 'FFD97706', RESOLVED: 'FF059669', CLOSED: 'FF64748B' };
      const priorityColors: Record<string, string> = { LOW: 'FF64748B', MEDIUM: 'FF2563EB', HIGH: 'FFF97316', URGENT: 'FFDC2626' };

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'UNT Comedor';
      workbook.created = new Date();

      const sheet = workbook.addWorksheet('Reclamos', {
        views: [{ state: 'frozen', ySplit: 2 }],
      });

      sheet.mergeCells('A1:H1');
      const titleCell = sheet.getCell('A1');
      titleCell.value = 'Mesa de Servicio — Registro de Reclamos — UNT Comedor';
      titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4338CA' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getRow(1).height = 30;

      const headers = [
        { key: 'subject', header: 'Asunto', width: 30 },
        { key: 'student', header: 'Estudiante', width: 24 },
        { key: 'code', header: 'Código', width: 14 },
        { key: 'category', header: 'Categoría', width: 20 },
        { key: 'priority', header: 'Prioridad', width: 14 },
        { key: 'status', header: 'Estado', width: 14 },
        { key: 'createdAt', header: 'Fecha Creación', width: 16 },
        { key: 'resolvedAt', header: 'Fecha Resolución', width: 16 },
      ];

      sheet.columns = headers.map((h) => ({ key: h.key, width: h.width }));

      const headerRow = sheet.addRow(headers.map((h) => h.header));
      headerRow.height = 22;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FF4338CA' } } };
      });

      tickets.forEach((ticket: any, idx: number) => {
        const dataRow = sheet.addRow([
          ticket.subject,
          ticket.user?.name || '',
          ticket.user?.universityId || '',
          categoryLabels[ticket.category] || ticket.category,
          priorityLabels[ticket.priority] || ticket.priority,
          statusLabels[ticket.status] || ticket.status,
          new Date(ticket.createdAt).toISOString().split('T')[0],
          ticket.resolvedAt ? new Date(ticket.resolvedAt).toISOString().split('T')[0] : '—',
        ]);

        const isEven = idx % 2 === 0;
        dataRow.eachCell((cell, colNumber) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFF8FAFC' : 'FFFFFFFF' } };
          cell.font = { size: 10 };
          cell.alignment = { vertical: 'middle' };
          cell.border = { bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } } };

          if (colNumber === 5) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.font = { bold: true, size: 10, color: { argb: priorityColors[ticket.priority] || 'FF000000' } };
          }
          if (colNumber === 6) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.font = { bold: true, size: 10, color: { argb: statusColors[ticket.status] || 'FF000000' } };
          }
          if (colNumber === 7 || colNumber === 8) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
        });
      });

      sheet.addRow([]);
      const open = tickets.filter((t: any) => t.status === 'OPEN').length;
      const inReview = tickets.filter((t: any) => t.status === 'IN_REVIEW').length;
      const resolved = tickets.filter((t: any) => t.status === 'RESOLVED').length;
      const closed = tickets.filter((t: any) => t.status === 'CLOSED').length;

      const summaryRow = sheet.addRow([
        'RESUMEN',
        `Total: ${tickets.length} reclamos`,
        '',
        '',
        '',
        `${open} abiertos / ${inReview} en revisión`,
        `${resolved} resueltos`,
        `${closed} cerrados`,
      ]);
      summaryRow.eachCell((cell) => {
        cell.font = { bold: true, size: 10 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } };
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reclamos.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }
}
