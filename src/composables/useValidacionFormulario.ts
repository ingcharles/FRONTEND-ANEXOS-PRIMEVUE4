import { ref, computed } from 'vue'
import { z } from 'zod'
import type { FieldSchema, ValidationResult, FormValidationResult } from '@/types/disenador'

export function useValidacionFormulario() {
  const errores = ref<Record<string, string[]>>({})
  const validando = ref(false)

  // Función para crear esquema Zod dinámicamente
  function crearEsquemaZod(campos: FieldSchema[]): z.ZodSchema {
    const esquemaObjeto: Record<string, z.ZodSchema> = {}

    function procesarCampos(fields: FieldSchema[]) {
      fields.forEach(campo => {
        if (!campo.visible || campo.type === 'Label' || campo.type === 'Divider' || campo.type === 'Panel') {
          if (campo.children) {
            procesarCampos(campo.children)
          }
          return
        }

        let esquemaCampo: z.ZodSchema = z.any()

        // Esquemas base según tipo de campo
        switch (campo.type) {
          case 'text':
          case 'email':
          case 'password':
          case 'textarea':
            esquemaCampo = z.string()
            break
          case 'number':
            esquemaCampo = z.number()
            break
          case 'checkbox':
            esquemaCampo = z.boolean()
            break
          case 'select':
          case 'radio':
            esquemaCampo = z.string()
            break
          case 'table':
            esquemaCampo = z.array(z.record(z.string(), z.unknown()))
            break
          default:
            esquemaCampo = z.any()
        }

        // Aplicar validaciones del campo
        campo.validations.forEach(validacion => {
          switch (validacion.type) {
            case 'required':
              if (campo.required) {
                if (esquemaCampo instanceof z.ZodString) {
                  esquemaCampo = esquemaCampo.min(1, validacion.message || 'Este campo es requerido')
                } else if (esquemaCampo instanceof z.ZodArray) {
                  esquemaCampo = esquemaCampo.min(1, validacion.message || 'Este campo es requerido')
                } else {
                  esquemaCampo = esquemaCampo.refine(
                    val => val !== null && val !== undefined && val !== '',
                    { message: validacion.message || 'Este campo es requerido' }
                  )
                }
              }
              break

            case 'minLength':
              if (esquemaCampo instanceof z.ZodString && typeof validacion.value === 'number') {
                esquemaCampo = esquemaCampo.min(
                  validacion.value,
                  validacion.message || `Mínimo ${validacion.value} caracteres`
                )
              }
              break

            case 'maxLength':
              if (esquemaCampo instanceof z.ZodString && typeof validacion.value === 'number') {
                esquemaCampo = esquemaCampo.max(
                  validacion.value,
                  validacion.message || `Máximo ${validacion.value} caracteres`
                )
              }
              break

            case 'pattern':
              if (esquemaCampo instanceof z.ZodString && typeof validacion.value === 'string') {
                const regex = new RegExp(validacion.value)
                esquemaCampo = esquemaCampo.regex(
                  regex,
                  validacion.message || 'Formato inválido'
                )
              }
              break

            case 'custom':
              if (validacion.expression) {
                try {
                  const validadorCustom = new Function('value', `return ${validacion.expression}`) as (value: unknown) => boolean
                  esquemaCampo = esquemaCampo.refine(
                    validadorCustom,
                    { message: validacion.message || 'Valor inválido' }
                  )
                } catch (error) {
                  console.warn(`Error en validación custom para ${campo.id}:`, error)
                }
              }
              break
          }
        })

        // Si no es requerido, hacer opcional
        if (!campo.required) {
          esquemaCampo = esquemaCampo.optional()
        }

        esquemaObjeto[campo.id] = esquemaCampo

        // Procesar campos hijos
        if (campo.children) {
          procesarCampos(campo.children)
        }
      })
    }

    procesarCampos(campos)
    return z.object(esquemaObjeto)
  }

  // Función para validar un campo individual
  function validarCampo(campo: FieldSchema, valor: unknown): ValidationResult {
    const erroresCampo: string[] = []

    try {
      const esquema = crearEsquemaZod([campo])
      esquema.parse({ [campo.id]: valor })

      // Validaciones de lógica condicional
      const erroresLogica = validarLogicaCampo(campo, valor, {})
      erroresCampo.push(...erroresLogica)

    } catch (error) {
      if (error instanceof z.ZodError) {
        erroresCampo.push(...error.issues.map((e: z.ZodIssue) => e.message))
      } else {
        erroresCampo.push('Error de validación')
      }
    }

    return {
      fieldId: campo.id,
      isValid: erroresCampo.length === 0,
      errors: erroresCampo
    }
  }

  // Función para validar lógica condicional
  function validarLogicaCampo(campo: FieldSchema, valor: unknown, valoresFormulario: Record<string, unknown>): string[] {
    const errores: string[] = []

    campo.logic.forEach(regla => {
      try {
        const valorCondicion = valoresFormulario[regla.condition.fieldId]
        let cumpleCondicion = false

        switch (regla.condition.operator) {
          case '==':
            cumpleCondicion = valorCondicion === regla.condition.value
            break
          case '!=':
            cumpleCondicion = valorCondicion !== regla.condition.value
            break
          case '>':
            cumpleCondicion = Number(valorCondicion) > Number(regla.condition.value)
            break
          case '<':
            cumpleCondicion = Number(valorCondicion) < Number(regla.condition.value)
            break
          case '>=':
            cumpleCondicion = Number(valorCondicion) >= Number(regla.condition.value)
            break
          case '<=':
            cumpleCondicion = Number(valorCondicion) <= Number(regla.condition.value)
            break
          case 'contains':
            cumpleCondicion = String(valorCondicion).includes(String(regla.condition.value))
            break
          case 'startsWith':
            cumpleCondicion = String(valorCondicion).startsWith(String(regla.condition.value))
            break
          case 'endsWith':
            cumpleCondicion = String(valorCondicion).endsWith(String(regla.condition.value))
            break
        }

        if (cumpleCondicion) {
          switch (regla.type) {
            case 'requeridoSi':
              if (!valor || valor === '') {
                errores.push(`Este campo es requerido cuando ${regla.condition.fieldId} ${regla.condition.operator} ${regla.condition.value}`)
              }
              break
            case 'custom':
              if (regla.expression) {
                try {
                  const validadorCustom = new Function('value', 'formValues', `return ${regla.expression}`) as (value: unknown, formValues: Record<string, unknown>) => boolean
                  if (!validadorCustom(valor, valoresFormulario)) {
                    errores.push(`Condición custom no cumplida: ${regla.expression}`)
                  }
                } catch (error) {
                  console.warn(`Error en lógica custom para ${campo.id}:`, error)
                }
              }
              break
          }
        }
      } catch (error) {
        console.warn(`Error evaluando lógica para ${campo.id}:`, error)
      }
    })

    return errores
  }

  // Función para validar todo el formulario
  function validarFormulario(campos: FieldSchema[], valores: Record<string, unknown>): FormValidationResult {
    validando.value = true
    const resultadosCampos: ValidationResult[] = []
    const erroresGlobales: string[] = []

    try {
      const esquema = crearEsquemaZod(campos)
      esquema.parse(valores)

      // Validar cada campo individualmente para obtener errores específicos
      function validarCamposRecursivamente(fields: FieldSchema[]) {
        fields.forEach(campo => {
          if (campo.visible && campo.type !== 'label' && campo.type !== 'divider' && campo.type !== 'panel') {
            const valor = valores[campo.id]
            const resultado = validarCampo(campo, valor)

            // Agregar validaciones de lógica
            const erroresLogica = validarLogicaCampo(campo, valor, valores)
            resultado.errors.push(...erroresLogica)
            resultado.isValid = resultado.errors.length === 0

            resultadosCampos.push(resultado)
          }

          if (campo.children) {
            validarCamposRecursivamente(campo.children)
          }
        })
      }

      validarCamposRecursivamente(campos)

    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((err: z.ZodIssue) => {
          const path = err.path.join('.')
          const campoExistente = resultadosCampos.find(r => r.fieldId === path)
          if (campoExistente) {
            campoExistente.errors.push(err.message)
            campoExistente.isValid = false
          } else {
            erroresGlobales.push(`${path}: ${err.message}`)
          }
        })
      }
    }

    // Actualizar estado de errores
    errores.value = {}
    resultadosCampos.forEach(resultado => {
      if (!resultado.isValid) {
        errores.value[resultado.fieldId] = resultado.errors
      }
    })

    validando.value = false

    const esValido = resultadosCampos.every(r => r.isValid) && erroresGlobales.length === 0

    return {
      isValid: esValido,
      fieldResults: resultadosCampos,
      globalErrors: erroresGlobales
    }
  }

  // Función para limpiar errores
  function limpiarErrores(): void {
    errores.value = {}
  }

  // Función para obtener errores de un campo específico
  function obtenerErroresCampo(campoId: string): string[] {
    return errores.value[campoId] || []
  }

  // Computed para saber si hay errores
  const tieneErrores = computed(() => Object.keys(errores.value).length > 0)

  // Función para evaluar visibilidad condicional
  function evaluarVisibilidad(campo: FieldSchema, valores: Record<string, unknown>): boolean {
    if (!campo.logic.length) return campo.visible

    let visible = campo.visible

    campo.logic.forEach(regla => {
      if (regla.type === 'visibleSi') {
        const valorCondicion = valores[regla.condition.fieldId]
        let cumpleCondicion = false

        switch (regla.condition.operator) {
          case '==':
            cumpleCondicion = valorCondicion === regla.condition.value
            break
          case '!=':
            cumpleCondicion = valorCondicion !== regla.condition.value
            break
          case '>':
            cumpleCondicion = Number(valorCondicion) > Number(regla.condition.value)
            break
          case '<':
            cumpleCondicion = Number(valorCondicion) < Number(regla.condition.value)
            break
          case '>=':
            cumpleCondicion = Number(valorCondicion) >= Number(regla.condition.value)
            break
          case '<=':
            cumpleCondicion = Number(valorCondicion) <= Number(regla.condition.value)
            break
          case 'contains':
            cumpleCondicion = String(valorCondicion).includes(String(regla.condition.value))
            break
          case 'startsWith':
            cumpleCondicion = String(valorCondicion).startsWith(String(regla.condition.value))
            break
          case 'endsWith':
            cumpleCondicion = String(valorCondicion).endsWith(String(regla.condition.value))
            break
        }

        visible = cumpleCondicion
      }
    })

    return visible
  }

  return {
    errores,
    validando,
    tieneErrores,
    validarCampo,
    validarFormulario,
    limpiarErrores,
    obtenerErroresCampo,
    evaluarVisibilidad,
    crearEsquemaZod
  }
}
