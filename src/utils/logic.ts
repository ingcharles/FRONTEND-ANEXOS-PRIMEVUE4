import type { FieldSchema, LogicRule } from '@/types/form-schema'

export interface EstadoEfectivoCampo {
  visible: boolean
  required: boolean
}

export function EvaluarReglasCampo(
  campo: FieldSchema,
  valoresPorNombre: Record<string, unknown>,
  idAName: Record<string, string>
): EstadoEfectivoCampo {
  let visible = campo.visible !== false
  let required = !!campo.required

  for (const r of campo.logic ?? []) {
    const nombreDependencia = idAName[r.whenFieldId]
    const valor = nombreDependencia ? valoresPorNombre[nombreDependencia] : undefined
    const cumple = evaluarCondicion(r, valor)
    if (cumple) {
      if (r.action === 'show') visible = true
      if (r.action === 'hide') visible = false
      if (r.action === 'require') required = true
      if (r.action === 'optional') required = false
    }
  }

  return { visible, required }
}

function evaluarCondicion(regla: LogicRule, valor: unknown): boolean {
  switch (regla.operator) {
    case 'equals':
      return valor === regla.value
    case 'not_equals':
      return valor !== regla.value
    case 'contains':
      return Array.isArray(valor) ? valor.includes(regla.value) : String(valor ?? '').includes(String(regla.value ?? ''))
    case 'gt':
      return Number(valor) > Number(regla.value)
    case 'lt':
      return Number(valor) < Number(regla.value)
    case 'custom':
      if (!regla.expression) return false
      try {
        const fn = new Function('valor', `return (${regla.expression})`) as (valor: unknown) => boolean
        return !!fn(valor)
      } catch {
        return false
      }
    default:
      return false
  }
}
