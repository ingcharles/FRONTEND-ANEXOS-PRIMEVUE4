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
              { label: 'Colombia', value: 'CO' },
              { label: 'México', value: 'MX' }
            ]
          }
        },
        {
          id: 'hijo',
          tipo: 'seleccion',
          etiqueta: 'Ciudad',
          nombre: 'ciudad',
          metadatos: {
            dependeDe: ['pais'],
            apiUrl: '/api/ciudades',
            parametroQuery: 'pais_id',
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

    // Establecer valores iniciales
    almacen.valoresPorPagina[almacen.paginaActiva.id] = {
      pais: 'CO',
      ciudad: 'bogota'
    }

    const valoresActuales = almacen.valoresPorPagina[almacen.paginaActiva.id]
    expect(valoresActuales.pais).toBe('CO')
    expect(valoresActuales.ciudad).toBe('bogota')

    // Cambiar el valor del padre
    almacen.actualizarValorCampo('pais', 'MX')

    // El hijo debería limpiarse
    const valoresActualizados = almacen.valoresPorPagina[almacen.paginaActiva.id]
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
                { label: 'Colombia', value: 'CO' },
                { label: 'México', value: 'MX' }
              ]
            }
          },
          {
            id: 'estado',
            tipo: 'seleccion',
            etiqueta: 'Estado',
            nombre: 'estado',
            metadatos: {
              dependeDe: ['pais'],
              opciones: []
            }
          },
          {
            id: 'ciudad',
            tipo: 'seleccion',
            etiqueta: 'Ciudad',
            nombre: 'ciudad',
            metadatos: {
              dependeDe: ['pais'],
              opciones: []
            }
          }
        ]
      }
    ]

    // Establecer valores iniciales
    almacen.valoresPorPagina[almacen.paginaActiva.id] = {
      pais: 'CO',
      estado: 'cundinamarca',
      ciudad: 'bogota'
    }

    // Cambiar el padre
    almacen.actualizarValorCampo('pais', 'MX')

    // Todos los dependientes deberían limpiarse
    const valores = almacen.valoresPorPagina[almacen.paginaActiva.id]
    expect(valores.pais).toBe('MX')
    expect(valores.estado).toBe('')
    expect(valores.ciudad).toBe('')
  })
})
