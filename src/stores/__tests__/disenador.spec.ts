import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDisenadorStore } from '../disenador'
import type { PaletteItem, FieldSchema } from '../../types/disenador'

describe('useDisenadorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Estado inicial', () => {
    it('Debería inicializar con un formulario por defecto', () => {
      const store = useDisenadorStore()

      expect(store.currentForm.id).toBe('nuevo-formulario')
      expect(store.currentForm.title).toBe('Nuevo Formulario')
      expect(store.currentForm.pages).toHaveLength(1)
      expect(store.currentForm.pages[0].fields).toHaveLength(0)
      expect(store.currentPageIndex).toBe(0)
      expect(store.previewMode).toBe(false)
    })

    it('Debería tener paleta de componentes configurada', () => {
      const store = useDisenadorStore()

      expect(store.paletteItems).toBeDefined()
      expect(store.paletteItems.length).toBeGreaterThan(0)

      // Verificar que tiene los componentes principales requeridos
      const tipos = store.paletteItems.map((item: PaletteItem) => item.type)
      expect(tipos).toContain('text')
      expect(tipos).toContain('email')
      expect(tipos).toContain('password')
      expect(tipos).toContain('time')
      expect(tipos).toContain('select')
      expect(tipos).toContain('radio')
      expect(tipos).toContain('label')
      expect(tipos).toContain('panel')
      expect(tipos).toContain('table')
      expect(tipos).toContain('button')
      expect(tipos).toContain('divider')
    })
  })

  describe('Gestión de elementos', () => {
    it('Debería agregar elemento desde paleta', () => {
      const store = useDisenadorStore()
      const paletteItem = store.paletteItems.find((item: PaletteItem) => item.type === 'text')!

      expect(store.currentPage.fields).toHaveLength(0)

      store.agregarElemento(paletteItem, { x: 100, y: 100 })

      expect(store.currentPage.fields).toHaveLength(1)
      expect(store.currentPage.fields[0].type).toBe('text')
      expect(store.currentPage.fields[0].position.x).toBe(100)
      expect(store.currentPage.fields[0].position.y).toBe(100)
      expect(store.selectedElement?.id).toBe(store.currentPage.fields[0].id)
    })

    it('Debería duplicar elemento correctamente', () => {
      const store = useDisenadorStore()
      const paletteItem = store.paletteItems.find((item: PaletteItem) => item.type === 'email')!

      store.agregarElemento(paletteItem, { x: 50, y: 50 })
      const elementoOriginal = store.currentPage.fields[0]
      const idOriginal = elementoOriginal.id

      store.duplicarElemento(idOriginal)

      expect(store.currentPage.fields).toHaveLength(2)

      const elementoDuplicado = store.currentPage.fields[1]
      expect(elementoDuplicado.id).not.toBe(idOriginal)
      expect(elementoDuplicado.type).toBe('email')
      expect(elementoDuplicado.label).toBe(elementoOriginal.label)
      expect(elementoDuplicado.position.x).toBe(elementoOriginal.position.x + 20)
      expect(elementoDuplicado.position.y).toBe(elementoOriginal.position.y + 20)
      expect(store.selectedElement?.id).toBe(elementoDuplicado.id)
    })

    it('Debería eliminar elemento correctamente', () => {
      const store = useDisenadorStore()
      const paletteItem = store.paletteItems.find((item: PaletteItem) => item.type === 'text')!

      store.agregarElemento(paletteItem)
      const elementoId = store.currentPage.fields[0].id

      expect(store.currentPage.fields).toHaveLength(1)
      expect(store.selectedElement?.id).toBe(elementoId)

      store.eliminarElemento(elementoId)

      expect(store.currentPage.fields).toHaveLength(0)
      expect(store.selectedElement).toBeNull()
    })

    it('Debería mover elemento a nueva posición', () => {
      const store = useDisenadorStore()
      const paletteItem = store.paletteItems.find((item: PaletteItem) => item.type === 'text')!

      store.agregarElemento(paletteItem, { x: 0, y: 0 })
      const elementoId = store.currentPage.fields[0].id

      store.moverElemento(elementoId, { x: 200, y: 150 })

      const elemento = store.currentPage.fields[0]
      expect(elemento.position.x).toBe(200)
      expect(elemento.position.y).toBe(150)
    })

    it('Debería redimensionar elemento correctamente', () => {
      const store = useDisenadorStore()
      const paletteItem = store.paletteItems.find((item: PaletteItem) => item.type === 'textarea')!

      store.agregarElemento(paletteItem)
      const elementoId = store.currentPage.fields[0].id

      store.redimensionarElemento(elementoId, { width: 400, height: 200 })

      const elemento = store.currentPage.fields[0]
      expect(elemento.size.width).toBe(400)
      expect(elemento.size.height).toBe(200)
    })
  })

  describe('Gestión de páginas', () => {
    it('Debería agregar nueva página', () => {
      const store = useDisenadorStore()

      expect(store.totalPages).toBe(1)

      store.agregarPagina()

      expect(store.totalPages).toBe(2)
      expect(store.currentForm.pages[1].title).toBe('Página 2')
      expect(store.currentForm.pages[1].fields).toHaveLength(0)
    })

    it('Debería cambiar entre páginas', () => {
      const store = useDisenadorStore()

      store.agregarPagina()
      expect(store.currentPageIndex).toBe(0)

      store.cambiarPagina(1)
      expect(store.currentPageIndex).toBe(1)

      store.cambiarPagina(0)
      expect(store.currentPageIndex).toBe(0)
    })
  })

  describe('Funciones de utilidad', () => {
    it('Debería generar IDs únicos', () => {
      const store = useDisenadorStore()

      const id1 = store.generarId()
      const id2 = store.generarId()
      const id3 = store.generarId()

      expect(id1).not.toBe(id2)
      expect(id2).not.toBe(id3)
      expect(id1).not.toBe(id3)

      expect(id1).toMatch(/^campo-\d+-[a-z0-9]+$/)
      expect(id2).toMatch(/^campo-\d+-[a-z0-9]+$/)
      expect(id3).toMatch(/^campo-\d+-[a-z0-9]+$/)
    })
  })
})
