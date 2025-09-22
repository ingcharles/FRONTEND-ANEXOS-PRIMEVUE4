import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import PreviewView from '../PreviewView.vue'
import { useDesignerStore } from '@/stores/useDesignerStore'
import type { FieldSchema } from '@/types/form-schema'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

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
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    // Limpiar el formulario existente y agregar campo select independiente
    store.formSchema.pages[0].fields = [{
      id: 'year',
      type: 'string',
      name: 'year',
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
    } as FieldSchema]

    mount(PreviewView)
    await nextTick()

    // Verificar que se hizo la llamada a la API
    expect(mockFetch).toHaveBeenCalledWith(
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
    const campo = store.formSchema.pages[0].fields.find((f: FieldSchema) => f.id === 'year')
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
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    // Configurar campo select independiente SIN especificar keys
    store.formSchema.pages[0].fields = [{
      id: 'option',
      type: 'string',
      name: 'option',
      meta: {
        component: 'PrimeSelect',
        optionsMode: 'api',
        optionsApi: {
          url: 'http://localhost:3000/api/options',
          method: 'GET'
        }
      }
    } as FieldSchema]

    mount(PreviewView)
    await nextTick()

    // Dar tiempo para que se procese la respuesta
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar que se detectó automáticamente la estructura española
    const campo = store.formSchema.pages[0].fields.find((f: FieldSchema) => f.id === 'option')
    expect(campo?.meta?.options).toEqual([
      { label: 'Opción A', value: 'a' },
      { label: 'Opción B', value: 'b' }
    ])
  })

  it('Debería manejar errores de API correctamente', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    store.formSchema.pages[0].fields = [{
      id: 'errorField',
      type: 'string',
      name: 'errorField',
      meta: {
        component: 'PrimeSelect',
        optionsMode: 'api',
        optionsApi: {
          url: 'http://localhost:3000/api/error'
        }
      }
    } as FieldSchema]

    mount(PreviewView)
    await nextTick()

    // Dar tiempo para que se procese el error
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar que las opciones se configuran como array vacío
    const campo = store.formSchema.pages[0].fields.find((f: FieldSchema) => f.id === 'errorField')
    expect(campo?.meta?.options).toEqual([])
  })
})