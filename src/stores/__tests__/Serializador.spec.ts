import { describe, it, expect } from 'vitest'
import { deserializarFormulario, serializarFormulario } from '../../utilidades/serializador'
import type { EsquemaFormulario } from '../../interfaces/Formulario'

describe('serializer', () => {
  it('Deberia serializar y deserializar (roundtrip)', () => {
    const base: EsquemaFormulario = {
      id: 'form_1',
      nombre: 'Demo',
      paginas: [
        { id: 'page_1', titulo: 'Página', campos: [ { id: 'f1', tipo: 'texto', nombre: 'a', etiqueta: 'A' } ] }
      ],
      configuracion: { ajusteGrid: true, columnas: 12 }
    }
    const json = serializarFormulario(base)
    const back = deserializarFormulario(json)
    expect(back).toEqual(base)
  })
})
