import type { TipoCampo } from '@/tipos/Campos'
import { TIPOS_ESPANOL, TIPOS_CON_PLACEHOLDER, TIPOS_CON_OPCIONES } from '@/constantes/Campos'

/**
 * Obtener el nombre en español de un tipo de campo
 */
export function obtenerNombreTipoEspanol(tipo: TipoCampo): string {
  return TIPOS_ESPANOL[tipo] || tipo
}

/**
 * Verificar si un tipo de campo soporta placeholder
 */
export function soportaPlaceholder(tipo: TipoCampo): boolean {
  return TIPOS_CON_PLACEHOLDER.includes(tipo)
}

/**
 * Verificar si un tipo de campo soporta opciones
 */
export function soportaOpciones(tipo: TipoCampo): boolean {
  return TIPOS_CON_OPCIONES.includes(tipo)
}