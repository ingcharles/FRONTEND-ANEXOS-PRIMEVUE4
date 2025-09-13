import { mount } from '@vue/test-utils'
import PanelContainer from '../../pages/disenador/paginas/components/PanelContainer.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useDesignerStore } from '../useDesignerStore'
import type { FieldSchema } from '../../types/form-schema'

function crearCampo(id: string, type: FieldSchema['type'] = 'text', label = 'Campo'): FieldSchema {
  return { id, type, label, grid: { sm: 12, md: 6, lg: 6 } } as FieldSchema
}

function crearPanel(id: string, label = 'Panel'): FieldSchema {
  return { id, type: 'panel', label, children: [] as FieldSchema[] } as FieldSchema
}

it('Deveria seleccionar elemento hijo dentro del panel al hacer click', async () => {
  setActivePinia(createPinia())
  const store = useDesignerStore()
  const panel = crearPanel('p1')
  const hijo = crearCampo('c1')
  ;(panel.children as FieldSchema[]).push(hijo)

  const wrapper = mount(PanelContainer, {
    props: { field: panel },
    global: {
      stubs: { transition: false },
    },
  })

  // Hacer click en el FieldWrapper que envuelve al hijo
  const boton = wrapper.find('[role="button"]')
  expect(boton.exists()).toBe(true)
  await boton.trigger('click')

  expect(store.selectedFieldId).toBe('c1')
})
