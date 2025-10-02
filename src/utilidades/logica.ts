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
      // Evaluar regla de DecisionRules
      cumple = await evaluarReglaDecisionRules(r, valoresPorNombre)
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
  valoresPorNombre: RegistroDatos
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

    // Evaluar la condición del resultado
    if (regla.condicionResultado) {
      try {
        console.log('🔍 [DecisionRules] Evaluando condición:', regla.condicionResultado)
        const fn = new Function('result', `return (${regla.condicionResultado})`) as (result: unknown) => boolean
        const resultado = !!fn(response)
        console.log('✅ [DecisionRules] Resultado de condición:', resultado)
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

