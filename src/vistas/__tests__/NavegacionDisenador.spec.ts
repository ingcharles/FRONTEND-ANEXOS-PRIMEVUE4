import { shallowMount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import VistaDisenador from '../../vistas/VistaDisenador.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAlmacenDisenador } from '../../almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '../../interfaces/Campos'
import { nextTick } from 'vue'

describe('Diseñador - navegación entre páginas', () => {
  it('Deberia mostrar página 2 vacía tras añadir y navegar, manteniendo independiente la página 1', async () => {
    setActivePinia(createPinia())
    shallowMount(VistaDisenador, {
      global: {
        stubs: {
          PanelPaleta: true,
          TabsPropiedades: true,
          VistaPrevia: true,
          VistaJson: true,
        },
      },
    })

    // Página 1: agregar un campo simulando un drop en el canvas
    // Simplificamos: llamamos directamente a la almacen para añadir un campo
    const s = useAlmacenDisenador()
    const campo: EsquemaCampo = { id: 'f1', tipo: 'texto', nombre: 'campo1', etiqueta: 'Campo 1', grid: { sm: 12 } }
    s.agregarCampo(campo)
    expect(s.esquemaFormulario.paginas[0].campos.length).toBe(1)

    // Añadir página sin moverse a ella (replicar crearPaginaDespuesActual)
    const idx = s.indicePaginaActiva
    s.agregarPagina()
    s.indicePaginaActiva = idx
    await nextTick()
    expect(s.esquemaFormulario.paginas.length).toBe(2)
    // Debe seguir en página 1
    expect(s.indicePaginaActiva).toBe(0)

    // Pulsar Siguiente
    // Pulsar Siguiente (simular cambiando el índice)
    s.indicePaginaActiva = 1
    await nextTick()
    expect(s.indicePaginaActiva).toBe(1)

    // Página 2 debería estar vacía
    expect(s.esquemaFormulario.paginas[1].campos.length).toBe(0)

    // Volver a Página 1 y verificar que conserva su campo
    // Volver a Página 1
    s.indicePaginaActiva = 0
    await nextTick()
    expect(s.indicePaginaActiva).toBe(0)
    expect(s.esquemaFormulario.paginas[0].campos.length).toBe(1)

    // Volver a Página 2 y sigue vacía
    s.indicePaginaActiva = 1
    await nextTick()
    expect(s.indicePaginaActiva).toBe(1)
    expect(s.esquemaFormulario.paginas[1].campos.length).toBe(0)
  })
})

