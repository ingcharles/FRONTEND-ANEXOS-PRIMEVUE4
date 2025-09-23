import { mount } from '@vue/test-utils'import { mount } from '@vue/test-utils'

import { describe, it, expect, vi, beforeEach } from 'vitest'import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createPinia, setActivePinia } from 'pinia'import { createPinia, setActivePinia } from 'pinia'

import VistaPrevia from '../../../../../paginas/disenador/componentes/VistaPrevia.vue'import VistaPrevia from '../../../../../paginas/disenador/componentes/VistaPrevia.vue'

import { useAlmacenDisenador } from '../../../../../almacenes/UsarAlmacenDisenador'import { useAlmacenDisenador } from '../../../../../almacenes/UsarAlmacenDisenador'



function crearFormularioBasico() {function crearFormularioBasico() {

  const almacen = useAlmacenDisenador()  const almacen = useAlmacenDisenador()

  almacen.esquemaFormulario.paginas = [  almacen.esquemaFormulario.paginas = [

    {    {

      id: 'p1',      id: 'p1',

      titulo: 'P1',      titulo: 'P1',

      campos: [      campos: [

        {         {

          id: 'f1',           id: 'f1',

          tipo: 'seleccion',           tipo: 'seleccion',

          nombre: 'pais',           nombre: 'pais',

          etiqueta: 'País',           etiqueta: 'País',

          grid: { sm: 12 },           grid: { sm: 12 },

          metadatos: {           metadatos: {

            modoOpciones: 'manual',             modoOpciones: 'manual',

            opciones: [             opciones: [

              { etiqueta: 'Colombia', valor: 'CO' },               { etiqueta: 'Colombia', valor: 'CO' },

              { etiqueta: 'Perú', valor: 'PE' }               { etiqueta: 'Perú', valor: 'PE' }

            ]             ]

          }           }

        },        },

        {         {

          id: 'f2',           id: 'f2',

          tipo: 'seleccion',           tipo: 'seleccion',

          nombre: 'ciudad',           nombre: 'ciudad',

          etiqueta: 'Ciudad',           etiqueta: 'Ciudad',

          grid: { sm: 12 },           grid: { sm: 12 },

          metadatos: {           metadatos: {

            configuracionApi: {             configuracionApi: {

              url: '/api/opciones.json',               url: '/api/opciones.json',

              method: 'GET',               method: 'GET',

              labelKey: 'etiqueta',               labelKey: 'etiqueta',

              valueKey: 'valor'               valueKey: 'valor'

            },             },

            dependencia: {             dependencia: {

              campoPadre: 'pais',               campoPadre: 'pais',

              paramKey: 'country',               paramKey: 'country',

              modoEnvio: 'query',               modoEnvio: 'query',

              limpiarAlCambiar: true,               limpiarAlCambiar: true,

              deshabilitarHastaValor: true               deshabilitarHastaValor: true

            },            },

            opciones: []            opciones: []

          }           }

        },        },

      ],      ],

    },    },

  ]  ]

  almacen.indicePaginaActiva = 0  almacen.indicePaginaActiva = 0

  return almacen  return almacen

}}



