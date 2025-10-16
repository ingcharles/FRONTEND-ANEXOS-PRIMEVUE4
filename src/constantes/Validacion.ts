// Esquemas de validación Zod para validación
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { EsquemaFormulario } from '@/interfaces/Formulario'
import type { EsquemaPagina } from '@/interfaces/Pagina'
import { z } from 'zod'

export const zReglaValidacion = z.object({
  tipo: z.enum(['requerido', 'longitud-minima', 'longitud-maxima', 'valor-minimo', 'valor-maximo', 'patron', 'personalizada']),
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
  valorPorDefecto: z.union([z.string(), z.number(), z.boolean(), z.date(), z.array(z.unknown())]).optional(),
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
  // filas y columnas pueden ser números (para tabla normal) o arrays (para tabla-resumen y columnas de tabla)
  filas: z.union([z.number(), z.array(z.unknown())]).optional(),
  columnas: z.union([z.number(), z.array(z.unknown())]).optional(),
  agregarFilas: z.boolean().optional(),
  eliminarFilas: z.boolean().optional(),
  mostrarResumen: z.boolean().optional(),
  actualizacionAutomatica: z.boolean().optional(),
  estiloTabla: z.record(z.string(), z.unknown()).optional(),
}).catchall(z.unknown())

// Declaración forward para el esquema recursivo
const zEsquemaCampoInterno: z.ZodType<any> = z.lazy(() =>
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
      'tabla-resumen',
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
    hijos: z.array(zEsquemaCampoInterno).optional(),
    metadatos: zMetadatosCampo.optional(),
  })
)

// Exportar con el tipo correcto
export const zEsquemaCampo: z.ZodType<EsquemaCampo> = zEsquemaCampoInterno

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
