// Constantes relacionadas con campos
import type { ReglaLogica } from '@/interfaces/Validacion';
import type { TipoCampo } from '@/tipos/Campos'

export const TIPOS_CAMPO_DISPONIBLES: readonly TipoCampo[] = [
  'texto',
  'area-texto',
  'correo',
  'contrasena',
  'numero',
  'hora',
  'fecha',
  'seleccion',
  'radio',
  'casilla',
  'etiqueta',
  'panel',
  'tabla',
  'boton',
  'divisor',
] as const

/**
 * Mapeo de tipos de campos a sus nombres en español
 */
export const TIPOS_ESPANOL: Record<TipoCampo, string> = {
  'texto': 'Texto',
  'area-texto': 'Área de texto',
  'correo': 'Correo electrónico',
  'contrasena': 'Contraseña',
  'numero': 'Número',
  'hora': 'Hora',
  'fecha': 'Fecha',
  'seleccion': 'Selección',
  'radio': 'Opción múltiple',
  'casilla': 'Casilla de verificación',
  'etiqueta': 'Etiqueta',
  'boton': 'Botón',
  'divisor': 'Divisor',
  'panel': 'Panel',
  'tabla': 'Tabla'
} as const

/**
 * Opciones de tipos de campo para selects con formato español completo
 */
export const TIPOS_OPCIONES: readonly { etiqueta: string; valor: TipoCampo }[] = [
  { etiqueta: 'Texto', valor: 'texto' },
  { etiqueta: 'Área de texto', valor: 'area-texto' },
  { etiqueta: 'Correo electrónico', valor: 'correo' },
  { etiqueta: 'Contraseña', valor: 'contrasena' },
  { etiqueta: 'Número', valor: 'numero' },
  { etiqueta: 'Hora', valor: 'hora' },
  { etiqueta: 'Fecha', valor: 'fecha' },
  { etiqueta: 'Selección', valor: 'seleccion' },
  { etiqueta: 'Opción múltiple', valor: 'radio' },
  { etiqueta: 'Casilla de verificación', valor: 'casilla' },
  { etiqueta: 'Etiqueta', valor: 'etiqueta' },
  { etiqueta: 'Botón', valor: 'boton' },
  { etiqueta: 'Divisor', valor: 'divisor' },
  { etiqueta: 'Panel', valor: 'panel' },
  { etiqueta: 'Tabla', valor: 'tabla' },
] as const


export const OPERADORES_LOGICA_DISPONIBLES: readonly ReglaLogica['operador'][] = [
  'igual',
  'diferente',
  'contiene',
  'mayor-que',
  'menor-que',
  'personalizado',
] as const

export const ACCIONES_LOGICA_DISPONIBLES: readonly ReglaLogica['accion'][] = [
  'mostrar',
  'ocultar',
  'requerir',
  'opcional',
] as const


/**
 * Opciones de tipos de campo para selects con formato corto
 */
// export const OPCIONES_TIPO_CORTO: readonly { etiqueta: string; valor: TipoCampo }[] = [
//   { etiqueta: 'Texto', valor: 'texto' },
//   { etiqueta: 'Área', valor: 'area-texto' },
//   { etiqueta: 'Email', valor: 'correo' },
//   { etiqueta: 'Contraseña', valor: 'contrasena' },
//   { etiqueta: 'Número', valor: 'numero' },
//   { etiqueta: 'Hora', valor: 'hora' },
//   { etiqueta: 'Fecha', valor: 'fecha' },
//   { etiqueta: 'Select', valor: 'seleccion' },
//   { etiqueta: 'Radio', valor: 'radio' },
//   { etiqueta: 'Checkbox', valor: 'casilla' },
//   { etiqueta: 'Etiqueta', valor: 'etiqueta' },
//   { etiqueta: 'Botón', valor: 'boton' },
//   { etiqueta: 'Divisor', valor: 'divisor' },
//   { etiqueta: 'Panel', valor: 'panel' },
//   { etiqueta: 'Tabla', valor: 'tabla' },
// ] as const

export const TIPOS_CAMPO_DE_TEXTO: readonly TipoCampo[] = [
  'texto',
  'correo',
  'contrasena',
  'area-texto',
] as const

/**
 * Tipos de campo que soportan placeholder
 */
export const TIPOS_CON_PLACEHOLDER: readonly TipoCampo[] = [
  ...TIPOS_CAMPO_DE_TEXTO,
  'numero',
] as const

/**
 * Tipos de campo que soportan opciones (select, radio, checkbox múltiple)
 */
export const TIPOS_CON_OPCIONES: readonly TipoCampo[] = [
  'seleccion',
  'radio',
  'casilla'
] as const


