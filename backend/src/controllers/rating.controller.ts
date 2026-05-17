import { Request, Response, NextFunction } from 'express';
import ExcelJS from 'exceljs';
import { RatingService } from '../services';
import { sendSuccess } from '../utils';
import { AuthRequest } from '../types';

const ratingService = new RatingService();

export class RatingController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const rating = await ratingService.create(
        authReq.user!.userId,
        req.body
      );
      sendSuccess(res, rating, 'Valoración registrada exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async getGlobalStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ratingService.getGlobalStats(req.query as Record<string, string>);
      sendSuccess(res, stats, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getStatsByShift(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ratingService.getStatsByShift(req.query as Record<string, string>);
      sendSuccess(res, stats, 'Estadísticas por turno obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as 'week' | 'month' | 'quarter') || 'week';
      const trends = await ratingService.getTrends(period);
      sendSuccess(res, trends, 'Tendencias obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getMenuStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ratingService.getMenuStats(req.params.menuId);
      sendSuccess(res, stats, 'Estadísticas del menú obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getMenuExtremes(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      const extremes = await ratingService.getMenuExtremes(days);
      sendSuccess(res, extremes, 'Mejor y peor menú obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getShiftExtremes(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      const extremes = await ratingService.getShiftExtremes(days);
      sendSuccess(res, extremes, 'Extremos por turno obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async checkUserRating(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const result = await ratingService.checkUserRating(
        req.params.menuId,
        authReq.user!.userId
      );
      sendSuccess(res, result, 'Estado de valoración obtenido');
    } catch (error) {
      next(error);
    }
  }

  async exportExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const rows = await ratingService.exportRatings(req.query as Record<string, string>);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'UNT Comedor';
      workbook.created = new Date();

      const sheet = workbook.addWorksheet('Valoraciones', {
        views: [{ state: 'frozen', ySplit: 2 }],
      });

      // Titulo
      sheet.mergeCells('A1:K1');
      const titleCell = sheet.getCell('A1');
      titleCell.value = 'Reporte de Valoraciones — UNT Comedor';
      titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4338CA' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getRow(1).height = 30;

      // Headers
      const headers = [
        { key: 'fecha', header: 'Fecha', width: 14 },
        { key: 'turno', header: 'Turno', width: 12 },
        { key: 'descripcion', header: 'Descripcion', width: 30 },
        { key: 'sabor', header: 'Sabor', width: 9 },
        { key: 'cantidad', header: 'Cantidad', width: 10 },
        { key: 'variedad', header: 'Variedad', width: 10 },
        { key: 'higiene', header: 'Higiene', width: 10 },
        { key: 'atencion', header: 'Atencion', width: 10 },
        { key: 'promedio', header: 'Promedio', width: 10 },
        { key: 'comentario', header: 'Comentario', width: 35 },
        { key: 'fecha_valoracion', header: 'Fecha Valoracion', width: 16 },
      ];

      // Configurar columnas
      sheet.columns = headers.map((h) => ({ key: h.key, width: h.width }));

      // Agregar fila de headers
      const headerRow = sheet.addRow(headers.map((h) => h.header));
      headerRow.height = 22;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FF4338CA' } },
        };
      });

      // Agregar datos
      rows.forEach((row, idx) => {
        const dataRow = sheet.addRow([
          row.fecha,
          row.turno,
          row.descripcion,
          row.sabor,
          row.cantidad,
          row.variedad,
          row.higiene,
          row.atencion,
          row.promedio,
          row.comentario,
          row.fecha_valoracion,
        ]);

        const isEven = idx % 2 === 0;
        dataRow.eachCell((cell, colNumber) => {
          // Fondo alternado
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isEven ? 'FFF8FAFC' : 'FFFFFFFF' },
          };
          cell.font = { size: 10 };
          cell.alignment = { vertical: 'middle', wrapText: colNumber === 10 };
          cell.border = {
            bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } },
          };

          // Centrar columnas numericas
          if (colNumber >= 4 && colNumber <= 9) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }

          // Color condicional para promedio
          if (colNumber === 9) {
            const val = cell.value as number;
            cell.font = { bold: true, size: 10, color: { argb: val >= 4 ? 'FF059669' : val >= 3 ? 'FFD97706' : 'FFDC2626' } };
          }

          // Color del turno
          if (colNumber === 2) {
            const turno = cell.value as string;
            if (turno === 'Desayuno') cell.font = { size: 10, color: { argb: 'FFD97706' } };
            else if (turno === 'Almuerzo') cell.font = { size: 10, color: { argb: 'FF2563EB' } };
            else cell.font = { size: 10, color: { argb: 'FF7C3AED' } };
          }
        });
      });

      // Fila de resumen al final
      if (rows.length > 0) {
        sheet.addRow([]);
        const summaryRow = sheet.addRow([
          'RESUMEN',
          '',
          `Total: ${rows.length} valoraciones`,
          '',
          '',
          '',
          '',
          '',
          Number((rows.reduce((acc, r) => acc + r.promedio, 0) / rows.length).toFixed(2)),
          '',
          '',
        ]);
        summaryRow.eachCell((cell) => {
          cell.font = { bold: true, size: 10 };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } };
        });
      }

      // Enviar respuesta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=valoraciones.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }
}
