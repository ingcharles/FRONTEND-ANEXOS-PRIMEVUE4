// Interfaces para integración con DecisionRules.io

export interface ConfiguracionDecisionRules {
  apiKey: string
  urlBase?: string
}

export interface ReglaDecision {
  id: string
  ruleId: string // ID de la regla en DecisionRules.io
  nombre: string
  descripcion?: string
  version?: number
  activa: boolean
  camposEntrada: CampoEntradaRegla[]
  accionesResultado: AccionResultadoRegla[]
}

export interface CampoEntradaRegla {
  nombreCampo: string // Nombre del campo en el formulario
  claveDecisionRules: string // Clave esperada por DecisionRules
  transformacion?: 'ninguna' | 'numero' | 'texto' | 'booleano' | 'fecha'
}

export interface AccionResultadoRegla {
  condicionResultado: string // Expresión para evaluar el resultado (ej: "result.action === 'show'")
  campoObjetivo: string // ID del campo a afectar
  accion: 'mostrar' | 'ocultar' | 'requerir' | 'opcional' | 'establecer-valor'
  valorEstablecer?: unknown // Valor a establecer si la acción es 'establecer-valor'
}

export interface ResultadoDecisionRules {
  [key: string]: unknown
}
