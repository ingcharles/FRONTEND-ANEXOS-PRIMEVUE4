import type { EsquemaCampo } from '@/interfaces/Campos'
import type { ReglaLogica } from '@/interfaces/Validacion'
import type { RegistroDatos, TipoEventoDecisionRules, ValorDato } from '@/tipos/Comunes'
import { ServicioDecisionRules } from '@/servicios/ServicioDecisionRules'
import type { EstadoEfectivoCampo } from '@/interfaces/TabLogica'
import { convertirATexto } from '@/utilidades/Normalizar'


// Instancia global del servicio
let servicioDecisionRules: ServicioDecisionRules | null = null

export function configurarServicioDecisionRules(apiKey: string, urlBase?: string): void {
  servicioDecisionRules = new ServicioDecisionRules({ apiKey, urlBase })
}

export function obtenerServicioDecisionRules(): ServicioDecisionRules | null {
  return servicioDecisionRules
}

// Función para obtener reglas DecisionRules de un campo específico
export function obtenerReglasDecisionRulesPorCampo(
  campo: EsquemaCampo,
  nombreCampo: string
): ReglaLogica[] {
  if (!campo.logica) return []

  return campo.logica.filter(regla => {
    if (regla.tipo !== 'decisionrules') return false
    if (!regla.camposEntrada) return false

    // Verificar si el campo está en los campos de entrada
    return regla.camposEntrada.some(ce => ce.nombreCampo === nombreCampo)
  })
}

// Función para evaluar solo reglas DecisionRules específicas de un campo
export async function evaluarReglasDecisionRulesCampo(
  campo: EsquemaCampo,
  valoresPorNombre: RegistroDatos,
  mapaIdNombre: Record<string, string>,
  nombreCampoEvento: string,
  tipoEvento: TipoEventoDecisionRules
): Promise<EstadoEfectivoCampo> {
  if (!campo) {
    return { visible: true, requerido: false }
  }

  let estado = obtenerEstadoBaseCampo(campo)

  // Evaluar reglas simples
  estado = aplicarReglasSimples(campo, valoresPorNombre, mapaIdNombre, estado)

  // Evaluar reglas DecisionRules
  estado = await aplicarReglasDecisionRules(campo, valoresPorNombre, nombreCampoEvento, tipoEvento, estado)

  return estado
}

function obtenerEstadoBaseCampo(campo: EsquemaCampo): EstadoEfectivoCampo {
  return {
    visible: campo.visible !== false,
    requerido: !!campo.requerido
  }
}

function aplicarReglasSimples(
  campo: EsquemaCampo,
  valoresPorNombre: RegistroDatos,
  mapaIdNombre: Record<string, string>,
  estadoActual: EstadoEfectivoCampo
): EstadoEfectivoCampo {
  const reglasSimples = (campo.logica ?? []).filter(r => r.tipo !== 'decisionrules')

  for (const regla of reglasSimples) {
    const nombreDependencia = mapaIdNombre[regla.campoCondicionId]
    const valor = nombreDependencia ? valoresPorNombre[nombreDependencia] : undefined

    if (evaluarCondicion(regla, valor)) {
      estadoActual = aplicarAccionRegla(regla, estadoActual)
    }
  }

  return estadoActual
}

async function aplicarReglasDecisionRules(
  campo: EsquemaCampo,
  valoresPorNombre: RegistroDatos,
  nombreCampoEvento: string,
  tipoEvento: TipoEventoDecisionRules,
  estadoActual: EstadoEfectivoCampo
): Promise<EstadoEfectivoCampo> {
  const reglasDecision = obtenerReglasDecisionAplicables(campo, nombreCampoEvento, tipoEvento)

  for (const regla of reglasDecision) {
    const cumple = await evaluarReglaDecision(regla, valoresPorNombre, campo.nombre)
    if (cumple) {
      estadoActual = aplicarAccionRegla(regla, estadoActual)
    }
  }

  return estadoActual
}

function obtenerReglasDecisionAplicables(
  campo: EsquemaCampo,
  nombreCampoEvento: string,
  tipoEvento: TipoEventoDecisionRules
): ReglaLogica[] {
  return (campo.logica ?? []).filter(regla => {
    if (regla.tipo !== 'decisionrules') return false
    if (!regla.camposEntrada) return false

    const tieneElCampo = regla.camposEntrada.some(ce => ce.nombreCampo === nombreCampoEvento)
    if (!tieneElCampo) return false

    const eventoRegla = regla.eventoEjecucion || 'change'
    return eventoRegla === tipoEvento
  })
}

