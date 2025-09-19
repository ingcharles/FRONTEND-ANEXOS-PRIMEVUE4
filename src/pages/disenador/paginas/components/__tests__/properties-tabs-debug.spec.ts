import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PropertiesTabs from '../PropertiesTabs.vue'
import { useDesignerStore } from '../../../../../stores/useDesignerStore'

describe('PropertiesTabs - Debug', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Deveria mostrar los 3 tabs cuando hay un campo seleccionado', () => {
    const store = useDesignerStore()
    // Crear un campo de prueba
    const campoId = store.agregarCampo({
      type: 'text',
      label: 'Campo de prueba',
      name: 'test',
      grid: { sm: 12, md: 6, lg: 4 }
    })
    
    // Verificar que el campo fue creado y seleccionado
    expect(campoId).toBeTruthy()
    expect(store.campoSeleccionado).toBeTruthy()
    expect(store.campoSeleccionado?.id).toBe(campoId)
    
    const wrapper = mount(PropertiesTabs)
    
    // Debug: Verificar HTML generado
    console.log('HTML generado:', wrapper.html())
    
    // Buscar el componente PrimeTabs
    const primeTabs = wrapper.findComponent({ name: 'PrimeTabs' })
    console.log('PrimeTabs encontrado:', primeTabs.exists())
    
    // Si no encontramos por name, buscar por clase
    const primeTabsByClass = wrapper.find('.prime-tabs')
    console.log('PrimeTabs por clase encontrado:', primeTabsByClass.exists())
    
    // Buscar PrimeTabPanel por componente y por clase
    const tabPanels = wrapper.findAllComponents({ name: 'PrimeTabPanel' })
    const tabPanelsByClass = wrapper.findAll('.tab-panel')
    console.log('PrimeTabPanels encontrados:', tabPanels.length)
    console.log('TabPanels por clase encontrados:', tabPanelsByClass.length)
    
    // Verificar que se muestran los 3 tabs (usando clase como fallback)
    const tabCount = tabPanels.length > 0 ? tabPanels.length : tabPanelsByClass.length
    expect(tabCount).toBe(3)
    
    // Verificar los valores y contenido de cada tab
    const expectedTabs = [
      { value: 'attrs', text: 'Atributos' },
      { value: 'logic', text: 'Lógica' },
      { value: 'valid', text: 'Validaciones' }
    ]
    
    if (tabPanels.length > 0) {
      // Usar componentes reales
      expectedTabs.forEach((expectedTab, index) => {
        const tabPanel = tabPanels[index]
        expect(tabPanel.props('value')).toBe(expectedTab.value)
      })
    } else {
      // Usar stubs - verificar atributos en DOM
      expectedTabs.forEach((expectedTab, index) => {
        const tabPanel = tabPanelsByClass.at(index)
        expect(tabPanel?.attributes('value')).toBe(expectedTab.value)
      })
      
      // Verificar también los tabs en la tab-list
      const tabButtons = wrapper.findAll('.tab')
      expect(tabButtons.length).toBe(3)
      expectedTabs.forEach((expectedTab, index) => {
        const tabButton = tabButtons.at(index)
        expect(tabButton?.attributes('value')).toBe(expectedTab.value)
        expect(tabButton?.text()).toBe(expectedTab.text)
      })
    }
    
    // Verificar que v-model está configurado
    if (primeTabs.exists()) {
      const primeTabsProps = primeTabs.props()
      console.log('Props de PrimeTabs:', primeTabsProps)
      expect(primeTabsProps).toHaveProperty('modelValue')
    } else if (primeTabsByClass.exists()) {
      console.log('PrimeTabs renderizado como stub con clase .prime-tabs')
      expect(primeTabsByClass.attributes('value')).toBe('attrs')
    }
  })
  
  it('Deveria mostrar mensaje cuando no hay campo seleccionado', () => {
    const wrapper = mount(PropertiesTabs)
    
    // No hay campo seleccionado por defecto
    expect(wrapper.text()).toContain('Selecciona un elemento para ver propiedades')
    
    // No debería mostrar PrimeTabs
    const primeTabs = wrapper.findComponent({ name: 'PrimeTabs' })
    expect(primeTabs.exists()).toBe(false)
  })
})