// Esquemas de validación Zod para formularios
import { z } from 'zod'
import { zEsquemaPagina } from '@/esquemas/Pagina'
import type { EsquemaFormulario } from '@/interfaces/Formulario'

export const zConfiguracionFormulario = z.object({
  ajusteGrid: z.boolean(),
  columnas: z.number(),
  tema: z.string().optional(),
  idioma: z.string().optional(),
})

export const zEsquemaFormulario: z.ZodType<EsquemaFormulario> = z.object({
  id: z.string(),
  nombre: z.string(),
  paginas: z.array(zEsquemaPagina),
  configuracion: zConfiguracionFormulario.optional(),
})