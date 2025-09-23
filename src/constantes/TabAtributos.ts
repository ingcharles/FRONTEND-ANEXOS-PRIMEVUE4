import type { OpcionSelector } from "@/interfaces/TabAtributos"
import { MetodoHttp, ModoOpciones } from "@/tipos/TabAtributos"

// Opciones para los selectores
export const opcionesFuente: OpcionSelector[] = [
  { label: 'Manual', value: ModoOpciones.MANUAL },
  { label: 'API', value: ModoOpciones.API }
]

export const opcionesMetodo: OpcionSelector[] = [
  { label: 'GET', value: MetodoHttp.GET },
  { label: 'POST', value: MetodoHttp.POST }
]

export const opcionesContentType: OpcionSelector[] = [
  { label: 'application/json', value: 'application/json' },
  { label: 'text/plain', value: 'text/plain' },
  { label: 'application/x-www-form-urlencoded', value: 'application/x-www-form-urlencoded' }
]
