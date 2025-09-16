import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PreviewView from '../PreviewView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useDesignerStore } from '../../../../../stores/useDesignerStore'

function campoFecha(meta: Record<string, unknown> = {}) {
  return {
    id: 'f_date',
    type: 'date' as const,
    label: 'Fecha',
    name: 'fecha1',
    visible: true,
    required: true,
    meta,
  }
}

function paginaConFecha(meta: Record<string, unknown> = {}) {
  return { id: 'p_date', title: 'P', fields: [campoFecha(meta)] }
}

describe('Validación de fecha (min/max)', () => {
  it('Deveria requerir fecha válida y respetar min/max', async () => {
    setActivePinia(createPinia())
    const store = useDesignerStore()
    // min: 2025-01-10, max: 2025-01-20
    store.formSchema.pages = [paginaConFecha({ minDate: '2025-01-10', maxDate: '2025-01-20' })]
    const wrapper = mount(PreviewView as unknown as object)
    await wrapper.vm.$nextTick()

    const pageId = store.formSchema.pages[0].id
    const vals = store.obtenerValoresPagina(pageId) as Record<string, unknown>

    // 1) No valor -> error requerido
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    const vm = wrapper.vm as unknown as { errores: Record<string, string> }
    expect(Object.keys(vm.errores || {}).length).toBeGreaterThan(0)

    // 2) Fecha menor al min -> error
    ;(vals['fecha1'] as unknown) = '2025-01-05'
    await wrapper.vm.$nextTick()
    await form.trigger('submit.prevent')
    expect(Object.values(vm.errores || {}).some(m => /posterior/.test(m))).toBe(true)

    // 3) Fecha mayor al max -> error
    ;(vals['fecha1'] as unknown) = '2025-01-25'
    await wrapper.vm.$nextTick()
    await form.trigger('submit.prevent')
    expect(Object.values(vm.errores || {}).some(m => /anterior/.test(m))).toBe(true)

    // 4) Fecha dentro de rango -> sin errores
    ;(vals['fecha1'] as unknown) = '2025-01-15'
    await wrapper.vm.$nextTick()
    await form.trigger('submit.prevent')
    expect(Object.keys(vm.errores || {}).length).toBe(0)
  })
})
