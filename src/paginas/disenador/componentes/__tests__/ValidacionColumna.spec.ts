import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import VistaPrevia from '../VistaPrevia.vue'
import { useAlmacenDisenador } from '../../../../almacenes/UsarAlmacenDisenador'

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
        {
          nombre: 'n',
          etiqueta: 'N',
          tipo: 'number',
          requerido: true,
          min: 1,
          max: 10,
          mensajeMin: '>=1',
          mensajeMax: '<=10'
        },
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
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Debería fallar al enviar si n fuera de rango', async () => {
    const almacen = useAlmacenDisenador()
    almacen.esquemaFormulario.paginas = [crearPagina()]
    
    const wrapper = mount(VistaPrevia as unknown as object)
    await wrapper.vm.$nextTick()

    const pageId = almacen.esquemaFormulario.paginas[0].id
    
    // Configurar un valor inválido en la tabla
    almacen.actualizarValorCampo(pageId, 'tablaVal', [{ n: 15 }]) // 15 está fuera del rango 1-10

    await wrapper.vm.$nextTick()

    // Forzar envío del formulario
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    
    await wrapper.vm.$nextTick()
    
    // Esperamos que aparezca error con la clase correcta
    const errorEls = wrapper.findAll('.text-red-500')
    expect(errorEls.length).toBeGreaterThan(0)
  })
})

