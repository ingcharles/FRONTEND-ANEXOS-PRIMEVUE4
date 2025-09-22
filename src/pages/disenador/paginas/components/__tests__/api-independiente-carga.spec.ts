import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import PreviewView from '../PreviewView.vue'
import { useDesignerStore } from '@/stores/useDesignerStore'

// Mock global fetch
global.fetch = vi.fn()

describe('Carga independiente de API con estructura española', () => {
  let store: ReturnType<typeof useDesignerStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useDesignerStore()
    vi.clearAllMocks()
  })

  it('Debería cargar opciones para select independiente con estructura española', async () => {
    // Mock de respuesta API con estructura española
    const mockResponse = [
      { etiqueta: 'Año 2023', valor: 2023 },
      { etiqueta: 'Año 2024', valor: 2024 }
    ]
    
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    // Configurar página con select independiente
    const pagina = {
      id: 'test-page',
      titulo: 'Test',
      esquema: {
        type: 'object',
        properties: {
          year: {
            type: 'string',
            meta: {
              component: 'PrimeSelect',
              optionsMode: 'api',
              optionsApi: {
                url: 'http://localhost:3000/api/years',
                method: 'GET',
                dataPath: '',
                labelKey: 'etiqueta',
                valueKey: 'valor'
              }
            }
          }
        }
      }
    }

    store.agregarPagina(pagina)
    store.establecerPaginaActual(pagina.id)

    const wrapper = mount(PreviewView)
    await nextTick()

    // Verificar que se hizo la llamada a la API
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/years',
      {
        method: 'GET',
        headers: {},
        body: undefined
      }
    )

    // Dar tiempo para que se procese la respuesta
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar que las opciones se configuraron correctamente
    const campo = store.obtenerCampoPorId('test-page', 'year')
    expect(campo?.meta?.options).toEqual([
      { label: 'Año 2023', value: 2023 },
      { label: 'Año 2024', value: 2024 }
    ])
  })

  it('Debería detectar automáticamente estructura española cuando no se especifica labelKey/valueKey', async () => {
    // Mock de respuesta API con estructura española
    const mockResponse = [
      { etiqueta: 'Opción A', valor: 'a' },
      { etiqueta: 'Opción B', valor: 'b' }
    ]
    
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    // Configurar página con select independiente SIN especificar keys
    const pagina = {
      id: 'test-page-auto',
      titulo: 'Test Auto',
      esquema: {
        type: 'object',
        properties: {
          option: {
            type: 'string',
            meta: {
              component: 'PrimeSelect',
              optionsMode: 'api',
              optionsApi: {
                url: 'http://localhost:3000/api/options',
                method: 'GET'
              }
            }
          }
        }
      }
    }

    store.agregarPagina(pagina)
    store.establecerPaginaActual(pagina.id)

    const wrapper = mount(PreviewView)
    await nextTick()

    // Dar tiempo para que se procese la respuesta
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar que se detectó automáticamente la estructura española
    const campo = store.obtenerCampoPorId('test-page-auto', 'option')
    expect(campo?.meta?.options).toEqual([
      { label: 'Opción A', value: 'a' },
      { label: 'Opción B', value: 'b' }
    ])
  })

  it('Debería manejar errores de API correctamente', async () => {
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

    const pagina = {
      id: 'test-page-error',
      titulo: 'Test Error',
      esquema: {
        type: 'object',
        properties: {
          errorField: {
            type: 'string',
            meta: {
              component: 'PrimeSelect',
              optionsMode: 'api',
              optionsApi: {
                url: 'http://localhost:3000/api/error'
              }
            }
          }
        }
      }
    }

    store.agregarPagina(pagina)
    store.establecerPaginaActual(pagina.id)

    const wrapper = mount(PreviewView)
    await nextTick()

    // Dar tiempo para que se procese el error
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar que las opciones se configuran como array vacío
    const campo = store.obtenerCampoPorId('test-page-error', 'errorField')
    expect(campo?.meta?.options).toEqual([])
  })
})