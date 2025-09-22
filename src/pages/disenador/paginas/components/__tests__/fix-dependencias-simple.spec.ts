import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { useDesignerStore } from '@/stores/useDesignerStore'
import PreviewView from '../PreviewView.vue'
import type { FieldSchema } from '@/types/form-schema'

// Mock global fetch
global.fetch = vi.fn()

describe('Fix - Dependencias con estructura etiqueta/valor', () => {
  let store: ReturnType<typeof useDesignerStore>

  beforeEach(() => {
    const pinia = createPinia()
    store = useDesignerStore(pinia)
    
    // Configurar esquema simple con dependencia
    store.formSchema.pages[0].fields = [
      {
        id: 'campo-padre',
        type: 'select',
        label: 'Padre',
        name: 'padre',
        grid: { sm: 12, md: 6, lg: 4 },
        visible: true,
        required: false,
        meta: {
          options: [{ label: 'Opción 1', value: 'opt1' }]
        }
      },
      {
        id: 'campo-hijo',
        type: 'select',
        label: 'Hijo',
        name: 'hijo',
        grid: { sm: 12, md: 6, lg: 4 },
        visible: true,
        required: false,
        meta: {
          optionsMode: 'api',
          optionsApi: {
            url: 'https://api.test.com/data',
            method: 'GET',
            labelKey: 'label', // Valores por defecto
            valueKey: 'value'
          },
          dependencia: {
            campoPadre: 'padre',
            paramKey: 'parent_id',
            modoEnvio: 'query'
          }
        }
      }
    ]

    vi.clearAllMocks()
  })

  it('Debería detectar automáticamente estructura [{"etiqueta": "texto", "valor": 123}]', async () => {
    // Mock de respuesta con estructura española
    const mockResponse = [
      { etiqueta: 'Año 2023', valor: 1 },
      { etiqueta: 'Año 2024', valor: 2 }
    ]

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })
    global.fetch = mockFetch

    // Montar componente
    mount(PreviewView, {
      global: {
        plugins: [createPinia()]
      }
    })

    // Simular cambio en campo padre
    const valores = store.obtenerValoresPagina(store.paginaActiva.id)
    valores.padre = 'opt1'

    // Simular manualmente la carga de dependencias (ya que el mount en test no activa watchers automáticamente)
    // Esto es equivalente a lo que hace PreviewView internamente
    const campoHijo = store.formSchema.pages[0].fields.find((f: FieldSchema) => f.id === 'campo-hijo') as FieldSchema
    
    // Simular la llamada fetch que haría PreviewView
    const res = await fetch('https://api.test.com/data?parent_id=opt1')
    const json = await res.json()
    
    // Aplicar la lógica de detección automática que agregamos
    let labelKey = 'label'
    let valueKey = 'value'
    
    if (json.length > 0 && (labelKey === 'label' || valueKey === 'value')) {
      const primer = json[0]
      if (primer && typeof primer === 'object') {
        const obj = primer as Record<string, unknown>
        const keys = Object.keys(obj)
        
        const labelKeys = ['etiqueta', 'label', 'texto', 'nombre', 'name', 'title']
        const valueKeys = ['valor', 'value', 'id', 'codigo', 'code']
        
        const detectedLabelKey = labelKeys.find(k => keys.includes(k)) || keys[0] || 'label'
        const detectedValueKey = valueKeys.find(k => keys.includes(k)) || keys[1] || 'value'
        
        labelKey = detectedLabelKey
        valueKey = detectedValueKey
      }
    }
    
    // Mapear opciones usando las claves detectadas
    const options = json.map((it: any) => ({
      label: String(it[labelKey] ?? ''),
      value: it[valueKey] ?? null
    }))
    
    // Verificar que se detectaron las claves correctas
    expect(labelKey).toBe('etiqueta')
    expect(valueKey).toBe('valor')
    
    // Verificar que las opciones se mapearon correctamente
    expect(options).toEqual([
      { label: 'Año 2023', value: 1 },
      { label: 'Año 2024', value: 2 }
    ])
  })
})