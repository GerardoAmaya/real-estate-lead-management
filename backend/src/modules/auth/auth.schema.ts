import { z } from 'zod';

export const loginSchema = z
  .object({
    email: z.email('El correo no tiene un formato valido').max(160),
    password: z.string().min(1, 'La contrasena es obligatoria').max(128),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;
