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

  it('Deveria construir URL Path con múltiples placeholders y normalizar path', async () => {
    const json = [ { label: 'Lima', value: 'LIM' } ]
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(json) })
    ;(globalThis as unknown as { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> }).fetch = mockFetch as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

    const store = useDesignerStore()
    store.formSchema.pages = [
      {
        id: 'p1',
        title: 'P1',
        fields: [
          { id: 'f1', type: 'select', name: 'pais', label: 'País', grid: { sm: 12 }, meta: { optionsMode: 'manual', options: [ { label: 'Perú', value: 'PE' } ] } },
          { id: 'f2', type: 'select', name: 'region', label: 'Región', grid: { sm: 12 }, meta: { optionsMode: 'manual', options: [ { label: 'Costa', value: 'costa norte' } ] } },
          { id: 'f3', type: 'select', name: 'ciudad', label: 'Ciudad', grid: { sm: 12 }, meta: { optionsMode: 'api', optionsApi: { url: 'http://api.local//paises/{pais}//regiones/{region}/ciudades', method: 'GET', labelKey: 'label', valueKey: 'value' }, dependencia: { campoPadre: 'pais,region', modoEnvio: 'path', limpiarAlCambiar: true, deshabilitarHastaValor: true } } },
        ],
      },
    ]
    store.activePageIndex = 0

    mount(PreviewView, { global: { stubs: { PrimePanel: true } } })

    const valores = store.obtenerValoresPagina('p1') as Record<string, unknown>
    valores['pais'] = 'PE'
    valores['region'] = 'costa norte'

    await new Promise(r => setTimeout(r))

    expect(mockFetch).toHaveBeenCalled()
    const llamada = mockFetch.mock.calls[0][0] as string
    // Debe reemplazar ambos placeholders y normalizar dobles barras en pathname
    expect(llamada).toContain('/paises/PE/regiones/costa%20norte/ciudades')
    expect(llamada.includes('?')).toBe(false)
  })

  it('Deveria concatenar segmentos en Path sin placeholders con múltiples padres', async () => {
    const json = [ { label: 'Cusco', value: 'CUZ' } ]
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(json) })
    ;(globalThis as unknown as { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> }).fetch = mockFetch as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

    const store = useDesignerStore()
    store.formSchema.pages = [
      {
        id: 'p1',
        title: 'P1',
        fields: [
          { id: 'f1', type: 'select', name: 'pais', label: 'País', grid: { sm: 12 }, meta: { optionsMode: 'manual', options: [ { label: 'Perú', value: 'PE' } ] } },
          { id: 'f2', type: 'select', name: 'region', label: 'Región', grid: { sm: 12 }, meta: { optionsMode: 'manual', options: [ { label: 'Sierra Sur', value: 'sierra sur' } ] } },
          { id: 'f3', type: 'select', name: 'ciudad', label: 'Ciudad', grid: { sm: 12 }, meta: { optionsMode: 'api', optionsApi: { url: 'http://api.local/base/', method: 'GET', labelKey: 'label', valueKey: 'value' }, dependencia: { campoPadre: 'pais,region', modoEnvio: 'path', limpiarAlCambiar: true, deshabilitarHastaValor: true } } },
        ],
      },
    ]
    store.activePageIndex = 0

    mount(PreviewView, { global: { stubs: { PrimePanel: true } } })

    const vals = store.obtenerValoresPagina('p1') as Record<string, unknown>
    vals['pais'] = 'PE'
    vals['region'] = 'sierra sur'

    await new Promise(r => setTimeout(r))

    expect(mockFetch).toHaveBeenCalled()
    const llamada = mockFetch.mock.calls[0][0] as string
    expect(llamada).toContain('http://api.local/base/PE/sierra%20sur')
    expect(llamada.includes('?')).toBe(false)
  })

  it('Deveria mapear múltiples padres a múltiples keys en Query', async () => {
    const json = [ { label: 'Ciudad', value: 'C' } ]
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(json) })
    ;(globalThis as unknown as { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> }).fetch = mockFetch as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

    const store = useDesignerStore()
    store.formSchema.pages = [
      {
        id: 'p1',
        title: 'P1',
        fields: [
          { id: 'f1', type: 'select', name: 'pais', label: 'País', grid: { sm: 12 }, meta: { optionsMode: 'manual', options: [ { label: 'Perú', value: 'PE' } ] } },
          { id: 'f2', type: 'select', name: 'region', label: 'Región', grid: { sm: 12 }, meta: { optionsMode: 'manual', options: [ { label: 'Sierra Sur', value: 'sierra sur' } ] } },
          { id: 'f3', type: 'select', name: 'ciudad', label: 'Ciudad', grid: { sm: 12 }, meta: { optionsMode: 'api', optionsApi: { url: 'http://api.local/ciudades', method: 'GET', labelKey: 'label', valueKey: 'value' }, dependencia: { campoPadre: 'pais,region', paramKey: 'country,reg', modoEnvio: 'query', limpiarAlCambiar: true, deshabilitarHastaValor: true } } },
        ],
      },
    ]
    store.activePageIndex = 0

    mount(PreviewView, { global: { stubs: { PrimePanel: true } } })

    const vals2 = store.obtenerValoresPagina('p1') as Record<string, unknown>
    vals2['pais'] = 'PE'
    vals2['region'] = 'sierra sur'

    await new Promise(r => setTimeout(r))

    expect(mockFetch).toHaveBeenCalled()
    const llamada = mockFetch.mock.calls[0][0] as string
    expect(llamada).toContain('country=PE')
    // URLSearchParams puede codificar espacios como '+' o '%20'
    expect(/reg=sierra(?:%20|\+)sur/.test(llamada)).toBe(true)
  })
})
