import type { EsquemaCampo } from '@/interfaces/Campos'
import type { ReglaLogica } from '@/interfaces/Validacion'
import type { RegistroDatos, ValorDato } from '@/tipos/Comunes'
import { ServicioDecisionRules } from '@/servicios/ServicioDecisionRules'

export interface EstadoEfectivoCampo {
  visible: boolean
  requerido: boolean
}

// Instancia global del servicio (se puede configurar desde la aplicación)
let servicioDecisionRules: ServicioDecisionRules | null = null

export function configurarServicioDecisionRules(apiKey: string, urlBase?: string): void {
  servicioDecisionRules = new ServicioDecisionRules({ apiKey, urlBase })
}

export function obtenerServicioDecisionRules(): ServicioDecisionRules | null {
  return servicioDecisionRules
}

// Variable para almacenar el último resultado de DecisionRules
let ultimoResultadoDecisionRules: unknown = null

export function obtenerUltimoResultadoDecisionRules(): unknown {
  return ultimoResultadoDecisionRules
}

// Caché de resultados de DecisionRules
interface CacheEntry {
  resultado: unknown
  timestamp: number
}

const cacheDecisionRules = new Map<string, CacheEntry>()
const CACHE_TTL = 5000 // 5 segundos

// Función para generar clave de caché basada en los valores de entrada
function generarClaveCacheDecisionRules(
  regla: ReglaLogica,
  valoresPorNombre: RegistroDatos
): string {
  const valoresEntrada: Record<string, unknown> = {}

  // Solo incluir los campos de entrada configurados
  for (const campoEntrada of regla.camposEntrada ?? []) {
    valoresEntrada[campoEntrada.nombreCampo] = valoresPorNombre[campoEntrada.nombreCampo]
  }

  return `${regla.decisionRulesId}_${regla.decisionRulesVersion}_${JSON.stringify(valoresEntrada)}`
}

// Función para limpiar caché expirado
function limpiarCacheExpirado(): void {
  const ahora = Date.now()
  for (const [clave, entrada] of cacheDecisionRules.entries()) {
    if (ahora - entrada.timestamp > CACHE_TTL) {
      cacheDecisionRules.delete(clave)
    }
  }
}



// Versión nueva con esquema español (EsquemaCampo)
export async function evaluarReglasCampo(
  campo: EsquemaCampo,
  valoresPorNombre: RegistroDatos,
  mapaIdNombre: Record<string, string>
): Promise<EstadoEfectivoCampo> {
  // Guard: verificar que el campo existe
  if (!campo) {
    return { visible: true, requerido: false }
  }

  let visible = campo.visible !== false
  let requerido = !!campo.requerido

  for (const r of campo.logica ?? []) {
    let cumple = false

    if (r.tipo === 'decisionrules') {
      // Evaluar regla de DecisionRules, pasando el nombre del campo actual
      cumple = await evaluarReglaDecisionRules(r, valoresPorNombre, campo.nombre)
    } else {
      // Evaluar regla simple
      const nombreDependencia = mapaIdNombre[r.campoCondicionId]
      const valor = (nombreDependencia ? valoresPorNombre[nombreDependencia] : undefined) as ValorDato | undefined
      cumple = evaluarCondicion(r, valor)
    }

    if (cumple) {
      if (r.accion === 'mostrar') visible = true
      if (r.accion === 'ocultar') visible = false
      if (r.accion === 'requerir') requerido = true
      if (r.accion === 'opcional') requerido = false
      // La acción 'establecer-valor' se maneja dentro de evaluarReglaDecisionRules
    }
  }

  return { visible, requerido }
}

// Versión síncrona para compatibilidad (solo evalúa reglas simples)
export function evaluarReglasCampoSync(
  campo: EsquemaCampo,
  valoresPorNombre: RegistroDatos,
  mapaIdNombre: Record<string, string>
): EstadoEfectivoCampo {
  if (!campo) {
    return { visible: true, requerido: false }
  }

  let visible = campo.visible !== false
  let requerido = !!campo.requerido

  // Solo evaluar reglas simples en modo síncrono
  for (const r of campo.logica ?? []) {
    if (r.tipo !== 'decisionrules') {
      const nombreDependencia = mapaIdNombre[r.campoCondicionId]
      const valor = (nombreDependencia ? valoresPorNombre[nombreDependencia] : undefined) as ValorDato | undefined
      const cumple = evaluarCondicion(r, valor)
      if (cumple) {
        if (r.accion === 'mostrar') visible = true
        if (r.accion === 'ocultar') visible = false
        if (r.accion === 'requerir') requerido = true
        if (r.accion === 'opcional') requerido = false
      }
    }
  }

  return { visible, requerido }
}

