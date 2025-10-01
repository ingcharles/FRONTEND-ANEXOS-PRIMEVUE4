import type { EsquemaCampo } from '@/interfaces/Campos'
import type { ReglaLogica } from '@/interfaces/Validacion'
import type { RegistroDatos, ValorDato } from '@/tipos/Comunes'

export interface EstadoEfectivoCampo {
  visible: boolean
  requerido: boolean
}



// Versión nueva con esquema español (EsquemaCampo)
export function evaluarReglasCampo(
  campo: EsquemaCampo,
  valoresPorNombre: RegistroDatos,
  mapaIdNombre: Record<string, string>
): EstadoEfectivoCampo {
  // Guard: verificar que el campo existe
  if (!campo) {
    return { visible: true, requerido: false }
  }

  let visible = campo.visible !== false
  let requerido = !!campo.requerido

  for (const r of campo.logica ?? []) {
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

  return { visible, requerido }
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

