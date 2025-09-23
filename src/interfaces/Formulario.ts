// Interfaces para formularios
import type { EsquemaPagina } from '@/interfaces/Pagina'

export interface ConfiguracionFormulario {
  ajusteGrid: boolean
  columnas: number
  tema?: string
  idioma?: string
}

export interface EsquemaFormulario {
  id: string
  nombre: string
  paginas: EsquemaPagina[]
  configuracion?: ConfiguracionFormulario
}