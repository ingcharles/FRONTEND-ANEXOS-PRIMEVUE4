import { describe, it, expect } from 'vitest'
import { ServicioEsquemasFormulario } from '../ServicioEsquemas'
import type { EsquemaCampo } from '@/interfaces/Campos'
import { TipoCampoValor } from '@/enumeraciones/Campos'

describe('ServicioEsquemas - Validación Requerido', () => {
  const servicio = new ServicioEsquemasFormulario()

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

    const esquema = servicio.crearEsquemaValidacion([campoRequerido])
    const resultado = esquema.safeParse({
      campoTest: undefined // Campo vacío
    })

    expect(resultado.success).toBe(false)
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe('Este campo es obligatorio personalizado')
    }
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

    const esquema = servicio.crearEsquemaValidacion([campoRequerido])
    const resultado = esquema.safeParse({
      campoTest: undefined
    })

    expect(resultado.success).toBe(false)
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe('Este campo es obligatorio')
    }
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

    const esquema = servicio.crearEsquemaValidacion([campoRequerido])
    const resultado = esquema.safeParse({
      campoTest: 'Valor válido'
    })

    expect(resultado.success).toBe(true)
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

    const esquema = servicio.crearEsquemaValidacion([campoOpcional])
    const resultado = esquema.safeParse({
      campoOpcional: undefined
    })

    expect(resultado.success).toBe(true)
  })

  it('debe manejar correctamente strings vacíos en campos requeridos', () => {
    const campoRequerido: EsquemaCampo = {
      id: 'campo-test',
      tipo: TipoCampoValor.Texto,
      etiqueta: 'Campo de Prueba',
      nombre: 'campoTest',
      requerido: true,
      validaciones: [
        {
          tipo: 'requerido',
          valor: 'Campo obligatorio'
        }
      ]
    }

    const esquema = servicio.crearEsquemaValidacion([campoRequerido])

    // String vacío debe fallar
    const resultadoVacio = esquema.safeParse({
      campoTest: ''
    })
    expect(resultadoVacio.success).toBe(false)

    // String con espacios debe fallar
    const resultadoEspacios = esquema.safeParse({
      campoTest: '   '
    })
    expect(resultadoEspacios.success).toBe(false)

    // String válido debe pasar
    const resultadoValido = esquema.safeParse({
      campoTest: 'texto válido'
    })
    expect(resultadoValido.success).toBe(true)
  })
})
