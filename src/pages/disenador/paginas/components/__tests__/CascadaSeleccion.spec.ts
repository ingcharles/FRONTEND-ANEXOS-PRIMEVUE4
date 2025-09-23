import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import VistaPrevia from '../../../../../paginas/disenador/componentes/VistaPrevia.vue'
import { useAlmacenDisenador } from '../../../../../almacenes/UsarAlmacenDisenador'

function crearFormulario() {
  const almacen = useAlmacenDisenador()
  almacen.esquemaFormulario.paginas = [
    {
      id: 'p1',
      titulo: 'P1',
      campos: [
        { id: 'f1', tipo: 'seleccion', nombre: 'pais', etiqueta: 'País', grid: { sm: 12 }, metadatos: { modoOpciones: 'manual', opciones: [ { etiqueta: 'Colombia', valor: 'CO' }, { etiqueta: 'Perú', valor: 'PE' } ] } },
        { id: 'f2', tipo: 'seleccion', nombre: 'ciudad', etiqueta: 'Ciudad', grid: { sm: 12 }, metadatos: { modoOpciones: 'api', apiOpciones: { url: '/api/opciones.json', metodo: 'GET', claveEtiqueta: 'etiqueta', claveValor: 'valor' }, dependencia: { campoPadre: 'pais', claveParametro: 'country', modoEnvio: 'query', limpiarAlCambiar: true, deshabilitarHastaValor: true } } },
      ],
    },
  ]
  almacen.indicePaginaActiva = 0
  return almacen
}

