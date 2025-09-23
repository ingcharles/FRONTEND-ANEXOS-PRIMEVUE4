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
  return { id: 'p_date', title: 'P', fields: [campoFecha(meta)] }
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
    const vals = almacen.obtenerValoresPagina(pageId) as Record<string, unknown>

    // 1) No valor -> error requerido
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    const vm = wrapper.vm as unknown as { errores: Record<string, string> }
    expect(Object.keys(vm.errores || {}).length).toBeGreaterThan(0)

    // 2) Fecha fuera de rango (menor que min)
    vals['fecha1'] = '2025-01-05'
    await wrapper.vm.$nextTick()
    await form.trigger('submit.prevent')
    expect(Object.keys(vm.errores || {}).length).toBeGreaterThan(0)

    // 3) Fecha fuera de rango (mayor que max)
    vals['fecha1'] = '2025-01-25'
    await wrapper.vm.$nextTick()
    await form.trigger('submit.prevent')
    expect(Object.keys(vm.errores || {}).length).toBeGreaterThan(0)

    // 4) Fecha válida dentro del rango
    vals['fecha1'] = '2025-01-15'
    await wrapper.vm.$nextTick()
    await form.trigger('submit.prevent')
    // Debería pasar sin errores
    expect(Object.keys(vm.errores || {}).length).toBe(0)
  })
})
