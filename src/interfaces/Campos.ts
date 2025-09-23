// Interfaces para campos
import type { ColumnasGrid, OpcionSeleccion } from '@/interfaces/Comunes'
import type { ValorDato } from '@/tipos/Comunes'
import type { ReglaValidacion, ReglaLogica } from '@/interfaces/Validacion'
import type { TipoCampo } from '@/tipos/Campos'
import type { ColumnaTabla, ConfiguracionDependencia } from '@/interfaces/Comunes'

export interface MetadatosCampo {
  valorPorDefecto?: ValorDato | undefined
  opciones?: OpcionSeleccion[] | undefined
  modoOpciones?: 'api' | 'estatico' | string | undefined
  configuracionApi?: Record<string, ValorDato> | undefined
  // Compatibilidad con claves en inglés durante la migración
  options?: Array<{ label: string; value: string | number; disabled?: boolean }> | undefined
  dependencia?: ConfiguracionDependencia | undefined
  dependeDe?: string | undefined
  urlApi?: string | undefined
  propiedadEtiqueta?: string | undefined
  propiedadValor?: string | undefined
  formatoFecha?: string | undefined
  minimo?: number | undefined
  maximo?: number | undefined
  // Claves en inglés/compatibilidad para número
  min?: number | undefined
  max?: number | undefined
  mensajeMinimo?: string | undefined
  mensajeMaximo?: string | undefined
  minMessage?: string | undefined
  maxMessage?: string | undefined
  filas?: number | undefined
  columnas?: number | ColumnaTabla[] | undefined
  // Compatibilidad con claves en inglés para tabla
  rows?: number | undefined
  columns?: number | ColumnaTabla[] | undefined
  agregarFilas?: boolean | undefined
  mostrarResumen?: boolean | undefined
  estiloTabla?: Record<string, ValorDato> | undefined
  // Compatibilidad en inglés
  disabled?: boolean | undefined
  deshabilitado?: boolean | undefined
  fechaMinima?: Date | string | undefined
  fechaMaxima?: Date | string | undefined
  // Compatibilidad en inglés para fechas y paso numérico
  minDate?: Date | string | undefined
  maxDate?: Date | string | undefined
  step?: number | undefined
  paso?: number | undefined
}

export interface EsquemaCampo {
  id: string
  tipo: TipoCampo
  etiqueta?: string
  nombre?: string
  marcadorPosicion?: string
  valorPorDefecto?: string | number | boolean | Date
  grid?: ColumnasGrid
  anchoMinimo?: number
  anchoMaximo?: number
  requerido?: boolean
  visible?: boolean
  deshabilitado?: boolean
  soloLectura?: boolean
  validaciones?: ReglaValidacion[]
  logica?: ReglaLogica[]
  hijos?: EsquemaCampo[]
  metadatos?: MetadatosCampo
}
