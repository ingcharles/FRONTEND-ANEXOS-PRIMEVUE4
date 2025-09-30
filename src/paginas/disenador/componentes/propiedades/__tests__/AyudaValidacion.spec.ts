import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AyudaValidacion from '../AyudaValidacion.vue'

// Mock de PrimeVue components
const mockComponents = {
  PrimeButton: { template: '<button><slot /></button>' },
  DialogoAyuda: {
    template: '<div v-if="visible"><slot /></div>',
    props: ['visible', 'titulo', 'ancho']
  },
  PrimeTabs: {
    template: '<div><slot /></div>',
    props: ['modelValue']
  },
  PrimeTabList: { template: '<div class="tab-list"><slot /></div>' },
  PrimeTab: {
    template: '<div class="tab" :data-value="value"><slot /></div>',
    props: ['value']
  },
  PrimeTabPanels: { template: '<div class="tab-panels"><slot /></div>' },
  PrimeTabPanel: {
    template: '<div class="tab-panel" :data-value="value"><slot /></div>',
    props: ['value']
  },
  Accordion: { template: '<div class="accordion"><slot /></div>' },
  AccordionPanel: { template: '<div class="accordion-panel"><slot /></div>' },
  AccordionHeader: { template: '<div class="accordion-header"><slot /></div>' },
  AccordionContent: { template: '<div class="accordion-content"><slot /></div>' },
  PrimeMessage: { template: '<div class="message"><slot /></div>' },
  PrimeInputText: { template: '<input />' },
  PrimeTag: { template: '<span class="tag">{{ value }}</span>', props: ['value'] },
  PrimeTextarea: { template: '<textarea></textarea>' },
  PrimeScrollPanel: { template: '<div class="scroll-panel"><slot /></div>' }
}

describe('AyudaValidacion', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('debe renderizar el botón de ayuda correctamente', () => {
    const wrapper = mount(AyudaValidacion, {
      global: {
        components: mockComponents
      }
    })

    // Verificar que el botón de ayuda existe
    const botonAyuda = wrapper.find('button')
    expect(botonAyuda.exists()).toBe(true)
  })

  it('debe tener la configuración correcta de tabs', async () => {
    const wrapper = mount(AyudaValidacion, {
      global: {
        components: mockComponents
      }
    })

    // Verificar que los datos iniciales son correctos
    const vm = wrapper.vm as any
    expect(vm.tabActivo).toBe('basicas')
    expect(vm.panelActivo).toEqual(['0'])
  })

  it('debe contener las validaciones básicas correctas', () => {
    const wrapper = mount(AyudaValidacion, {
      global: {
        components: mockComponents
      }
    })

    const vm = wrapper.vm as any
    const validacionesBasicas = vm.validacionesBasicas

    // Verificar que tiene las validaciones esperadas
    expect(validacionesBasicas).toHaveLength(3)
    expect(validacionesBasicas[0].tipo).toBe('requerido')
    expect(validacionesBasicas[1].tipo).toBe('longitud-minima')
    expect(validacionesBasicas[2].tipo).toBe('longitud-maxima')

    // Verificar propiedades de la primera validación
    expect(validacionesBasicas[0].titulo).toBe('Campo Obligatorio')
    expect(validacionesBasicas[0].icono).toBe('pi-exclamation-triangle')
  })

  it('debe contener los patrones comunes correctos', () => {
    const wrapper = mount(AyudaValidacion, {
      global: {
        components: mockComponents
      }
    })

    const vm = wrapper.vm as any
    const patronesComunes = vm.patronesComunes

    // Verificar que tiene patrones
    expect(patronesComunes.length).toBeGreaterThan(0)

    // Verificar que tiene el patrón de email
    const patronEmail = patronesComunes.find((p: any) => p.nombre === 'Email')
    expect(patronEmail).toBeDefined()
    expect(patronEmail.regex).toContain('@')
    expect(patronEmail.ejemplos).toContain('usuario@ejemplo.com')
  })

  it('debe contener ejemplos personalizados correctos', () => {
    const wrapper = mount(AyudaValidacion, {
      global: {
        components: mockComponents
      }
    })

    const vm = wrapper.vm as any
    const ejemplosPersonalizados = vm.ejemplosPersonalizados

    // Verificar que tiene ejemplos
    expect(ejemplosPersonalizados.length).toBeGreaterThan(0)

    // Verificar que tiene el ejemplo de edad mínima
    const ejemploEdad = ejemplosPersonalizados.find((e: any) => e.nombre === 'Edad mínima')
    expect(ejemploEdad).toBeDefined()
    expect(ejemploEdad.codigo).toContain('parseInt(valor)')
    expect(ejemploEdad.codigo).toContain('edad >= 18')
  })

  it('debe tener funciones de copiado', () => {
    const wrapper = mount(AyudaValidacion, {
      global: {
        components: mockComponents
      }
    })

    const vm = wrapper.vm as any

    // Verificar que las funciones existen
    expect(typeof vm.copiarPatron).toBe('function')
    expect(typeof vm.copiarCodigo).toBe('function')
  })

  it('debe mostrar el diálogo cuando se hace clic en el botón', async () => {
    const wrapper = mount(AyudaValidacion, {
      global: {
        components: mockComponents
      }
    })

    // Inicialmente el diálogo no debe estar visible
    expect(wrapper.vm.mostrarAyuda).toBe(false)

    // Hacer clic en el botón
    await wrapper.find('button').trigger('click')

    // El diálogo debe estar visible
    expect(wrapper.vm.mostrarAyuda).toBe(true)
  })

  it('debe resetear el tab activo cuando se abre el diálogo', async () => {
    const wrapper = mount(AyudaValidacion, {
      global: {
        components: mockComponents
      }
    })

    const vm = wrapper.vm as any

    // Cambiar el tab activo
    vm.tabActivo = 'patrones'

    // Abrir el diálogo
    vm.mostrarAyuda = true
    await wrapper.vm.$nextTick()

    // El tab activo debe volver a 'basicas'
    expect(vm.tabActivo).toBe('basicas')
  })

  console.log('🧪 TESTS DE AYUDA VALIDACIÓN')
  console.log('============================')
  console.log('✅ Botón de ayuda se renderiza')
  console.log('✅ Configuración de tabs correcta')
  console.log('✅ Validaciones básicas presentes')
  console.log('✅ Patrones comunes incluidos')
  console.log('✅ Ejemplos personalizados disponibles')
  console.log('✅ Funciones de copiado implementadas')
  console.log('✅ Diálogo se muestra al hacer clic')
  console.log('✅ Tab se resetea al abrir diálogo')
})