describe('Cascada de Selects', () => {describe('Cascada de Selects', () => {

  let mockFetch: ReturnType<typeof vi.fn>  let mockFetch: ReturnType<typeof vi.fn>



  beforeEach(() => {  beforeEach(() => {

    setActivePinia(createPinia())    setActivePinia(createPinia())

    mockFetch = vi.fn()    mockFetch = vi.fn()

    global.fetch = mockFetch    global.fetch = mockFetch

    vi.clearAllMocks()    vi.clearAllMocks()

  })  })



  it('Debería cargar opciones del hijo cuando cambia el padre (query)', async () => {  it('Debería cargar opciones del hijo cuando cambia el padre (query)', async () => {

    const json = [ { etiqueta: 'Bogotá', valor: 'BOG' }, { etiqueta: 'Medellín', valor: 'MED' } ]    const json = [ { etiqueta: 'Bogotá', valor: 'BOG' }, { etiqueta: 'Medellín', valor: 'MED' } ]

    mockFetch.mockResolvedValue({     mockFetch.mockResolvedValue({

      ok: true,       ok: true,

      json: vi.fn().mockResolvedValue(json)       json: vi.fn().mockResolvedValue(json)

    })    })



    const almacen = crearFormularioBasico()    const almacen = crearFormularioBasico()

    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })



    // Establecer valor del padre para disparar watcher    // Establecer valor del padre para disparar watcher

    almacen.actualizarValorCampo('p1', 'pais', 'CO')    almacen.actualizarValorCampo('p1', 'pais', 'CO')



    await new Promise(r => setTimeout(r, 100))    await new Promise(r => setTimeout(r, 100))



    // Verificar que fetch fue llamado con query param    // Verificar que fetch fue llamado con query param

    expect(mockFetch).toHaveBeenCalledWith('/api/opciones.json?country=CO', { method: 'GET' })    expect(mockFetch).toHaveBeenCalledWith('/api/opciones.json?country=CO', { method: 'GET' })

  })  })



  it('Debería cargar opciones del hijo cuando cambia el padre (body)', async () => {  it('Debería cargar opciones del hijo cuando cambia el padre (body)', async () => {

    const almacen = crearFormularioBasico()    const almacen = crearFormularioBasico()

    const field2 = almacen.esquemaFormulario.paginas[0].campos[1]    const field2 = almacen.esquemaFormulario.paginas[0].campos[1]

    field2.metadatos!.dependencia!.modoEnvio = 'body'    field2.metadatos!.dependencia!.modoEnvio = 'body'



    const json = [ { etiqueta: 'Lima', valor: 'LIM' }, { etiqueta: 'Arequipa', valor: 'AQP' } ]    const json = [ { etiqueta: 'Lima', valor: 'LIM' }, { etiqueta: 'Arequipa', valor: 'AQP' } ]

    mockFetch.mockResolvedValue({     mockFetch.mockResolvedValue({

      ok: true,       ok: true,

      json: vi.fn().mockResolvedValue(json)       json: vi.fn().mockResolvedValue(json)

    })    })



    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })



    almacen.actualizarValorCampo('p1', 'pais', 'PE')    almacen.actualizarValorCampo('p1', 'pais', 'PE')



    await new Promise(r => setTimeout(r, 100))    await new Promise(r => setTimeout(r, 100))



    expect(mockFetch).toHaveBeenCalledWith('/api/opciones.json', {    expect(mockFetch).toHaveBeenCalledWith('/api/opciones.json', {

      method: 'GET',      method: 'GET',

      headers: { 'Content-Type': 'application/json' },      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ country: 'PE' })      body: JSON.stringify({ country: 'PE' })

    })    })

  })  })



  it('Debería limpiar el valor del hijo al cambiar el padre', async () => {  it('Debería limpiar el valor del hijo al cambiar el padre', async () => {

    const almacen = crearFormularioBasico()    const almacen = crearFormularioBasico()

    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })



    // Establecer valor inicial en el hijo    // Establecer valor inicial en el hijo

    almacen.actualizarValorCampo('p1', 'ciudad', 'BOG')    almacen.actualizarValorCampo('p1', 'ciudad', 'BOG')

    const valores = almacen.obtenerValoresPagina('p1') as Record<string, unknown>    const valores = almacen.obtenerValoresPagina('p1') as Record<string, unknown>

    expect(valores['ciudad']).toBe('BOG')    expect(valores['ciudad']).toBe('BOG')



    // Cambiar padre debería limpiar hijo (por configuración limpiarAlCambiar: true)    // Cambiar padre debería limpiar hijo (por configuración limpiarAlCambiar: true)

    almacen.actualizarValorCampo('p1', 'pais', 'PE')    almacen.actualizarValorCampo('p1', 'pais', 'PE')

    await new Promise(r => setTimeout(r, 100))    await new Promise(r => setTimeout(r, 100))



    const valoresActualizados = almacen.obtenerValoresPagina('p1') as Record<string, unknown>    const valoresActualizados = almacen.obtenerValoresPagina('p1') as Record<string, unknown>

    expect(valoresActualizados['ciudad']).toBe('')    expect(valoresActualizados['ciudad']).toBe('')

  })  })



  it('Debería deshabilitar el hijo hasta que el padre tenga valor', async () => {  it('Debería deshabilitar el hijo hasta que el padre tenga valor', async () => {

    const almacen = crearFormularioBasico()    const almacen = crearFormularioBasico()

    const wrapper = mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })    const wrapper = mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })



    await wrapper.vm.$nextTick()    await wrapper.vm.$nextTick()



    // Sin valor en padre, el campo hijo debería estar deshabilitado    // Sin valor en padre, el campo hijo debería estar deshabilitado

    const ciudadField = almacen.esquemaFormulario.paginas[0].campos[1]    const ciudadField = almacen.esquemaFormulario.paginas[0].campos[1]

    expect(ciudadField.metadatos?.disabled).toBe(true)    expect(ciudadField.metadatos?.disabled).toBe(true)



    // Al establecer valor en padre, debería habilitarse    // Al establecer valor en padre, debería habilitarse

    almacen.actualizarValorCampo('p1', 'pais', 'CO')    almacen.actualizarValorCampo('p1', 'pais', 'CO')

    await new Promise(r => setTimeout(r, 100))    await new Promise(r => setTimeout(r, 100))



    expect(ciudadField.metadatos?.disabled).toBe(false)    expect(ciudadField.metadatos?.disabled).toBe(false)

  })  })



  it('Debería funcionar con múltiples padres', async () => {  it('Debería funcionar con múltiples padres', async () => {

    const almacen = useAlmacenDisenador()    const almacen = useAlmacenDisenador()

    almacen.esquemaFormulario.paginas = [    almacen.esquemaFormulario.paginas = [

      {      {

        id: 'p1',        id: 'p1',

        titulo: 'P1',        titulo: 'P1',

        campos: [        campos: [

          {           {

            id: 'f1',             id: 'f1',

            tipo: 'seleccion',             tipo: 'seleccion',

            nombre: 'pais',             nombre: 'pais',

            etiqueta: 'País',             etiqueta: 'País',

            grid: { sm: 12 },             grid: { sm: 12 },

            metadatos: {             metadatos: {

              modoOpciones: 'manual',               modoOpciones: 'manual',

              opciones: [ { etiqueta: 'Colombia', valor: 'CO' } ]               opciones: [ { etiqueta: 'Colombia', valor: 'CO' } ]

            }             }

          },          },

          {           {

            id: 'f2',             id: 'f2',

            tipo: 'seleccion',             tipo: 'seleccion',

            nombre: 'estado',             nombre: 'estado',

            etiqueta: 'Estado',             etiqueta: 'Estado',

            grid: { sm: 12 },             grid: { sm: 12 },

            metadatos: {             metadatos: {

              modoOpciones: 'manual',               modoOpciones: 'manual',

              opciones: [ { etiqueta: 'Cundinamarca', valor: 'CUN' } ]               opciones: [ { etiqueta: 'Cundinamarca', valor: 'CUN' } ]

            }             }

          },          },

          {           {

            id: 'f3',             id: 'f3',

            tipo: 'seleccion',             tipo: 'seleccion',

            nombre: 'ciudad',             nombre: 'ciudad',

            etiqueta: 'Ciudad',             etiqueta: 'Ciudad',

            grid: { sm: 12 },             grid: { sm: 12 },

            metadatos: {             metadatos: {

              configuracionApi: {               configuracionApi: {

                url: '/api/ciudades.json',                 url: '/api/ciudades.json',

                method: 'GET',                 method: 'GET',

                labelKey: 'etiqueta',                 labelKey: 'etiqueta',

                valueKey: 'valor'                 valueKey: 'valor'

              },               },

              dependencia: {               dependencia: {

                campoPadre: 'pais,estado',                 campoPadre: 'pais,estado',

                paramKey: 'pais,estado',                 paramKey: 'pais,estado',

                modoEnvio: 'query',                 modoEnvio: 'query',

                limpiarAlCambiar: true,                 limpiarAlCambiar: true,

                deshabilitarHastaValor: true                 deshabilitarHastaValor: true

              },              },

              opciones: []               opciones: []

            }             }

          },          },

        ],        ],

      },      },

    ]    ]



    const json = [ { etiqueta: 'Bogotá', valor: 'BOG' } ]    const json = [ { etiqueta: 'Bogotá', valor: 'BOG' } ]

    mockFetch.mockResolvedValue({     mockFetch.mockResolvedValue({

      ok: true,       ok: true,

      json: vi.fn().mockResolvedValue(json)       json: vi.fn().mockResolvedValue(json)

    })    })



    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })



    almacen.actualizarValorCampo('p1', 'pais', 'CO')    almacen.actualizarValorCampo('p1', 'pais', 'CO')

    almacen.actualizarValorCampo('p1', 'estado', 'CUN')    almacen.actualizarValorCampo('p1', 'estado', 'CUN')



    await new Promise(r => setTimeout(r, 100))    await new Promise(r => setTimeout(r, 100))



    expect(mockFetch).toHaveBeenCalledWith('/api/ciudades.json?pais=CO&estado=CUN', { method: 'GET' })    expect(mockFetch).toHaveBeenCalledWith('/api/ciudades.json?pais=CO&estado=CUN', { method: 'GET' })

  })  })



  it('Debería usar URLs dinámicas con parámetros', async () => {  it('Debería usar URLs dinámicas con parámetros', async () => {

    const almacen = crearFormularioBasico()    const almacen = crearFormularioBasico()

    const field2 = almacen.esquemaFormulario.paginas[0].campos[1]    const field2 = almacen.esquemaFormulario.paginas[0].campos[1]

    field2.metadatos!.configuracionApi!.url = '/api/ciudades/{country}'    field2.metadatos!.configuracionApi!.url = '/api/ciudades/{country}'

    field2.metadatos!.dependencia!.modoEnvio = 'path'    field2.metadatos!.dependencia!.modoEnvio = 'path'



    const json = [ { etiqueta: 'Bogotá', valor: 'BOG' } ]    const json = [ { etiqueta: 'Bogotá', valor: 'BOG' } ]

    mockFetch.mockResolvedValue({     mockFetch.mockResolvedValue({

      ok: true,       ok: true,

      json: vi.fn().mockResolvedValue(json)       json: vi.fn().mockResolvedValue(json)

    })    })



    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })



    almacen.actualizarValorCampo('p1', 'pais', 'CO')    almacen.actualizarValorCampo('p1', 'pais', 'CO')



    await new Promise(r => setTimeout(r, 100))    await new Promise(r => setTimeout(r, 100))



    expect(mockFetch).toHaveBeenCalledWith('/api/ciudades/CO', { method: 'GET' })    expect(mockFetch).toHaveBeenCalledWith('/api/ciudades/CO', { method: 'GET' })

  })  })



  it('Debería manejar errores de API graciosamente', async () => {  it('Debería manejar errores de API graciosamente', async () => {

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mockFetch.mockRejectedValue(new Error('Network error'))    mockFetch.mockRejectedValue(new Error('Network error'))



    const almacen = crearFormularioBasico()    const almacen = crearFormularioBasico()

    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })    mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })



    almacen.actualizarValorCampo('p1', 'pais', 'CO')    almacen.actualizarValorCampo('p1', 'pais', 'CO')



    await new Promise(r => setTimeout(r, 100))    await new Promise(r => setTimeout(r, 100))



    // El error debería ser capturado y las opciones mantenerse vacías    // El error debería ser capturado y las opciones mantenerse vacías

    const ciudadField = almacen.esquemaFormulario.paginas[0].campos[1]    const ciudadField = almacen.esquemaFormulario.paginas[0].campos[1]

    expect(ciudadField.metadatos?.opciones).toEqual([])    expect(ciudadField.metadatos?.opciones).toEqual([])



    consoleErrorSpy.mockRestore()    consoleErrorSpy.mockRestore()

  })  })



  it('Debería funcionar sin configuración de dependencia', () => {  it('Debería funcionar sin configuración de dependencia', () => {

    const almacen = useAlmacenDisenador()    const almacen = useAlmacenDisenador()

    almacen.esquemaFormulario.paginas = [    almacen.esquemaFormulario.paginas = [

      {      {

        id: 'p1',        id: 'p1',

        titulo: 'P1',        titulo: 'P1',

        campos: [        campos: [

          {           {

            id: 'f1',             id: 'f1',

            tipo: 'seleccion',             tipo: 'seleccion',

            nombre: 'simple',             nombre: 'simple',

            etiqueta: 'Simple',             etiqueta: 'Simple',

            grid: { sm: 12 },             grid: { sm: 12 },

            metadatos: {             metadatos: {

              opciones: [ { etiqueta: 'Opción 1', valor: '1' } ]               opciones: [ { etiqueta: 'Opción 1', valor: '1' } ]

            }             }

          },          },

        ],        ],

      },      },

    ]    ]



    const wrapper = mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })    const wrapper = mount(VistaPrevia, { global: { stubs: { PrimePanel: true } } })



    // Debería renderizar sin errores    // Debería renderizar sin errores

    expect(wrapper.find('form').exists()).toBe(true)    expect(wrapper.find('form').exists()).toBe(true)

  })  })

})})
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
