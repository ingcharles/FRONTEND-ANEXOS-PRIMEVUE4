// Interfaces para validación y lógica de campos

export interface ReglaValidacion {
  tipo: 'requerido' | 'longitud-minima' | 'longitud-maxima' | 'valor-minimo' | 'valor-maximo' | 'patron' | 'personalizada'
  valor?: string | number | boolean | Date
  mensaje?: string
}

export interface ReglaLogica {
  id: string
  tipo?: 'simple' | 'decisionrules' // Tipo de regla
  campoCondicionId: string
  operador: 'igual' | 'diferente' | 'contiene' | 'mayor-que' | 'menor-que' | 'personalizado'
  valor: string | number | boolean | Date
  accion: 'mostrar' | 'ocultar' | 'requerir' | 'opcional' | 'establecer-valor'
  expresion?: string
  // Propiedades para DecisionRules
  decisionRulesId?: string // ID de la regla en DecisionRules.io
  decisionRulesVersion?: number
  camposEntrada?: Array<{ nombreCampo: string; claveDecisionRules: string }>
  condicionResultado?: string // Expresión para evaluar el resultado
  // Propiedades para acción "establecer-valor"
  camposAsignar?: Array<{ nombreCampo: string; expresionValor: string }> // Mapeo de campos a asignar
}
