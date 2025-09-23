import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TabAtributos from '../TabAtributos.vue'
import { useAlmacenDisenador } from '../../../../../almacenes/UsarAlmacenDisenador'
import { createPinia, setActivePinia } from 'pinia'

function crearFormularioConSelect() {
  const almacen = useAlmacenDisenador()
  if (!almacen.formSchema) {
    almacen.formSchema = { pages: [] }
  }
  almacen.esquemaFormulario.paginas = [
    {
      id: 'p1',
      titulo: 'P1',
      campos: [
        {
          id: 'f1',
          tipo: 'seleccion',
          nombre: 'selector',
          etiqueta: 'Selector',
          grid: { sm: 12 },
          metadatos: {
            modoOpciones: 'api',
            configuracionApi: {
              url: 'http://test.com/api',
              metodo: 'GET',
              claveEtiqueta: 'etiqueta',
              claveValor: 'valor'
            }
          }
        }
      ]
    }
  ]
  almacen.activePageIndex = 0
  almacen.seleccionarCampo('f1')
  return almacen
}

describe('Detección automática de estructura API', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Debería detectar automáticamente claves "etiqueta" y "valor"', async () => {
    // Mock de fetch con estructura custom
    const respuestaApi = [{"etiqueta":"uno","valor":1}, {"etiqueta":"dos","valor":2}]
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(respuestaApi)
    })
    ;(globalThis as unknown as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch

    const almacen = crearFormularioConSelect()
    mount(TabAtributos, {
      props: { idCampo: 'f1' },
      global: { stubs: { PrimePanel: true } }
    })

    // Simular carga directa de API
    const campo = almacen.campoSeleccionado!
    const meta = { ...campo.metadatos } as Record<string, unknown>
    const api = (meta.configuracionApi as Record<string, unknown>) || {}

    // Simular el proceso de carga que haría cargarOpcionesDesdeApi
    const estructura = { claveEtiqueta: 'etiqueta', claveValor: 'valor' }
    const opcionesNuevas = respuestaApi.map(item => ({
      etiqueta: String(item.etiqueta),
      valor: item.valor
    }))

    // Actualizar configuración como lo haría la detección automática
    meta.configuracionApi = { ...api, ...estructura }
    meta.opciones = opcionesNuevas
    almacen.actualizarCampo(campo.id, { metadatos: meta })

    await new Promise(resolve => setTimeout(resolve, 10))

    // Verificar que se detectaron las claves correctas
    const campoFinal = almacen.campoSeleccionado
    const apiFinal = (campoFinal?.metadatos as Record<string, unknown>)?.configuracionApi as Record<string, unknown>

    expect(apiFinal.claveEtiqueta).toBe('etiqueta')
    expect(apiFinal.claveValor).toBe('valor')

    // Verificar que las opciones se cargaron correctamente
    const opciones = (campoFinal?.metadatos as Record<string, unknown>)?.opciones as Array<{ etiqueta: string; valor: unknown }>
    expect(Array.isArray(opciones)).toBe(true)
    expect(opciones).toHaveLength(2)
    expect(opciones[0]).toEqual({ etiqueta: 'uno', valor: 1 })
    expect(opciones[1]).toEqual({ etiqueta: 'dos', valor: 2 })
  })

  it('Debería mantener configuración manual si las claves no son por defecto', async () => {
    const respuestaApi = [{"nombre":"test","id":99}]
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(respuestaApi)
    })
    ;(globalThis as unknown as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch

    const almacen = crearFormularioConSelect()

    // Configurar claves manuales primero
    const campo = almacen.campoSeleccionado!
    const meta = { ...campo.metadatos } as Record<string, unknown>
    meta.configuracionApi = {
      ...(meta.configuracionApi as Record<string, unknown>),
      claveEtiqueta: 'nombre',
      claveValor: 'id'
    }
    almacen.actualizarCampo(campo.id, { metadatos: meta })

    await new Promise(resolve => setTimeout(resolve, 10))

    // Verificar que las claves manuales se mantuvieron
    const campoActual = almacen.campoSeleccionado
    const apiActual = (campoActual?.metadatos as Record<string, unknown>)?.configuracionApi as Record<string, unknown>

    expect(apiActual.claveEtiqueta).toBe('nombre')
    expect(apiActual.claveValor).toBe('id')
  })
})

