// Esquemas de validación Zod para tipos comunes
import { z } from 'zod'

export const zOpcionSeleccion = z.object({
  etiqueta: z.string(),
  valor: z.union([z.string(), z.number()]),
  deshabilitado: z.boolean().optional(),
})

export const zColumnasGrid = z.object({
  sm: z.number().optional(),
  md: z.number().optional(),
  lg: z.number().optional()
})