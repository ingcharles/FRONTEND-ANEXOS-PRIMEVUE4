import { zFormSchema, type FormSchema } from '@/types/form-schema'

export function serializarFormulario(schema: FormSchema): string {
  return JSON.stringify(schema, null, 2)
}

export function deserializarFormulario(json: string): FormSchema {
  const data = JSON.parse(json)
  const parseado = zFormSchema.safeParse(data)
  if (!parseado.success) {
    const mensaje = parseado.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`JSON inválido para FormSchema:\n${mensaje}`)
  }
  return parseado.data
}

export function descargarJson(nombre: string, contenido: string): void {
  const blob = new Blob([contenido], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
