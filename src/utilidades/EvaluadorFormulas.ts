/**
 * Evaluador de fórmulas para tabla resumen
 * Soporta referencias a otras tablas y operaciones matemáticas
 */

import type { RegistroDatos } from '@/tipos/Comunes'

export type OperacionAgregacion = 'sum' | 'avg' | 'count' | 'min' | 'max'

/**
 * Interfaz para el resultado de parsear una referencia
 */
interface ReferenciaTabla {
  nombreTabla: string
  nombreColumna: string
  operacion: OperacionAgregacion
}

/**
 * Evalúa una fórmula que puede contener referencias a tablas
 * Formato: {nombreTabla.columna.operacion}
 * Ejemplo: {tabla_productos.precio.sum} * 1.19
 * 
 * @param formula - La fórmula a evaluar
 * @param valoresFormulario - Todos los valores del formulario
 * @returns El resultado de la evaluación
 */
export function evaluarFormula(
  formula: string,
  valoresFormulario: RegistroDatos
): number {
  try {
    // Si la fórmula está vacía, retornar 0
    if (!formula || formula.trim() === '') return 0

    // Reemplazar todas las referencias {tabla.columna.operacion} por sus valores
    let formulaProcesada = formula

    // Buscar todas las referencias en formato {tabla.columna.operacion}
    const patron = /\{([^}]+)\}/g
    const referencias = formula.match(patron)

    if (referencias) {
      for (const referencia of referencias) {
        // Quitar las llaves
        const contenido = referencia.slice(1, -1)
        const valor = evaluarReferencia(contenido, valoresFormulario)
        formulaProcesada = formulaProcesada.replace(referencia, String(valor))
      }
    }

    // Evaluar la expresión matemática resultante
    return evaluarExpresion(formulaProcesada)
  } catch (error) {
    console.error('Error al evaluar fórmula:', formula, error)
    return 0
  }
}

/**
 * Evalúa una referencia a una tabla
 * Formato: nombreTabla.columna.operacion
 * 
 * @param referencia - La referencia sin llaves
 * @param valoresFormulario - Todos los valores del formulario
 * @returns El valor calculado
 */
function evaluarReferencia(
  referencia: string,
  valoresFormulario: RegistroDatos
): number {
  try {
    const partes = referencia.split('.')
    
    if (partes.length !== 3) {
      console.warn('Formato de referencia inválido:', referencia)
      return 0
    }

    const [nombreTabla, nombreColumna, operacion] = partes
    const datosTabla = valoresFormulario[nombreTabla]

    // Validar que la tabla existe y es un array
    if (!Array.isArray(datosTabla)) {
      console.warn('Tabla no encontrada o no es un array:', nombreTabla)
      return 0
    }

    return calcularAgregacion(
      datosTabla,
      nombreColumna,
      operacion as OperacionAgregacion
    )
  } catch (error) {
    console.error('Error al evaluar referencia:', referencia, error)
    return 0
  }
}

/**
 * Calcula una operación de agregación sobre los datos de una tabla
 * 
 * @param datosTabla - Array con las filas de la tabla
 * @param nombreColumna - Nombre de la columna a agregar
 * @param operacion - Tipo de agregación (sum, avg, count, min, max)
 * @returns El valor calculado
 */
export function calcularAgregacion(
  datosTabla: Array<Record<string, unknown>>,
  nombreColumna: string,
  operacion: OperacionAgregacion
): number {
  // Extraer los valores de la columna
  const valores = datosTabla
    .map(fila => {
      const valor = fila[nombreColumna]
      
      // Convertir a número
      if (typeof valor === 'number') return valor
      if (typeof valor === 'string') {
        const numero = Number(valor)
        return isNaN(numero) ? null : numero
      }
      return null
    })
    .filter((v): v is number => v !== null && !isNaN(v))

  // Si no hay valores válidos
  if (valores.length === 0) {
    return operacion === 'count' ? 0 : 0
  }

  switch (operacion) {
    case 'sum':
      return valores.reduce((acc, val) => acc + val, 0)
    
    case 'avg':
      return valores.reduce((acc, val) => acc + val, 0) / valores.length
    
    case 'count':
      return valores.length
    
    case 'min':
      return Math.min(...valores)
    
    case 'max':
      return Math.max(...valores)
    
    default:
      console.warn('Operación de agregación desconocida:', operacion)
      return 0
  }
}

