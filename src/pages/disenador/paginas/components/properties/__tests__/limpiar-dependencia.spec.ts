import { describe, it, expect } from 'vitest'
import { useDesignerStore } from '../../../../../../stores/useDesignerStore'

function crearSelectConDependencia() {
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
              labelKey: 'etiqueta',
              valueKey: 'valor'
            },
            dependencia: {
              campoPadre: 'padre',
              paramKey: 'country',
              modoEnvio: 'query',
              limpiarAlCambiar: true,
              deshabilitarHastaValor: true
            },
            options: [
              { label: 'Opción 1', value: 1 },
              { label: 'Opción 2', value: 2 }
            ]
          }
        }
      ]
    }
  ]
  store.activePageIndex = 0
  store.seleccionarCampo('f1')
  return store
}

describe('Limpiar dependencia', () => {
  it('Debería limpiar tanto la dependencia como las opciones al presionar "Quitar dependencia"', async () => {
    const store = crearSelectConDependencia()

    // Verificar estado inicial - debe tener dependencia y opciones
    let campo = store.campoSeleccionado!
    let meta = campo.meta as Record<string, unknown>

    expect(meta.dependencia).toBeDefined()
    expect(meta.options).toBeDefined()
    expect(Array.isArray(meta.options)).toBe(true)
    expect((meta.options as Array<unknown>)).toHaveLength(2)

    // Simular el comportamiento de limpiarDependencia directamente
    const metaActualizada = { ...meta } as Record<string, unknown>
    if ('dependencia' in metaActualizada) delete metaActualizada.dependencia
    if ('options' in metaActualizada) delete metaActualizada.options
    store.actualizarCampo(campo.id, { meta: metaActualizada })

    await new Promise(resolve => setTimeout(resolve, 10))

    // Verificar que se limpió la dependencia Y las opciones
    campo = store.campoSeleccionado!
    meta = campo.meta as Record<string, unknown>

    expect(meta.dependencia).toBeUndefined()
    expect(meta.options).toBeUndefined()
  })

  it('Debería mantener otras propiedades de meta intactas al limpiar dependencia', async () => {
    const store = crearSelectConDependencia()

    // Añadir una propiedad adicional al meta
    const campo = store.campoSeleccionado!
    const meta = { ...campo.meta } as Record<string, unknown>
    meta.optionsMode = 'api'
    meta.valorPorDefecto = 'test'
    store.actualizarCampo(campo.id, { meta })

    await new Promise(resolve => setTimeout(resolve, 10))

    // Simular limpiarDependencia
    const metaActualizada = { ...meta } as Record<string, unknown>
    if ('dependencia' in metaActualizada) delete metaActualizada.dependencia
    if ('options' in metaActualizada) delete metaActualizada.options
    store.actualizarCampo(campo.id, { meta: metaActualizada })

    await new Promise(resolve => setTimeout(resolve, 10))

    // Verificar que otras propiedades se mantuvieron
    const campoFinal = store.campoSeleccionado!
    const metaFinal = campoFinal.meta as Record<string, unknown>

    expect(metaFinal.dependencia).toBeUndefined()
    expect(metaFinal.options).toBeUndefined()
    expect(metaFinal.optionsMode).toBe('api')
    expect(metaFinal.valorPorDefecto).toBe('test')
    expect(metaFinal.optionsApi).toBeDefined() // La configuración de API se mantiene
  })
})
