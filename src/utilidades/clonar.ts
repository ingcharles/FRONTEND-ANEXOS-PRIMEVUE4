import { toRaw } from 'vue'
import type { EsquemaCampo } from '@/interfaces/Campos'

// Clonación profunda preservando tipos y evitando proxys reactivos
export function clonarProfundo<T>(valor: T): T {
  const valorCrudo = (valor && typeof valor === 'object') ? (toRaw as unknown as <U>(v: U) => U)(valor as unknown as object) : valor
  try {
    return structuredClone(valorCrudo as unknown as object) as unknown as T
  } catch {
    // Fallback JSON para objetos serializables
    return JSON.parse(JSON.stringify(valorCrudo)) as T
  }
}

// Duplicar estructura generando nuevos ids con un generador externo
export function duplicarConNuevosIds(
  nodo: EsquemaCampo,
  generarId: () => string
): EsquemaCampo {
  const base = clonarProfundo(nodo)
  const copia: EsquemaCampo = { ...base, id: generarId() }

  if (Array.isArray(copia.hijos)) {
    copia.hijos = copia.hijos.map((hijo) => duplicarConNuevosIds(hijo, generarId))
  }

  return copia
}

// Función auxiliar para clonar arrays de forma segura
export function clonarArray<T>(array: T[]): T[] {
  return array.map(item => clonarProfundo(item))
}

// Función auxiliar para clonar objetos planos
export function clonarObjeto<T extends Record<string, unknown>>(objeto: T): T {
  return clonarProfundo(objeto)
}