/**
 * Evalúa una expresión matemática simple
 * Soporta: +, -, *, /, (), números decimales
 * 
 * @param expresion - La expresión a evaluar
 * @returns El resultado
 */
function evaluarExpresion(expresion: string): number {
  try {
    // Limpiar la expresión
    const expresionLimpia = expresion.trim().replace(/\s+/g, '')
    
    // Validar que solo contenga caracteres permitidos
    if (!/^[0-9+\-*/.()]+$/.test(expresionLimpia)) {
      console.warn('Expresión contiene caracteres no permitidos:', expresion)
      return 0
    }

    // Evaluar la expresión usando Function (más seguro que eval)
    const resultado = new Function(`return ${expresionLimpia}`)()
    
    return typeof resultado === 'number' && !isNaN(resultado) ? resultado : 0
  } catch (error) {
    console.error('Error al evaluar expresión:', expresion, error)
    return 0
  }
}

/**
 * Valida si una fórmula tiene sintaxis correcta
 * 
 * @param formula - La fórmula a validar
 * @returns true si es válida, false si no
 */
export function validarFormula(formula: string): {
  valida: boolean
  errores: string[]
} {
  const errores: string[] = []

  try {
    if (!formula || formula.trim() === '') {
      return { valida: true, errores: [] }
    }

    // Validar que las llaves estén balanceadas
    const aperturas = (formula.match(/\{/g) || []).length
    const cierres = (formula.match(/\}/g) || []).length
    
    if (aperturas !== cierres) {
      errores.push('Las llaves { } no están balanceadas')
    }

    // Validar formato de referencias
    const patron = /\{([^}]+)\}/g
    const referencias = formula.match(patron)
    
    if (referencias) {
      for (const referencia of referencias) {
        const contenido = referencia.slice(1, -1)
        const partes = contenido.split('.')
        
        if (partes.length !== 3) {
          errores.push(`Formato inválido en referencia: ${referencia}. Debe ser {tabla.columna.operacion}`)
        } else {
          const [, , operacion] = partes
          const operacionesValidas: OperacionAgregacion[] = ['sum', 'avg', 'count', 'min', 'max']
          
          if (!operacionesValidas.includes(operacion as OperacionAgregacion)) {
            errores.push(`Operación inválida: ${operacion}. Debe ser: sum, avg, count, min o max`)
          }
        }
      }
    }

    return {
      valida: errores.length === 0,
      errores
    }
  } catch (error) {
    errores.push('Error al validar la fórmula')
    return { valida: false, errores }
  }
}

/**
 * Obtiene todas las referencias de tablas en una fórmula
 * 
 * @param formula - La fórmula a analizar
 * @returns Array con las referencias encontradas
 */
export function obtenerReferenciasFormula(formula: string): ReferenciaTabla[] {
  const referencias: ReferenciaTabla[] = []
  
  try {
    const patron = /\{([^}]+)\}/g
    const matches = formula.match(patron)
    
    if (matches) {
      for (const match of matches) {
        const contenido = match.slice(1, -1)
        const partes = contenido.split('.')
        
        if (partes.length === 3) {
          referencias.push({
            nombreTabla: partes[0],
            nombreColumna: partes[1],
            operacion: partes[2] as OperacionAgregacion
          })
        }
      }
    }
  } catch (error) {
    console.error('Error al obtener referencias:', error)
  }
  
  return referencias
}

/**
 * Formatea un número según la configuración especificada
 * 
 * @param valor - El valor a formatear
 * @param formato - Configuración del formato
 * @returns El valor formateado como string
 */
export function formatearNumero(
  valor: number,
  formato?: {
    decimales?: number
    prefijo?: string
    sufijo?: string
  }
): string {
  const decimales = formato?.decimales ?? 2
  const prefijo = formato?.prefijo ?? ''
  const sufijo = formato?.sufijo ?? ''
  
  const valorFormateado = valor.toFixed(decimales)
  
  return `${prefijo}${valorFormateado}${sufijo}`.trim()
}

