import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import PreviewView from '../../../../../paginas/disenador/componentes/VistaPrevia.vue'
import { useAlmacenDisenador } from '../../../../../almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '../../../../../interfaces/Campos'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Carga independiente de API con estructura española', () => {
  let almacen: ReturnType<typeof useAlmacenDisenador>

  beforeEach(() => {
    setActivePinia(createPinia())
    almacen = useAlmacenDisenador()
    vi.clearAllMocks()
  })

  it('Debería cargar opciones para select independiente con estructura española', async () => {
    // Configurar mock de respuesta API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { etiqueta: 'Año 2023', valor: '2023' },
        { etiqueta: 'Año 2024', valor: '2024' }
      ]
    })

    // Crear formulario con select que tiene URL API
    const formulario = {
      id: 'form1',
      nombre: 'Test Form',
      paginas: [
        {
          id: 'page1',
          titulo: 'Página 1',
          campos: [
            {
              id: 'yearSelect',
              tipo: 'seleccion',
              etiqueta: 'Año',
              nombre: 'year',
              metadatos: {
                apiUrl: 'http://localhost:3000/api/years',
                labelKey: 'etiqueta',
                valueKey: 'valor',
                opciones: []
              }
            } as EsquemaCampo
          ]
        }
      ],
      configuracion: { ajusteGrid: true, columnas: 12 }
    }

    almacen.cargarFormulario(formulario)

    // Montar componente
    const wrapper = mount(PreviewView, {
      global: {
        plugins: [createPinia()]
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar que se hizo la llamada a la API
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/years',
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    )

    // Verificar que las opciones se cargaron en el campo
    const campo = almacen.esquemaFormulario.paginas[0].campos.find((f: EsquemaCampo) => f.id === 'yearSelect')
    expect(campo?.metadatos?.opciones).toEqual([
      { etiqueta: 'Año 2023', valor: '2023' },
      { etiqueta: 'Año 2024', valor: '2024' }
    ])

    wrapper.unmount()
  })

  it('Debería detectar automáticamente estructura española cuando no se especifica labelKey/valueKey', async () => {
    // Configurar mock de respuesta API con estructura española
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { etiqueta: 'Opción A', valor: 'a' },
        { etiqueta: 'Opción B', valor: 'b' }
      ]
    })

    // Crear formulario sin especificar labelKey/valueKey
    const formulario = {
      id: 'form1',
      nombre: 'Test Form',
      paginas: [
        {
          id: 'page1',
          titulo: 'Página 1',
          campos: [
            {
              id: 'option',
              tipo: 'seleccion',
              etiqueta: 'Opciones',
              nombre: 'option',
              metadatos: {
                apiUrl: 'http://localhost:3000/api/options',
                opciones: []
              }
            } as EsquemaCampo
          ]
        }
      ],
      configuracion: { ajusteGrid: true, columnas: 12 }
    }

    almacen.cargarFormulario(formulario)

    // Montar componente
    const wrapper = mount(PreviewView, {
      global: {
        plugins: [createPinia()]
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar que se detectó automáticamente la estructura española
    const campo = almacen.esquemaFormulario.paginas[0].campos.find((f: EsquemaCampo) => f.id === 'option')
    expect(campo?.metadatos?.opciones).toEqual([
      { etiqueta: 'Opción A', valor: 'a' },
      { etiqueta: 'Opción B', valor: 'b' }
    ])

    wrapper.unmount()
  })

  it('Debería manejar errores de API correctamente', async () => {
    // Configurar mock para error
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    // Crear formulario
    const formulario = {
      id: 'form1',
      nombre: 'Test Form',
      paginas: [
        {
          id: 'page1',
          titulo: 'Página 1',
          campos: [
            {
              id: 'errorField',
              tipo: 'seleccion',
              etiqueta: 'Campo con Error',
              nombre: 'error_field',
              metadatos: {
                apiUrl: 'http://localhost:3000/api/error',
                opciones: []
              }
            } as EsquemaCampo
          ]
        }
      ],
      configuracion: { ajusteGrid: true, columnas: 12 }
    }

    almacen.cargarFormulario(formulario)

    // Montar componente
    const wrapper = mount(PreviewView, {
      global: {
        plugins: [createPinia()]
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verificar que las opciones se configuran como array vacío
    const campo = almacen.esquemaFormulario.paginas[0].campos.find((f: EsquemaCampo) => f.id === 'errorField')
    expect(campo?.metadatos?.opciones).toEqual([])

    wrapper.unmount()
  })
})
