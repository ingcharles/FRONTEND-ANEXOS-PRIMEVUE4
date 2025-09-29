// Constantes relacionadas con campos
import { TipoCampoEtiqueta, TipoCampoValor } from '@/enumeraciones/Campos';
import type { ReglaLogica } from '@/interfaces/Validacion';

// Re-exportamos las enumeraciones para compatibilidad
export { TipoCampoEtiqueta, TipoCampoValor } from '@/enumeraciones/Campos';

// export const TIPOS_CAMPO_DISPONIBLES: readonly TipoCampoValor[] = [
//   'texto',
//   'area-texto',
//   'correo',
//   'contrasena',
//   'numero',
//   'hora',
//   'fecha',
//   'seleccion',
//   'radio',
//   'casilla',
//   'etiqueta',
//   'panel',
//   'tabla',
//   'boton',
//   'divisor',
// ] as const

/**
 * Mapeo de tipos de campos a sus nombres en español
 */
// export const TIPOS_OPCIONES_ESPANOL: Record<TipoCampoValor, string> = {
//   'texto': 'Texto',
//   'area-texto': 'Área de texto',
//   'correo': 'Correo electrónico',
//   'contrasena': 'Contraseña',
//   'numero': 'Número',
//   'hora': 'Hora',
//   'fecha': 'Fecha',
//   'seleccion': 'Selección',
//   'radio': 'Opción múltiple',
//   'casilla': 'Casilla de verificación',
//   'etiqueta': 'Etiqueta',
//   'boton': 'Botón',
//   'divisor': 'Divisor',
//   'panel': 'Panel',
//   'tabla': 'Tabla'
// } as const




export const TIPOS_OPCIONES_ESPANOL: readonly { valor: TipoCampoValor, etiqueta: TipoCampoEtiqueta }[] = [
  { etiqueta: TipoCampoEtiqueta.Texto, valor: TipoCampoValor.Texto },
  { etiqueta: TipoCampoEtiqueta.AreaTexto,valor: TipoCampoValor.AreaTexto },
  { etiqueta: TipoCampoEtiqueta.Correo, valor: TipoCampoValor.Correo },
  { etiqueta: TipoCampoEtiqueta.Contrasena, valor: TipoCampoValor.Contrasena },
  { etiqueta: TipoCampoEtiqueta.Numero, valor: TipoCampoValor.Numero },
  { etiqueta: TipoCampoEtiqueta.Hora, valor: TipoCampoValor.Hora },
  { etiqueta: TipoCampoEtiqueta.Fecha, valor: TipoCampoValor.Fecha },
  { etiqueta: TipoCampoEtiqueta.Seleccion, valor: TipoCampoValor.Seleccion },
  { etiqueta: TipoCampoEtiqueta.Radio, valor: TipoCampoValor.Radio },
  { etiqueta: TipoCampoEtiqueta.Casilla, valor: TipoCampoValor.Casilla },
  { etiqueta: TipoCampoEtiqueta.Etiqueta, valor: TipoCampoValor.Etiqueta },
  { etiqueta: TipoCampoEtiqueta.Boton, valor: TipoCampoValor.Boton },
  { etiqueta: TipoCampoEtiqueta.Divisor, valor: TipoCampoValor.Divisor },
  { etiqueta: TipoCampoEtiqueta.Panel, valor: TipoCampoValor.Panel },
  { etiqueta: TipoCampoEtiqueta.Tabla, valor: TipoCampoValor.Tabla },
]

/**
 * Opciones de tipos de campo para selects con formato español completo
 */
