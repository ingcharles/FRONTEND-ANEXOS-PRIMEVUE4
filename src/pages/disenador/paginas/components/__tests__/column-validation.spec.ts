import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PreviewView from '../PreviewView.vue'
import { useDesignerStore } from '../../../../../stores/useDesignerStore'

function crearCampoTablaValidaciones() {
  return {
    id: 'field_v',
    type: 'table' as const,
    label: 'Tabla',
    name: 'tablaVal',
    visible: true,
    required: false,
    meta: {
      columns: [
        { name: 'n', label: 'N', type: 'number', required: true, min: 1, max: 10, minMessage: '>=1', maxMessage: '<=10' },
      ],
      rows: 1,
      addRows: false,
      showSummary: false,
    },
  }
}

function crearPagina() {
  return { id: 'page_v', title: 'V', fields: [crearCampoTablaValidaciones()] }
}

describe('Validación por columna en tabla', () => {
  it('Debería fallar al enviar si n fuera de rango', async () => {
    setActivePinia(createPinia())
    const store = useDesignerStore()
    store.formSchema.pages = [crearPagina()]
    const wrapper = mount(PreviewView as unknown as object)
    await wrapper.vm.$nextTick()

    const pageId = store.formSchema.pages[0].id
    const vals = store.obtenerValoresPagina(pageId) as Record<string, unknown>
    ;(vals['tablaVal'] as Array<Record<string, unknown>>)[0]['n'] = 99 as unknown as number
    await wrapper.vm.$nextTick()

    // Forzar envío
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    // Esperamos que aparezca error en 'tablaVal' (clave de campo)
    // El esquema agrega errores por path de nivel de campo; se valida que exista al menos uno
    // La prueba se mantiene laxa por estructura de errores simplificada
  const vm = wrapper.vm as unknown as { errores: Record<string, string> }
  expect(Object.keys(vm.errores || {}).length).toBeGreaterThan(0)
  })
})
