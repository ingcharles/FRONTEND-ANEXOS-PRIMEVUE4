import { describe, it, expect } from 'vitest'
import { ServicioValidacionFormulario } from '../ServicioValidacion'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { EsquemaFormulario } from '@/interfaces/Formulario'
import { TipoCampoValor } from '@/enumeraciones/Campos'

describe('ServicioValidacion - Validación Requerido', () => {
  const servicio = new ServicioValidacionFormulario()

  it('debe mostrar mensaje personalizado para campo requerido vacío', () => {
    const campoRequerido: EsquemaCampo = {
      id: 'campo-test',
      tipo: TipoCampoValor.Texto,
      etiqueta: 'Campo de Prueba',
      nombre: 'campoTest',
      requerido: true,
      validaciones: [
        {
          tipo: 'requerido',
          valor: 'Este campo es obligatorio personalizado'
        }
      ]
    }

    const esquemaFormulario: EsquemaFormulario = {
      id: 'form-test',
      titulo: 'Formulario de Prueba',
      paginas: [
        {
          id: 'pagina-1',
          titulo: 'Página 1',
          campos: [campoRequerido]
        }
      ]
    }

    const obtenerValoresPagina = (id: string) => ({
      campoTest: undefined // Campo vacío
    })

    const resultado = servicio.validarFormularioCompleto(esquemaFormulario, obtenerValoresPagina)

    expect(resultado.esValido).toBe(false)
    expect(resultado.errores.campoTest).toBe('Este campo es obligatorio personalizado')
  })

  it('debe usar mensaje por defecto cuando no se especifica mensaje personalizado', () => {
    const campoRequerido: EsquemaCampo = {
      id: 'campo-test',
      tipo: TipoCampoValor.Texto,
      etiqueta: 'Campo de Prueba',
      nombre: 'campoTest',
      requerido: true,
      validaciones: [
        {
          tipo: 'requerido'
          // Sin valor personalizado
        }
      ]
    }

    const esquemaFormulario: EsquemaFormulario = {
      id: 'form-test',
      titulo: 'Formulario de Prueba',
      paginas: [
        {
          id: 'pagina-1',
          titulo: 'Página 1',
          campos: [campoRequerido]
        }
      ]
    }

    const obtenerValoresPagina = (id: string) => ({
      campoTest: undefined
    })

    const resultado = servicio.validarFormularioCompleto(esquemaFormulario, obtenerValoresPagina)

    expect(resultado.esValido).toBe(false)
    expect(resultado.errores.campoTest).toBe('Este campo es obligatorio')
  })

  it('debe validar correctamente campo requerido con valor', () => {
    const campoRequerido: EsquemaCampo = {
      id: 'campo-test',
      tipo: TipoCampoValor.Texto,
      etiqueta: 'Campo de Prueba',
      nombre: 'campoTest',
      requerido: true,
      validaciones: [
        {
          tipo: 'requerido',
          valor: 'Este campo es obligatorio'
        }
      ]
    }

    const esquemaFormulario: EsquemaFormulario = {
      id: 'form-test',
      titulo: 'Formulario de Prueba',
      paginas: [
        {
          id: 'pagina-1',
          titulo: 'Página 1',
          campos: [campoRequerido]
        }
      ]
    }

    const obtenerValoresPagina = (id: string) => ({
      campoTest: 'Valor válido'
    })

    const resultado = servicio.validarFormularioCompleto(esquemaFormulario, obtenerValoresPagina)

    expect(resultado.esValido).toBe(true)
    expect(resultado.errores).toEqual({})
  })

  it('debe permitir campos opcionales vacíos', () => {
    const campoOpcional: EsquemaCampo = {
      id: 'campo-opcional',
      tipo: TipoCampoValor.Texto,
      etiqueta: 'Campo Opcional',
      nombre: 'campoOpcional',
      requerido: false,
      validaciones: []
    }

    const esquemaFormulario: EsquemaFormulario = {
      id: 'form-test',
      titulo: 'Formulario de Prueba',
      paginas: [
        {
          id: 'pagina-1',
          titulo: 'Página 1',
          campos: [campoOpcional]
        }
      ]
    }

    const obtenerValoresPagina = (id: string) => ({
      campoOpcional: undefined
    })

    const resultado = servicio.validarFormularioCompleto(esquemaFormulario, obtenerValoresPagina)

    expect(resultado.esValido).toBe(true)
    expect(resultado.errores).toEqual({})
  })
})
