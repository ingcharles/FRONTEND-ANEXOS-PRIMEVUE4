// Esquemas de validación Zod para campos
import { z } from 'zod'
import { zReglaValidacion, zReglaLogica } from '@/esquemas/Validacion'
import type { EsquemaCampo } from '@/interfaces/Campos'

export const zMetadatosCampo = z.object({
  valorPorDefecto: z.union([z.string(), z.number(), z.boolean(), z.date()]).optional(),
  opciones: z.array(z.object({
    etiqueta: z.string(),
    valor: z.union([z.string(), z.number()]),
    deshabilitado: z.boolean().optional(),
  })).optional(),
  dependeDe: z.string().optional(),
  urlApi: z.string().optional(),
  propiedadEtiqueta: z.string().optional(),
  propiedadValor: z.string().optional(),
  formatoFecha: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  paso: z.number().optional(),
  filas: z.number().optional(),
  columnas: z.number().optional(),
}).catchall(z.unknown())

export const zEsquemaCampo: z.ZodType<EsquemaCampo> = z.lazy(() =>
  z.object({
    id: z.string(),
    tipo: z.enum([
      'texto',
      'area-texto',
      'correo',
      'contrasena',
      'numero',
      'hora',
      'fecha',
      'seleccion',
      'radio',
      'casilla',
      'etiqueta',
      'panel',
      'tabla',
      'boton',
      'divisor',
    ]),
    etiqueta: z.string().optional(),
    nombre: z.string().optional(),
    marcadorPosicion: z.string().optional(),
    valorPorDefecto: z.union([z.string(), z.number(), z.boolean(), z.date()]).optional(),
    grid: z.object({
      sm: z.number().optional(),
      md: z.number().optional(),
      lg: z.number().optional()
    }).optional(),
    anchoMinimo: z.number().optional(),
    anchoMaximo: z.number().optional(),
    requerido: z.boolean().optional(),
    visible: z.boolean().optional(),
    deshabilitado: z.boolean().optional(),
    soloLectura: z.boolean().optional(),
    validaciones: z.array(zReglaValidacion).optional(),
    logica: z.array(zReglaLogica).optional(),
    hijos: z.array(z.lazy(() => zEsquemaCampo)).optional(),
    metadatos: zMetadatosCampo.optional(),
  })
)