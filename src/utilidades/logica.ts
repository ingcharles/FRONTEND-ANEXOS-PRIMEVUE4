import type { EsquemaCampo } from '@/interfaces/Campos'
import type { ReglaLogica } from '@/interfaces/Validacion'
import type { RegistroDatos, ValorDato } from '@/tipos/Comunes'
import { ServicioDecisionRules } from '@/servicios/ServicioDecisionRules'

export interface EstadoEfectivoCampo {
  visible: boolean
  requerido: boolean
}

// Instancia global del servicio
let servicioDecisionRules: ServicioDecisionRules | null = null

export function configurarServicioDecisionRules(apiKey: string, urlBase?: string): void {
  servicioDecisionRules = new ServicioDecisionRules({ apiKey, urlBase })
}

export function obtenerServicioDecisionRules(): ServicioDecisionRules | null {
  return servicioDecisionRules
}

// Versión asíncrona con soporte para DecisionRules
export async function evaluarReglasCampo(
  campo: EsquemaCampo,
  valoresPorNombre: RegistroDatos,
  mapaIdNombre: Record<string, string>
): Promise<EstadoEfectivoCampo> {
  if (!campo) {
    return { visible: true, requerido: false }
  }

  let visible = campo.visible !== false
  let requerido = !!campo.requerido

  for (const r of campo.logica ?? []) {
    let cumple = false

    if (r.tipo === 'decisionrules') {
      cumple = await evaluarReglaDecisionRules(r, valoresPorNombre, campo.nombre)
    } else {
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

// Versión síncrona (solo reglas simples)
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

  // ⚠️ VALIDACIÓN: No evaluar si la regla no está completamente configurada
  if (!regla.decisionRulesId || !regla.decisionRulesId.trim()) {
    console.log('⏭️ [DecisionRules] Saltando regla - ID no configurado')
    return false
  }

  if (!regla.decisionRulesVersion || regla.decisionRulesVersion < 1) {
    console.log('⏭️ [DecisionRules] Saltando regla - Versión no configurada')
    return false
  }

  // ⚠️ VALIDACIÓN: Para acciones que no sean "establecer-valor", la condición es obligatoria
  const esAccionEstablecerValor = regla.accion === 'establecer-valor'
  if (!esAccionEstablecerValor && (!regla.condicionResultado || regla.condicionResultado.trim() === '')) {
    console.log('⏭️ [DecisionRules] Saltando regla - Sin condición de resultado (requerida para acciones mostrar/ocultar/requerir/opcional)')
    return false
  }

  // 🧹 VALIDACIÓN: Verificar si algún campo de entrada está vacío
  const algunCampoEntradaVacio = (regla.camposEntrada ?? []).some(campoEntrada => {
    const valor = valoresPorNombre[campoEntrada.nombreCampo]
    return valor === null || valor === undefined || valor === ''
  })

  // Si hay campos de entrada vacíos y es acción "establecer-valor", limpiar campos de salida
  if (algunCampoEntradaVacio && esAccionEstablecerValor) {
    console.log('🧹 [DecisionRules] Campo(s) de entrada vacío(s) - Limpiando campos de salida')

    // Limpiar campos configurados en "Campos a Asignar"
    if (regla.camposAsignar && regla.camposAsignar.length > 0) {
      for (const asignacion of regla.camposAsignar) {
        console.log(`   🧹 Limpiando: ${asignacion.nombreCampo}`)
        valoresPorNombre[asignacion.nombreCampo] = undefined
      }
    } else if (nombreCampoActual) {
      // Limpiar campo actual si no hay asignaciones configuradas
      console.log(`   🧹 Limpiando campo actual: ${nombreCampoActual}`)
      valoresPorNombre[nombreCampoActual] = undefined
    }

    return false
  }

  try {
    console.log('📋 [DecisionRules] Valores disponibles:', valoresPorNombre)
    console.log('📋 [DecisionRules] Claves de valores:', Object.keys(valoresPorNombre))
    console.log('📋 [DecisionRules] Campos de entrada configurados:', regla.camposEntrada)

    const requestBody: Record<string, unknown> = {}
    for (const campoEntrada of regla.camposEntrada ?? []) {
      const nombreCampo = campoEntrada.nombreCampo
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

    // Si la acción es "establecer-valor", aplicar valores directamente
    if (esAccionEstablecerValor) {
      if (regla.camposAsignar && regla.camposAsignar.length > 0) {
        console.log('📝 [DecisionRules] Aplicando asignaciones configuradas...')
        aplicarAsignacionesValores(regla, response, valoresPorNombre)
      } else if (nombreCampoActual) {
        console.log('📝 [DecisionRules] Asignación automática al campo actual:', nombreCampoActual)
        try {
          // Si hay condición, usarla; si no, usar el response directamente
          if (regla.condicionResultado && regla.condicionResultado.trim()) {
            const fn = new Function('result', `return (${regla.condicionResultado})`) as (result: unknown) => unknown
            const valor = fn(response)
            console.log(`   📝 Asignando (con condición): ${nombreCampoActual} = ${JSON.stringify(valor)}`)
            valoresPorNombre[nombreCampoActual] = valor as ValorDato
          } else {
            // Sin condición, asignar el response completo
            console.log(`   📝 Asignando (sin condición): ${nombreCampoActual} = ${JSON.stringify(response)}`)
            valoresPorNombre[nombreCampoActual] = response as ValorDato
          }
        } catch (error) {
          console.error('❌ Error al asignar valor automático:', error)
        }
      }
      // Para "establecer-valor", siempre retornar true (no afecta visible/requerido)
      return true
    }

    // Para otras acciones (mostrar/ocultar/requerir/opcional), evaluar la condición
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

function aplicarAsignacionesValores(
  regla: ReglaLogica,
  resultado: unknown,
  valoresPorNombre: RegistroDatos
): void {
  if (!regla.camposAsignar) return

  for (const asignacion of regla.camposAsignar) {
    try {
      const fn = new Function('result', `return (${asignacion.expresionValor})`) as (result: unknown) => unknown
      const valor = fn(resultado)

      console.log(`   📝 Asignando: ${asignacion.nombreCampo} = ${JSON.stringify(valor)}`)
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
