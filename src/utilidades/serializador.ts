import { zEsquemaFormulario } from '@/esquemas/Formulario'
import type { EsquemaFormulario } from '@/interfaces/Formulario'

// Funciones para esquema español
export function serializarFormulario(esquema: EsquemaFormulario): string {
  return JSON.stringify(esquema, null, 2)
}

export function deserializarFormulario(json: string): EsquemaFormulario {
  const data = JSON.parse(json)
  const parseado = zEsquemaFormulario.safeParse(data)
  if (!parseado.success) {
    const mensaje = parseado.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`JSON inválido para EsquemaFormulario:\n${mensaje}`)
  }
  return parseado.data
}

export function descargarJson(nombre: string, contenido: string): void {
  const blob = new Blob([contenido], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
