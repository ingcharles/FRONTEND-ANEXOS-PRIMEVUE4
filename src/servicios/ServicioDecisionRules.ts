import DecisionRules from '@decisionrules/decisionrules'
import type {
  ConfiguracionDecisionRules,
  ReglaDecision,
  ResultadoDecisionRules,
} from '@/interfaces/DecisionRules'
import type { RegistroDatos } from '@/tipos/Comunes'

export class ServicioDecisionRules {
  private cliente: unknown = null

  constructor(configuracion?: ConfiguracionDecisionRules) {
    if (configuracion) {
      this.inicializar(configuracion)
    }
  }

  inicializar(configuracion: ConfiguracionDecisionRules): void {
    const opciones: unknown = {
      solverKey: configuracion.apiKey
    }
    if (configuracion.urlBase) {
      opciones.host = configuracion.urlBase
    }
    this.cliente = new DecisionRules(opciones)
  }

  estaInicializado(): boolean {
    return this.cliente !== null
  }

  async evaluarRegla(
    regla: ReglaDecision,
    valoresFormulario: RegistroDatos
  ): Promise<ResultadoDecisionRules | null> {
    if (!this.cliente) {
      console.error('❌ [ServicioDecisionRules] Cliente no está inicializado')
      return null
    }

    try {
      // Construir el cuerpo de la solicitud
      const requestBody = this.construirCuerpoSolicitud(regla, valoresFormulario)

      console.log('🚀 [ServicioDecisionRules] Llamando a DecisionRules API')
      console.log('   Rule ID:', regla.ruleId)
      console.log('   Version:', regla.version ?? 1)
      console.log('   Request Body:', requestBody)

      // Llamar a la regla
      const version = String(regla.version ?? 1)
      const response = await this.cliente.solve(regla.ruleId, requestBody, version)

      console.log('✅ [ServicioDecisionRules] Respuesta recibida:', response)

      return response as ResultadoDecisionRules
    } catch (error: unknown) {
      console.error('❌ [ServicioDecisionRules] Error al evaluar regla:', error)
      console.error('   Regla:', regla.nombre)
      console.error('   Rule ID:', regla.ruleId)
      console.error('   Error details:', error.message || error)
      return null
    }
  }

  private construirCuerpoSolicitud(
    regla: ReglaDecision,
    valoresFormulario: RegistroDatos
  ): Record<string, unknown> {
    const cuerpo: Record<string, unknown> = {}

    for (const campoEntrada of regla.camposEntrada) {
      const valor = valoresFormulario[campoEntrada.nombreCampo]
      const valorTransformado = this.transformarValor(valor, campoEntrada.transformacion)
      // Si claveDecisionRules está vacía, usar el nombreCampo como clave
      const clave = campoEntrada.claveDecisionRules || campoEntrada.nombreCampo
      cuerpo[clave] = valorTransformado
    }

    return cuerpo
  }

  private transformarValor(
    valor: unknown,
    transformacion?: 'ninguna' | 'numero' | 'texto' | 'booleano' | 'fecha'
  ): unknown {
    if (valor === null || valor === undefined) return null

    switch (transformacion) {
      case 'numero':
        return Number(valor)
      case 'texto':
        return String(valor)
      case 'booleano':
        return Boolean(valor)
      case 'fecha':
        return valor instanceof Date ? valor.toISOString() : String(valor)
      case 'ninguna':
      default:
        return valor
    }
  }

  async evaluarMultiplesReglas(
    reglas: ReglaDecision[],
    valoresFormulario: RegistroDatos
  ): Promise<Map<string, ResultadoDecisionRules | null>> {
    const resultados = new Map<string, ResultadoDecisionRules | null>()

    // Evaluar solo reglas activas
    const reglasActivas = reglas.filter((r) => r.activa)

    for (const regla of reglasActivas) {
      const resultado = await this.evaluarRegla(regla, valoresFormulario)
      resultados.set(regla.id, resultado)
    }

    return resultados
  }
}
