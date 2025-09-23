import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAlmacenDisenador } from '../../../../../almacenes/UsarAlmacenDisenador'

function crearSelectConDependencia() {
  const almacen = useAlmacenDisenador()

  almacen.esquemaFormulario.paginas = [
    {
      id: 'p1',
      titulo: 'Página 1',
      campos: [
        {
          id: 'padre',
          tipo: 'seleccion',
          etiqueta: 'País',
          nombre: 'pais',
          metadatos: {
            opciones: [
              { etiqueta: 'Colombia', valor: 'CO' },
              { etiqueta: 'México', valor: 'MX' }
            ]
          }
        },
        {
          id: 'hijo',
          tipo: 'seleccion',
          etiqueta: 'Ciudad',
          nombre: 'ciudad',
          metadatos: {
            configuracionApi: {
              url: '/api/ciudades',
              method: 'GET',
              claveEtiqueta: 'etiqueta',
              claveValor: 'valor'
            },
            dependencia: {
              campoPadre: 'pais',
              claveParametro: 'pais_id',
              modoEnvio: 'query',
              limpiarAlCambiar: true
            },
            opciones: []
          }
        }
      ]
    }
  ]

  return almacen
}

describe('Limpiar dependencias', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Debería limpiar el valor del campo hijo cuando cambia el padre', async () => {
    const almacen = crearSelectConDependencia()
    const paginaId = 'p1'

    // Establecer valores iniciales
    almacen.actualizarValorCampo(paginaId, 'pais', 'CO')
    almacen.actualizarValorCampo(paginaId, 'ciudad', 'bogota')

    const valoresActuales = almacen.obtenerValoresPagina(paginaId) as Record<string, unknown>
    expect(valoresActuales.pais).toBe('CO')
    expect(valoresActuales.ciudad).toBe('bogota')

    // Cambiar el valor del padre - esto debería disparar la limpieza
    almacen.actualizarValorCampo(paginaId, 'pais', 'MX')

    // El hijo debería limpiarse
    const valoresActualizados = almacen.obtenerValoresPagina(paginaId) as Record<string, unknown>
    expect(valoresActualizados.pais).toBe('MX')
    expect(valoresActualizados.ciudad).toBe('')
  })

  it('Debería limpiar múltiples campos dependientes', async () => {
    const almacen = useAlmacenDisenador()

    almacen.esquemaFormulario.paginas = [
      {
        id: 'p1',
        titulo: 'Página 1',
        campos: [
          {
            id: 'pais',
            tipo: 'seleccion',
            etiqueta: 'País',
            nombre: 'pais',
            metadatos: {
              opciones: [
                { etiqueta: 'Colombia', valor: 'CO' },
                { etiqueta: 'México', valor: 'MX' }
              ]
            }
          },
          {
            id: 'estado',
            tipo: 'seleccion',
            etiqueta: 'Estado',
            nombre: 'estado',
            metadatos: {
              configuracionApi: {
                url: '/api/estados',
                method: 'GET',
                claveEtiqueta: 'etiqueta',
                claveValor: 'valor'
              },
              dependencia: {
                campoPadre: 'pais',
                claveParametro: 'pais_id',
                modoEnvio: 'query',
                limpiarAlCambiar: true
              },
              opciones: []
            }
          },
          {
            id: 'ciudad',
            tipo: 'seleccion',
            etiqueta: 'Ciudad',
            nombre: 'ciudad',
            metadatos: {
              configuracionApi: {
                url: '/api/ciudades',
                method: 'GET',
                claveEtiqueta: 'etiqueta',
                claveValor: 'valor'
              },
              dependencia: {
                campoPadre: 'pais',
                claveParametro: 'pais_id',
                modoEnvio: 'query',
                limpiarAlCambiar: true
              },
              opciones: []
            }
          }
        ]
      }
    ]

    const paginaId = 'p1'

    // Establecer valores iniciales
    almacen.actualizarValorCampo(paginaId, 'pais', 'CO')
    almacen.actualizarValorCampo(paginaId, 'estado', 'cundinamarca')
    almacen.actualizarValorCampo(paginaId, 'ciudad', 'bogota')

    // Cambiar el padre
    almacen.actualizarValorCampo(paginaId, 'pais', 'MX')

    // Todos los dependientes deberían limpiarse
    const valores = almacen.obtenerValoresPagina(paginaId) as Record<string, unknown>
    expect(valores.pais).toBe('MX')
    expect(valores.estado).toBe('')
    expect(valores.ciudad).toBe('')
  })
})
