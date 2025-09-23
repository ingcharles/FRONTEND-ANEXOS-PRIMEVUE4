// Interfaces para validación y lógica de campos

export interface ReglaValidacion {
  tipo: 'requerido' | 'longitud-minima' | 'longitud-maxima' | 'patron' | 'personalizada'
  valor?: string | number | boolean | Date
  mensaje?: string
}

export interface ReglaLogica {
  id: string
  campoCondicionId: string
  operador: 'igual' | 'diferente' | 'contiene' | 'mayor-que' | 'menor-que' | 'personalizado'
  valor: string | number | boolean | Date
  accion: 'mostrar' | 'ocultar' | 'requerir' | 'opcional'
  expresion?: string
}