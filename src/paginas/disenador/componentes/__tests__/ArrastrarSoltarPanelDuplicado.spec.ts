import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { useAlmacenDisenador } from '../../../../almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '../../../../interfaces/Campos'

describe('ContenedorPanel - Arrastrar y Soltar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Debería actualizar almacen directamente cuando se llama actualizarCampo', async () => {
    const almacen = useAlmacenDisenador()

    // Crear un panel con dos campos
    const panel: EsquemaCampo = {
      id: 'panel1',
      tipo: 'panel',
      etiqueta: 'Mi Panel',
      hijos: [
        { id: 'campo1', tipo: 'texto', etiqueta: 'Campo 1', grid: { sm: 12, md: 12, lg: 12 } },
        { id: 'campo2', tipo: 'texto', etiqueta: 'Campo 2', grid: { sm: 12, md: 12, lg: 12 } }
      ]
    }

    // Añadir el panel al almacen (verificar que existe la página primero)
    if (!almacen.esquemaFormulario.paginas[0]) {
      almacen.esquemaFormulario.paginas = [{ id: 'page1', titulo: 'Página 1', campos: [] }]
    }
    almacen.esquemaFormulario.paginas[0].campos.push(panel)

    // Verificar estado inicial
    expect(panel.hijos![0].id).toBe('campo1')
    expect(panel.hijos![1].id).toBe('campo2')

    // Simular reordenamiento: intercambiar campo1 y campo2
    const nuevaLista = [panel.hijos![1], panel.hijos![0]]

    // Llamar directamente a actualizarCampo
    almacen.actualizarCampo('panel1', { hijos: [...nuevaLista] })
    await nextTick()

    // Obtener la referencia actualizada del almacén
    const panelActualizado = almacen.esquemaFormulario.paginas[0].campos.find((c: EsquemaCampo) => c.id === 'panel1')!

    // Verificar que el orden cambió
    expect(panelActualizado.hijos).toHaveLength(2)
    expect(panelActualizado.hijos![0].id).toBe('campo2')
    expect(panelActualizado.hijos![1].id).toBe('campo1')
  })
})