export const TIPOS_OPCIONES: readonly { etiqueta: TipoCampoEtiqueta; valor: TipoCampoValor }[] = [
  { etiqueta: TipoCampoEtiqueta.Texto, valor: TipoCampoValor.Texto },
  { etiqueta: TipoCampoEtiqueta.AreaTexto, valor: TipoCampoValor.AreaTexto },
  { etiqueta: TipoCampoEtiqueta.Correo, valor: TipoCampoValor.Correo },
  { etiqueta: TipoCampoEtiqueta.Contrasena, valor: TipoCampoValor.Contrasena },
  { etiqueta: TipoCampoEtiqueta.Numero, valor: TipoCampoValor.Numero },
  { etiqueta: TipoCampoEtiqueta.Hora, valor: TipoCampoValor.Hora },
  { etiqueta: TipoCampoEtiqueta.Fecha, valor: TipoCampoValor.Fecha },
  { etiqueta: TipoCampoEtiqueta.Seleccion, valor: TipoCampoValor.Seleccion },
  { etiqueta: TipoCampoEtiqueta.Radio, valor: TipoCampoValor.Radio },
  { etiqueta: TipoCampoEtiqueta.Casilla, valor: TipoCampoValor.Casilla },
  { etiqueta: TipoCampoEtiqueta.Etiqueta, valor: TipoCampoValor.Etiqueta },
  { etiqueta: TipoCampoEtiqueta.Boton, valor: TipoCampoValor.Boton },
  { etiqueta: TipoCampoEtiqueta.Divisor, valor: TipoCampoValor.Divisor },
  { etiqueta: TipoCampoEtiqueta.Panel, valor: TipoCampoValor.Panel },
  { etiqueta: TipoCampoEtiqueta.Tabla, valor: TipoCampoValor.Tabla },
]


export const OPERADORES_LOGICA_DISPONIBLES: readonly ReglaLogica['operador'][] = [
  'igual',
  'diferente',
  'contiene',
  'mayor-que',
  'menor-que',
  'personalizado',
]

export const ACCIONES_LOGICA_DISPONIBLES: readonly ReglaLogica['accion'][] = [
  'mostrar',
  'ocultar',
  'requerir',
  'opcional',
]


/**
 * Opciones de tipos de campo para selects con formato corto
 */
// export const OPCIONES_TIPO_CORTO: readonly { etiqueta: string; valor: TipoCampoValor }[] = [
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

export const TIPOS_CAMPO_DE_TEXTO: readonly TipoCampoValor[] = [
  TipoCampoValor.Texto,
  TipoCampoValor.Correo,
  TipoCampoValor.Contrasena,
  TipoCampoValor.AreaTexto,
]


/**
 * Tipos de campo que soportan placeholder
 */
export const TIPOS_CON_PLACEHOLDER: readonly TipoCampoValor[] = [
  ...TIPOS_CAMPO_DE_TEXTO,
  TipoCampoValor.Numero,
]



/**
 * Tipos de campo que soportan opciones (select, radio, checkbox múltiple)
 */
export const TIPOS_CON_OPCIONES: readonly TipoCampoValor[] = [
  TipoCampoValor.Seleccion,
  TipoCampoValor.Radio,
  TipoCampoValor.Casilla
]

/**
 * Tipos de campo que soportan opciones (select, radio, checkbox múltiple)
 */
export const TIPOS_CON_OPCIONES_HORIZONAL_VERTICAL: readonly TipoCampoValor[] = [
  TipoCampoValor.Radio,
  TipoCampoValor.Casilla
]


/**
 * Tipos de campo que soportan placeholder
 */
export const TIPOS_SOLO_LECTURA: readonly TipoCampoValor[] = [
  ...TIPOS_CAMPO_DE_TEXTO,
  ...TIPOS_CON_OPCIONES,
  TipoCampoValor.Fecha,
  TipoCampoValor.Hora,
  TipoCampoValor.Boton
]

/**
 * Tipos de campo que soportan placeholder
 */
export const TIPOS_DESHABILITABLES: readonly TipoCampoValor[] = [
  ...TIPOS_CAMPO_DE_TEXTO,
  ...TIPOS_CON_OPCIONES,
  TipoCampoValor.Fecha,
  TipoCampoValor.Hora,
  TipoCampoValor.Boton
]

