import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Operación exitosa',
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message = 'Error interno del servidor',
  statusCode = 500,
  errors?: Record<string, string[]>
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Datos obtenidos exitosamente'
): Response => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};
