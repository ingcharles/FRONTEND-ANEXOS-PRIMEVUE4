import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAlmacenDisenador } from '../../../../../almacenes/UsarAlmacenDisenador'
import { generarId } from '../../../../../utilidades/id'

describe('Checkbox - Opciones por defecto', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Debería crear checkbox con opciones por defecto cuando tipo es casilla y no tiene opciones', () => {
    const almacen = useAlmacenDisenador()

    // Crear formulario base
    almacen.esquemaFormulario.paginas = [
      {
        id: generarId('page'),
        titulo: 'Página 1',
        campos: []
      }
    ]

    // Agregar campo checkbox sin opciones definidas
    const idCampo = almacen.agregarCampo({
      id: generarId('campo'),
      tipo: 'casilla',
      etiqueta: 'Checkbox Test',
      nombre: 'checkbox_test',
      metadatos: {}
    })

    const campo = almacen.buscarCampoPorId(idCampo)
    expect(campo).toBeDefined()
    expect(campo!.tipo).toBe('casilla')

    // Por defecto debería tener opciones vacías inicialmente
    expect(campo!.metadatos?.opciones).toBeUndefined()
  })

  it('Debería mantener opciones existentes cuando tipo es casilla y ya tiene opciones', () => {
    const almacen = useAlmacenDisenador()

    // Crear formulario base
    almacen.esquemaFormulario.paginas = [
      {
        id: generarId('page'),
        titulo: 'Página 1',
        campos: []
      }
    ]

    const opcionesExistentes = [
      { label: 'Opción 1', value: 'opt1' },
      { label: 'Opción 2', value: 'opt2' }
    ]

    // Agregar campo checkbox con opciones existentes
    const idCampo = almacen.agregarCampo({
      id: generarId('campo'),
      tipo: 'casilla',
      etiqueta: 'Checkbox Test',
      nombre: 'checkbox_test',
      metadatos: {
        opciones: opcionesExistentes
      }
    })

    const campo = almacen.buscarCampoPorId(idCampo)
    expect(campo).toBeDefined()
    expect(campo!.metadatos?.opciones).toEqual(opcionesExistentes)
  })

  it('Debería configurar valor por defecto para checkbox individual', () => {
    const almacen = useAlmacenDisenador()

    // Crear formulario base
    almacen.esquemaFormulario.paginas = [
      {
        id: generarId('page'),
        titulo: 'Página 1',
        campos: []
      }
    ]

    // Agregar campo checkbox individual (sin opciones múltiples)
    const idCampo = almacen.agregarCampo({
      id: generarId('campo'),
      tipo: 'casilla',
      etiqueta: 'Acepto términos',
      nombre: 'acepto_terminos',
      metadatos: {
        valorPorDefecto: true
      }
    })

    const campo = almacen.buscarCampoPorId(idCampo)
    expect(campo).toBeDefined()
    expect(campo!.metadatos?.valorPorDefecto).toBe(true)
  })

  it('Debería crear opciones por defecto cuando se cambia tipo a checkbox desde otro tipo', () => {
    const almacen = useAlmacenDisenador()

    // Crear formulario base
    almacen.esquemaFormulario.paginas = [
      {
        id: generarId('page'),
        titulo: 'Página 1',
        campos: []
      }
    ]

    // Agregar campo de texto
    const idCampo = almacen.agregarCampo({
      id: generarId('campo'),
      tipo: 'texto',
      etiqueta: 'Campo Test',
      nombre: 'campo_test',
      metadatos: {}
    })

    // Cambiar tipo a checkbox
    almacen.actualizarCampo(idCampo, { tipo: 'casilla' })

    const campo = almacen.buscarCampoPorId(idCampo)
    expect(campo).toBeDefined()
    expect(campo!.tipo).toBe('casilla')

    // Debería mantener valor por defecto false para checkbox individual
    expect(campo!.metadatos?.valorPorDefecto).toBe(false)
  })

  it('Debería preservar configuración existente al cambiar de tipo', () => {
    const almacen = useAlmacenDisenador()

    // Crear formulario base
    almacen.esquemaFormulario.paginas = [
      {
        id: generarId('page'),
        titulo: 'Página 1',
        campos: []
      }
    ]

    // Agregar campo select con opciones
    const idCampo = almacen.agregarCampo({
      id: generarId('campo'),
      tipo: 'seleccion',
      etiqueta: 'Select Test',
      nombre: 'select_test',
      metadatos: {
        opciones: [
          { label: 'Opción A', value: 'a' },
          { label: 'Opción B', value: 'b' }
        ]
      }
    })

    // Cambiar tipo a checkbox
    almacen.actualizarCampo(idCampo, { tipo: 'casilla' })

    const campo = almacen.buscarCampoPorId(idCampo)
    expect(campo).toBeDefined()
    expect(campo!.tipo).toBe('casilla')

    // Debería preservar las opciones existentes
    expect(campo!.metadatos?.opciones).toEqual([
      { label: 'Opción A', value: 'a' },
      { label: 'Opción B', value: 'b' }
    ])
  })

  it('Debería configurar correctamente checkbox múltiple con opciones', () => {
    const almacen = useAlmacenDisenador()

    // Crear formulario base
    almacen.esquemaFormulario.paginas = [
      {
        id: generarId('page'),
        titulo: 'Página 1',
        campos: []
      }
    ]

    const opciones = [
      { label: 'JavaScript', value: 'js' },
      { label: 'TypeScript', value: 'ts' },
      { label: 'Vue.js', value: 'vue' }
    ]

    // Agregar campo checkbox múltiple
    const idCampo = almacen.agregarCampo({
      id: generarId('campo'),
      tipo: 'casilla',
      etiqueta: 'Tecnologías',
      nombre: 'tecnologias',
      metadatos: {
        opciones: opciones,
        valorPorDefecto: ['js', 'vue']
      }
    })

    const campo = almacen.buscarCampoPorId(idCampo)
    expect(campo).toBeDefined()
    expect(campo!.metadatos?.opciones).toEqual(opciones)
    expect(campo!.metadatos?.valorPorDefecto).toEqual(['js', 'vue'])
  })
})
