import { shallowMount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import DesignerView from '../DesignerView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useDesignerStore } from '../../stores/useDesignerStore'
import type { FieldSchema } from '../../types/form-schema'
import { nextTick } from 'vue'

describe('Diseñador - navegación entre páginas', () => {
  it('Deberia mostrar página 2 vacía tras añadir y navegar, manteniendo independiente la página 1', async () => {
    setActivePinia(createPinia())
    shallowMount(DesignerView, {
      global: {
        stubs: {
          PalettePanel: true,
          PropertiesTabs: true,
          PreviewView: true,
          JsonView: true,
        },
      },
    })

    // Página 1: agregar un campo simulando un drop en el canvas
    // Simplificamos: llamamos directamente a la store para añadir un campo
  const s = useDesignerStore()
  const campo: FieldSchema = { id: 'f1', type: 'text', name: 'campo1', label: 'Campo 1', grid: { sm: 12 } }
  s.agregarCampo(campo)
  expect(s.formSchema.pages[0].fields.length).toBe(1)

  // Añadir página sin moverse a ella (replicar crearPaginaDespuesActual)
  const idx = s.activePageIndex
  s.agregarPagina()
  s.activePageIndex = idx
  await nextTick()
    expect(s.formSchema.pages.length).toBe(2)
    // Debe seguir en página 1
    expect(s.activePageIndex).toBe(0)

    // Pulsar Siguiente
  // Pulsar Siguiente (simular cambiando el índice)
  s.activePageIndex = 1
  await nextTick()
    expect(s.activePageIndex).toBe(1)

    // Página 2 debería estar vacía
    expect(s.formSchema.pages[1].fields.length).toBe(0)

    // Volver a Página 1 y verificar que conserva su campo
  // Volver a Página 1
  s.activePageIndex = 0
  await nextTick()
    expect(s.activePageIndex).toBe(0)
    expect(s.formSchema.pages[0].fields.length).toBe(1)

    // Volver a Página 2 y sigue vacía
    s.activePageIndex = 1
    await nextTick()
    expect(s.activePageIndex).toBe(1)
    expect(s.formSchema.pages[1].fields.length).toBe(0)
  })
})
