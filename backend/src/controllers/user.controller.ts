import { Request, Response, NextFunction } from 'express';
import ExcelJS from 'exceljs';
import { UserService } from '../services';
import { sendSuccess } from '../utils';

const userService = new UserService();

export class UserController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.getAll(req.query as Record<string, string>);
      sendSuccess(res, result, 'Usuarios obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body);
      sendSuccess(res, user, 'Usuario creado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(req.params.id as string, req.body);
      sendSuccess(res, user, 'Usuario actualizado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.delete(req.params.id as string);
      sendSuccess(res, null, 'Usuario eliminado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await userService.getDashboardStats();
      sendSuccess(res, stats, 'Estadísticas del dashboard obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async exportExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string>;
      const result = await userService.getAll({ ...query, limit: '10000' });
      const users = result.data;

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'UNT Comedor';
      workbook.created = new Date();

      const sheet = workbook.addWorksheet('Usuarios', {
        views: [{ state: 'frozen', ySplit: 2 }],
      });

      // Titulo
      sheet.mergeCells('A1:F1');
      const titleCell = sheet.getCell('A1');
      titleCell.value = 'Registro de Usuarios — UNT Comedor';
      titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4338CA' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getRow(1).height = 30;

      // Columnas
      const headers = [
        { key: 'universityId', header: 'Codigo', width: 16 },
        { key: 'name', header: 'Nombre Completo', width: 28 },
        { key: 'email', header: 'Email', width: 30 },
        { key: 'role', header: 'Rol', width: 16 },
        { key: 'isActive', header: 'Estado', width: 14 },
        { key: 'createdAt', header: 'Fecha Registro', width: 16 },
      ];

      sheet.columns = headers.map((h) => ({ key: h.key, width: h.width }));

      // Header row
      const headerRow = sheet.addRow(headers.map((h) => h.header));
      headerRow.height = 22;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FF4338CA' } } };
      });

      // Datos
      users.forEach((user, idx) => {
        const rolLabel = user.role === 'ADMIN' ? 'Administrador' : 'Estudiante';
        const estadoLabel = user.isActive ? 'Activo' : 'Inactivo';
        const fecha = new Date(user.createdAt).toISOString().split('T')[0];

        const dataRow = sheet.addRow([
          user.universityId,
          user.name,
          user.email,
          rolLabel,
          estadoLabel,
          fecha,
        ]);

        const isEven = idx % 2 === 0;
        dataRow.eachCell((cell, colNumber) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isEven ? 'FFF8FAFC' : 'FFFFFFFF' },
          };
          cell.font = { size: 10 };
          cell.alignment = { vertical: 'middle' };
          cell.border = { bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } } };

          // Rol con color
          if (colNumber === 4) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.font = {
              bold: true,
              size: 10,
              color: { argb: rolLabel === 'Administrador' ? 'FF7C3AED' : 'FF2563EB' },
            };
          }

          // Estado con color
          if (colNumber === 5) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.font = {
              bold: true,
              size: 10,
              color: { argb: estadoLabel === 'Activo' ? 'FF059669' : 'FFDC2626' },
            };
          }

          // Fecha centrada
          if (colNumber === 6) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
        });
      });

      // Resumen
      sheet.addRow([]);
      const totalStudents = users.filter((u) => u.role === 'STUDENT').length;
      const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;
      const totalActive = users.filter((u) => u.isActive).length;

      const summaryRow = sheet.addRow([
        'RESUMEN',
        `Total: ${users.length} usuarios`,
        '',
        `${totalAdmins} admins / ${totalStudents} estudiantes`,
        `${totalActive} activos`,
        '',
      ]);
      summaryRow.eachCell((cell) => {
        cell.font = { bold: true, size: 10 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } };
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=usuarios.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }
}
