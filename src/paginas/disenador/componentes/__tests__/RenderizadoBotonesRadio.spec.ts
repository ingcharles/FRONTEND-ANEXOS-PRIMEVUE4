import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import RenderizadorCampo from '../RenderizadorCampo.vue'
import type { EsquemaCampo } from '../../../../tipos/EsquemaFormulario'

describe('Renderizado de Radio Button', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Debería renderizar radio buttons con opciones', () => {
    const campoRadio: EsquemaCampo = {
      id: 'radio1',
      tipo: 'radio',
      nombre: 'genero',
      etiqueta: 'Género',
      metadatos: {
        opciones: [
          { etiqueta: 'Masculino', valor: 'M' },
          { etiqueta: 'Femenino', valor: 'F' },
          { etiqueta: 'Otro', valor: 'O' }
        ]
      }
    }

    const valores = { genero: null }
    const idAName = { radio1: 'genero' }

    const wrapper = mount(RenderizadorCampo, {
      props: {
        campo: campoRadio,
        valoresCampos: valores,
        mapaIdNombre: idAName
      }
    })

    // Verificar que se renderizan los radio buttons
    const radioButtons = wrapper.findAll('input[type="radio"]')
    expect(radioButtons).toHaveLength(3)

    // Verificar las etiquetas
    expect(wrapper.text()).toContain('Masculino')
    expect(wrapper.text()).toContain('Femenino')
    expect(wrapper.text()).toContain('Otro')
  })

  it('Debería seleccionar un valor cuando se hace clic', async () => {
    const campoRadio: EsquemaCampo = {
      id: 'radio1',
      tipo: 'radio',
      nombre: 'color',
      etiqueta: 'Color',
      metadatos: {
        opciones: [
          { etiqueta: 'Rojo', valor: 'rojo' },
          { etiqueta: 'Azul', valor: 'azul' }
        ]
      }
    }

    const valores = { color: null }
    const idAName = { radio1: 'color' }

    const wrapper = mount(RenderizadorCampo, {
      props: {
        campo: campoRadio,
        valoresCampos: valores,
        mapaIdNombre: idAName
      }
    })

    // Seleccionar el segundo radio button
    const radioButtons = wrapper.findAll('input[type="radio"]')
    await radioButtons[1].setValue(true)

    expect(valores.color).toBe('azul')
  })

  it('Debería mostrar layout horizontal cuando se especifica', () => {
    const campoRadio: EsquemaCampo = {
      id: 'radio1',
      tipo: 'radio',
      nombre: 'tamaño',
      etiqueta: 'Tamaño',
      metadatos: {
        layout: 'horizontal',
        opciones: [
          { etiqueta: 'Pequeño', valor: 'S' },
          { etiqueta: 'Mediano', valor: 'M' },
          { etiqueta: 'Grande', valor: 'L' }
        ]
      }
    }

    const valores = { tamaño: null }
    const idAName = { radio1: 'tamaño' }

    const wrapper = mount(RenderizadorCampo, {
      props: {
        campo: campoRadio,
        valoresCampos: valores,
        mapaIdNombre: idAName
      }
    })

    // Verificar que tiene las clases de layout horizontal
    const container = wrapper.find('.flex')
    expect(container.classes()).toContain('flex-row')
  })
})
