// Servicios para lógica de validación de formularios
import { z } from 'zod'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { EsquemaFormulario } from '@/interfaces/Formulario'
import type { ReglaValidacion } from '@/interfaces/Validacion'
import type { RegistroDatos, ValorDato } from '@/tipos/Comunes'

export interface ServicioValidacion {
  recolectarCamposConNombre(lista: EsquemaCampo[], salida?: EsquemaCampo[]): EsquemaCampo[]
  construirMapaIdNombre(lista: EsquemaCampo[]): Record<string, string>
  validarFormularioCompleto(esquema: EsquemaFormulario, obtenerValoresPagina: (id: string) => RegistroDatos): {
    errores: Record<string, string>
    valores: RegistroDatos
    esValido: boolean
  }
}

export class ServicioValidacionFormulario implements ServicioValidacion {
  recolectarCamposConNombre(lista: EsquemaCampo[], salida: EsquemaCampo[] = []): EsquemaCampo[] {
    for (const campo of lista) {
      if (!campo) continue
      if (campo.nombre) salida.push(campo)
      if (campo.hijos?.length) {
        this.recolectarCamposConNombre(campo.hijos, salida)
      }
    }
    return salida
  }

  construirMapaIdNombre(lista: EsquemaCampo[]): Record<string, string> {
    const mapa: Record<string, string> = {}
    const pila: Array<EsquemaCampo | null | undefined> = [...lista]
    
    while (pila.length) {
      const campo = pila.shift()!
      if (!campo) continue
      
      if (campo.id && campo.nombre) {
        mapa[campo.id] = campo.nombre
      }
      
      if (campo.hijos?.length) {
        pila.push(...campo.hijos)
      }
    }
    return mapa
  }

  private crearEsquemaValidacionCampo(campo: EsquemaCampo): z.ZodTypeAny {
    let esquemaBase: z.ZodTypeAny = z.any()

    // Definir esquema base según tipo de campo
    switch (campo.tipo) {
      case 'texto':
      case 'correo':
      case 'contrasena':
      case 'area-texto':
        esquemaBase = z.string()
        break
      case 'numero':
        esquemaBase = this.crearEsquemaNumero(campo)
        break
      case 'fecha':
        esquemaBase = this.crearEsquemaFecha(campo)
        break
      case 'radio':
      case 'seleccion':
        esquemaBase = z.union([z.string(), z.number()])
        break
      case 'casilla':
        esquemaBase = this.crearEsquemaCheckbox(campo)
        break
      case 'tabla':
        esquemaBase = this.crearEsquemaTabla(campo)
        break
      default:
        esquemaBase = z.any()
    }

    // Evaluar reglas de visibilidad y requerimiento (versión simplificada)
    const esVisible = campo.visible !== false
    const esRequerido = campo.requerido && !campo.deshabilitado

    if (!esVisible) {
      return esquemaBase.optional()
    }

    if (esRequerido) {
      return this.aplicarValidacionRequerido(campo, esquemaBase)
    }

    return esquemaBase
  }

  private crearEsquemaNumero(campo: EsquemaCampo): z.ZodTypeAny {
    const meta = campo.metadatos as Record<string, ValorDato> | undefined
    const min = typeof meta?.min === 'number' ? meta.min : undefined
    const max = typeof meta?.max === 'number' ? meta.max : undefined
    const mensajeMin = typeof meta?.minMessage === 'string' && meta.minMessage 
      ? meta.minMessage 
      : `Debe ser >= ${min}`
    const mensajeMax = typeof meta?.maxMessage === 'string' && meta.maxMessage 
      ? meta.maxMessage 
      : `Debe ser <= ${max}`

    let reglaNumero = z.number()
    if (typeof min === 'number') reglaNumero = reglaNumero.min(min, mensajeMin)
    if (typeof max === 'number') reglaNumero = reglaNumero.max(max, mensajeMax)

    return z.preprocess(
      (valor) => typeof valor === 'string' ? (valor.trim() === '' ? undefined : Number(valor)) : valor,
      reglaNumero
    )
  }

