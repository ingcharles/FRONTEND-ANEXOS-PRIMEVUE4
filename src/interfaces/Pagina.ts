// Interfaces para páginas del formulario
import type { EsquemaCampo } from '@/interfaces/Campos'

export interface EsquemaPagina {
  id: string
  titulo?: string
  campos: EsquemaCampo[]
}