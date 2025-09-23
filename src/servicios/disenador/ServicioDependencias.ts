// Servicio para manejo de dependencias y carga de opciones desde APIs
import type { EsquemaCampo, MetadatosCampo } from '@/interfaces/Campos'
import type { ConfiguracionDependencia } from '@/interfaces/Comunes'
import type { RegistroDatos, ValorDato } from '@/tipos/Comunes'

export interface OpcionApi {
  label: string
  value: string | number
}

export interface ConfiguracionApi {
  url: string
  method?: 'GET' | 'POST'
  dataPath?: string
  claveEtiqueta?: string
  claveValor?: string
  contentType?: string
  body?: string
}

type Dependencia = ConfiguracionDependencia & {
  claveParametro?: string
  modoEnvio?: 'query' | 'body' | 'header' | 'path'
  limpiarAlCambiar?: boolean
}

export interface ServicioDependencias {
  cargarOpcionesIndependientes(campo: EsquemaCampo): Promise<void>
  cargarOpcionesDependientes(hijo: EsquemaCampo, valorPadre: ValorDato | RegistroDatos): Promise<void>
  construirUrlConQuery(base: string, params: RegistroDatos): string
  detectarEstructuraAutomatica(datos: ValorDato[], configuracion: ConfiguracionApi): { claveEtiqueta: string; claveValor: string }
}

export class ServicioDependenciasFormulario implements ServicioDependencias {
  private controladoresCarga = new Map<string, AbortController>()

