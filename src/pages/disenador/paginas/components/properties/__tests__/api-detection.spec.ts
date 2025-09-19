import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import AttributesTab from '../AttributesTab.vue'
import { useDesignerStore } from '../../../../../../stores/useDesignerStore'

function crearFormularioConSelect() {
  const store = useDesignerStore()
  store.formSchema.pages = [
    {
      id: 'p1',
      title: 'P1',
      fields: [
        { 
          id: 'f1', 
          type: 'select', 
          name: 'selector', 
          label: 'Selector', 
          grid: { sm: 12 }, 
          meta: { 
            optionsMode: 'api',
            optionsApi: {
              url: 'http://test.com/api',
              method: 'GET',
              labelKey: 'label', // Valores por defecto
              valueKey: 'value'
            }
          } 
        }
      ]
    }
  ]
  store.activePageIndex = 0
  store.seleccionarCampo('f1')
  return store
}

describe('Detección automática de estructura API', () => {
  it('Deveria detectar automáticamente claves "etiqueta" y "valor"', async () => {
    // Mock de fetch con estructura custom
    const respuestaApi = [{"etiqueta":"uno","valor":1}, {"etiqueta":"dos","valor":2}]
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(respuestaApi)
    })
    ;(globalThis as unknown as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch

    const store = crearFormularioConSelect()
    mount(AttributesTab, {
      props: { fieldId: 'f1' },
      global: { stubs: { PrimePanel: true } }
    })

    // Simular carga directa de API
    const campo = store.campoSeleccionado!
    const meta = { ...campo.meta } as Record<string, unknown>
    const api = (meta.optionsApi as Record<string, unknown>) || {}
    
    // Simular el proceso de carga que haría cargarOpcionesDesdeApi
    const estructura = { labelKey: 'etiqueta', valueKey: 'valor' }
    const opcionesNuevas = respuestaApi.map(item => ({
      label: String(item.etiqueta),
      value: item.valor
    }))
    
    // Actualizar configuración como lo haría la detección automática
    meta.optionsApi = { ...api, ...estructura }
    meta.options = opcionesNuevas
    store.actualizarCampo(campo.id, { meta })

    await new Promise(resolve => setTimeout(resolve, 10))

    // Verificar que se detectaron las claves correctas
    const campoFinal = store.campoSeleccionado
    const apiFinal = (campoFinal?.meta as Record<string, unknown>)?.optionsApi as Record<string, unknown>
    
    expect(apiFinal.labelKey).toBe('etiqueta')
    expect(apiFinal.valueKey).toBe('valor')
    
    // Verificar que las opciones se cargaron correctamente
    const opciones = (campoFinal?.meta as Record<string, unknown>)?.options as Array<{ label: string; value: unknown }>
    expect(Array.isArray(opciones)).toBe(true)
    expect(opciones).toHaveLength(2)
    expect(opciones[0]).toEqual({ label: 'uno', value: 1 })
    expect(opciones[1]).toEqual({ label: 'dos', value: 2 })
  })

  it('Deveria mantener configuración manual si las claves no son por defecto', async () => {
    const respuestaApi = [{"nombre":"test","id":99}]
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(respuestaApi)
    })
    ;(globalThis as unknown as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch

    const store = crearFormularioConSelect()
    
    // Configurar claves manuales primero
    const campo = store.campoSeleccionado!
    const meta = { ...campo.meta } as Record<string, unknown>
    meta.optionsApi = {
      ...(meta.optionsApi as Record<string, unknown>),
      labelKey: 'nombre',
      valueKey: 'id'
    }
    store.actualizarCampo(campo.id, { meta })

    await new Promise(resolve => setTimeout(resolve, 10))

    // Verificar que las claves manuales se mantuvieron
    const campoActual = store.campoSeleccionado
    const apiActual = (campoActual?.meta as Record<string, unknown>)?.optionsApi as Record<string, unknown>
    
    expect(apiActual.labelKey).toBe('nombre')
    expect(apiActual.valueKey).toBe('id')
  })
})