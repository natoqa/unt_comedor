import { z } from 'zod';

const starRating = z.coerce
  .number()
  .int()
  .min(1, 'La calificación mínima es 1')
  .max(5, 'La calificación máxima es 5');

export const createRatingSchema = z.object({
  body: z.object({
    menuId: z
      .string({ required_error: 'El ID del menú es obligatorio' })
      .uuid('ID de menú inválido'),
    taste: starRating,
    quantity: starRating,
    variety: starRating,
    hygiene: starRating,
    service: starRating,
    comment: z
      .string()
      .max(500, 'El comentario no puede exceder 500 caracteres')
      .trim()
      .optional()
      .nullable(),
  }),
});

export const ratingStatsQuerySchema = z.object({
  query: z.object({
    menuId: z.string().uuid().optional(),
    dateFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
      .optional(),
    dateTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
      .optional(),
    shift: z.enum(['BREAKFAST', 'LUNCH', 'DINNER']).optional(),
    period: z.enum(['week', 'month', 'quarter']).optional(),
  }),
});

export type CreateRatingInput = z.infer<typeof createRatingSchema>['body'];