  construirUrlConQuery(base: string, params: RegistroDatos): string {
    try {
      const url = new URL(base, window.location.origin)
      Object.entries(params).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== '') {
          url.searchParams.set(clave, String(valor))
        }
      })
      return url.toString()
    } catch {
      return base
    }
  }

  detectarEstructuraAutomatica(datos: ValorDato[], configuracion: ConfiguracionApi): { claveEtiqueta: string; claveValor: string } {
    let claveEtiqueta = configuracion.claveEtiqueta || 'label'
    let claveValor = configuracion.claveValor || 'value'

    if (datos.length > 0 && (claveEtiqueta === 'label' || claveValor === 'value')) {
      const primerElemento = datos[0]
      if (primerElemento && typeof primerElemento === 'object' && !Array.isArray(primerElemento)) {
        const objeto = primerElemento as Record<string, ValorDato>
        const claves = Object.keys(objeto)

        // Detectar claves comunes para etiqueta
        const clavesEtiqueta = ['etiqueta', 'label', 'texto', 'nombre', 'name', 'title']
        const clavesValor = ['valor', 'value', 'id', 'codigo', 'code']

        const etiquetaDetectada = clavesEtiqueta.find(clave => claves.includes(clave))
        const valorDetectado = clavesValor.find(clave => claves.includes(clave))

        if (etiquetaDetectada && etiquetaDetectada !== claveEtiqueta) {
          claveEtiqueta = etiquetaDetectada
        }
        if (valorDetectado && valorDetectado !== claveValor) {
          claveValor = valorDetectado
        }
      }
    }

    return { claveEtiqueta, claveValor }
  }

  async cargarOpcionesIndependientes(campo: EsquemaCampo): Promise<void> {
    const metadatos = (campo.metadatos || {}) as MetadatosCampo
    const configuracionApi = (metadatos.configuracionApi || metadatos.configuracionApi || {}) as Record<string, ValorDato>

    // Buscar URL en diferentes ubicaciones para compatibilidad
    const url = String((configuracionApi['url'] || metadatos.urlApi || (metadatos as Record<string, unknown>).apiUrl || ''))

    if (!url) return

    const metodo = String(((configuracionApi['method'] as string) || 'GET')).toUpperCase()
    const encabezados: Record<string, string> = {}
    let cuerpo: BodyInit | undefined

    const tipoContenido = String((configuracionApi['contentType'] as string) || 'application/json')
    if (metodo === 'POST') {
      encabezados['Content-Type'] = tipoContenido
      if (configuracionApi['body']) {
        cuerpo = String(configuracionApi['body'])
      }
    }

    try {
      const respuesta = await fetch(url, { method: metodo, headers: encabezados, body: cuerpo })
      if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status)

      const json = (await respuesta.json()) as ValorDato
      let datos: ValorDato = json

      const rutaDatos = String((configuracionApi['dataPath'] as string) || '')
      if (rutaDatos) {
        const partes = rutaDatos.split('.')
        let actual: ValorDato = json
        for (const parte of partes) {
          if (actual && typeof actual === 'object' && !Array.isArray(actual) && parte in (actual as Record<string, ValorDato>)) {
            actual = (actual as Record<string, ValorDato>)[parte]
          } else {
            actual = [] as unknown as ValorDato
            break
          }
        }
        datos = actual
      }

      const arreglo: ValorDato[] = Array.isArray(datos) ? (datos as ValorDato[]) : []

      // Buscar claves de etiqueta y valor en diferentes ubicaciones para compatibilidad
      const claveEtiquetaConfig = (configuracionApi['claveEtiqueta'] as string) ||
                           (metadatos as Record<string, unknown>).claveEtiqueta as string ||
                           metadatos.propiedadEtiqueta
      const claveValorConfig = (configuracionApi['claveValor'] as string) ||
                           (metadatos as Record<string, unknown>).claveValor as string ||
                           metadatos.propiedadValor

      const { claveEtiqueta, claveValor } = this.detectarEstructuraAutomatica(arreglo, {
        url,
        method: metodo as 'GET' | 'POST',
        dataPath: rutaDatos || undefined,
        claveEtiqueta: claveEtiquetaConfig || undefined,
        claveValor: claveValorConfig || undefined,
        contentType: tipoContenido,
        body: (configuracionApi['body'] as string) || undefined,
      })

      const opciones = arreglo.map((elemento) => {
        const objeto = (typeof elemento === 'object' && elemento !== null) ? (elemento as Record<string, ValorDato>) : {}
        const etiqueta = String(objeto[claveEtiqueta] ?? '')
        const valorRaw = objeto[claveValor]
        const valor = typeof valorRaw === 'number' || typeof valorRaw === 'string' ? valorRaw : String(valorRaw ?? '')
        return { label: etiqueta, value: valor }
      }) as OpcionApi[]

      // Actualizar las opciones del campo - usar 'opciones' para compatibilidad con interfaz española
      const metadatosHelper = (campo.metadatos ||= {}) as MetadatosCampo & Record<string, unknown>
      metadatosHelper.opciones = opciones.map(op => ({ etiqueta: op.label, valor: op.value }))
      metadatosHelper.opciones = opciones

    } catch {
      // En caso de error, asegurar que siempre hay un array vacío
      const metadatosHelper = (campo.metadatos ||= {}) as MetadatosCampo & Record<string, unknown>
      metadatosHelper.opciones = []
      metadatosHelper.opciones = []
    }
  }

  async cargarOpcionesDependientes(hijo: EsquemaCampo, valorPadre: ValorDato | RegistroDatos): Promise<void> {
    const metadatos = (hijo.metadatos || {}) as MetadatosCampo
    const dependencia = (metadatos.dependencia || {}) as Dependencia
    const configuracionApi = (metadatos.configuracionApi || metadatos.configuracionApi || {}) as Record<string, ValorDato>
    const url = String((configuracionApi['url'] || ''))

    if (!url) return

    const modo = dependencia.modoEnvio || 'query'
    if (modo !== 'path' && !dependencia.claveParametro) return

  const metodo = String(((configuracionApi['method'] as string) || 'GET')).toUpperCase()
    const encabezados: Record<string, string> = {}
    let urlFinal = url
    let cuerpo: BodyInit | undefined
    const clave = hijo.id || hijo.nombre || Math.random().toString(36).slice(2)

    // Preparar mapa de valores de padres
    const nombresPadres = String(dependencia.campoPadre || '').split(',').map(s => s.trim()).filter(Boolean)
    const mapaValores: RegistroDatos = {}

    if (valorPadre && typeof valorPadre === 'object' && !Array.isArray(valorPadre)) {
      Object.assign(mapaValores, valorPadre as RegistroDatos)
    } else if (nombresPadres.length > 0) {
      mapaValores[nombresPadres[0]] = valorPadre as ValorDato
    } else {
      mapaValores['valor'] = valorPadre as ValorDato
    }

    // Alias genérico 'valor' para el primero no vacío
    const primero = nombresPadres.find(nombre =>
      mapaValores[nombre] !== undefined &&
      mapaValores[nombre] !== null &&
      mapaValores[nombre] !== ''
    )
    if (primero) {
      mapaValores['valor'] = mapaValores[primero]
    }

    // Cancelación de requests anteriores
    this.controladoresCarga.get(clave)?.abort()
    const controladorAbort = new AbortController()
    this.controladoresCarga.set(clave, controladorAbort)

    // Construir URL según modo de envío
    urlFinal = this.construirUrlSegunModo(url, modo, dependencia, mapaValores, nombresPadres)

    // Configurar headers
    if (dependencia.modoEnvio === 'header' && dependencia.claveParametro) {
      encabezados[dependencia.claveParametro] = String(valorPadre ?? '')
    }

    // Configurar body para POST
    const tipoContenido = String((configuracionApi['contentType'] as string) || 'application/json')
    if (metodo === 'POST') {
      encabezados['Content-Type'] = tipoContenido
      if (dependencia.modoEnvio === 'body') {
        cuerpo = this.construirCuerpoRequest(configuracionApi as Record<string, ValorDato>, dependencia, mapaValores, valorPadre as ValorDato)
      } else if (configuracionApi['body']) {
        cuerpo = String(configuracionApi['body'])
      }
    }

    try {
      const respuesta = await fetch(urlFinal, {
        method: metodo,
        headers: encabezados,
        body: cuerpo,
        signal: controladorAbort.signal
      })

      if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status)

      const json = (await respuesta.json()) as ValorDato
      const opciones = this.procesarRespuestaApi(json, {
        url,
        method: metodo as 'GET' | 'POST',
        dataPath: (configuracionApi['dataPath'] as string) || undefined,
        claveEtiqueta: (configuracionApi['claveEtiqueta'] as string) || undefined,
        claveValor: (configuracionApi['claveValor'] as string) || undefined,
        contentType: tipoContenido,
        body: (configuracionApi['body'] as string) || undefined,
      })

      const metadatosHelper = (hijo.metadatos ||= {}) as MetadatosCampo
      metadatosHelper.opciones = opciones

    } catch {
      // En caso de error, asegurar que siempre hay un array vacío
      const metadatosHelper = (hijo.metadatos ||= {}) as MetadatosCampo
      metadatosHelper.opciones = []
    }
  }

  private construirUrlSegunModo(
    url: string,
    modo: string,
    dependencia: Dependencia,
    mapaValores: RegistroDatos,
    nombresPadres: string[]
  ): string {
    if (modo === 'path') {
      return this.construirUrlPath(url, mapaValores, nombresPadres)
    }

    if (modo === 'query' || !modo) {
      return this.construirUrlQuery(url, dependencia, mapaValores, nombresPadres)
    }

    return url
  }

  private construirUrlPath(url: string, mapaValores: RegistroDatos, nombresPadres: string[]): string {
    // Reemplazar placeholders por cualquiera de las claves disponibles
    let reemplazadoAlguno = false
    let temporal = url

    for (const [clave, valor] of Object.entries(mapaValores)) {
      const antes = temporal
      temporal = temporal.replace(
        new RegExp('\\{' + clave + '\\}', 'g'),
        encodeURIComponent(String(valor ?? ''))
      )
      if (temporal !== antes) reemplazadoAlguno = true
    }

    // Si no hubo reemplazos, concatenar segmentos en el orden de los padres
    if (!reemplazadoAlguno) {
      const segmentos: string[] = []
      const orden = nombresPadres.length ? nombresPadres : Object.keys(mapaValores)

      for (const nombre of orden) {
        const valor = mapaValores[nombre]
        if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
          segmentos.push(encodeURIComponent(String(valor)))
        }
      }

      if (segmentos.length) {
        try {
          const urlObj = new URL(temporal, window.location.origin)
          urlObj.pathname = urlObj.pathname.replace(/\/$/, '') + '/' + segmentos.join('/')
          return urlObj.toString()
        } catch {
          return temporal + '/' + segmentos.join('/')
        }
      }
    } else {
      // Normalizar dobles barras si quedaron
      try {
        const urlObj = new URL(temporal, window.location.origin)
        urlObj.pathname = urlObj.pathname.replace(/\/{2,}/g, '/')
        return urlObj.toString()
      } catch {
        return temporal
      }
    }

    return temporal
  }

  private construirUrlQuery(
    url: string,
    dependencia: Dependencia,
    mapaValores: RegistroDatos,
    nombresPadres: string[]
  ): string {
    const parametros: RegistroDatos = {}
    const claves = (dependencia.claveParametro || '').split(',').map(s => s.trim()).filter(Boolean)

    if (claves.length > 1 && claves.length === nombresPadres.length) {
      for (let i = 0; i < claves.length; i++) {
        parametros[claves[i]] = mapaValores[nombresPadres[i]]
      }
    } else if (dependencia.claveParametro && nombresPadres.length <= 1) {
      parametros[dependencia.claveParametro] = mapaValores['valor']
    } else {
      // usar nombres de padres como claves
      for (const nombre of nombresPadres) {
        parametros[nombre] = mapaValores[nombre]
      }
    }

    if (Object.keys(parametros).length) {
      return this.construirUrlConQuery(url, parametros)
    }

    return url
  }

  private construirCuerpoRequest(
    configuracionApi: Record<string, ValorDato>,
    dependencia: Dependencia,
    mapaValores: RegistroDatos,
    valorPadre: ValorDato
  ): string {
    const plantilla = String((configuracionApi['body'] as string) || '')

    // Reemplazar {{clave}} para todas las entradas del mapa
    let procesado = plantilla
    for (const [clave, valor] of Object.entries(mapaValores)) {
      const expresionRegular = new RegExp(`\\{\\{${clave}\\}\\}`, 'g')
      procesado = procesado.replace(expresionRegular, String(valor ?? ''))
    }

    // Compatibilidad: también reemplazar {{claveParametro}} si se definió
    if (dependencia.claveParametro) {
      const expresionRegularParam = new RegExp(`\\{\\{${dependencia.claveParametro}\\}\\}`, 'g')
      procesado = procesado.replace(expresionRegularParam, String(valorPadre ?? ''))
    }

    return procesado
  }

  private procesarRespuestaApi(json: ValorDato, configuracion: ConfiguracionApi): OpcionApi[] {
    let datos: ValorDato = json

    const rutaDatos = configuracion.dataPath || ''
    if (rutaDatos) {
      const partes = rutaDatos.split('.')
      let actual: ValorDato = json
      for (const parte of partes) {
        if (actual && typeof actual === 'object' && !Array.isArray(actual) && parte in (actual as Record<string, ValorDato>)) {
          actual = (actual as Record<string, ValorDato>)[parte]
        } else {
          actual = [] as unknown as ValorDato
          break
        }
      }
      datos = actual
    }

    const arreglo: ValorDato[] = Array.isArray(datos) ? (datos as ValorDato[]) : []
    const { claveEtiqueta, claveValor } = this.detectarEstructuraAutomatica(arreglo, configuracion)

    return arreglo.map((elemento) => {
      const objeto = (typeof elemento === 'object' && elemento !== null) ? (elemento as Record<string, ValorDato>) : {}
      const etiqueta = String(objeto[claveEtiqueta] ?? '')
      const valorRaw = objeto[claveValor]
      const valor = typeof valorRaw === 'number' || typeof valorRaw === 'string' ? valorRaw : String(valorRaw ?? '')
      return { label: etiqueta, value: valor }
    })
  }
}