describe('Cascada de Selects', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Debería cargar opciones del hijo cuando cambia el padre (query)', async () => {
    const json = [ { etiqueta: 'Bogotá', valor: 'BOG' }, { etiqueta: 'Medellín', valor: 'MED' } ]
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(json) })
    ;(globalThis as unknown as { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> }).fetch = mockFetch as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

    const almacen = crearFormulario()
    const wrapper = mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })

    // Establecer valor del padre para disparar watcher
    const valores = almacen.obtenerValoresPagina('p1') as Record<string, unknown>
    valores['pais'] = 'CO'
    almacen.actualizarValorCampo('p1', 'pais', 'CO')

    await new Promise(r => setTimeout(r, 100))

    // Verificar que fetch fue llamado con query param
    expect(mockFetch).toHaveBeenCalledWith('/api/opciones.json?country=CO', { method: 'GET' })
  })

  it('Debería cargar opciones del hijo cuando cambia el padre (body)', async () => {
    const almacen = crearFormulario()
    const field2 = almacen.esquemaFormulario.paginas[0].campos[1]
    field2.metadatos!.dependencia!.modoEnvio = 'body'

    const json = [ { etiqueta: 'Lima', valor: 'LIM' }, { etiqueta: 'Arequipa', valor: 'AQP' } ]
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(json) })
    ;(globalThis as unknown as { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> }).fetch = mockFetch as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })

    const valores = almacen.obtenerValoresPagina('p1') as Record<string, unknown>
    valores['pais'] = 'PE'

    await new Promise(r => setTimeout(r))

    expect(mockFetch).toHaveBeenCalledWith('/api/opciones.json', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'PE' })
    })
  })

  it('Debería limpiar el valor del hijo al cambiar el padre', async () => {
    const almacen = crearFormulario()
    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })

    const valores = almacen.obtenerValoresPagina('p1') as Record<string, unknown>
    valores['ciudad'] = 'BOG'
    expect(valores['ciudad']).toBe('BOG')

    // Cambiar padre debería limpiar hijo
    valores['pais'] = 'PE'
    await new Promise(r => setTimeout(r))

    expect(valores['ciudad']).toBe('')
  })

  it('Debería deshabilitar el hijo hasta que el padre tenga valor', () => {
    const almacen = crearFormulario()
    const wrapper = mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })

    // Buscar el select de ciudad
    const ciudadField = wrapper.find('[data-field-name="ciudad"]')
    const ciudadDropdown = ciudadField.find('.p-dropdown')

    // Debería estar deshabilitado sin valor en padre
    expect(ciudadDropdown.attributes('data-p-disabled')).toBe('true')

    // Al establecer valor en padre, debería habilitarse
    const valores = almacen.obtenerValoresPagina('p1') as Record<string, unknown>
    valores['pais'] = 'CO'

    wrapper.vm.$nextTick().then(() => {
      expect(ciudadDropdown.attributes('data-p-disabled')).toBe('false')
    })
  })

  it('Debería funcionar con múltiples padres', async () => {
    const almacen = useAlmacenDisenador()
    almacen.esquemaFormulario.paginas = [
      {
        id: 'p1',
        titulo: 'P1',
        campos: [
          { id: 'f1', tipo: 'seleccion', nombre: 'pais', etiqueta: 'País', grid: { sm: 12 }, metadatos: { modoOpciones: 'manual', opciones: [ { etiqueta: 'Colombia', valor: 'CO' } ] } },
          { id: 'f2', tipo: 'seleccion', nombre: 'estado', etiqueta: 'Estado', grid: { sm: 12 }, metadatos: { modoOpciones: 'manual', opciones: [ { etiqueta: 'Cundinamarca', valor: 'CUN' } ] } },
          { id: 'f3', tipo: 'seleccion', nombre: 'ciudad', etiqueta: 'Ciudad', grid: { sm: 12 }, metadatos: { modoOpciones: 'api', apiOpciones: { url: '/api/ciudades.json', metodo: 'GET', claveEtiqueta: 'etiqueta', claveValor: 'valor' }, dependencia: { campoPadre: 'pais,estado', claveParametro: 'pais,estado', modoEnvio: 'query', limpiarAlCambiar: true, deshabilitarHastaValor: true } } },
        ],
      },
    ]

    const json = [ { etiqueta: 'Bogotá', valor: 'BOG' } ]
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(json) })
    ;(globalThis as unknown as { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> }).fetch = mockFetch as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })

    const valores = almacen.obtenerValoresPagina('p1') as Record<string, unknown>
    valores['pais'] = 'CO'
    valores['estado'] = 'CUN'

    await new Promise(r => setTimeout(r))

    expect(mockFetch).toHaveBeenCalledWith('/api/ciudades.json?pais=CO&estado=CUN', { method: 'GET' })
  })

  it('Debería usar URLs dinámicas con parámetros', async () => {
    const almacen = crearFormulario()
    const field2 = almacen.esquemaFormulario.paginas[0].campos[1]
    field2.metadatos!.apiOpciones!.url = '/api/ciudades/{country}'
    field2.metadatos!.dependencia!.modoEnvio = 'url'

    const json = [ { etiqueta: 'Bogotá', valor: 'BOG' } ]
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(json) })
    ;(globalThis as unknown as { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> }).fetch = mockFetch as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })

    const valores = almacen.obtenerValoresPagina('p1') as Record<string, unknown>
    valores['pais'] = 'CO'

    await new Promise(r => setTimeout(r))

    expect(mockFetch).toHaveBeenCalledWith('/api/ciudades/CO', { method: 'GET' })
  })

  it('Debería manejar errores de API graciosamente', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    ;(globalThis as unknown as { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> }).fetch = mockFetch as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

    const almacen = crearFormulario()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })

    const valores = almacen.obtenerValoresPagina('p1') as Record<string, unknown>
    valores['pais'] = 'CO'

    await new Promise(r => setTimeout(r))

    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })

  it('Debería funcionar sin configuración de dependencia', () => {
    const almacen = useAlmacenDisenador()
    almacen.esquemaFormulario.paginas = [
      {
        id: 'p1',
        titulo: 'P1',
        campos: [
          { id: 'f1', tipo: 'seleccion', nombre: 'simple', etiqueta: 'Simple', grid: { sm: 12 }, metadatos: { modoOpciones: 'manual', opciones: [ { etiqueta: 'Opción 1', valor: '1' } ] } },
        ],
      },
    ]

    expect(() => {
      mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })
    }).not.toThrow()
  })
})