  private crearEsquemaFecha(campo: EsquemaCampo): z.ZodTypeAny {
    const meta = campo.metadatos as Record<string, ValorDato> | undefined
    let reglaFecha = z.date()

  const parsearFecha = (fecha: ValorDato | undefined): Date | undefined => {
      if (fecha instanceof Date) return isNaN(fecha.getTime()) ? undefined : fecha
      if (typeof fecha === 'string' && fecha.trim()) {
        const fechaParseada = new Date(fecha)
        return isNaN(fechaParseada.getTime()) ? undefined : fechaParseada
      }
      return undefined
    }

  const fechaMin = parsearFecha(meta?.minDate as ValorDato | undefined)
  const fechaMax = parsearFecha(meta?.maxDate as ValorDato | undefined)

    if (fechaMin) {
      reglaFecha = reglaFecha.min(fechaMin, `Debe ser posterior a ${fechaMin.toISOString().slice(0, 10)}`)
    }
    if (fechaMax) {
      reglaFecha = reglaFecha.max(fechaMax, `Debe ser anterior a ${fechaMax.toISOString().slice(0, 10)}`)
    }

    return z.preprocess((valor) => {
      if (valor == null || valor === '') return undefined
      if (valor instanceof Date) return valor
      if (typeof valor === 'string') {
        const fecha = new Date(valor)
        return isNaN(fecha.getTime()) ? undefined : fecha
      }
      return valor
    }, reglaFecha).optional()
  }

  private crearEsquemaCheckbox(campo: EsquemaCampo): z.ZodTypeAny {
  const metaObjeto = campo.metadatos as Record<string, ValorDato> | undefined
  const opciones = metaObjeto?.opciones as unknown
    const esGrupo = Array.isArray(opciones) && opciones.length > 0

  return esGrupo ? z.array(z.union([z.string(), z.number()])) : z.boolean()
  }

  private crearEsquemaTabla(campo: EsquemaCampo): z.ZodTypeAny {
  const meta = campo.metadatos as Record<string, ValorDato> | undefined
  const columnasRaw = (meta?.columnas as unknown) || []
  const columnas = Array.isArray(columnasRaw) ? columnasRaw as Array<Record<string, ValorDato>> : []
    
    const formaFila: Record<string, z.ZodTypeAny> = {}

    for (const columna of columnas) {
      const tipo = (columna.tipo as string) || 'texto'
      const nombre = String(columna.nombre || '')
      if (!nombre) continue

      const esRequerido = Boolean(columna.requerido)
      let esquemaColumna: z.ZodTypeAny

      switch (tipo) {
        case 'numero':
          esquemaColumna = this.crearEsquemaNumeroTabla(columna)
          break
        case 'fecha':
          esquemaColumna = this.crearEsquemaFechaTabla(columna)
          break
        default:
          esquemaColumna = z.string()
      }

      formaFila[nombre] = esRequerido ? esquemaColumna : esquemaColumna.optional()
    }

    return z.array(z.object(formaFila)).optional()
  }

  private crearEsquemaNumeroTabla(columna: Record<string, ValorDato>): z.ZodTypeAny {
    const min = typeof columna.min === 'number' ? columna.min : undefined
    const max = typeof columna.max === 'number' ? columna.max : undefined
    const mensajeMin = typeof columna.minMessage === 'string' && columna.minMessage 
      ? columna.minMessage 
      : (typeof min === 'number' ? `Debe ser >= ${min}` : 'Valor demasiado pequeño')
    const mensajeMax = typeof columna.maxMessage === 'string' && columna.maxMessage 
      ? columna.maxMessage 
      : (typeof max === 'number' ? `Debe ser <= ${max}` : 'Valor demasiado grande')

    let reglaNumero = z.number()
    if (typeof min === 'number') reglaNumero = reglaNumero.min(min, mensajeMin)
    if (typeof max === 'number') reglaNumero = reglaNumero.max(max, mensajeMax)

    return z.preprocess(
      (valor) => typeof valor === 'string' ? (valor.trim() === '' ? undefined : Number(valor)) : valor,
      reglaNumero
    )
  }

