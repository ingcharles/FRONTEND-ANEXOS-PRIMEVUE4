import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import PreviewView from '../PreviewView.vue'
import { useDesignerStore } from '../../../../../stores/useDesignerStore'

function crearFormulario() {
  const store = useDesignerStore()
  store.formSchema.pages = [
    {
      id: 'p1',
      title: 'P1',
      fields: [
        { id: 'f1', type: 'select', name: 'pais', label: 'País', grid: { sm: 12 }, meta: { optionsMode: 'manual', options: [ { label: 'Colombia', value: 'CO' }, { label: 'Perú', value: 'PE' } ] } },
        { id: 'f2', type: 'select', name: 'ciudad', label: 'Ciudad', grid: { sm: 12 }, meta: { optionsMode: 'api', optionsApi: { url: '/api/opciones.json', method: 'GET', labelKey: 'label', valueKey: 'value' }, dependencia: { campoPadre: 'pais', paramKey: 'country', modoEnvio: 'query', limpiarAlCambiar: true, deshabilitarHastaValor: true } } },
      ],
    },
  ]
  store.activePageIndex = 0
  return store
}

describe('Cascada de Selects', () => {
  it('Deveria cargar opciones del hijo cuando cambia el padre (query)', async () => {
    const json = [ { label: 'Bogotá', value: 'BOG' }, { label: 'Medellín', value: 'MED' } ]
  const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(json) })
  ;(globalThis as unknown as { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> }).fetch = mockFetch as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

  const store = crearFormulario()
  mount(PreviewView, { global: { stubs: { PrimePanel: true } } })

    // Establecer valor del padre para disparar watcher
  const valores = store.obtenerValoresPagina('p1') as Record<string, unknown>
  valores['pais'] = 'CO'

    await new Promise(r => setTimeout(r))

  const hijo = store.formSchema.pages[0].fields[1]
  const opciones = ((hijo.meta as Record<string, unknown>)?.options as Array<{ label: string; value: unknown }> | undefined) || []
    expect(opciones.length).toBe(2)
    expect(opciones[0].label).toBe('Bogotá')

    // Asegura que se llamó fetch con query country=CO
    expect(mockFetch).toHaveBeenCalled()
    const llamada = mockFetch.mock.calls[0][0] as string
    expect(llamada.includes('country=CO')).toBe(true)
  })

  it('Deveria construir URL con path cuando no hay placeholder', async () => {
    const json = [ { label: 'Item A', value: 'A' } ]
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(json) })
    ;(globalThis as unknown as { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> }).fetch = mockFetch as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

    const store = useDesignerStore()
    store.formSchema.pages = [
      {
        id: 'p1',
        title: 'P1',
        fields: [
          { id: 'f1', type: 'select', name: 'padre', label: 'Padre', grid: { sm: 12 }, meta: { optionsMode: 'manual', options: [ { label: 'Item 1', value: 'item 1' } ] } },
          { id: 'f2', type: 'select', name: 'hijo', label: 'Hijo', grid: { sm: 12 }, meta: { optionsMode: 'api', optionsApi: { url: 'http://localhost:8086/xxx/', method: 'GET', labelKey: 'label', valueKey: 'value' }, dependencia: { campoPadre: 'padre', paramKey: 'valor', modoEnvio: 'path', limpiarAlCambiar: true, deshabilitarHastaValor: true } } },
        ],
      },
    ]
    store.activePageIndex = 0

    mount(PreviewView, { global: { stubs: { PrimePanel: true } } })

    const valores = store.obtenerValoresPagina('p1') as Record<string, unknown>
    valores['padre'] = 'item 1'

    await new Promise(r => setTimeout(r))

    expect(mockFetch).toHaveBeenCalled()
    const llamada = mockFetch.mock.calls[0][0] as string
    expect(llamada).toContain('http://localhost:8086/xxx/')
    expect(llamada).toContain('item%201')
    // No debe tener query param duplicado
    expect(llamada.includes('?')).toBe(false)
  })

  it('Deveria funcionar Path sin paramKey (concatena segmento)', async () => {
    const json = [ { label: 'X', value: 'x' } ]
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(json) })
  ;(globalThis as unknown as { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> }).fetch = mockFetch as unknown as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

    const store = useDesignerStore()
    store.formSchema.pages = [
      {
        id: 'p1',
        title: 'P1',
        fields: [
          { id: 'f1', type: 'select', name: 'padre', label: 'Padre', grid: { sm: 12 }, meta: { optionsMode: 'manual', options: [ { label: 'Item 1', value: 'item 1' } ] } },
          { id: 'f2', type: 'select', name: 'hijo', label: 'Hijo', grid: { sm: 12 }, meta: { optionsMode: 'api', optionsApi: { url: 'http://localhost:8086/xxx/', method: 'GET', labelKey: 'label', valueKey: 'value' }, dependencia: { campoPadre: 'padre', modoEnvio: 'path', limpiarAlCambiar: true, deshabilitarHastaValor: true } } },
        ],
      },
    ]
    store.activePageIndex = 0

    mount(PreviewView, { global: { stubs: { PrimePanel: true } } })
    const valores = store.obtenerValoresPagina('p1') as Record<string, unknown>
    valores['padre'] = 'item 1'
    await new Promise(r => setTimeout(r))

    expect(mockFetch).toHaveBeenCalled()
    const llamada = mockFetch.mock.calls[0][0] as string
    expect(llamada).toContain('http://localhost:8086/xxx/')
    expect(llamada).toContain('item%201')
  })
})