function aplicarAccionRegla(regla: ReglaLogica, estado: EstadoEfectivoCampo): EstadoEfectivoCampo {
  switch (regla.accion) {
    case 'mostrar':
      return { ...estado, visible: true }
    case 'ocultar':
      return { ...estado, visible: false }
    case 'requerir':
      return { ...estado, requerido: true }
    case 'opcional':
      return { ...estado, requerido: false }
    default:
      return estado
  }
}

// Versión asíncrona con soporte para DecisionRules
export async function evaluarReglasCampo(
  campo: EsquemaCampo,
  valoresPorNombre: RegistroDatos,
  mapaIdNombre: Record<string, string>,
  opciones?: { incluirDecisionRules?: boolean }
): Promise<EstadoEfectivoCampo> {
  if (!campo) {
    return { visible: true, requerido: false }
  }

  const incluirDR = opciones?.incluirDecisionRules ?? true
  let estado = obtenerEstadoBaseCampo(campo)

  for (const regla of campo.logica ?? []) {
    const cumple = await evaluarReglaIndividual(regla, valoresPorNombre, mapaIdNombre, campo.nombre, incluirDR)
    if (cumple) {
      estado = aplicarAccionRegla(regla, estado)
    }
  }

  return estado
}

async function evaluarReglaIndividual(
  regla: ReglaLogica,
  valoresPorNombre: RegistroDatos,
  mapaIdNombre: Record<string, string>,
  nombreCampo?: string,
  incluirDecisionRules: boolean = true
): Promise<boolean> {
  if (regla.tipo === 'decisionrules') {
    if (!incluirDecisionRules) return false
    return await evaluarReglaDecision(regla, valoresPorNombre, nombreCampo)
  }

  return evaluarReglaSimpleIndividual(regla, valoresPorNombre, mapaIdNombre)
}

function evaluarReglaSimpleIndividual(
  regla: ReglaLogica,
  valoresPorNombre: RegistroDatos,
  mapaIdNombre: Record<string, string>
): boolean {
  const nombreDependencia = mapaIdNombre[regla.campoCondicionId]
  const valor = nombreDependencia ? valoresPorNombre[nombreDependencia] : undefined
  return evaluarCondicion(regla, valor)
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

  let estado = obtenerEstadoBaseCampo(campo)

  const reglasSimples = (campo.logica ?? []).filter(r => r.tipo !== 'decisionrules')

  for (const regla of reglasSimples) {
    const cumple = evaluarReglaSimpleIndividual(regla, valoresPorNombre, mapaIdNombre)
    if (cumple) {
      estado = aplicarAccionRegla(regla, estado)
    }
  }

  return estado
}

async function evaluarReglaDecision(
  regla: ReglaLogica,
  valoresPorNombre: RegistroDatos,
  nombreCampoActual?: string
): Promise<boolean> {
  console.log('🔵 [DecisionRules] Evaluando regla:', regla.id)

  if (!validarServicioDecisionRules()) return false
  if (!validarConfiguracionRegla(regla)) return false

  const esAccionEstablecerValor = regla.accion === 'establecer-valor'

  if (manejarCamposEntradaVacios(regla, valoresPorNombre, nombreCampoActual, esAccionEstablecerValor)) {
    return false
  }

  try {
    const response = await ejecutarReglaDecisionRules(regla, valoresPorNombre)
    if (!response) return false

    return procesarRespuestaDecisionRules(regla, response, valoresPorNombre, nombreCampoActual, esAccionEstablecerValor)
  } catch (error) {
    console.error('❌ [DecisionRules] Error al evaluar regla:', error)
    return false
  }
}

function validarServicioDecisionRules(): boolean {
  if (!servicioDecisionRules?.estaInicializado()) {
    console.warn('⚠️ [DecisionRules] ServicioDecisionRules no está configurado')
    return false
  }
  return true
}

function validarConfiguracionRegla(regla: ReglaLogica): boolean {
  if (!regla.decisionRulesId?.trim()) {
    console.log('⏭️ [DecisionRules] Saltando regla - ID no configurado')
    return false
  }

  if (!regla.decisionRulesVersion || regla.decisionRulesVersion < 1) {
    console.log('⏭️ [DecisionRules] Saltando regla - Versión no configurada')
    return false
  }

  const esAccionEstablecerValor = regla.accion === 'establecer-valor'
  if (!esAccionEstablecerValor && !regla.condicionResultado?.trim()) {
    console.log('⏭️ [DecisionRules] Saltando regla - Sin condición de resultado (requerida para acciones mostrar/ocultar/requerir/opcional)')
    return false
  }

  return true
}