  private crearEsquemaFechaTabla(columna: Record<string, ValorDato>): z.ZodTypeAny {
    let reglaFecha = z.date()

    const parsearFecha = (fecha: ValorDato | undefined): Date | undefined => {
      if (fecha instanceof Date) return isNaN(fecha.getTime()) ? undefined : fecha
      if (typeof fecha === 'string' && fecha.trim()) {
        const fechaParseada = new Date(fecha)
        return isNaN(fechaParseada.getTime()) ? undefined : fechaParseada
      }
      return undefined
    }

  const fechaMin = parsearFecha(columna.minDate as ValorDato | undefined)
  const fechaMax = parsearFecha(columna.maxDate as ValorDato | undefined)

    if (fechaMin) {
      reglaFecha = reglaFecha.min(fechaMin, `Debe ser posterior a ${fechaMin.toISOString().slice(0, 10)}`)
    }
    if (fechaMax) {
      reglaFecha = reglaFecha.max(fechaMax, `Debe ser anterior a ${fechaMax.toISOString().slice(0, 10)}`)
    }

    return z.preprocess((valor) => {
      if (valor == null || valor === '') return undefined
      if (valor instanceof Date) return valor
      if (typeof valor === 'string') {
        const fecha = new Date(valor)
        return isNaN(fecha.getTime()) ? undefined : fecha
      }
      return valor
    }, reglaFecha)
  }

  private aplicarValidacionRequerido(campo: EsquemaCampo, esquemaBase: z.ZodTypeAny): z.ZodTypeAny {
  const mensajeRequerido = campo.validaciones?.find((v: ReglaValidacion) => v.tipo === 'requerido')?.mensaje || 'Requerido'

    if (campo.tipo === 'casilla') {
      const metaObjeto = campo.metadatos as Record<string, unknown> | undefined
      const opciones = metaObjeto?.opciones as unknown
      
      if (Array.isArray(opciones) && opciones.length > 0) {
        return z.array(z.union([z.string(), z.number()])).refine(
          (arr) => Array.isArray(arr) && arr.length > 0,
          mensajeRequerido || 'Seleccione al menos una opción'
        )
      } else {
        return z.literal(true)
      }
    }

    if (campo.tipo === 'fecha') {
      return esquemaBase.refine(
        (valor: unknown) => valor instanceof Date,
        mensajeRequerido
      )
    }

    return esquemaBase.refine(
      (valor: unknown) => typeof valor === 'string' ? valor.trim().length > 0 : valor != null,
      mensajeRequerido
    )
  }

  validarFormularioCompleto(
    esquema: EsquemaFormulario,
    obtenerValoresPagina: (id: string) => RegistroDatos
  ): { errores: Record<string, string>; valores: RegistroDatos; esValido: boolean } {
    const erroresGlobales: Record<string, string> = {}
    const valoresGlobales: RegistroDatos = {}

    for (const pagina of esquema.paginas) {
      const valoresPagina = obtenerValoresPagina(pagina.id)
      Object.assign(valoresGlobales, valoresPagina)

  const forma: Record<string, z.ZodTypeAny> = {}
      const todosCampos = this.recolectarCamposConNombre(pagina.campos, [])
  // const mapaIdNombre = this.construirMapaIdNombre(pagina.campos)

      for (const campo of todosCampos) {
          if (campo.nombre) {
          forma[campo.nombre] = this.crearEsquemaValidacionCampo(campo)
        }
      }

      const esquemaPagina = z.object(forma)
  const resultado = esquemaPagina.safeParse(valoresPagina)

      if (!resultado.success) {
        for (const problema of resultado.error.issues) {
          const ruta = String(problema.path[0] || '')
          if (ruta) {
            erroresGlobales[ruta] = problema.message
          }
        }
      }
    }

    return {
      errores: erroresGlobales,
      valores: valoresGlobales,
      esValido: Object.keys(erroresGlobales).length === 0
    }
  }
}
