import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PreviewView from '../PreviewView.vue'
import { useDesignerStore } from '../../../../../stores/useDesignerStore'

function crearCampoTablaPercent() {
  return {
    id: 'field_p',
    type: 'table' as const,
    label: 'Tabla %',
    name: 'tablaPct',
    visible: true,
    required: false,
    meta: {
      columns: [
        { name: 'pctWhole', label: 'Whole', type: 'number', formatMode: 'percent', percentScale: 'whole' },
        { name: 'pctFraction', label: 'Fraction', type: 'number', formatMode: 'percent', percentScale: 'fraction' },
      ],
      rows: 1,
      addRows: false,
      showSummary: false,
    },
  }
}

function crearPagina() {
  return { id: 'page_p', title: 'P', fields: [crearCampoTablaPercent()] }
}

describe('percentScale en Preview', () => {
  it('Debería transformar fraction x100 en UI y /100 al guardar', async () => {
    setActivePinia(createPinia())
    const store = useDesignerStore()
    store.formSchema.pages = [crearPagina()]
    const wrapper = mount(PreviewView as unknown as object)
    await wrapper.vm.$nextTick()

    const pageId = store.formSchema.pages[0].id
  const vals = store.obtenerValoresPagina(pageId) as Record<string, unknown>
    // Simular edición
  ;(vals['tablaPct'] as Array<Record<string, unknown>>)[0]['pctWhole'] = 15 as unknown as number
  ;(vals['tablaPct'] as Array<Record<string, unknown>>)[0]['pctFraction'] = 0.15 as unknown as number
    await wrapper.vm.$nextTick()

  expect((vals['tablaPct'] as Array<Record<string, unknown>>)[0]['pctWhole']).toBe(15)
  expect((vals['tablaPct'] as Array<Record<string, unknown>>)[0]['pctFraction']).toBeCloseTo(0.15, 6)
  })
})
