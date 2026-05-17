import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    category: z.enum(['FOOD_QUALITY', 'HYGIENE', 'SERVICE', 'INFRASTRUCTURE', 'SCHEDULE', 'OTHER'], {
      required_error: 'La categoría es obligatoria',
    }),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    subject: z
      .string({ required_error: 'El asunto es obligatorio' })
      .min(5, 'El asunto debe tener al menos 5 caracteres')
      .max(100, 'El asunto no puede exceder 100 caracteres')
      .trim(),
    description: z
      .string({ required_error: 'La descripción es obligatoria' })
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(1000, 'La descripción no puede exceder 1000 caracteres')
      .trim(),
  }),
});

export const updateTicketStatusSchema = z.object({
  body: z.object({
    status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'], {
      required_error: 'El estado es obligatorio',
    }),
  }),
});

export const createTicketResponseSchema = z.object({
  body: z.object({
    message: z
      .string({ required_error: 'El mensaje es obligatorio' })
      .min(1, 'El mensaje no puede estar vacío')
      .max(1000, 'El mensaje no puede exceder 1000 caracteres')
      .trim(),
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>['body'];
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>['body'];
export type CreateTicketResponseInput = z.infer<typeof createTicketResponseSchema>['body'];
