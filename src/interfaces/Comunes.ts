// Interfaces comunes utilizadas en todo el sistema

export interface ColumnasGrid {
  sm?: number
  md?: number
  lg?: number
}

export interface ConfiguracionDependencia {
  campoPadre?: string
  valorCondicion?: string | number | boolean
  deshabilitarHastaValor?: boolean
  [clave: string]: unknown
}

export interface OpcionSeleccion {
  etiqueta: string
  valor: string | number
  deshabilitado?: boolean
}

export interface ColumnaTabla {
  id: string
  nombre: string
  etiqueta: string
  tipo: string
  ancho?: number
  visible?: boolean
  agregar?: string
  [clave: string]: unknown
}

export interface ResultadoValidacion {
  esValido: boolean
  errores: string[]
  advertencias?: string[]
}

// Interfaces para el manejo de eventos
import type { TipoAlerta, ValorDato } from '@/tipos/Comunes'
export interface EventoCambioCampo {
  campoId: string
  valorAnterior: ValorDato | undefined
  valorNuevo: ValorDato | undefined
  timestamp: Date
}

export interface EventoValidacion {
  campoId: string
  resultado: ResultadoValidacion
  timestamp: Date
}


// Modales
export interface ModalAlerta {
  modelValue: boolean
  titulo: string
  mensaje: string
  mensajeDetalle?: string
  tipo?: TipoAlerta
  ancho?: string
  cerrable?: boolean
  mostrarBotonCancelar?: boolean
  textoBotonConfirmar?: string
  textoBotonCancelar?: string
  iconoBotonConfirmar?: string
}
