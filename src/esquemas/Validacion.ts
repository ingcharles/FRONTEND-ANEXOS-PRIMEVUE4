// Esquemas de validación Zod para validación
import { z } from 'zod'

export const zReglaValidacion = z.object({
  tipo: z.enum(['requerido', 'longitud-minima', 'longitud-maxima', 'patron', 'personalizada']),
  valor: z.union([z.string(), z.number(), z.boolean(), z.date()]).optional(),
  mensaje: z.string().optional(),
})

export const zReglaLogica = z.object({
  id: z.string(),
  campoCondicionId: z.string(),
  operador: z.enum(['igual', 'diferente', 'contiene', 'mayor-que', 'menor-que', 'personalizado']),
  valor: z.union([z.string(), z.number(), z.boolean(), z.date()]),
  accion: z.enum(['mostrar', 'ocultar', 'requerir', 'opcional']),
  expresion: z.string().optional(),
})