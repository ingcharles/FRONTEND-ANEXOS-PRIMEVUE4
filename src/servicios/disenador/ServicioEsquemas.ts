// Servicio para manejo de esquemas de formulario y validación
import { z } from 'zod'
import type { EsquemaCampo, MetadatosCampo } from '@/interfaces/Campos'
import type { ColumnaTabla } from '@/interfaces/Comunes'
import { TipoCampoValor } from '@/enumeraciones/Campos'
import type { ValorDato } from '@/tipos/Comunes'

export interface ServicioEsquemas {
  recolectarCamposConNombre(lista: EsquemaCampo[], salida?: EsquemaCampo[]): EsquemaCampo[]
  construirMapaIdNombre(lista: EsquemaCampo[]): Record<string, string>
  aplanarCampos(lista: EsquemaCampo[], salida?: EsquemaCampo[]): EsquemaCampo[]
  obtenerColumnasTabla(campo: EsquemaCampo): ColumnaTabla[]
  obtenerFilasTabla(campo: EsquemaCampo): number
  crearFilaVacia(columnas: ColumnaTabla[]): Record<string, ValorDato>
  crearEsquemaValidacion(campos: EsquemaCampo[]): z.ZodObject<Record<string, z.ZodTypeAny>>
}

export class ServicioEsquemasFormulario implements ServicioEsquemas {
  recolectarCamposConNombre(lista: EsquemaCampo[], salida: EsquemaCampo[] = []): EsquemaCampo[] {
    if (!Array.isArray(lista)) return salida
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

  aplanarCampos(lista: EsquemaCampo[], salida: EsquemaCampo[] = []): EsquemaCampo[] {
    for (const campo of lista || []) {
      if (!campo) continue
      salida.push(campo)
      if (campo.hijos?.length) {
        this.aplanarCampos(campo.hijos, salida)
      }
    }
    return salida
  }

  obtenerColumnasTabla(campo: EsquemaCampo): ColumnaTabla[] {
    const metadatos = campo.metadatos as MetadatosCampo | undefined
    const columnasRaw = (metadatos?.columnas ?? metadatos?.columnas) as unknown
    return Array.isArray(columnasRaw)
      ? (columnasRaw as ColumnaTabla[]).filter(c => c && typeof c.nombre === 'string')
      : []
  }

  obtenerFilasTabla(campo: EsquemaCampo): number {
    const metadatos = campo.metadatos as MetadatosCampo | undefined
    let filas: number | undefined = metadatos?.filas
    if (filas === undefined) {
      const metaGenerico = metadatos as unknown as { filas?: number }
      if (typeof metaGenerico?.filas === 'number') filas = metaGenerico.filas
    }
    return typeof filas === 'number' && filas > 0 ? filas : 1
  }

  crearFilaVacia(columnas: ColumnaTabla[]): Record<string, ValorDato> {
    const objeto: Record<string, ValorDato> = {}
  for (const columna of columnas) {
      objeto[columna.nombre] = null
    }
    return objeto
  }

  crearEsquemaValidacion(campos: EsquemaCampo[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
    const forma: Record<string, z.ZodTypeAny> = {}
    const todosCampos = this.recolectarCamposConNombre(campos, [])
  // const mapaIdNombre = this.construirMapaIdNombre(campos)

    for (const campo of todosCampos) {
      if (!campo.nombre) continue

      let esquemaBase = this.crearEsquemaBasePorTipo(campo)

      // Evaluar reglas de visibilidad y requerimiento (versión simplificada)
      const esVisible = campo.visible !== false
      const esRequerido = campo.requerido && !campo.deshabilitado

      if (!esVisible) {
        esquemaBase = esquemaBase.optional()
      } else if (esRequerido) {
        esquemaBase = this.aplicarValidacionRequerido(campo, esquemaBase)
      }

      // Aplicar validaciones adicionales
      esquemaBase = this.aplicarValidacionesPersonalizadas(campo, esquemaBase)

      forma[campo.nombre] = esquemaBase
    }

    return z.object(forma)
  }

  private crearEsquemaBasePorTipo(campo: EsquemaCampo): z.ZodTypeAny {
    switch (campo.tipo) {
      case 'texto':
      case 'correo':
      case 'contrasena':
      case 'area-texto':
        return z.string()

      case 'numero':
        return this.crearEsquemaNumero(campo)

      case 'fecha':
        return this.crearEsquemaFecha(campo)

      case 'hora':
        return z.any()

      case 'radio':
      case 'seleccion':
        return z.union([z.string(), z.number()])

      case 'casilla':
        return this.crearEsquemaCheckbox(campo)

      case 'tabla':
        return this.crearEsquemaTabla(campo)

      default:
        return z.any()
    }
  }

  private crearEsquemaNumero(campo: EsquemaCampo): z.ZodTypeAny {
    const metadatos = campo.metadatos as MetadatosCampo | undefined
    const min = typeof metadatos?.minimo === 'number' ? metadatos?.minimo : undefined
    const max = typeof metadatos?.maximo === 'number' ? metadatos?.maximo: undefined
    const mensajeMin = typeof (metadatos?.mensajeMinimo) === 'string' && metadatos?.mensajeMinimo
      ? metadatos?.mensajeMinimo
      : `Debe ser >= ${min}`
    const mensajeMax = typeof metadatos?.mensajeMaximo === 'string' && (metadatos?.mensajeMaximo)
      ? metadatos?.mensajeMaximo
      : `Debe ser <= ${max}`

    let reglaNumero = z.number()
    if (typeof min === 'number') reglaNumero = reglaNumero.min(min, mensajeMin)
    if (typeof max === 'number') reglaNumero = reglaNumero.max(max, mensajeMax)

    return z.preprocess(
      (valor) => typeof valor === 'string' ? (valor.trim() === '' ? undefined : Number(valor)) : valor,
      reglaNumero
    ).optional()
  }

  private crearEsquemaFecha(campo: EsquemaCampo): z.ZodTypeAny {
    const metadatos = campo.metadatos as MetadatosCampo | undefined
    let reglaFecha = z.date()

    const parsearFecha = (fecha: string | Date | undefined): Date | undefined => {
      if (fecha instanceof Date) return isNaN(fecha.getTime()) ? undefined : fecha
      if (typeof fecha === 'string' && fecha.trim()) {
        const fechaParseada = new Date(fecha)
        return isNaN(fechaParseada.getTime()) ? undefined : fechaParseada
      }
      return undefined
    }

    const fechaMin = parsearFecha(metadatos?.fechaMinima)
    const fechaMax = parsearFecha(metadatos?.fechaMaxima)

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
    const metadatos = campo.metadatos as MetadatosCampo | undefined
    const opciones = metadatos?.opciones
    const esGrupo = Array.isArray(opciones) && opciones.length > 0

    return esGrupo ? z.array(z.union([z.string(), z.number()])) : z.boolean()
  }

  private crearEsquemaTabla(campo: EsquemaCampo): z.ZodTypeAny {
    const columnas = this.obtenerColumnasTabla(campo)
    const formaFila: Record<string, z.ZodTypeAny> = {}

    for (const columna of columnas) {
      const esRequerido = Boolean(columna.requerido)
      let esquemaColumna: z.ZodTypeAny

      switch (columna.tipo || 'text') {
        case 'number':
          esquemaColumna = this.crearEsquemaNumeroColumna(columna)
          break
        case 'date':
          esquemaColumna = this.crearEsquemaFechaColumna()
          break
        default:
          esquemaColumna = z.string()
      }

      // Usar el nombre técnico de la columna como clave del objeto de fila
      formaFila[columna.nombre] = esRequerido ? esquemaColumna : esquemaColumna.optional()
    }

    return z.array(z.object(formaFila)).optional()
  }

  private crearEsquemaNumeroColumna(columna: ColumnaTabla): z.ZodTypeAny {
    type ColumnaConMensajes = ColumnaTabla & {
      min?: number
      max?: number
      minMessage?: string
      maxMessage?: string
      mensajeMin?: string
      mensajeMax?: string
    }
    const col = columna as ColumnaConMensajes
    const min = typeof col.min === 'number' ? col.min : undefined
    const max = typeof col.max === 'number' ? col.max : undefined
    const mensajeMin = col.mensajeMinimo || col.mensajeMin || (typeof min === 'number' ? `Debe ser >= ${min}` : 'Valor demasiado pequeño')
    const mensajeMax = col.mensajeMaximo || col.mensajeMax || (typeof max === 'number' ? `Debe ser <= ${max}` : 'Valor demasiado grande')

    let reglaNumero = z.number()
    if (typeof min === 'number') reglaNumero = reglaNumero.min(min, mensajeMin)
    if (typeof max === 'number') reglaNumero = reglaNumero.max(max, mensajeMax)

    return z.preprocess(
      (valor) => typeof valor === 'string' ? (valor.trim() === '' ? undefined : Number(valor)) : valor,
      reglaNumero
    )
  }

  private crearEsquemaFechaColumna(): z.ZodTypeAny {
    const reglaFecha = z.date()

    // Para columnas de tabla, las fechas min/max vendrían en las propiedades de la columna
    // Por ahora mantener estructura básica, se puede extender según necesidades usando 'columna'

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
    const mensajeRequerido = campo.validaciones?.find(v => v.tipo === 'requerido')?.mensaje || 'Requerido'

    if (campo.tipo === TipoCampoValor.Casilla) {
      const metadatos = campo.metadatos as MetadatosCampo | undefined
      const opciones = metadatos?.opciones

      if (Array.isArray(opciones) && opciones.length > 0) {
        return z.array(z.any()).refine(
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

    if (campo.tipo === 'numero') {
      return esquemaBase.refine(
        (valor: unknown) => valor != null,
        mensajeRequerido
      )
    }

    return esquemaBase.refine(
      (valor: unknown) => typeof valor === 'string' ? valor.trim().length > 0 : valor != null,
      mensajeRequerido
    )
  }

  private aplicarValidacionesPersonalizadas(campo: EsquemaCampo, esquemaBase: z.ZodTypeAny): z.ZodTypeAny {
    if (!campo.validaciones?.length) return esquemaBase

    let esquemaConValidaciones = esquemaBase

    for (const validacion of campo.validaciones!) {
      switch (validacion.tipo) {
        case 'longitud-minima':
          if (typeof validacion.valor === 'number') {
            esquemaConValidaciones = esquemaConValidaciones.refine(
              (valor: unknown) => typeof valor === 'string' ? valor.length >= (validacion.valor as number) : true,
              validacion.mensaje || `Debe tener al menos ${validacion.valor} caracteres`
            )
          }
          break

        case 'longitud-maxima':
          if (typeof validacion.valor === 'number') {
            esquemaConValidaciones = esquemaConValidaciones.refine(
              (valor: unknown) => typeof valor === 'string' ? valor.length <= (validacion.valor as number) : true,
              validacion.mensaje || `No debe superar ${validacion.valor} caracteres`
            )
          }
          break

        case 'patron':
          if (typeof validacion.valor === 'string') {
            const patron = new RegExp(validacion.valor)
            esquemaConValidaciones = esquemaConValidaciones.refine(
              (valor: unknown) => typeof valor === 'string' ? patron.test(valor) : true,
              validacion.mensaje || 'Formato inválido'
            )
          }
          break
      }
    }

    return esquemaConValidaciones
  }
}

