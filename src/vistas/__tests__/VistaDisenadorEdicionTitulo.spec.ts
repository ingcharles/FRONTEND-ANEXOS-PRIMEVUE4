import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import VistaDisenador from '../VistaDisenador.vue'
import { useAlmacenDisenador } from '../../almacenes/UsarAlmacenDisenador'

describe('VistaDisenador - Edición de títulos', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Debería permitir editar el título de una página', async () => {
    const wrapper = mount(VistaDisenador)
    const almacen = useAlmacenDisenador()

    // Verificar que el título inicial existe
    expect(wrapper.text()).toContain('Página 1')

    // Simular clic en el título para editarlo
    const tituloElement = wrapper.find('.cursor-pointer')
    expect(tituloElement.exists()).toBe(true)

    // Simular inicio de edición (activar el estado editandoTitulo)
    await wrapper.find('.cursor-pointer').trigger('click')

    // Verificar que el campo de entrada aparece
    await wrapper.vm.$nextTick()
    const inputElement = wrapper.find('.titulo-input')
    expect(inputElement.exists()).toBe(true)

    // Cambiar el valor del input
    await inputElement.setValue('Mi Página Personalizada')

    // Simular presionar Enter o hacer clic en guardar
    await inputElement.trigger('keydown', { key: 'Enter' })
    await wrapper.vm.$nextTick()

    // Verificar que el título se actualizó
    const paginaActual = almacen.paginaActiva
    expect(paginaActual?.titulo).toBe('Mi Página Personalizada')
  })

  it('Debería cancelar la edición con Escape', async () => {
    const wrapper = mount(VistaDisenador)
    const almacen = useAlmacenDisenador()

    const tituloOriginal = almacen.paginaActiva?.titulo || 'Página 1'

    // Iniciar edición
    await wrapper.find('.cursor-pointer').trigger('click')
    await wrapper.vm.$nextTick()

    const inputElement = wrapper.find('.titulo-input')
    await inputElement.setValue('Título temporal')

    // Cancelar con Escape
    await inputElement.trigger('keydown', { key: 'Escape' })
    await wrapper.vm.$nextTick()

    // Verificar que el título no cambió
    expect(almacen.paginaActiva?.titulo || 'Página 1').toBe(tituloOriginal)
  })

  it('Debería actualizar título mediante el almacén', () => {
    const almacen = useAlmacenDisenador()
    
    // Verificar que el método existe y funciona
    const resultado = almacen.actualizarTituloPagina(0, 'Nuevo Título')
    expect(resultado).toBe(true)
    
    // Verificar que el título se actualizó
    expect(almacen.paginaActiva?.titulo).toBe('Nuevo Título')
  })
})