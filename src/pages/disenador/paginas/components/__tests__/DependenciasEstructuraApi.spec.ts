import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { useAlmacenDisenador } from '../../../../../almacenes/UsarAlmacenDisenador'
import PreviewView from '../../../../../paginas/disenador/componentes/VistaPrevia.vue'
import type { EsquemaCampo } from '../../../../../interfaces/Campos'

// Mock global fetch
global.fetch = vi.fn()

describe('Dependencias - Detección automática de estructura API', () => {
  let almacen: ReturnType<typeof useAlmacenDisenador>
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    const pinia = createPinia()
    almacen = useAlmacenDisenador(pinia)
    mockFetch = vi.mocked(fetch)
    mockFetch.mockClear()
  })

  function crearFormularioConDependencias(): void {
    almacen.esquemaFormulario = {
      id: 'test-form',
      nombre: 'Test Form',
      paginas: [
        {
          id: 'page1',
          titulo: 'Página 1',
          campos: [
            {
              id: 'select-padre',
              tipo: 'seleccion',
              etiqueta: 'Categoría Padre',
              nombre: 'categoria_padre',
              metadatos: {
                opciones: [
                  { etiqueta: 'Categoría A', valor: 'catA' },
                  { etiqueta: 'Categoría B', valor: 'catB' }
                ]
              }
            } as EsquemaCampo,
            {
              id: 'select-hijo',
              tipo: 'seleccion',
              etiqueta: 'Subcategoría',
              nombre: 'subcategoria',
              metadatos: {
                dependeDe: ['categoria_padre'],
                apiUrl: '/api/subcategorias',
                parametroQuery: 'parent_id',
                opciones: []
              }
            } as EsquemaCampo
          ]
        }
      ],
      configuracion: { ajusteGrid: true, columnas: 12 }
    }
  }

  it('Debería detectar automáticamente claves "etiqueta" y "valor" en respuesta API', async () => {
    crearFormularioConDependencias()

    // Mock de respuesta API con estructura española
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { etiqueta: 'Opción A', valor: 'a' },
        { etiqueta: 'Opción B', valor: 'b' }
      ]
    })

    // Actualizar valor del padre
    almacen.actualizarValorCampo('categoria_padre', 'opt1')

    // Montar componente
    const wrapper = mount(PreviewView, {
      global: {
        plugins: [createPinia()]
      }
    })

    // Esperar a que se procesen las dependencias
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar que se hizo la llamada a la API
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('parent_id=opt1'),
      expect.any(Object)
    )

    // Verificar que se detectaron automáticamente las claves españolas
    const campoHijo = almacen.esquemaFormulario.paginas[0].campos.find((f: EsquemaCampo) => f.id === 'select-hijo') as EsquemaCampo
    expect(campoHijo.metadatos?.opciones).toEqual([
      { label: 'Opción A', value: 'a' },
      { label: 'Opción B', value: 'b' }
    ])

    wrapper.unmount()
  })

  it('Debería detectar automáticamente claves "nombre" y "id"', async () => {
    crearFormularioConDependencias()

    // Mock de respuesta API con estructura nombre/id
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { nombre: 'Opción A', id: 'a' },
        { nombre: 'Opción B', id: 'b' }
      ]
    })

    // Actualizar valor del padre
    almacen.actualizarValorCampo('categoria_padre', 'catA')

    // Montar componente
    const wrapper = mount(PreviewView, {
      global: {
        plugins: [createPinia()]
      }
    })

    // Esperar a que se procesen las dependencias
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar opciones con las claves detectadas
    const campoHijo = almacen.esquemaFormulario.paginas[0].campos.find((f: EsquemaCampo) => f.id === 'select-hijo') as EsquemaCampo
    expect(campoHijo.metadatos?.opciones).toEqual([
      { label: 'Opción A', value: 'a' },
      { label: 'Opción B', value: 'b' }
    ])

    wrapper.unmount()
  })

  it('Debería usar claves por defecto si no encuentra claves conocidas', async () => {
    crearFormularioConDependencias()

    // Mock de respuesta API con estructura desconocida
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { title: 'Item 1', code: 'i1' },
        { title: 'Item 2', code: 'i2' }
      ]
    })

    // Actualizar valor del padre
    almacen.actualizarValorCampo('categoria_padre', 'catA')

    // Montar componente
    const wrapper = mount(PreviewView, {
      global: {
        plugins: [createPinia()]
      }
    })

    // Esperar a que se procesen las dependencias
    await new Promise(resolve => setTimeout(resolve, 100))

    // Debería usar la primera clave como label y la segunda como value
    const campoHijo = almacen.esquemaFormulario.paginas[0].campos.find((f: EsquemaCampo) => f.id === 'select-hijo') as EsquemaCampo
    expect(campoHijo.metadatos?.opciones).toEqual([
      { label: 'Item 1', value: 'i1' },
      { label: 'Item 2', value: 'i2' }
    ])

    wrapper.unmount()
  })

  it('Debería manejar múltiples campos padre correctamente', async () => {
    // Crear formulario con múltiples dependencias
    almacen.esquemaFormulario = {
      id: 'test-form',
      nombre: 'Test Form',
      paginas: [
        {
          id: 'page1',
          titulo: 'Página 1',
          campos: [
            {
              id: 'categoria',
              tipo: 'seleccion',
              etiqueta: 'Categoría',
              nombre: 'categoria',
              metadatos: {
                opciones: [
                  { label: 'Categoría A', value: 'catA' }
                ]
              }
            } as EsquemaCampo,
            {
              id: 'subcategoria',
              tipo: 'seleccion',
              etiqueta: 'Subcategoría',
              nombre: 'subcategoria',
              metadatos: {
                dependeDe: ['categoria'],
                opciones: [
                  { label: 'Sub A', value: 'subA' }
                ]
              }
            } as EsquemaCampo,
            {
              id: 'producto',
              tipo: 'seleccion',
              etiqueta: 'Producto',
              nombre: 'producto',
              metadatos: {
                dependeDe: ['categoria', 'subcategoria'],
                apiUrl: '/api/productos',
                parametroQuery: 'categoria,subcategoria',
                opciones: []
              }
            } as EsquemaCampo
          ]
        }
      ],
      configuracion: { ajusteGrid: true, columnas: 12 }
    }

    // Mock de respuesta API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { etiqueta: 'Producto 1', valor: 'prod1' }
      ]
    })

    // Establecer valores para ambos padres
    almacen.valoresPorPagina[almacen.paginaActiva.id] = {
      categoria: 'catA',
      subcategoria: 'subA'
    }

    // Actualizar valor que dispara la dependencia
    almacen.actualizarValorCampo('categoria', 'catA')

    // Montar componente
    const wrapper = mount(PreviewView, {
      global: {
        plugins: [createPinia()]
      }
    })

    // Esperar a que se procesen las dependencias
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar que se llamó con los parámetros correctos
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('categoria=catA'),
      expect.any(Object)
    )

    wrapper.unmount()
  })
})
