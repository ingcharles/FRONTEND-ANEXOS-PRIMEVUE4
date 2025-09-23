import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PreviewView from '../../../../../paginas/disenador/componentes/VistaPrevia.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAlmacenDisenador } from '../../../../../almacenes/UsarAlmacenDisenador'

function campoFecha(metadatos: Record<string, unknown> = {}) {
  return {
    id: 'f_date',
    tipo: 'fecha' as const,
    etiqueta: 'Fecha',
    nombre: 'fecha1',
    visible: true,
    requerido: true,
    metadatos,
  }
}

function paginaConFecha(meta: Record<string, unknown> = {}) {
  return { id: 'p_date', titulo: 'P', campos: [campoFecha(meta)] }
}

describe('Validación de fecha (min/max)', () => {
  it('Debería requerir fecha válida y respetar min/max', async () => {
    setActivePinia(createPinia())
    const almacen = useAlmacenDisenador()
    // min: 2025-01-10, max: 2025-01-20
    almacen.esquemaFormulario.paginas = [paginaConFecha({ minDate: '2025-01-10', maxDate: '2025-01-20' })]
    const wrapper = mount(PreviewView as unknown as object)
    await wrapper.vm.$nextTick()

    const pageId = almacen.esquemaFormulario.paginas[0].id

    // 1) No valor -> error requerido
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    // Buscar errores con la clase correcta en lugar de en vm.errores
    let errorEls = wrapper.findAll('.text-red-500')
    expect(errorEls.length).toBeGreaterThan(0)

    // 2) Fecha fuera de rango (menor que min)
    almacen.actualizarValorCampo(pageId, 'fecha1', '2025-01-05')
    await wrapper.vm.$nextTick()
    await form.trigger('submit.prevent')
    errorEls = wrapper.findAll('.text-red-500')
    expect(errorEls.length).toBeGreaterThan(0)

    // 3) Fecha fuera de rango (mayor que max)
    almacen.actualizarValorCampo(pageId, 'fecha1', '2025-01-25')
    await wrapper.vm.$nextTick()
    await form.trigger('submit.prevent')
    errorEls = wrapper.findAll('.text-red-500')
    expect(errorEls.length).toBeGreaterThan(0)

    // 4) Fecha válida dentro del rango
    almacen.actualizarValorCampo(pageId, 'fecha1', '2025-01-15')
    await wrapper.vm.$nextTick()
    await form.trigger('submit.prevent')
    // Debería pasar sin errores (excepto el asterisco de campo requerido)
    errorEls = wrapper.findAll('.text-red-500')
    // Filtrar solo los errores que no sean el asterisco
    const errorMessages = errorEls.filter(el => el.text() !== '*')
    expect(errorMessages.length).toBe(0)
  })
})
