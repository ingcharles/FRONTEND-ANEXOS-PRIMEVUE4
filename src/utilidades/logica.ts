import type { EsquemaCampo } from '@/interfaces/Campos'
import type { ReglaLogica } from '@/interfaces/Validacion'
import type { RegistroDatos, ValorDato } from '@/tipos/Comunes'

export interface EstadoEfectivoCampo {
  visible: boolean
  requerido: boolean
}

// Versión compatible con esquema viejo (EsquemaCampo) - Alias para compatibilidad
// export function EvaluarReglasCampo(
//   campo: EsquemaCampo,
//   valoresPorNombre: Record<string, unknown>,
//   idAName: Record<string, string>
// ): { visible: boolean; required: boolean } {
//   const resultado = evaluarReglasCampo(campo, valoresPorNombre, idAName)
//   return { visible: resultado.visible, required: resultado.requerido }
// }

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


// function evaluarCondicionVieja(regla: any, valor: unknown): boolean {
//   const operador = regla.operador || regla.operator || ''
//   const valorRegla = regla.valor || regla.value

//   if (operador === 'igual' || operador === 'equals') {
//     return valor === valorRegla
//   }
//   if (operador === 'diferente' || operador === 'not_equals') {
//     return valor !== valorRegla
//   }
//   if (operador === 'contiene' || operador === 'contains') {
//     return Array.isArray(valor) ? valor.includes(valorRegla) : String(valor ?? '').includes(String(valorRegla ?? ''))
//   }
//   if (operador === 'mayor-que' || operador === 'gt') {
//     return Number(valor) > Number(valorRegla)
//   }
//   if (operador === 'menor-que' || operador === 'lt') {
//     return Number(valor) < Number(valorRegla)
//   }
//   if (operador === 'personalizado' || operador === 'custom') {
//     const expresion = regla.expresion || regla.expression
//     if (!expresion) return false
//     try {
//       const fn = new Function('valor', `return (${expresion})`) as (valor: unknown) => boolean
//       return !!fn(valor)
//     } catch {
//       return false
//     }
//   }
//   return false
// }
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

