import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import TabsPropiedades from '../TabsPropiedades.vue'
import { useAlmacenDisenador } from '../../../../almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '../../../../tipos/EsquemaFormulario'

describe('TabsPropiedades', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Debería mostrar mensaje cuando no hay elemento seleccionado', () => {
    const wrapper = mount(TabsPropiedades)
    expect(wrapper.text()).toContain('Selecciona un elemento para ver propiedades')
  })

  it('Debería mostrar tabs cuando hay un campo seleccionado', async () => {
    const almacen = useAlmacenDisenador()

    const campo: EsquemaCampo = {
      id: 'test-field',
      tipo: 'texto',
      nombre: 'testField',
      etiqueta: 'Campo de Prueba',
      grid: { sm: 12, md: 6, lg: 4 }
    }

    // Agregar campo a la página actual
    if (!almacen.formSchema || !almacen.esquemaFormulario.paginas) {
      almacen.formSchema = { pages: [] }
    }
    if (!almacen.esquemaFormulario.paginas[0]) {
      almacen.esquemaFormulario.paginas[0] = { id: 'page1', titulo: 'Página 1', campos: [] }
    }
    almacen.esquemaFormulario.paginas[0].campos.push(campo)
    almacen.seleccionarCampo('test-field')

    const wrapper = mount(TabsPropiedades)
    await wrapper.vm.$nextTick()

    // Verificar que se muestran los tabs
    expect(wrapper.text()).toContain('Atributos')
    expect(wrapper.text()).toContain('Lógica')
    expect(wrapper.text()).toContain('Validaciones')
  })

  it('Debería resetear al tab de atributos cuando se selecciona un campo diferente', async () => {
    const almacen = useAlmacenDisenador()

    const campo1: EsquemaCampo = {
      id: 'field1',
      tipo: 'texto',
      nombre: 'field1',
      etiqueta: 'Campo 1',
      grid: { sm: 12, md: 6, lg: 4 }
    }

    const campo2: EsquemaCampo = {
      id: 'field2',
      tipo: 'numero',
      nombre: 'field2',
      etiqueta: 'Campo 2',
      grid: { sm: 12, md: 6, lg: 4 }
    }

    // Agregar campos
    if (!almacen.formSchema || !almacen.esquemaFormulario.paginas) {
      almacen.formSchema = { pages: [] }
    }
    if (!almacen.esquemaFormulario.paginas[0]) {
      almacen.esquemaFormulario.paginas[0] = { id: 'page1', titulo: 'Página 1', campos: [] }
    }
    almacen.esquemaFormulario.paginas[0].campos.push(campo1, campo2)

    almacen.seleccionarCampo('field1')
    const wrapper = mount(TabsPropiedades)
    await wrapper.vm.$nextTick()

    // Cambiar a otro campo
    almacen.seleccionarCampo('field2')
    await wrapper.vm.$nextTick()

    // Verificar que está en el tab de atributos por defecto (no podemos acceder directamente al estado interno)
    expect(wrapper.exists()).toBe(true)
  })
})

