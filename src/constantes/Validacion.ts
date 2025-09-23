// Constantes relacionadas con validación
import type { ReglaLogica } from '@/interfaces/Validacion'

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