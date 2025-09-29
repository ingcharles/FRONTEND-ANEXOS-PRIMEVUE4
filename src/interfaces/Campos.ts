// Interfaces para campos
import type { ColumnasGrid, OpcionSeleccion } from '@/interfaces/Comunes'
import type { ValorDato } from '@/tipos/Comunes'
import type { ReglaValidacion, ReglaLogica } from '@/interfaces/Validacion'
// import type { TipoCampo } from '@/tipos/Campos'
import type { ColumnaTabla, ConfiguracionDependencia } from '@/interfaces/Comunes'
import type { TipoCampoValor } from '@/enumeraciones/Campos'

export interface MetadatosCampo {
  valorPorDefecto?: ValorDato | undefined
  opciones?: OpcionSeleccion[] | undefined
  modoOpciones?: 'api' | 'estatico' | string | undefined
  configuracionApi?: Record<string, ValorDato> | undefined
  dependencia?: ConfiguracionDependencia | undefined
  dependeDe?: string | undefined
  urlApi?: string | undefined
  propiedadEtiqueta?: string | undefined
  propiedadValor?: string | undefined
  formatoFecha?: string | undefined
  minimo?: number | undefined
  maximo?: number | undefined
  mensajeMinimo?: string | undefined
  mensajeMaximo?: string | undefined
  filas?: number | undefined
  columnas?: number | ColumnaTabla[] | undefined
  agregarFilas?: boolean | undefined
  mostrarResumen?: boolean | undefined
  estiloTabla?: Record<string, ValorDato> | undefined
  deshabilitado?: boolean | undefined
  fechaMinima?: Date | string | undefined
  fechaMaxima?: Date | string | undefined
  paso?: number | undefined
}

export interface EsquemaCampo {
  id: string
  tipo: TipoCampoValor
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



// RenderizadorCampo.vue
export interface ColumnaTablaBasica {
  name: string
  label?: string
  type?: 'texto' | 'numero' | 'fecha'
}

export interface ColumnaTablaExtendida extends ColumnaTablaBasica {
  modoFormato?: 'decimal' | 'currency' | 'percent'
  moneda?: string
  idioma?: string
  prefijo?: string
  sufijo?: string
  decimalesMinimos?: number
  decimalesMaximos?: number;
  escalaPorcentaje?: 'whole' | 'fraction';
  agregar?: 'none' | 'sum' | 'avg' | 'count' | 'min' | 'max';
  prefijoAgregado?: string;
  sufijoAgregado?: string;
  decimales?: number;
  requerido?: boolean;
  minimo?: number | null;
  maximo?: number | null;
  mensajeMinimo?: string;
  mensajeMaximo?: string;
  tipo?: string;
}
