import { describe, it, expect } from 'vitest'
import { ServicioEsquemasFormulario } from '../ServicioEsquemas'
import type { EsquemaCampo } from '@/interfaces/Campos'
import { TipoCampoValor } from '@/enumeraciones/Campos'

describe('Validación con Mensajes Personalizados', () => {
  const servicioEsquemas = new ServicioEsquemasFormulario()

  describe('ServicioEsquemasFormulario', () => {
    it('debe mostrar mensaje personalizado para longitud mínima', () => {
      const campoTexto: EsquemaCampo = {
        id: 'campo-texto',
        tipo: TipoCampoValor.Texto,
        etiqueta: 'Nombre',
        nombre: 'nombre',
        requerido: false,
        validaciones: [
          {
            tipo: 'longitud-minima',
            valor: '3',
            mensaje: 'El nombre debe tener al menos 3 caracteres'
          }
        ]
      }

      const esquema = servicioEsquemas.crearEsquemaValidacion([campoTexto])
      const resultado = esquema.safeParse({
        nombre: 'ab'
      })

      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toBe('El nombre debe tener al menos 3 caracteres')
      }
    })

    it('debe validar correctamente múltiples validaciones con mensajes personalizados', () => {
      const campoTexto: EsquemaCampo = {
        id: 'campo-texto',
        tipo: TipoCampoValor.Texto,
        etiqueta: 'Contraseña',
        nombre: 'password',
        requerido: true,
        validaciones: [
          {
            tipo: 'requerido',
            valor: 'La contraseña es obligatoria'
          },
          {
            tipo: 'longitud-minima',
            valor: '8',
            mensaje: 'La contraseña debe tener al menos 8 caracteres'
          },
          {
            tipo: 'patron',
            valor: '.*[A-Z].*',
            mensaje: 'La contraseña debe contener al menos una mayúscula'
          }
        ]
      }

      const esquema = servicioEsquemas.crearEsquemaValidacion([campoTexto])

      // Contraseña muy corta
      const resultadoCorta = esquema.safeParse({
        password: '123'
      })
      expect(resultadoCorta.success).toBe(false)

      // Contraseña sin mayúscula
      const resultadoSinMayuscula = esquema.safeParse({
        password: 'password123'
      })
      expect(resultadoSinMayuscula.success).toBe(false)

      // Contraseña válida
      const resultadoValida = esquema.safeParse({
        password: 'Password123'
      })
      expect(resultadoValida.success).toBe(true)
    })
  })
})
