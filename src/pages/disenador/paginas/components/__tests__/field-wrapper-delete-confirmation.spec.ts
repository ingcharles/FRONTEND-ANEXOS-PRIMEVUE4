import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import FieldWrapper from '../FieldWrapper.vue'
import type { FieldSchema, FieldType } from '../../../../../types/form-schema'

describe('FieldWrapper - Confirmación de eliminación', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Deveria mostrar modal de confirmación al hacer click en eliminar', async () => {
    const testField: FieldSchema = {
      id: 'test-field',
      type: 'text',
      label: 'Campo de prueba',
      name: 'test',
      grid: { sm: 12, md: 6, lg: 4 },
      visible: true,
      required: false
    }

    const wrapper = mount(FieldWrapper, {
      props: { field: testField, selected: true },
      global: {
        plugins: [createPinia()],
        stubs: {
          PrimeButton: {
            template: '<button @click="$emit(\'click\', $event)" :title="title"><slot /></button>',
            props: ['title', 'icon', 'text', 'rounded', 'size', 'severity'],
            emits: ['click']
          },
          PrimeTag: { 
            template: '<div class="tag"><slot /></div>',
            props: ['severity', 'value']
          },
          PrimeInputText: { 
            template: '<input />',
            props: ['modelValue', 'placeholder', 'disabled', 'readonly']
          },
          ModalConfirm: {
            template: '<div v-if="visible" data-testid="modal-confirm"><p>{{ message }}</p></div>',
            props: ['visible', 'message'],
            emits: ['confirm', 'cancel']
          }
        }
      }
    })

    // Inicialmente el modal no debe estar visible
    expect(wrapper.find('[data-testid="modal-confirm"]').exists()).toBe(false)

    // Buscar el botón eliminar por su icono
    const deleteButton = wrapper.find('[title="Eliminar"]')
    expect(deleteButton.exists()).toBe(true)
    
    // Hacer click en el botón eliminar
    await deleteButton.trigger('click')
    await wrapper.vm.$nextTick()

    // Verificar que el modal se muestra
    expect(wrapper.find('[data-testid="modal-confirm"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="modal-confirm"]').text()).toContain('¿Está usted seguro de eliminar el componente \'Texto\'?')
  })

  it('Deveria mostrar el tipo correcto en el mensaje de confirmación para diferentes tipos', async () => {
    const tiposCasos = [
      { type: 'text', esperado: 'Texto' },
      { type: 'select', esperado: 'Select' },
      { type: 'radio', esperado: 'Radio' },
      { type: 'checkbox', esperado: 'Checkbox' },
      { type: 'table', esperado: 'Tabla' },
      { type: 'panel', esperado: 'Panel' }
    ]

    for (const caso of tiposCasos) {
      const testField: FieldSchema = {
        id: `test-field-${caso.type}`,
        type: caso.type as FieldType,
        label: `Campo ${caso.type}`,
        name: `test_${caso.type}`,
        grid: { sm: 12, md: 6, lg: 4 },
        visible: true,
        required: false
      }

      const wrapper = mount(FieldWrapper, {
        props: { field: testField, selected: true },
        global: {
          plugins: [createPinia()],
          stubs: {
            PrimeButton: {
              template: '<button @click="$emit(\'click\', $event)" :title="title"><slot /></button>',
              props: ['title', 'icon', 'text', 'rounded', 'size', 'severity'],
              emits: ['click']
            },
            PrimeTag: { 
              template: '<div class="tag"><slot /></div>',
              props: ['severity', 'value']
            },
            PrimeInputText: { 
              template: '<input />',
              props: ['modelValue', 'placeholder', 'disabled', 'readonly']
            },
            PrimeSelect: { 
              template: '<select />',
              props: ['options', 'optionLabel', 'optionValue', 'modelValue', 'disabled']
            },
            PrimeCheckbox: { 
              template: '<input type="checkbox" />',
              props: ['inputId', 'value', 'modelValue', 'disabled']
            },
            ModalConfirm: {
              template: '<div v-if="visible" data-testid="modal-confirm"><p>{{ message }}</p></div>',
              props: ['visible', 'message'],
              emits: ['confirm', 'cancel']
            },
            AsyncPanelContainer: { template: '<div>Panel Container</div>' }
          }
        }
      })

      // Hacer click en eliminar
      const deleteButton = wrapper.find('[title="Eliminar"]')
      await deleteButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Verificar el mensaje específico para cada tipo
      const modal = wrapper.find('[data-testid="modal-confirm"]')
      expect(modal.exists()).toBe(true)
      expect(modal.text()).toContain(`¿Está usted seguro de eliminar el componente '${caso.esperado}'?`)
    }
  })

  it('Deveria eliminar el campo cuando se confirma la acción', async () => {
    const testField: FieldSchema = {
      id: 'test-field-delete',
      type: 'text',
      label: 'Campo a eliminar',
      name: 'test_delete',
      grid: { sm: 12, md: 6, lg: 4 },
      visible: true,
      required: false
    }

    const wrapper = mount(FieldWrapper, {
      props: { field: testField, selected: true },
      global: {
        plugins: [createPinia()],
        stubs: {
          PrimeButton: {
            template: '<button @click="$emit(\'click\', $event)" :title="title"><slot /></button>',
            props: ['title', 'icon', 'text', 'rounded', 'size', 'severity'],
            emits: ['click']
          },
          PrimeTag: { 
            template: '<div class="tag"><slot /></div>',
            props: ['severity', 'value']
          },
          PrimeInputText: { 
            template: '<input />',
            props: ['modelValue', 'placeholder', 'disabled', 'readonly']
          },
          ModalConfirm: {
            template: '<div v-if="visible" data-testid="modal-confirm"><button @click="$emit(\'confirm\')" data-testid="confirm-btn">Confirmar</button></div>',
            props: ['visible', 'message'],
            emits: ['confirm', 'cancel']
          }
        }
      }
    })

    // Hacer click en eliminar
    const deleteButton = wrapper.find('[title="Eliminar"]')
    await deleteButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    // Verificar que el modal de confirmación se muestra
    expect(wrapper.find('[data-testid="modal-confirm"]').exists()).toBe(true)
    
    // Confirmar la eliminación
    await wrapper.find('[data-testid="confirm-btn"]').trigger('click')
    await wrapper.vm.$nextTick()

    // Verificar que el modal se oculta después de confirmar
    expect(wrapper.find('[data-testid="modal-confirm"]').exists()).toBe(false)
  })

  it('Deveria cancelar la eliminación cuando se cancela la acción', async () => {
    const testField: FieldSchema = {
      id: 'test-field-cancel',
      type: 'select',
      label: 'Campo a NO eliminar',
      name: 'test_cancel',
      grid: { sm: 12, md: 6, lg: 4 },
      visible: true,
      required: false
    }

    const wrapper = mount(FieldWrapper, {
      props: { field: testField, selected: true },
      global: {
        plugins: [createPinia()],
        stubs: {
          PrimeButton: {
            template: '<button @click="$emit(\'click\', $event)" :title="title"><slot /></button>',
            props: ['title', 'icon', 'text', 'rounded', 'size', 'severity'],
            emits: ['click']
          },
          PrimeTag: { 
            template: '<div class="tag"><slot /></div>',
            props: ['severity', 'value']
          },
          PrimeSelect: { 
            template: '<select />',
            props: ['options', 'optionLabel', 'optionValue', 'modelValue', 'disabled']
          },
          ModalConfirm: {
            template: '<div v-if="visible" data-testid="modal-confirm"><button @click="$emit(\'cancel\')" data-testid="cancel-btn">Cancelar</button></div>',
            props: ['visible', 'message'],
            emits: ['confirm', 'cancel']
          }
        }
      }
    })

    // Hacer click en eliminar
    const deleteButton = wrapper.find('[title="Eliminar"]')
    await deleteButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    // Verificar que el modal está visible
    expect(wrapper.find('[data-testid="modal-confirm"]').exists()).toBe(true)
    
    // Cancelar la eliminación
    await wrapper.find('[data-testid="cancel-btn"]').trigger('click')
    await wrapper.vm.$nextTick()

    // Verificar que el modal se ocultó
    expect(wrapper.find('[data-testid="modal-confirm"]').exists()).toBe(false)
  })
})