// Esquemas de validación Zod para validación
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { EsquemaFormulario } from '@/interfaces/Formulario'
import type { EsquemaPagina } from '@/interfaces/Pagina'
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
      'areaTexto',
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

export const zEsquemaPagina: z.ZodType<EsquemaPagina> = z.object({
  id: z.string(),
  titulo: z.string().optional(),
  campos: z.array(zEsquemaCampo),
})



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
