import { describe, it, expect, beforeEach } from 'vitest'
import { useAlmacenDisenador } from '../../almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '../../interfaces/Campos'

function crearPanelConHijo(): { panel: EsquemaCampo; hijo: EsquemaCampo } {
  const panel: EsquemaCampo = {
    id: 'panel_1',
    tipo: 'panel',
    etiqueta: 'Panel',
    hijos: [],
    grid: { sm: 12, md: 12, lg: 12 },
  }
  const hijo: EsquemaCampo = {
    id: 'child_1',
    tipo: 'texto',
    nombre: 'campo1',
    etiqueta: 'Campo 1',
    grid: { sm: 12, md: 6, lg: 6 },
    visible: true,
    requerido: false,
  }
  panel.hijos = [hijo]
  return { panel, hijo }
}

describe('almacen recursivo con paneles', () => {
  let almacen: ReturnType<typeof useAlmacenDisenador>

  beforeEach(() => {
    almacen = useAlmacenDisenador()
    // limpiar y dejar una página vacía conocida
    almacen.esquemaFormulario.paginas = [
      { id: 'page_1', titulo: 'Página 1', campos: [] },
    ]
    almacen.indicePaginaActiva = 0
  })

  it('Deberia actualizar un hijo dentro de panel', () => {
    const { panel, hijo } = crearPanelConHijo()
    // agregar panel al nivel raíz
    almacen.paginaActiva.campos.push(panel)

    // actualizar label del hijo
    almacen.actualizarCampo(hijo.id, { etiqueta: 'Actualizado' })

    const panelEnStore = almacen.paginaActiva.campos.find((f: EsquemaCampo) => f.id === panel.id)!
    const hijoEnStore = panelEnStore.hijos!.find((f: EsquemaCampo) => f.id === hijo.id)!
    expect(hijoEnStore.etiqueta).toBe('Actualizado')
  })

  it('Deberia eliminar un hijo dentro de panel', () => {
    const { panel, hijo } = crearPanelConHijo()
    almacen.paginaActiva.campos.push(panel)

    // eliminar hijo del panel
    almacen.eliminarCampo(hijo.id)

    const panelEnStore = almacen.paginaActiva.campos.find((f: EsquemaCampo) => f.id === panel.id)!
    expect(panelEnStore.hijos).toHaveLength(0)
  })

  it('Deberia buscar campo en estructura anidada', () => {
    const { panel, hijo } = crearPanelConHijo()
    almacen.paginaActiva.campos.push(panel)

    const encontrado = almacen.buscarCampo(hijo.id)
    expect(encontrado).toBeDefined()
    expect(encontrado!.id).toBe(hijo.id)
  })

  it('Deberia devolver null para campo inexistente', () => {
    const { panel } = crearPanelConHijo()
    almacen.paginaActiva.campos.push(panel)

    const noEncontrado = almacen.buscarCampo('no_existe')
    expect(noEncontrado).toBeNull()
  })
})

