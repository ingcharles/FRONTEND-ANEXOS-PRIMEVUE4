import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import ContenedorPanel from '../../paginas/disenador/componentes/ContenedorPanel.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAlmacenDisenador } from '../../almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '../../interfaces/Campos'
import type { TipoCampo } from '../../tipos/Campos'
function crearCampoTexto(id: string, tipo: TipoCampo = 'texto', etiqueta = 'Campo'): EsquemaCampo {
  return { id, tipo: tipo, etiqueta: etiqueta, grid: { sm: 12, md: 6, lg: 6 } } as EsquemaCampo
}

function crearCampoPanel(id: string, etiqueta = 'Panel'): EsquemaCampo {
  return { id, tipo: 'panel', etiqueta: etiqueta, hijos: [] as EsquemaCampo[] } as EsquemaCampo
}

describe('Selección de Panel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Debería seleccionar elemento hijo dentro del panel al hacer clic', async () => {
    const almacen = useAlmacenDisenador()
    const panel = crearCampoPanel('p1')
    const elementoHijo = crearCampoTexto('c1')
    ;(panel.hijos as EsquemaCampo[]).push(elementoHijo)

    const envoltorio = mount(ContenedorPanel, {
      props: { campo: panel },
      global: {
        stubs: { transition: false },
      },
    })

    // Hacer clic en el FieldWrapper que envuelve al hijo
    const botonSeleccion = envoltorio.find('[role="button"]')
    expect(botonSeleccion.exists()).toBe(true)

    await botonSeleccion.trigger('click')

    // Verificar que el elemento fue seleccionado en el almacén
    expect(almacen.idCampoSeleccionado).toBe('c1')
  })

  it('Debería permitir anidación de elementos en panel', () => {
    const panelPrincipal = crearCampoPanel('panel-principal', 'Panel Principal')
    const panelAnidado = crearCampoPanel('panel-anidado', 'Panel Anidado')
    const campoTexto = crearCampoTexto('campo-texto', 'texto', 'Texto de entrada')

    // Anidar panel dentro de panel principal
    ;(panelPrincipal.hijos as EsquemaCampo[]).push(panelAnidado)
    // Agregar campo al panel anidado
    ;(panelAnidado.hijos as EsquemaCampo[]).push(campoTexto)

    expect(panelPrincipal.hijos).toHaveLength(1)
    expect(panelPrincipal.hijos![0]).toBe(panelAnidado)
    expect((panelPrincipal.hijos![0] as EsquemaCampo).hijos).toHaveLength(1)
    expect((panelPrincipal.hijos![0] as EsquemaCampo).hijos![0]).toBe(campoTexto)
  })
})