async function evaluarReglaDecisionRules(
  regla: ReglaLogica,
  valoresPorNombre: RegistroDatos,
  nombreCampoActual?: string
): Promise<boolean> {
  console.log('🔵 [DecisionRules] Evaluando regla:', regla.id)

  if (!servicioDecisionRules || !servicioDecisionRules.estaInicializado()) {
    console.warn('⚠️ [DecisionRules] ServicioDecisionRules no está configurado')
    return false
  }

  if (!regla.decisionRulesId) {
    console.warn('⚠️ [DecisionRules] Regla sin ID configurado')
    return false
  }

  // Limpiar caché expirado periódicamente
  limpiarCacheExpirado()

  // Generar clave de caché
  const claveCache = generarClaveCacheDecisionRules(regla, valoresPorNombre)

  // Verificar si hay resultado en caché
  const entradaCache = cacheDecisionRules.get(claveCache)
  if (entradaCache) {
    const edad = Date.now() - entradaCache.timestamp
    console.log(`💾 [DecisionRules] Usando resultado en caché (edad: ${edad}ms)`)
    ultimoResultadoDecisionRules = entradaCache.resultado

    // Evaluar la condición con el resultado cacheado
    if (regla.condicionResultado) {
      try {
        const fn = new Function('result', `return (${regla.condicionResultado})`) as (result: unknown) => boolean
        const resultado = !!fn(entradaCache.resultado)

        // Aplicar asignaciones si corresponde
        if (resultado && regla.accion === 'establecer-valor') {
          if (regla.camposAsignar && regla.camposAsignar.length > 0) {
            aplicarAsignacionesValores(regla, entradaCache.resultado, valoresPorNombre)
          } else if (nombreCampoActual) {
            const valor = fn(entradaCache.resultado)
            valoresPorNombre[nombreCampoActual] = valor
          }
        }

        return resultado
      } catch (error) {
        console.error('❌ [DecisionRules] Error al evaluar condición con caché:', error)
      }
    }
    return true
  }

  try {
    // Construir el cuerpo de la solicitud
    console.log('📋 [DecisionRules] Valores disponibles:', valoresPorNombre)
    console.log('📋 [DecisionRules] Claves de valores:', Object.keys(valoresPorNombre))
    console.log('📋 [DecisionRules] Campos de entrada configurados:', regla.camposEntrada)

    const requestBody: Record<string, unknown> = {}
    for (const campoEntrada of regla.camposEntrada ?? []) {
      const nombreCampo = campoEntrada.nombreCampo
      // Si claveDecisionRules está vacía, usar el nombreCampo como clave
      const clave = campoEntrada.claveDecisionRules || nombreCampo
      const valor = valoresPorNombre[nombreCampo]

      console.log(`   📌 Mapeando:`)
      console.log(`      Campo: "${nombreCampo}"`)
      console.log(`      Clave DR: "${clave}" ${!campoEntrada.claveDecisionRules ? '(usando nombre del campo)' : ''}`)
      console.log(`      Valor: ${JSON.stringify(valor)}`)

      if (valor === undefined) {
        console.warn(`   ⚠️ ADVERTENCIA: El campo "${nombreCampo}" no existe en los valores disponibles`)
        console.warn(`   ⚠️ Valores disponibles:`, Object.keys(valoresPorNombre))
      }

      requestBody[clave] = valor
    }

    console.log('📤 [DecisionRules] Request Body final:', requestBody)
    console.log('📋 [DecisionRules] Rule ID:', regla.decisionRulesId)
    console.log('📋 [DecisionRules] Version:', regla.decisionRulesVersion ?? 1)

    // Llamar a DecisionRules
    const response = await servicioDecisionRules.evaluarRegla(
      {
        id: regla.id,
        ruleId: regla.decisionRulesId,
        nombre: `Regla ${regla.id}`,
        activa: true,
        version: regla.decisionRulesVersion ?? 1,
        camposEntrada: (regla.camposEntrada ?? []).map(ce => ({
          nombreCampo: ce.nombreCampo,
          claveDecisionRules: ce.claveDecisionRules
        })),
        accionesResultado: []
      },
      valoresPorNombre
    )

    console.log('📥 [DecisionRules] Response:', response)

    if (!response) {
      console.warn('⚠️ [DecisionRules] Response vacía')
      return false
    }

    // Guardar el resultado para uso posterior (asignación de valores)
    ultimoResultadoDecisionRules = response

    // Guardar en caché
    cacheDecisionRules.set(claveCache, {
      resultado: response,
      timestamp: Date.now()
    })
    console.log('💾 [DecisionRules] Resultado guardado en caché')

    // Evaluar la condición del resultado
    if (regla.condicionResultado) {
      try {
        console.log('🔍 [DecisionRules] Evaluando condición:', regla.condicionResultado)
        const fn = new Function('result', `return (${regla.condicionResultado})`) as (result: unknown) => boolean
        const resultado = !!fn(response)
        console.log('✅ [DecisionRules] Resultado de condición:', resultado)

        // Si la condición se cumple y la acción es establecer-valor
        if (resultado && regla.accion === 'establecer-valor') {
          if (regla.camposAsignar && regla.camposAsignar.length > 0) {
            // Usar configuración de campos a asignar
            console.log('📝 [DecisionRules] Aplicando asignaciones configuradas...')
            aplicarAsignacionesValores(regla, response, valoresPorNombre)
          } else if (nombreCampoActual) {
            // Asignación automática al campo actual usando la expresión de la condición
            console.log('📝 [DecisionRules] Asignación automática al campo actual:', nombreCampoActual)
            try {
              // Usar la misma expresión de la condición para obtener el valor
              const valor = fn(response)
              console.log(`   📝 Asignando: ${nombreCampoActual} = ${JSON.stringify(valor)}`)
              valoresPorNombre[nombreCampoActual] = valor
            } catch (error) {
              console.error('❌ Error al asignar valor automático:', error)
            }
          }
        }

        return resultado
      } catch (error) {
        console.error('❌ [DecisionRules] Error al evaluar condición:', error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('❌ [DecisionRules] Error al evaluar regla:', error)
    return false
  }
}


// Función para aplicar asignaciones de valores desde el resultado de DecisionRules
function aplicarAsignacionesValores(
  regla: ReglaLogica,
  resultado: unknown,
  valoresPorNombre: RegistroDatos
): void {
  if (!regla.camposAsignar) return

  for (const asignacion of regla.camposAsignar) {
    try {
      // Evaluar la expresión para obtener el valor
      const fn = new Function('result', `return (${asignacion.expresionValor})`) as (result: unknown) => unknown
      const valor = fn(resultado)

      console.log(`   📝 Asignando: ${asignacion.nombreCampo} = ${JSON.stringify(valor)}`)

      // Asignar el valor (esto se reflejará en el formulario)
      valoresPorNombre[asignacion.nombreCampo] = valor as ValorDato
    } catch (error) {
      console.error(`❌ Error al asignar valor a ${asignacion.nombreCampo}:`, error)
    }
  }
}

function evaluarCondicion(regla: ReglaLogica, valor: ValorDato | undefined): boolean {
  switch (regla.operador) {
    case 'igual':
      return valor === regla.valor
    case 'diferente':
      return valor !== regla.valor
    case 'contiene':
      return Array.isArray(valor) ? valor.includes(regla.valor) : String(valor ?? '').includes(String(regla.valor ?? ''))
    case 'mayor-que':
      return Number(valor) > Number(regla.valor)
    case 'menor-que':
      return Number(valor) < Number(regla.valor)
    case 'personalizado':
      if (!regla.expresion) return false
      try {
        const fn = new Function('valor', `return (${regla.expresion})`) as (valor: unknown) => boolean
        return !!fn(valor)
      } catch {
        return false
      }
    default:
      return false
  }
}

