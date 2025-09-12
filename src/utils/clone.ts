// Clonación profunda preservando tipos
export function clonarProfundo<T>(valor: T): T {
  return structuredClone(valor)
}

// Duplicar estructura generando nuevos ids con un generador externo
export function duplicarConNuevosIds<T extends { id: string; children?: T[] }>(
  nodo: T,
  generarId: () => string
): T {
  const copia: T = { ...structuredClone(nodo), id: generarId() }
  if (copia.children && Array.isArray(copia.children)) {
    copia.children = copia.children.map((hijo) => duplicarConNuevosIds(hijo as T, generarId))
  }
  return copia
}
