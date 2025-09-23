// Generar identificadores únicos simples
export function generarId(prefijo = 'id'): string {
  const numeroAleatorio = Math.random().toString(36).slice(2, 8)
  const marcaTiempo = Date.now().toString(36)
  return `${prefijo}_${marcaTiempo}_${numeroAleatorio}`
}

// Generar ID único para campos
export function generarIdCampo(): string {
  return generarId('campo')
}

// Generar ID único para páginas
export function generarIdPagina(): string {
  return generarId('pagina')
}

// Generar ID único para formularios
export function generarIdFormulario(): string {
  return generarId('formulario')
}

// Validar formato de ID
export function esIdValido(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && id.includes('_')
}

// Extraer prefijo de un ID
export function extraerPrefijo(id: string): string {
  const partes = id.split('_')
  return partes[0] || ''
}

// Generar ID único con sufijo personalizado
export function generarIdConSufijo(prefijo: string, sufijo: string): string {
  const numeroAleatorio = Math.random().toString(36).slice(2, 6)
  return `${prefijo}_${sufijo}_${numeroAleatorio}`
}
