// Servicios para lógica de validación de formularios
import { z } from 'zod'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { EsquemaFormulario } from '@/interfaces/Formulario'
import type { ReglaValidacion } from '@/interfaces/Validacion'
import type { RegistroDatos, ValorDato } from '@/tipos/Comunes'
import { TipoCampoValor } from '@/enumeraciones/Campos'

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
  // Helpers compartidos (DRY)
  private parsearFechaComun(fecha: ValorDato | undefined): Date | undefined {
    if (fecha instanceof Date) return isNaN(fecha.getTime()) ? undefined : fecha
    if (typeof fecha === 'string' && fecha.trim()) {
      const fechaParseada = new Date(fecha)
      return isNaN(fechaParseada.getTime()) ? undefined : fechaParseada
    }
    return undefined
  }

  private construirReglaNumero(
    min: number | undefined,
    max: number | undefined,
    mensajeMin: string | undefined,
    mensajeMax: string | undefined
  ): z.ZodTypeAny {
    let regla = z.number()
    if (typeof min === 'number') regla = regla.min(min, mensajeMin)
    if (typeof max === 'number') regla = regla.max(max, mensajeMax)
    return z.preprocess(
      (valor) => (typeof valor === 'string' ? (valor.trim() === '' ? undefined : Number(valor)) : valor),
      regla
    )
  }

  private construirReglaFecha(
    min: Date | undefined,
    max: Date | undefined
  ): z.ZodTypeAny {
    let regla = z.date()
    if (min) {
      regla = regla.min(min, `Debe ser posterior a ${min.toISOString().slice(0, 10)}`)
    }
    if (max) {
      regla = regla.max(max, `Debe ser anterior a ${max.toISOString().slice(0, 10)}`)
    }
    return z.preprocess((valor) => {
      if (valor == null || valor === '') return undefined
      if (valor instanceof Date) return valor
      if (typeof valor === 'string') {
        const fecha = new Date(valor)
        return isNaN(fecha.getTime()) ? undefined : fecha
      }
      return valor
    }, regla)
  }

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
      case TipoCampoValor.Texto:
      case TipoCampoValor.Correo:
      case TipoCampoValor.Contrasena:
      case TipoCampoValor.AreaTexto:
        esquemaBase = z.string()
        break
      case TipoCampoValor.Numero:
        esquemaBase = this.crearEsquemaNumero(campo)
        break
      case TipoCampoValor.Fecha:
        esquemaBase = this.crearEsquemaFecha(campo)
        break
      case TipoCampoValor.Radio:
      case TipoCampoValor.Seleccion:
        esquemaBase = z.union([z.string(), z.number()])
        break
      case TipoCampoValor.Casilla:
        esquemaBase = this.crearEsquemaCheckbox(campo)
        break
      case TipoCampoValor.Tabla:
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
    const min = typeof meta?.minimo === 'number' ? meta.minimo : undefined
    const max = typeof meta?.maximo === 'number' ? meta.maximo : undefined
    const mensajeMin = typeof meta?.mensajeMinimo === 'string' && meta.mensajeMinimo
      ? meta.mensajeMinimo
      : `Debe ser >= ${min}`
    const mensajeMax = typeof meta?.mensajeMaximo === 'string' && meta.mensajeMaximo
      ? meta.mensajeMaximo
      : `Debe ser <= ${max}`

  return this.construirReglaNumero(min, max, mensajeMin, mensajeMax)
  }

  private crearEsquemaFecha(campo: EsquemaCampo): z.ZodTypeAny {
    const meta = campo.metadatos as Record<string, ValorDato> | undefined
  const fechaMin = this.parsearFechaComun(meta?.fechaMinima as ValorDato | undefined)
  const fechaMax = this.parsearFechaComun(meta?.fechaMaxima as ValorDato | undefined)

  return this.construirReglaFecha(fechaMin, fechaMax).optional()
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
    const min = typeof columna.minimo === 'number' ? columna.minimo : undefined
    const max = typeof columna.maximo === 'number' ? columna.maximo : undefined
    const mensajeMin = typeof columna.mensajeMinimo === 'string' && columna.mensajeMinimo
      ? columna.mensajeMinimo
      : (typeof min === 'number' ? `Debe ser >= ${min}` : 'Valor demasiado pequeño')
    const mensajeMax = typeof columna.mensajeMaximo === 'string' && columna.mensajeMaximo
      ? columna.mensajeMaximo
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
  const fechaMin = this.parsearFechaComun(columna.fechaMinima as ValorDato | undefined)
  const fechaMax = this.parsearFechaComun(columna.fechaMaxima as ValorDato | undefined)
  return this.construirReglaFecha(fechaMin, fechaMax)
  }

  private aplicarValidacionRequerido(campo: EsquemaCampo, esquemaBase: z.ZodTypeAny): z.ZodTypeAny {
  const mensajeRequerido = campo.validaciones?.find((v: ReglaValidacion) => v.tipo === 'requerido')?.mensaje || 'Requerido'

    if (campo.tipo === TipoCampoValor.Casilla) {
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
