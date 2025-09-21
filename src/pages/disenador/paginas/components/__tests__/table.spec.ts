import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PreviewView from '../PreviewView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useDesignerStore } from '../../../../../stores/useDesignerStore'

function crearCampoTabla() {
  return {
    id: 'field_1',
    type: 'table' as const,
    label: 'Tabla',
    name: 'tabla1',
    visible: true,
    required: false,
    meta: {
      columns: [
        { name: 'c1', label: 'C1', type: 'text', agg: 'count' },
        { name: 'c2', label: 'C2', type: 'number', agg: 'sum' },
      ],
      rows: 2,
      addRows: true,
      showSummary: true,
      summaryLabel: 'Total',
    },
  }
}

function crearPaginaConTabla() {
  return {
    id: 'page_1',
    title: 'Página 1',
    fields: [crearCampoTabla()],
  }
}

describe('Tabla en Preview', () => {
  it('Debería inicializar filas según meta.rows cuando está vacío', async () => {
    setActivePinia(createPinia())
    const store = useDesignerStore()
    store.formSchema.pages = [crearPaginaConTabla()]
    const wrapper = mount(PreviewView as unknown as object, { global: { stubs: { alert: false } } })
    await wrapper.vm.$nextTick()

    const pageId = store.formSchema.pages[0].id
    const valores = store.obtenerValoresPagina(pageId)
    const tabla = (valores as Record<string, unknown>)['tabla1'] as unknown[]
    expect(Array.isArray(tabla)).toBe(true)
    expect(tabla.length).toBe(2)
  })

  it('Debería añadir una fila al pulsar "Añadir fila"', async () => {
    setActivePinia(createPinia())
    const store = useDesignerStore()
    store.formSchema.pages = [crearPaginaConTabla()]
    const wrapper = mount(PreviewView as unknown as object)
    await wrapper.vm.$nextTick()

    // Click en botón de añadir fila
  const botones = wrapper.findAll('button')
  const add = botones.find(b => b.text().includes('Añadir fila'))
  expect(!!add).toBe(true)
  if (add) await add.trigger('click')

    const pageId = store.formSchema.pages[0].id
    const valores = store.obtenerValoresPagina(pageId) as Record<string, unknown>
    const tabla = valores['tabla1'] as unknown[]
    expect(tabla.length).toBe(3)
  })

  it('Debería calcular agregados (count y sum) en el pie', async () => {
    setActivePinia(createPinia())
  const store = useDesignerStore()
  store.formSchema.pages = [crearPaginaConTabla()]
  const wrapper = mount(PreviewView as unknown as object)
    await wrapper.vm.$nextTick()

  const pageId = store.formSchema.pages[0].id
  const valores = store.obtenerValoresPagina(pageId) as Record<string, unknown>
  const tabla = valores['tabla1'] as Array<Record<string, unknown>>
  tabla[0]['c1'] = 'a'
  tabla[1]['c1'] = ''
  tabla[0]['c2'] = 10
  tabla[1]['c2'] = 5
    await wrapper.vm.$nextTick()

    const tfootCells = wrapper.findAll('tfoot td')
    expect(tfootCells.length).toBeGreaterThan(0)
    // Primera celda: etiqueta del resumen
    expect(tfootCells[0].text()).toContain('Total')
    // Segunda celda: count de c1 (1 no vacío)
    // Tercera celda: sum de c2 (15)
    const textos = tfootCells.map(c => c.text())
    expect(textos.join(' ')).toMatch(/1/) // count
    expect(textos.join(' ')).toMatch(/15/) // sum
  })
})
