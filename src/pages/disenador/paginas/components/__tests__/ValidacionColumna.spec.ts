import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import VistaPrevia from '../../../../../paginas/disenador/componentes/VistaPrevia.vue'
import { useAlmacenDisenador } from '../../../../../almacenes/UsarAlmacenDisenador'

function crearCampoTablaValidaciones() {
  return {
    id: 'field_v',
    tipo: 'tabla' as const,
    etiqueta: 'Tabla',
    nombre: 'tablaVal',
    visible: true,
    requerido: false,
    metadatos: {
      columnas: [
        { nombre: 'n', etiqueta: 'N', tipo: 'number', requerido: true, min: 1, max: 10, mensajeMin: '>=1', mensajeMax: '<=10' },
      ],
      filas: 1,
      agregarFilas: false,
      mostrarResumen: false,
    },
  }
}

function crearPagina() {
  return { id: 'page_v', titulo: 'V', campos: [crearCampoTablaValidaciones()] }
}

describe('Validación por columna en tabla', () => {
  it('Debería fallar al enviar si n fuera de rango', async () => {
    setActivePinia(createPinia())
    const almacen = useAlmacenDisenador()
    if (!almacen.formSchema) {
      almacen.formSchema = { pages: [] }
    }
    almacen.esquemaFormulario.paginas = [crearPagina()]
    const wrapper = mount(VistaPrevia as unknown as object)
    await wrapper.vm.$nextTick()

    const pageId = almacen.esquemaFormulario.paginas[0].id
    const vals = almacen.obtenerValoresPagina(pageId) as Record<string, unknown>
    ;(vals['tablaVal'] as Array<Record<string, unknown>>)[0]['n'] = 99 as unknown as number
    await wrapper.vm.$nextTick()

    // Forzar envío
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    // Esperamos que aparezca error con la clase correcta
    const errorEls = wrapper.findAll('.color-rojo')
    expect(errorEls.length).toBeGreaterThan(0)
  })
})
