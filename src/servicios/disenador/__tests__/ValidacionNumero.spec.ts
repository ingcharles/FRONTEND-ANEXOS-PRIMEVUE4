import { describe, it, expect } from 'vitest'
import { ServicioValidacionFormulario } from '../ServicioValidacion'
import { ServicioEsquemasFormulario } from '../ServicioEsquemas'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { EsquemaFormulario } from '@/interfaces/Formulario'
import { TipoCampoValor } from '@/enumeraciones/Campos'

describe('Validación de Campos Numéricos', () => {
  const servicioValidacion = new ServicioValidacionFormulario()
  const servicioEsquemas = new ServicioEsquemasFormulario()

  describe('ServicioValidacionFormulario', () => {
    it('debe mostrar mensaje personalizado para campo numérico requerido vacío', () => {
      const campoNumerico: EsquemaCampo = {
        id: 'campo-numero',
        tipo: TipoCampoValor.Numero,
        etiqueta: 'Edad',
        nombre: 'edad',
        requerido: true,
        validaciones: [
          {
            tipo: 'requerido',
            valor: 'La edad es obligatoria'
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
            campos: [campoNumerico]
          }
        ]
      }

      const obtenerValoresPagina = (id: string) => ({
        edad: undefined // Campo vacío
      })

      const resultado = servicioValidacion.validarFormularioCompleto(esquemaFormulario, obtenerValoresPagina)

      expect(resultado.esValido).toBe(false)
      expect(resultado.errores.edad).toBe('La edad es obligatoria')
    })

    it('debe validar correctamente campo numérico con valor válido', () => {
      const campoNumerico: EsquemaCampo = {
        id: 'campo-numero',
        tipo: TipoCampoValor.Numero,
        etiqueta: 'Edad',
        nombre: 'edad',
        requerido: true,
        validaciones: [
          {
            tipo: 'requerido',
            valor: 'La edad es obligatoria'
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
            campos: [campoNumerico]
          }
        ]
      }

      const obtenerValoresPagina = (id: string) => ({
        edad: 25
      })

      const resultado = servicioValidacion.validarFormularioCompleto(esquemaFormulario, obtenerValoresPagina)

      expect(resultado.esValido).toBe(true)
      expect(resultado.errores).toEqual({})
    })

    it('debe permitir campos numéricos opcionales vacíos', () => {
      const campoNumerico: EsquemaCampo = {
        id: 'campo-numero',
        tipo: TipoCampoValor.Numero,
        etiqueta: 'Edad Opcional',
        nombre: 'edadOpcional',
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
            campos: [campoNumerico]
          }
        ]
      }

      const obtenerValoresPagina = (id: string) => ({
        edadOpcional: undefined
      })

      const resultado = servicioValidacion.validarFormularioCompleto(esquemaFormulario, obtenerValoresPagina)

      expect(resultado.esValido).toBe(true)
      expect(resultado.errores).toEqual({})
    })

    it('debe manejar strings vacíos en campos numéricos requeridos', () => {
      const campoNumerico: EsquemaCampo = {
        id: 'campo-numero',
        tipo: TipoCampoValor.Numero,
        etiqueta: 'Edad',
        nombre: 'edad',
        requerido: true,
        validaciones: [
          {
            tipo: 'requerido',
            valor: 'Ingrese una edad válida'
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
            campos: [campoNumerico]
          }
        ]
      }

      const obtenerValoresPagina = (id: string) => ({
        edad: '' // String vacío
      })

      const resultado = servicioValidacion.validarFormularioCompleto(esquemaFormulario, obtenerValoresPagina)

      expect(resultado.esValido).toBe(false)
      expect(resultado.errores.edad).toBe('Ingrese una edad válida')
    })
  })

  describe('ServicioEsquemasFormulario', () => {
    it('debe mostrar mensaje personalizado para campo numérico requerido vacío', () => {
      const campoNumerico: EsquemaCampo = {
        id: 'campo-numero',
        tipo: TipoCampoValor.Numero,
        etiqueta: 'Edad',
        nombre: 'edad',
        requerido: true,
        validaciones: [
          {
            tipo: 'requerido',
            valor: 'La edad es obligatoria'
          }
        ]
      }

      const esquema = servicioEsquemas.crearEsquemaValidacion([campoNumerico])
      const resultado = esquema.safeParse({
        edad: undefined
      })

      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toBe('La edad es obligatoria')
      }
    })

    it('debe validar correctamente campo numérico con valor válido', () => {
      const campoNumerico: EsquemaCampo = {
        id: 'campo-numero',
        tipo: TipoCampoValor.Numero,
        etiqueta: 'Edad',
        nombre: 'edad',
        requerido: true,
        validaciones: [
          {
            tipo: 'requerido',
            valor: 'La edad es obligatoria'
          }
        ]
      }

      const esquema = servicioEsquemas.crearEsquemaValidacion([campoNumerico])
      const resultado = esquema.safeParse({
        edad: 25
      })

      expect(resultado.success).toBe(true)
    })

    it('debe manejar correctamente null y strings vacíos', () => {
      const campoNumerico: EsquemaCampo = {
        id: 'campo-numero',
        tipo: TipoCampoValor.Numero,
        etiqueta: 'Edad',
        nombre: 'edad',
        requerido: true,
        validaciones: [
          {
            tipo: 'requerido',
            valor: 'Campo obligatorio'
          }
        ]
      }

      const esquema = servicioEsquemas.crearEsquemaValidacion([campoNumerico])

      // Null debe fallar
      const resultadoNull = esquema.safeParse({
        edad: null
      })
      expect(resultadoNull.success).toBe(false)

      // String vacío debe fallar
      const resultadoVacio = esquema.safeParse({
        edad: ''
      })
      expect(resultadoVacio.success).toBe(false)

      // String con espacios debe fallar
      const resultadoEspacios = esquema.safeParse({
        edad: '   '
      })
      expect(resultadoEspacios.success).toBe(false)

      // Número válido debe pasar
      const resultadoValido = esquema.safeParse({
        edad: 30
      })
      expect(resultadoValido.success).toBe(true)

      // String numérico válido debe pasar
      const resultadoStringNumerico = esquema.safeParse({
        edad: '25'
      })
      expect(resultadoStringNumerico.success).toBe(true)
    })
  })
})
