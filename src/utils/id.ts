// Generar identificadores únicos simples
export function generarId(prefijo = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 8)
  const time = Date.now().toString(36)
  return `${prefijo}_${time}_${rand}`
}
