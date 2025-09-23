// Tipos comunes reutilizables para datos dinámicos (sin usar any/unknown)

// Un valor de datos permitido en el formulario (primitivos, fecha, null, arreglos y objetos recursivos)
export type ValorDato = string | number | boolean | Date | null | ValorDato[] | { [clave: string]: ValorDato }

// Registro de valores por nombre de campo
export type RegistroDatos = Record<string, ValorDato>
// Tipos básicos comunes utilizados en todo el sistema

export type PuntoDeCorte = 'sm' | 'md' | 'lg'

export type EstadoCampo = 'inicial' | 'modificado' | 'validando' | 'valido' | 'invalido'

// Tipos de utilidad
export type ParcialProfundo<T> = {
  [K in keyof T]?: T[K] extends object ? ParcialProfundo<T[K]> : T[K]
}

export type CampoRequerido<T, K extends keyof T> = T & Required<Pick<T, K>>
