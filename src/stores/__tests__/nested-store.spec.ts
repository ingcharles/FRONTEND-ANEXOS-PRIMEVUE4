import { describe, it, expect, beforeEach } from 'vitest'
import { useDesignerStore } from '../useDesignerStore'
import type { FieldSchema } from '../../types/form-schema'

function crearPanelConHijo(): { panel: FieldSchema; hijo: FieldSchema } {
  const panel: FieldSchema = {
    id: 'panel_1',
    type: 'panel',
    label: 'Panel',
    children: [],
    grid: { sm: 12, md: 12, lg: 12 },
  }
  const hijo: FieldSchema = {
    id: 'child_1',
    type: 'text',
    name: 'campo1',
    label: 'Campo 1',
    grid: { sm: 12, md: 6, lg: 6 },
    visible: true,
    required: false,
  }
  panel.children = [hijo]
  return { panel, hijo }
}

describe('store recursivo con paneles', () => {
  let store: ReturnType<typeof useDesignerStore>

  beforeEach(() => {
    store = useDesignerStore()
    // limpiar y dejar una página vacía conocida
    store.formSchema.pages = [
      { id: 'page_1', title: 'Página 1', fields: [] },
    ]
  store.activePageIndex = 0
  })

  it('Deberia actualizar un hijo dentro de panel', () => {
    const { panel, hijo } = crearPanelConHijo()
    // agregar panel al nivel raíz
    store.paginaActiva.fields.push(panel)

    // actualizar label del hijo
    store.actualizarCampo(hijo.id, { label: 'Actualizado' })

  const panelEnStore = store.paginaActiva.fields.find((f: FieldSchema) => f.id === panel.id)!
  const hijoEnStore = panelEnStore.children!.find((f: FieldSchema) => f.id === hijo.id)!
    expect(hijoEnStore.label).toBe('Actualizado')
  })

  it('Deberia duplicar un hijo dentro de panel', () => {
    const { panel, hijo } = crearPanelConHijo()
    store.paginaActiva.fields.push(panel)

    store.duplicarCampo(hijo.id)

  const panelEnStore = store.paginaActiva.fields.find((f: FieldSchema) => f.id === panel.id)!
    expect(panelEnStore.children).toBeTruthy()
    expect(panelEnStore.children!.length).toBe(2)
    const [primero, segundo] = panelEnStore.children!
    expect(primero.id).toBe(hijo.id)
    expect(segundo.id).not.toBe(hijo.id)
    expect(segundo.type).toBe(hijo.type)
  })

  it('Deberia eliminar un hijo dentro de panel', () => {
    const { panel, hijo } = crearPanelConHijo()
    store.paginaActiva.fields.push(panel)

    store.eliminarCampo(hijo.id)

  const panelEnStore = store.paginaActiva.fields.find((f: FieldSchema) => f.id === panel.id)!
    expect(panelEnStore.children!.length).toBe(0)
  })
})
