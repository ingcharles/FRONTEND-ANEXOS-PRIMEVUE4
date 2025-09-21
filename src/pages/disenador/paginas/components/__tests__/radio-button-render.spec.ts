import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import CampoRenderer from '../CampoRenderer.vue'
import type { FieldSchema } from '../../../../../types/form-schema'

describe('Renderizado de Radio Button', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Debería renderizar radio buttons con opciones', () => {
    const campoRadio: FieldSchema = {
      id: 'radio1',
      type: 'radio',
      name: 'genero',
      label: 'Género',
      meta: {
        options: [
          { label: 'Masculino', value: 'M' },
          { label: 'Femenino', value: 'F' },
          { label: 'Otro', value: 'O' }
        ]
      }
    }

    const valores = { genero: null }
    const idAName = { radio1: 'genero' }

    const wrapper = mount(CampoRenderer, {
      props: {
        field: campoRadio,
        valores,
        idAName
      }
    })

    // Verificar que se renderiza el contenedor de radio
    const radioContainer = wrapper.find('div[class*="flex"]')
    expect(radioContainer.exists()).toBe(true)

    // Verificar que se muestran las opciones radio
    const radioLabels = wrapper.findAll('.inline-flex')
    expect(radioLabels).toHaveLength(3)

    // Verificar textos de las opciones
    expect(wrapper.text()).toContain('Masculino')
    expect(wrapper.text()).toContain('Femenino')
    expect(wrapper.text()).toContain('Otro')

    // Verificar que tiene el label del campo
    expect(wrapper.text()).toContain('Género')
  })

  it('Debería actualizar el valor al seleccionar una opción', async () => {
    const campoRadio: FieldSchema = {
      id: 'radio1',
      type: 'radio',
      name: 'color',
      label: 'Color favorito',
      meta: {
        options: [
          { label: 'Azul', value: 'azul' },
          { label: 'Rojo', value: 'rojo' }
        ]
      }
    }

    const valores = { color: null }
    const idAName = { radio1: 'color' }

    const wrapper = mount(CampoRenderer, {
      props: {
        field: campoRadio,
        valores,
        idAName
      }
    })

    // Buscar los radio buttons
    const radioButtons = wrapper.findAllComponents({ name: 'RadioButton' })
    expect(radioButtons).toHaveLength(2)

    // Simular selección del primer radio button
    await radioButtons[0].vm.$emit('update:modelValue', 'azul')
    await wrapper.vm.$nextTick()

    // Verificar que el valor se actualizó
    expect(valores.color).toBe('azul')
  })

  it('Debería mostrar layout horizontal cuando se especifica', () => {
    const campoRadio: FieldSchema = {
      id: 'radio1',
      type: 'radio',
      name: 'tamaño',
      label: 'Tamaño',
      meta: {
        layout: 'horizontal',
        options: [
          { label: 'Pequeño', value: 'S' },
          { label: 'Mediano', value: 'M' },
          { label: 'Grande', value: 'L' }
        ]
      }
    }

    const valores = { tamaño: null }
    const idAName = { radio1: 'tamaño' }

    const wrapper = mount(CampoRenderer, {
      props: {
        field: campoRadio,
        valores,
        idAName
      }
    })

    // Verificar que tiene las clases de layout horizontal
    const container = wrapper.find('.flex')
    expect(container.classes()).toContain('flex-row')
    expect(container.classes()).toContain('gap-3')
  })

  it('Debería mostrar layout vertical por defecto', () => {
    const campoRadio: FieldSchema = {
      id: 'radio1',
      type: 'radio',
      name: 'plan',
      label: 'Plan',
      meta: {
        options: [
          { label: 'Básico', value: 'basico' },
          { label: 'Premium', value: 'premium' }
        ]
      }
    }

    const valores = { plan: null }
    const idAName = { radio1: 'plan' }

    const wrapper = mount(CampoRenderer, {
      props: {
        field: campoRadio,
        valores,
        idAName
      }
    })

    // Verificar que tiene las clases de layout vertical por defecto
    const container = wrapper.find('.flex')
    expect(container.classes()).toContain('flex-column')
    expect(container.classes()).toContain('gap-2')
  })

  it('Debería estar deshabilitado cuando el campo está disabled', () => {
    const campoRadio: FieldSchema = {
      id: 'radio1',
      type: 'radio',
      name: 'estado',
      label: 'Estado',
      disabled: true,
      meta: {
        options: [
          { label: 'Activo', value: 'activo' },
          { label: 'Inactivo', value: 'inactivo' }
        ]
      }
    }

    const valores = { estado: null }
    const idAName = { radio1: 'estado' }

    const wrapper = mount(CampoRenderer, {
      props: {
        field: campoRadio,
        valores,
        idAName
      }
    })

    // Verificar que los radio buttons están deshabilitados
    const radioButtons = wrapper.findAllComponents({ name: 'RadioButton' })
    radioButtons.forEach(radio => {
      expect(radio.props('disabled')).toBe(true)
    })
  })
})
