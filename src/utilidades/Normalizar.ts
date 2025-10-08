import type { EsquemaCampo, MetadatosCampo } from '@/interfaces/Campos'
import type { ValorDato } from '@/tipos/Comunes'
import { TipoCampoValor } from '@/enumeraciones/Campos'
import { ServicioEsquemasFormulario } from '@/servicios/disenador/ServicioEsquemas'

/**
 * Parsea una cadena con formato HH:mm a objeto Date.
 */
export function parsearHoraCadenaAFecha(cadena: string): Date | null {
  const coincidencia = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(cadena)
  if (!coincidencia) return null
  const [, horas, minutos] = coincidencia
  const fecha = new Date()
  fecha.setHours(Number(horas), Number(minutos), 0, 0)
  return fecha
}

/**
 * Obtiene las opciones de un campo.
 */
export function obtenerOpciones(
  campo: EsquemaCampo
): Array<{ label: string; value: string | number; disabled?: boolean }> {
  const metadatos = campo.metadatos as MetadatosCampo | undefined
  const opciones = (metadatos?.opciones ?? metadatos?.opciones) as
    | Array<{ label: string; value: string | number; disabled?: boolean }>
    | undefined
  return Array.isArray(opciones) ? opciones : []
}

/**
 * Normaliza un valor a número.
 */
export function normalizarNumero(valor: ValorDato | undefined): number | undefined {
  if (typeof valor === 'string' && valor.trim() !== '') {
    const numero = Number(valor)
    return isNaN(numero) ? undefined : numero
  }
  return valor as number | undefined
}

/**
 * Normaliza un valor a fecha.
 */
export function normalizarFecha(valor: ValorDato | undefined): Date | undefined {
  if (typeof valor === 'string' && valor.trim() !== '') {
    const fecha = new Date(valor)
    return isNaN(fecha.getTime()) ? undefined : fecha
  }
  return valor as Date | undefined
}

/**
 * Normaliza el valor de una casilla (checkbox).
 */
export function normalizarCasilla(campo: EsquemaCampo, valor: ValorDato | undefined): ValorDato {
  if (obtenerOpciones(campo).length > 0) {
    return Array.isArray(valor) ? valor : []
  }
  if (typeof valor === 'string') {
    return valor.toLowerCase() === 'true'
  }
  if (typeof valor === 'boolean') {
    return valor
  }
  return false
}

/**
 * Normaliza el valor de una tabla.
 */
export function normalizarTabla(campo: EsquemaCampo, valor: ValorDato | undefined): ValorDato {
  // Si ya hay un array con datos, devolverlo
  if (Array.isArray(valor) && valor.length > 0) return valor

  // Si no hay valor o es array vacío, crear filas iniciales según configuración
  const servicioEsquemas = new ServicioEsquemasFormulario()
  const columnas = servicioEsquemas.obtenerColumnasTabla(campo)
  const filas = servicioEsquemas.obtenerFilasTabla(campo)
  return Array.from({ length: filas }, () => servicioEsquemas.crearFilaVacia(columnas))
}

/**
 * Normaliza y obtiene el valor por defecto de un campo según su tipo.
 */
export function obtenerValorDefectoNormalizado(campo: EsquemaCampo): ValorDato | undefined {
  const metadatos = campo.metadatos as MetadatosCampo | undefined
  const valorDefecto = metadatos?.valorPorDefecto as ValorDato | undefined

  switch (campo.tipo) {
    case TipoCampoValor.Hora:
      return typeof valorDefecto === 'string' ? parsearHoraCadenaAFecha(valorDefecto) : valorDefecto
    case TipoCampoValor.Numero:
      return normalizarNumero(valorDefecto)
    case TipoCampoValor.Fecha:
      return normalizarFecha(valorDefecto)
    case TipoCampoValor.Casilla:
      return normalizarCasilla(campo, valorDefecto)
    case TipoCampoValor.Tabla:
      return normalizarTabla(campo, valorDefecto)
    default:
      return valorDefecto
  }
}

/**
 * Verifica si un valor está vacío.
 */
export function esVacio(valor: ValorDato | undefined): boolean {
  return valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '')
}


// Función auxiliar para convertir valores a texto de forma segura
export function convertirATexto(valor: unknown): string {
  if (valor === null || valor === undefined) {
    return ''
  }
  if (typeof valor === 'string') {
    return valor
  }
  if (typeof valor === 'number' || typeof valor === 'boolean') {
    return String(valor)
  }
  if (typeof valor === 'symbol') {
    return valor.toString()
  }
  if (typeof valor === 'function') {
    return '[function]'
  }
  if (typeof valor === 'object') {
    try {
      return JSON.stringify(valor)
    } catch {
      return '[object Object]'
    }
  }
  // Para bigint y otros tipos futuros
  return '[unknown type]'
}
