import { toRaw } from 'vue'

// Clonación profunda preservando tipos y evitando proxys reactivos
export function clonarProfundo<T>(valor: T): T {
  const raw = (valor && typeof valor === 'object') ? (toRaw as unknown as <U>(v: U) => U)(valor as unknown as object) : valor
  try {
    return structuredClone(raw as unknown as object) as unknown as T
  } catch {
    // Fallback JSON para objetos serializables
    return JSON.parse(JSON.stringify(raw)) as T
  }
}

// Duplicar estructura generando nuevos ids con un generador externo
export function duplicarConNuevosIds<T extends { id: string; children?: T[] }>(
  nodo: T,
  generarId: () => string
): T {
  const base = clonarProfundo(nodo)
  const copia: T = { ...(base as T), id: generarId() }
  if (Array.isArray(copia.children)) {
    copia.children = copia.children.map((hijo) => duplicarConNuevosIds(hijo as T, generarId))
  }
  return copia
}