function manejarCamposEntradaVacios(
  regla: ReglaLogica,
  valoresPorNombre: RegistroDatos,
  nombreCampoActual?: string,
  esAccionEstablecerValor: boolean = false
): boolean {
  const algunCampoEntradaVacio = (regla.camposEntrada ?? []).some(campoEntrada => {
    const valor = valoresPorNombre[campoEntrada.nombreCampo]
    return valor === null || valor === undefined || valor === ''
  })

  if (algunCampoEntradaVacio && esAccionEstablecerValor) {
    console.log('🧹 [DecisionRules] Campo(s) de entrada vacío(s) - Limpiando campos de salida')
    limpiarCamposSalida(regla, valoresPorNombre, nombreCampoActual)
    return true
  }

  return false
}

function limpiarCamposSalida(
  regla: ReglaLogica,
  valoresPorNombre: RegistroDatos,
  nombreCampoActual?: string
): void {
  if (regla.camposAsignar?.length) {
    for (const asignacion of regla.camposAsignar) {
      console.log(`   🧹 Limpiando: ${asignacion.nombreCampo}`)
      valoresPorNombre[asignacion.nombreCampo] = undefined
    }
  } else if (nombreCampoActual) {
    console.log(`   🧹 Limpiando campo actual: ${nombreCampoActual}`)
    valoresPorNombre[nombreCampoActual] = undefined
  }
}

async function ejecutarReglaDecisionRules(
  regla: ReglaLogica,
  valoresPorNombre: RegistroDatos
): Promise<unknown> {
  console.log('📋 [DecisionRules] Valores disponibles:', valoresPorNombre)
  console.log('📋 [DecisionRules] Campos de entrada configurados:', regla.camposEntrada)

  const requestBody = construirRequestBody(regla, valoresPorNombre)

  console.log('📤 [DecisionRules] Request Body final:', requestBody)
  console.log('📋 [DecisionRules] Rule ID:', regla.decisionRulesId)
  console.log('📋 [DecisionRules] Version:', regla.decisionRulesVersion ?? 1)

  const response = await servicioDecisionRules!.evaluarRegla(
    {
      id: regla.id,
      ruleId: regla.decisionRulesId!,
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
  return response
}

function construirRequestBody(regla: ReglaLogica, valoresPorNombre: RegistroDatos): Record<string, unknown> {
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

  return requestBody
}

function procesarRespuestaDecisionRules(
  regla: ReglaLogica,
  response: unknown,
  valoresPorNombre: RegistroDatos,
  nombreCampoActual?: string,
  esAccionEstablecerValor: boolean = false
): boolean {
  if (esAccionEstablecerValor) {
    return procesarAccionEstablecerValor(regla, response, valoresPorNombre, nombreCampoActual)
  }

  return evaluarCondicionResultado(regla, response)
}

function procesarAccionEstablecerValor(
  regla: ReglaLogica,
  response: unknown,
  valoresPorNombre: RegistroDatos,
  nombreCampoActual?: string
): boolean {
  if (regla.camposAsignar?.length) {
    console.log('📝 [DecisionRules] Aplicando asignaciones configuradas...')
    aplicarAsignacionesValores(regla, response, valoresPorNombre)
  } else if (nombreCampoActual) {
    aplicarAsignacionAutomatica(regla, response, valoresPorNombre, nombreCampoActual)
  }
  return true
}

function aplicarAsignacionAutomatica(
  regla: ReglaLogica,
  response: unknown,
  valoresPorNombre: RegistroDatos,
  nombreCampoActual: string
): void {
  console.log('📝 [DecisionRules] Asignación automática al campo actual:', nombreCampoActual)
  try {
    if (regla.condicionResultado?.trim()) {
      const fn = new Function('result', `return (${regla.condicionResultado})`) as (result: unknown) => unknown
      const valor = fn(response)
      console.log(`   📝 Asignando (con condición): ${nombreCampoActual} = ${JSON.stringify(valor)}`)
      valoresPorNombre[nombreCampoActual] = valor as ValorDato
    } else {
      console.log(`   📝 Asignando (sin condición): ${nombreCampoActual} = ${JSON.stringify(response)}`)
      valoresPorNombre[nombreCampoActual] = response as ValorDato
    }
  } catch (error) {
    console.error('❌ Error al asignar valor automático:', error)
  }
}

function evaluarCondicionResultado(regla: ReglaLogica, response: unknown): boolean {
  if (!regla.condicionResultado) return true

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
      return Array.isArray(valor) ? valor.includes(regla.valor) : convertirATexto(valor).includes(convertirATexto(regla.valor))
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
