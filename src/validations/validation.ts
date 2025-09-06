import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido'),
});

export type FormData = z.infer<typeof formSchema>;
