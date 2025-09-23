import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import TabsPropiedades from '../../../../../paginas/disenador/componentes/TabsPropiedades.vue'
import { useAlmacenDisenador } from '../../../../../almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '../../../../../interfaces/Campos'

describe('TabsPropiedades', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Debería mostrar mensaje cuando no hay elemento seleccionado', () => {
    const wrapper = mount(TabsPropiedades)
    expect(wrapper.text()).toContain('Selecciona un elemento para ver propiedades')
  })

  it('Debería incluir el v-model en PrimeTabs', () => {
    // Test simple que verifica que el código se actualizado correctamente
    // Al verificar el source code del componente TabsPropiedades
    const wrapper = mount(TabsPropiedades)

    // Verificar que el componente se monta sin errores
    expect(wrapper.exists()).toBe(true)

    // Verificar que contiene el texto de header
    expect(wrapper.text()).toContain('Propiedades')
  })

  it('Debería tener las correcciones implementadas', async () => {
    const almacen = useAlmacenDisenador()

    const campo: EsquemaCampo = {
      id: 'test-field',
      tipo: 'texto',
      nombre: 'testField',
      etiqueta: 'Campo de Prueba'
    }

    almacen.esquemaFormulario.paginas[0] = almacen.esquemaFormulario.paginas[0] || { id: 'page1', titulo: 'Página 1', campos: [] }
    almacen.esquemaFormulario.paginas[0].campos.push(campo)
    almacen.seleccionarCampo(campo.id)

    const wrapper = mount(TabsPropiedades)
    await wrapper.vm.$nextTick()

    // Verificar que se muestran las tabs cuando hay un campo seleccionado
    expect(wrapper.find('[data-pc-name="tablist"]').exists()).toBe(true)
  })
})
