import { z } from 'zod';

const mealShiftEnum = z.enum(['BREAKFAST', 'LUNCH', 'DINNER'], {
  required_error: 'El turno es obligatorio',
  invalid_type_error: 'Turno inválido (BREAKFAST, LUNCH, DINNER)',
});

const dishSchema = z.object({
  name: z
    .string({ required_error: 'El nombre del plato es obligatorio' })
    .min(2, 'Mínimo 2 caracteres')
    .max(150, 'Máximo 150 caracteres')
    .trim(),
  category: z.string().max(50).trim().optional(),
});

export const createMenuSchema = z.object({
  body: z.object({
    date: z
      .string({ required_error: 'La fecha es obligatoria' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
    shift: mealShiftEnum,
    startTime: z
      .string({ required_error: 'La hora de inicio es obligatoria' })
      .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
    endTime: z
      .string({ required_error: 'La hora de fin es obligatoria' })
      .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
    description: z.string().max(500).trim().optional(),
    calories: z.coerce.number().int().min(0).optional(),
    proteins: z.coerce.number().min(0).optional(),
    carbs: z.coerce.number().min(0).optional(),
    fats: z.coerce.number().min(0).optional(),
    iron: z.coerce.number().min(0).optional(),
    dishes: z
      .array(dishSchema)
      .min(1, 'Debe incluir al menos un plato')
      .max(10, 'Máximo 10 platos'),
  }),
});

export const updateMenuSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de menú inválido'),
  }),
  body: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
      .optional(),
    shift: mealShiftEnum.optional(),
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido')
      .optional(),
    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido')
      .optional(),
    description: z.string().max(500).trim().optional(),
    calories: z.coerce.number().int().min(0).optional(),
    proteins: z.coerce.number().min(0).optional(),
    carbs: z.coerce.number().min(0).optional(),
    fats: z.coerce.number().min(0).optional(),
    iron: z.coerce.number().min(0).optional(),
    dishes: z.array(dishSchema).min(1).max(10).optional(),
  }),
});

export const getMenuByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de menú inválido'),
  }),
});

export const getMenusQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(10).optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    dateFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    dateTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    shift: mealShiftEnum.optional(),
    search: z.string().max(100).optional(),
  }),
});

export type CreateMenuInput = z.infer<typeof createMenuSchema>['body'];
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>['body'];
