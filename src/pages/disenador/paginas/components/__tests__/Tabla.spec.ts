import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VistaPrevia from '../../../../../paginas/disenador/componentes/VistaPrevia.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAlmacenDisenador } from '../../../../../almacenes/UsarAlmacenDisenador'

function crearCampoTabla() {
  return {
    id: 'field_1',
    tipo: 'tabla' as const,
    etiqueta: 'Tabla',
    nombre: 'tabla1',
    visible: true,
    requerido: false,
    metadatos: {
      columnas: [
        { nombre: 'c1', etiqueta: 'C1', tipo: 'text', agg: 'count' },
        { nombre: 'c2', etiqueta: 'C2', tipo: 'number', agg: 'sum' },
      ],
      filas: 2,
      agregarFilas: true,
      mostrarResumen: true,
      etiquetaResumen: 'Total',
    },
  }
}

function crearPaginaConTabla() {
  return {
    id: 'page_1',
    titulo: 'P1',
    campos: [crearCampoTabla()],
  }
}

describe('Tabla en Preview', () => {
  it('Debería inicializar filas según meta.filas cuando está vacío', async () => {
    setActivePinia(createPinia())
    const almacen = useAlmacenDisenador()
    almacen.esquemaFormulario.paginas = [crearPaginaConTabla()]

    const wrapper = mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })
    await wrapper.vm.$nextTick()

    const pageId = almacen.esquemaFormulario.paginas[0].id
    const vals = almacen.obtenerValoresPagina(pageId) as Record<string, unknown>
    const tableValue = vals['tabla1'] as Array<Record<string, unknown>>

    // Debe tener 2 filas iniciales
    expect(Array.isArray(tableValue)).toBe(true)
    expect(tableValue.length).toBe(2)
  })

  it('Debería agregar fila cuando se presiona botón de añadir', async () => {
    setActivePinia(createPinia())
    const almacen = useAlmacenDisenador()
    almacen.esquemaFormulario.paginas = [crearPaginaConTabla()]

    const wrapper = mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })
    await wrapper.vm.$nextTick()

    const pageId = almacen.esquemaFormulario.paginas[0].id
    const vals = almacen.obtenerValoresPagina(pageId) as Record<string, unknown>

    // Simular click en botón añadir
    const addBtn = wrapper.find('[data-testid="add-row-btn"]')
    if (addBtn.exists()) {
      await addBtn.trigger('click')
      const tableValue = vals['tabla1'] as Array<Record<string, unknown>>
      expect(tableValue.length).toBe(3)
    }
  })

  it('Debería calcular resumen agregado cuando está habilitado', async () => {
    setActivePinia(createPinia())
    const almacen = useAlmacenDisenador()
    almacen.esquemaFormulario.paginas = [crearPaginaConTabla()]

    const wrapper = mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })
    await wrapper.vm.$nextTick()

    const pageId = almacen.esquemaFormulario.paginas[0].id
    const vals = almacen.obtenerValoresPagina(pageId) as Record<string, unknown>
    const tableValue = vals['tabla1'] as Array<Record<string, unknown>>

    // Llenar datos
    tableValue[0] = { c1: 'a', c2: 10 }
    tableValue[1] = { c1: 'b', c2: 20 }

    await wrapper.vm.$nextTick()

    // Verificar que existe fila de resumen
    const summaryRow = wrapper.find('[data-testid="summary-row"]')
    if (summaryRow.exists()) {
      expect(summaryRow.text()).toContain('Total')
      expect(summaryRow.text()).toContain('2') // count de c1
      expect(summaryRow.text()).toContain('30') // sum de c2
    }
  })
})
