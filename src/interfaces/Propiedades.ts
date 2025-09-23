import type { ReglaLogica } from "./Validacion"

// Tipos específicos para este componente TabLogica.vue
export interface PropiedadesTabLogica {
  idCampo: string
}

export interface OpcionOperador {
  etiqueta: string
  valor: ReglaLogica['operador']
}

export interface OpcionAccion {
  etiqueta: string
  valor: ReglaLogica['accion']
}
