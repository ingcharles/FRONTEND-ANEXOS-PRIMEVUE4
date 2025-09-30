import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ModalAlerta from '../ModalAlerta.vue'

describe('ModalAlerta', () => {
  const defaultProps = {
    modelValue: true,
    titulo: 'Título de prueba',
    mensaje: 'Mensaje de prueba'
  }

  it('Debería renderizar correctamente cuando está visible', async () => {
    const wrapper = mount(ModalAlerta, {
      props: defaultProps,
      attachTo: document.body // Necesario para que PrimeDialog funcione correctamente
    })

    // Esperar a que el componente se monte completamente
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar que el contenido esté presente en el DOM
    expect(document.body.textContent).toContain('Mensaje de prueba')
    expect(document.body.textContent).toContain('Entendido')

    wrapper.unmount()
  })

  it('Debería mostrar el mensaje de detalle cuando se proporciona', async () => {
    const wrapper = mount(ModalAlerta, {
      props: {
        ...defaultProps,
        mensajeDetalle: 'Detalle adicional'
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(document.body.textContent).toContain('Detalle adicional')

    wrapper.unmount()
  })

  it('Debería mostrar botón de cancelar cuando mostrarBotonCancelar es true', async () => {
    const wrapper = mount(ModalAlerta, {
      props: {
        ...defaultProps,
        mostrarBotonCancelar: true
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    const buttons = document.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)

    const buttonTexts = Array.from(buttons).map(btn => btn.textContent)
    expect(buttonTexts.some(text => text?.includes('Cancelar'))).toBe(true)
    expect(buttonTexts.some(text => text?.includes('Entendido'))).toBe(true)

    wrapper.unmount()
  })

  it('Debería emitir evento confirmar al hacer clic en el botón confirmar', async () => {
    const wrapper = mount(ModalAlerta, {
      props: defaultProps,
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Buscar el botón "Entendido" en el DOM
    const buttons = document.querySelectorAll('button')
    const confirmButton = Array.from(buttons).find(btn =>
      btn.textContent?.includes('Entendido')
    )

    expect(confirmButton).toBeTruthy()

    if (confirmButton) {
      confirmButton.click()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('confirmar')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    }

    wrapper.unmount()
  })

  it('Debería aplicar la clase de icono correcta según el tipo', async () => {
    const tipos = ['error', 'warning', 'info', 'success'] as const
    const iconosEsperados = [
      'pi-exclamation-triangle color-rojo',
      'pi-exclamation-triangle color-naranja-fuerte',
      'pi-info-circle color-cyan-fuerte',
      'pi-check-circle color-verde-claro'
    ]

    for (let i = 0; i < tipos.length; i++) {
      const wrapper = mount(ModalAlerta, {
        props: {
          ...defaultProps,
          tipo: tipos[i]
        },
        attachTo: document.body
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const icono = document.querySelector('i')
      expect(icono).toBeTruthy()

      if (icono) {
        const clases = icono.className
        iconosEsperados[i].split(' ').forEach(claseEsperada => {
          expect(clases).toContain(claseEsperada)
        })
      }

      wrapper.unmount()
    }
  })
})
