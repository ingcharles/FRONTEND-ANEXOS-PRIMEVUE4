// Esquemas de validación Zod para páginas
import { z } from 'zod'
import { zEsquemaCampo } from '@/esquemas/Campos'
import type { EsquemaPagina } from '@/interfaces/Pagina'

export const zEsquemaPagina: z.ZodType<EsquemaPagina> = z.object({
  id: z.string(),
  titulo: z.string().optional(),
  campos: z.array(zEsquemaCampo),
})