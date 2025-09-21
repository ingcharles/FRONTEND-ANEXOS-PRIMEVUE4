import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DesignerView from '../DesignerView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useDesignerStore } from '../../stores/useDesignerStore'

describe('DesignerView - Eliminar Página', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Deveria mostrar modal de confirmación al hacer clic en Eliminar página', async () => {
    const wrapper = mount(DesignerView)
    const store = useDesignerStore()
    
    // Agregar una página adicional para poder eliminar
    store.agregarPagina()
    await wrapper.vm.$nextTick()

    // Buscar el botón de eliminar página
    const eliminarButton = wrapper.find('[label="Eliminar página"]')
    expect(eliminarButton.exists()).toBe(true)

    // Hacer clic en eliminar
    await eliminarButton.trigger('click')
    await wrapper.vm.$nextTick()

    // Verificar que el modal aparece
    const modal = wrapper.findComponent({ name: 'ModalConfirm' })
    expect(modal.exists()).toBe(true)
    expect(modal.props('visible')).toBe(true)
  })

  it('Deveria mostrar mensaje específico para eliminar página', async () => {
    const wrapper = mount(DesignerView)
    const store = useDesignerStore()
    
    // Agregar una página adicional
    store.agregarPagina()
    await wrapper.vm.$nextTick()

    // Hacer clic en eliminar
    const eliminarButton = wrapper.find('[label="Eliminar página"]')
    await eliminarButton.trigger('click')
    await wrapper.vm.$nextTick()

    // Verificar el mensaje del modal
    const modal = wrapper.findComponent({ name: 'ModalConfirm' })
    expect(modal.props('message')).toBe('¿Estás seguro de que deseas eliminar esta página? Esta acción no se puede deshacer.')
  })

  it('Deveria eliminar la página al confirmar', async () => {
    const wrapper = mount(DesignerView)
    const store = useDesignerStore()
    
    // Agregar páginas adicionales
    store.agregarPagina()
    store.agregarPagina()
    await wrapper.vm.$nextTick()

    const paginasIniciales = store.formSchema.pages.length
    expect(paginasIniciales).toBe(3) // página inicial + 2 agregadas

    // Hacer clic en eliminar
    const eliminarButton = wrapper.find('[label="Eliminar página"]')
    await eliminarButton.trigger('click')
    await wrapper.vm.$nextTick()

    // Confirmar eliminación
    const modal = wrapper.findComponent({ name: 'ModalConfirm' })
    modal.vm.$emit('confirm')
    await wrapper.vm.$nextTick()

    // Verificar que la página fue eliminada
    expect(store.formSchema.pages.length).toBe(paginasIniciales - 1)
    
    // Verificar que el modal se oculta
    expect(modal.props('visible')).toBe(false)
  })

  it('Deveria cancelar eliminación al hacer clic en cancelar', async () => {
    const wrapper = mount(DesignerView)
    const store = useDesignerStore()
    
    // Agregar páginas adicionales
    store.agregarPagina()
    store.agregarPagina()
    await wrapper.vm.$nextTick()

    const paginasIniciales = store.formSchema.pages.length

    // Hacer clic en eliminar
    const eliminarButton = wrapper.find('[label="Eliminar página"]')
    await eliminarButton.trigger('click')
    await wrapper.vm.$nextTick()

    // Cancelar eliminación
    const modal = wrapper.findComponent({ name: 'ModalConfirm' })
    modal.vm.$emit('cancel')
    await wrapper.vm.$nextTick()

    // Verificar que la página NO fue eliminada
    expect(store.formSchema.pages.length).toBe(paginasIniciales)
    
    // Verificar que el modal se oculta
    expect(modal.props('visible')).toBe(false)
  })
})