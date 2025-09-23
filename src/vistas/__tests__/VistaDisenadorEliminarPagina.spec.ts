import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VistaDisenador from '../../vistas/VistaDisenador.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAlmacenDisenador } from '../../almacenes/UsarAlmacenDisenador'

describe('VistaDisenador - Eliminar Página', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Debería mostrar modal de confirmación al hacer clic en Eliminar página', async () => {
    const wrapper = mount(VistaDisenador)
    const almacen = useAlmacenDisenador()

    // Agregar una página adicional para poder eliminar
    almacen.agregarPagina()
    await wrapper.vm.$nextTick()

    // Buscar todos los botones
    const allButtons = wrapper.findAll('button')
    console.log('Total botones encontrados:', allButtons.length)

    // Buscar el botón específico que contiene "Eliminar página"
    let eliminarButton = null
    for (const button of allButtons) {
      if (button.text().includes('Eliminar página')) {
        eliminarButton = button
        break
      }
    }

    expect(eliminarButton).not.toBeNull()
    expect(eliminarButton?.exists()).toBe(true)

    // Hacer clic en eliminar
    await eliminarButton!.trigger('click')
    await wrapper.vm.$nextTick()

    // Verificar que el modal aparece
    expect(almacen.mostrarModalEliminarPagina).toBe(true)
  })

  it('Debería mostrar mensaje específico para eliminar página', async () => {
    const wrapper = mount(VistaDisenador)
    const almacen = useAlmacenDisenador()

    // Agregar una página adicional
    almacen.agregarPagina()
    await wrapper.vm.$nextTick()

    // Buscar el botón de eliminar
    const allButtons = wrapper.findAll('button')
    let eliminarButton = null
    for (const button of allButtons) {
      if (button.text().includes('Eliminar página')) {
        eliminarButton = button
        break
      }
    }

    await eliminarButton!.trigger('click')
    await wrapper.vm.$nextTick()

    // Verificar que el modal aparece con el mensaje correcto
    const modal = wrapper.findComponent({ name: 'ModalConfirm' })
    expect(modal.exists()).toBe(true)
    expect(modal.props('message')).toBe('¿Estás seguro de que deseas eliminar esta página? Esta acción no se puede deshacer.')
  })

  it('Debería eliminar la página al confirmar', async () => {
    const wrapper = mount(VistaDisenador)
    const almacen = useAlmacenDisenador()

    // Agregar páginas adicionales
    almacen.agregarPagina()
    almacen.agregarPagina()
    await wrapper.vm.$nextTick()

    const paginasIniciales = almacen.esquemaFormulario.paginas?.length || 0
    expect(paginasIniciales).toBe(3) // página inicial + 2 agregadas

    // Buscar el botón de eliminar
    const allButtons = wrapper.findAll('button')
    let eliminarButton = null
    for (const button of allButtons) {
      if (button.text().includes('Eliminar página')) {
        eliminarButton = button
        break
      }
    }

    await eliminarButton!.trigger('click')
    await wrapper.vm.$nextTick()

    // Confirmar eliminación
    const modal = wrapper.findComponent({ name: 'ModalConfirm' })
    modal.vm.$emit('confirm')
    await wrapper.vm.$nextTick()

    // Verificar que la página fue eliminada
    expect(almacen.esquemaFormulario.paginas?.length || 0).toBe(paginasIniciales - 1)

    // Verificar que el modal se oculta
    expect(almacen.mostrarModalEliminarPagina).toBe(false)
  })

  it('Debería cancelar eliminación al hacer clic en cancelar', async () => {
    const wrapper = mount(VistaDisenador)
    const almacen = useAlmacenDisenador()

    // Agregar páginas adicionales
    almacen.agregarPagina()
    almacen.agregarPagina()
    await wrapper.vm.$nextTick()

    const paginasIniciales = almacen.esquemaFormulario.paginas?.length || 0

    // Buscar el botón de eliminar
    const allButtons = wrapper.findAll('button')
    let eliminarButton = null
    for (const button of allButtons) {
      if (button.text().includes('Eliminar página')) {
        eliminarButton = button
        break
      }
    }

    await eliminarButton!.trigger('click')
    await wrapper.vm.$nextTick()

    // Cancelar eliminación
    const modal = wrapper.findComponent({ name: 'ModalConfirm' })
    modal.vm.$emit('cancel')
    await wrapper.vm.$nextTick()

    // Verificar que la página NO fue eliminada
    expect(almacen.esquemaFormulario.paginas?.length || 0).toBe(paginasIniciales)

    // Verificar que el modal se oculta
    expect(almacen.mostrarModalEliminarPagina).toBe(false)
  })
})

