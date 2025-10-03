import { OpcionSeleccion } from "@/interfaces/Comunes"
import { MetodoHttp, ModoOpciones } from "@/tipos/TabAtributos"

// Opciones para los selectores
export const opcionesFuente: OpcionSeleccion[] = [
  { etiqueta: 'Manual', valor: ModoOpciones.MANUAL },
  { etiqueta: 'API', valor: ModoOpciones.API }
]

export const opcionesMetodo: OpcionSeleccion[] = [
  { etiqueta: 'GET', valor: MetodoHttp.GET },
  { etiqueta: 'POST', valor: MetodoHttp.POST }
]

export const opcionesContentType: OpcionSeleccion[] = [
  { etiqueta: 'application/json', valor: 'application/json' },
  { etiqueta: 'text/plain', valor: 'text/plain' },
  { etiqueta: 'application/x-www-form-urlencoded', valor: 'application/x-www-form-urlencoded' }
]
