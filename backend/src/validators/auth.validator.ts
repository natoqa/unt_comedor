import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    universityId: z
      .string({ required_error: 'El código universitario es obligatorio' })
      .min(1, 'El código universitario es obligatorio')
      .trim(),
    password: z
      .string({ required_error: 'La contraseña es obligatoria' })
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    universityId: z
      .string({ required_error: 'El código universitario es obligatorio' })
      .min(4, 'El código universitario debe tener al menos 4 caracteres')
      .max(20, 'El código universitario no puede exceder 20 caracteres')
      .trim(),
    name: z
      .string({ required_error: 'El nombre es obligatorio' })
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres')
      .trim(),
    email: z
      .string({ required_error: 'El email es obligatorio' })
      .email('Email inválido')
      .trim()
      .toLowerCase(),
    password: z
      .string({ required_error: 'La contraseña es obligatoria' })
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(50, 'La contraseña no puede exceder 50 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
      ),
    confirmPassword: z.string({
      required_error: 'Confirmar contraseña es obligatorio',
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RegisterInput = z.infer<typeof registerSchema>['body'];
