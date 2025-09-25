import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TabValidacion from '../propiedades/TabValidacion.vue'
import EnvolvedorCampo from '../EnvolvedorCampo.vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '@/interfaces/Campos'
import { TipoCampoValor } from '@/enumeraciones/Campos'

describe('Validación Requerido', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('debe mostrar asterisco rojo cuando se añade validación requerido', async () => {
    const almacen = useAlmacenDisenador()

    // Crear un campo de prueba
    const campoTexto: EsquemaCampo = {
      id: 'campo-test',
      tipo: TipoCampoValor.Texto,
      etiqueta: 'Campo de Prueba',
      nombre: 'campoTest',
      requerido: false,
      validaciones: []
    }

    // Añadir el campo al almacén
    almacen.esquemaFormulario.paginas = [{
      id: 'pagina-1',
      titulo: 'Página de Prueba',
      campos: [campoTexto]
    }]

    // Seleccionar el campo
    almacen.seleccionarCampo(campoTexto.id)

    // Montar el componente TabValidacion
    const wrapper = mount(TabValidacion, {
      props: {
        idCampo: campoTexto.id
      },
      global: {
        stubs: {
          PrimeButton: true,
          PrimeInputText: true,
          PrimeCard: true,
          PrimeAvatar: true,
          PrimeMessage: true,
          PrimeTag: true,
          TransitionGroup: true,
          AyudaValidacion: true,
          DialogoAyuda: true
        }
      }
    })

    // Verificar que inicialmente no hay validaciones
    expect(almacen.campoSeleccionado?.validaciones).toEqual([])
    expect(almacen.campoSeleccionado?.requerido).toBe(false)

    // Simular agregar validación requerido directamente
    const vm = wrapper.vm as any
    vm.agregarValidacion('requerido')

    await wrapper.vm.$nextTick()

    // Verificar que se añadió la validación y se actualizó la propiedad requerido
    expect(almacen.campoSeleccionado?.validaciones).toHaveLength(1)
    expect(almacen.campoSeleccionado?.validaciones?.[0].tipo).toBe('requerido')
    expect(almacen.campoSeleccionado?.requerido).toBe(true)
  })

  it('debe mostrar asterisco rojo en el diseñador cuando el campo es requerido', () => {
    const campoRequerido: EsquemaCampo = {
      id: 'campo-requerido',
      tipo: TipoCampoValor.Texto,
      etiqueta: 'Campo Requerido',
      nombre: 'campoRequerido',
      requerido: true,
      validaciones: [{ tipo: 'requerido', valor: 'Este campo es obligatorio' }]
    }

    const wrapper = mount(EnvolvedorCampo, {
      props: {
        campo: campoRequerido,
        seleccionado: false
      },
      global: {
        stubs: {
          PrimeInputText: true,
          PrimeTag: true,
          PrimeButton: true,
          ModalConfirmar: true
        }
      }
    })

    // Verificar que se muestra el asterisco rojo
    const asterisco = wrapper.find('.color-rojo')
    expect(asterisco.exists()).toBe(true)
    expect(asterisco.text()).toContain('*')
  })

  it('debe eliminar la propiedad requerido cuando se elimina la validación requerido', async () => {
    const almacen = useAlmacenDisenador()

    // Crear un campo con validación requerido
    const campoConValidacion: EsquemaCampo = {
      id: 'campo-con-validacion',
      tipo: TipoCampoValor.Texto,
      etiqueta: 'Campo con Validación',
      nombre: 'campoConValidacion',
      requerido: true,
      validaciones: [{ tipo: 'requerido', valor: 'Este campo es obligatorio' }]
    }

    // Añadir el campo al almacén
    almacen.esquemaFormulario.paginas = [{
      id: 'pagina-1',
      titulo: 'Página de Prueba',
      campos: [campoConValidacion]
    }]

    // Seleccionar el campo
    almacen.seleccionarCampo(campoConValidacion.id)

    // Montar el componente TabValidacion
    const wrapper = mount(TabValidacion, {
      props: {
        idCampo: campoConValidacion.id
      },
      global: {
        stubs: {
          PrimeButton: true,
          PrimeInputText: true,
          PrimeCard: true,
          PrimeAvatar: true,
          PrimeMessage: true,
          PrimeTag: true,
          TransitionGroup: true,
          AyudaValidacion: true,
          DialogoAyuda: true
        }
      }
    })

    // Verificar estado inicial
    expect(almacen.campoSeleccionado?.validaciones).toHaveLength(1)
    expect(almacen.campoSeleccionado?.requerido).toBe(true)

    // Simular eliminación de la validación
    const vm = wrapper.vm as any
    vm.eliminarValidacion(0)

    await wrapper.vm.$nextTick()

    // Verificar que se eliminó la validación y se actualizó la propiedad requerido
    expect(almacen.campoSeleccionado?.validaciones).toHaveLength(0)
    expect(almacen.campoSeleccionado?.requerido).toBe(false)
  })
})
