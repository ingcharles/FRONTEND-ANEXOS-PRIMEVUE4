import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { useDesignerStore } from '@/stores/useDesignerStore'
import PreviewView from '../PreviewView.vue'
import type { FieldSchema } from '@/types/form-schema'

// Mock global fetch
global.fetch = vi.fn()

describe('Dependencias - Detección automática de estructura API', () => {
  let store: ReturnType<typeof useDesignerStore>

  beforeEach(() => {
    const pinia = createPinia()
    store = useDesignerStore(pinia)
    
    // Configurar esquema de formulario con campos dependientes
    store.formSchema.pages[0].fields = [
      {
        id: 'select-padre',
        type: 'select',
        label: 'Campo Padre',
        name: 'campo_padre',
        grid: { sm: 12, md: 6, lg: 4 },
        visible: true,
        required: false,
        meta: {
          options: [
            { label: 'Opción 1', value: 'opt1' },
            { label: 'Opción 2', value: 'opt2' }
          ]
        }
      },
      {
        id: 'select-hijo',
        type: 'select',
        label: 'Campo Hijo',
        name: 'campo_hijo',
        grid: { sm: 12, md: 6, lg: 4 },
        visible: true,
        required: false,
        meta: {
          optionsMode: 'api',
          optionsApi: {
            url: 'https://api.ejemplo.com/datos',
            method: 'GET',
            labelKey: 'label', // Valores por defecto que deberían detectarse automáticamente
            valueKey: 'value'
          },
          dependencia: {
            campoPadre: 'campo_padre',
            paramKey: 'parent_id',
            modoEnvio: 'query',
            limpiarAlCambiar: true,
            deshabilitarHastaValor: true
          }
        }
      }
    ]

    vi.clearAllMocks()
  })

  it('Debería detectar automáticamente claves "etiqueta" y "valor" en respuesta API', async () => {
    // Mock de respuesta API con estructura española
    const mockResponse = [
      { etiqueta: 'Año 2023', valor: 1 },
      { etiqueta: 'Año 2024', valor: 2 },
      { etiqueta: 'Año 2025', valor: 3 }
    ]

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })
    global.fetch = mockFetch

    const wrapper = mount(PreviewView, {
      global: {
        plugins: [createPinia()],
        provide: {
          store
        }
      }
    })

    // Establecer valor en el campo padre para activar la dependencia
    const valores = store.obtenerValoresPagina(store.paginaActiva.id)
    valores.campo_padre = 'opt1'

    // Esperar a que se procese la carga de dependencias
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar que se hizo la llamada a la API
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('parent_id=opt1'),
      expect.any(Object)
    )

    // Verificar que el campo hijo tiene las opciones correctas con las claves detectadas
    const campoHijo = store.formSchema.pages[0].fields.find((f: FieldSchema) => f.id === 'select-hijo') as FieldSchema
    expect(campoHijo.meta?.options).toEqual([
      { label: 'Año 2023', value: 1 },
      { label: 'Año 2024', value: 2 },
      { label: 'Año 2025', value: 3 }
    ])
  })

  it('Debería detectar automáticamente claves "nombre" y "id"', async () => {
    // Mock de respuesta API con estructura alternativa
    const mockResponse = [
      { nombre: 'Opción A', id: 'a' },
      { nombre: 'Opción B', id: 'b' }
    ]

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })
    global.fetch = mockFetch

    const wrapper = mount(PreviewView, {
      global: {
        plugins: [createPinia()],
        provide: {
          store
        }
      }
    })

    // Establecer valor en el campo padre
    const valores2 = store.obtenerValoresPagina(store.paginaActiva.id)
    valores2.campo_padre = 'opt2'

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar opciones con las claves detectadas
    const campoHijo = store.formSchema.pages[0].fields.find((f: FieldSchema) => f.id === 'select-hijo') as FieldSchema
    expect(campoHijo.meta?.options).toEqual([
      { label: 'Opción A', value: 'a' },
      { label: 'Opción B', value: 'b' }
    ])
  })

  it('Debería usar claves por defecto si no encuentra claves conocidas', async () => {
    // Mock de respuesta API con claves no estándar
    const mockResponse = [
      { texto_custom: 'Item 1', codigo_custom: 'i1' },
      { texto_custom: 'Item 2', codigo_custom: 'i2' }
    ]

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })
    global.fetch = mockFetch

    const wrapper = mount(PreviewView, {
      global: {
        plugins: [createPinia()],
        provide: {
          store
        }
      }
    })

    const valores3 = store.obtenerValoresPagina(store.paginaActiva.id)
    valores3.campo_padre = 'opt1'

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Debería usar la primera clave como label y la segunda como value
    const campoHijo = store.formSchema.pages[0].fields.find((f: FieldSchema) => f.id === 'select-hijo') as FieldSchema
    expect(campoHijo.meta?.options).toEqual([
      { label: 'Item 1', value: 'i1' },
      { label: 'Item 2', value: 'i2' }
    ])
  })

  it('Debería manejar múltiples campos padre correctamente', async () => {
    // Agregar un segundo campo padre
    store.formSchema.pages[0].fields.unshift({
      id: 'select-padre2',
      type: 'select',
      label: 'Campo Padre 2',
      name: 'campo_padre2',
      grid: { sm: 12, md: 6, lg: 4 },
      visible: true,
      required: false,
      meta: {
        options: [
          { label: 'Cat A', value: 'catA' },
          { label: 'Cat B', value: 'catB' }
        ]
      }
    })

    // Actualizar dependencia para incluir múltiples padres
    const campoHijo = store.formSchema.pages[0].fields.find((f: FieldSchema) => f.id === 'select-hijo') as FieldSchema
    if (campoHijo.meta?.dependencia) {
      campoHijo.meta.dependencia.campoPadre = 'campo_padre2,campo_padre'
      campoHijo.meta.dependencia.paramKey = 'categoria,parent_id'
    }

    const mockResponse = [
      { etiqueta: 'Resultado combinado', valor: 'combo1' }
    ]

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })
    global.fetch = mockFetch

    const wrapper = mount(PreviewView, {
      global: {
        plugins: [createPinia()],
        provide: {
          store
        }
      }
    })

    // Establecer valores en ambos campos padre
    const valores4 = store.obtenerValoresPagina(store.paginaActiva.id)
    valores4.campo_padre2 = 'catA'
    valores4.campo_padre = 'opt1'

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar que se llamó con los parámetros correctos
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('categoria=catA'),
      expect.any(Object)
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('parent_id=opt1'),
      expect.any(Object)
    )
  })
})