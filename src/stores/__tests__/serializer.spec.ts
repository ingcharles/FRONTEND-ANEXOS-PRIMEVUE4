import { describe, it, expect } from 'vitest'
import { deserializarFormulario, serializarFormulario } from '../../utils/serializer'
import type { FormSchema } from '../../types/form-schema'

describe('serializer', () => {
  it('Deberia serializar y deserializar (roundtrip)', () => {
    const base: FormSchema = {
      id: 'form_1',
      name: 'Demo',
      pages: [
        { id: 'page_1', title: 'Página', fields: [ { id: 'f1', type: 'text', name: 'a', label: 'A' } ] }
      ],
      settings: { gridSnap: true, columns: 12 }
    }
    const json = serializarFormulario(base)
    const back = deserializarFormulario(json)
    expect(back).toEqual(base)
  })
})
