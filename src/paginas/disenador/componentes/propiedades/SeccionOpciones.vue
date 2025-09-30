<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { OpcionSeleccion } from '@/interfaces/Comunes'
import SeccionDependencias from './SeccionDependencias.vue'
import ModalAlerta from '@/componentes/ModalAlerta.vue'
import { ServicioCampos } from '@/servicios/disenador/ServiciosCampos'
import type { ConfigApi } from '@/interfaces/TabAtributos'
import { MetodoHttp, ModoCarga, ModoOpciones } from '@/tipos/TabAtributos'
import { opcionesFuente, opcionesMetodo, opcionesContentType } from '@/constantes/TabAtributos'
import { TipoCampoValor } from '@/enumeraciones/Campos'


const props = defineProps<{
  campo: EsquemaCampo | null
}>()

const almacen = useAlmacenDisenador()

// Estado para carga de API
const cargandoApi = ref(false)
const errorApi = ref<string | null>(null)

// Estado para modal de alerta
const mostrarModalAlerta = ref(false)
const datosModalAlerta = ref({
  titulo: '',
  mensaje: '',
  detalle: ''
})



// Metadatos tipados
const metadatos = computed(() => {
  if (!props.campo) return {}
  return props.campo.metadatos || {}
})

// Configuración de API
const configApi = computed((): ConfigApi => {
  const meta = metadatos.value as Record<string, unknown>
  const config = (meta.configuracionApi as ConfigApi) || {}
  return {
    url: config.url || '',
    method: config.method || MetodoHttp.GET,
    dataPath: config.dataPath || '',
    claveEtiqueta: config.claveEtiqueta || 'label',
    claveValor: config.claveValor || 'value',
    contentType: config.contentType || 'application/json',
    body: config.body || '',
    headersJson: config.headersJson || ''
  }
})

// Verificar si el campo puede tener opciones
function esCampoConOpciones(): boolean {
  if (!props.campo) return false
  return ServicioCampos.soportaOpciones(props.campo.tipo)
}

// Modo de opciones
function obtenerModoOpciones(): ModoOpciones {
  const meta = metadatos.value as Record<string, unknown>
  return (meta.modoOpciones as ModoOpciones) || ModoOpciones.MANUAL
}

function actualizarModoOpciones(modo: ModoOpciones): void {
  if (!props.campo) return
  const meta = { ...metadatos.value } as Record<string, unknown>
  meta.modoOpciones = modo

  // Asegurar que opciones existe como array
  if (!Array.isArray(meta.opciones)) {
    meta.opciones = []
  }

  almacen.actualizarCampo(props.campo.id, { metadatos: meta })
}

// Gestión de opciones manuales
function obtenerOpciones(): OpcionSeleccion[] {
  const meta = metadatos.value as Record<string, unknown>
  // Preferir español
  const opsEs = meta.opciones
  if (Array.isArray(opsEs)) return opsEs as OpcionSeleccion[]
  // Compat: convertir de inglés si existe
  const opsEn = meta.opciones
  if (Array.isArray(opsEn)) {
    return (opsEn as Array<Record<string, unknown>>).map((o) => ({
      etiqueta: String(o.label ?? ''),
      valor: (o.value as string | number) ?? ''
    }))
  }
  return []
}

function actualizarOpciones(opciones: OpcionSeleccion[]): void {
  if (!props.campo) return
  const meta = { ...metadatos.value } as Record<string, unknown>

  // Guardar las opciones en el formato español
  meta.opciones = opciones

  almacen.actualizarCampo(props.campo.id, { metadatos: meta })
}

function agregarOpcion(): void {
  const opciones = obtenerOpciones()
  opciones.push({ etiqueta: '', valor: '' })
  actualizarOpciones(opciones)
}

function actualizarOpcion(indice: number, propiedad: keyof OpcionSeleccion, valor: unknown): void {
  const opciones = [...obtenerOpciones()]
  if (indice >= 0 && indice < opciones.length) {
    opciones[indice] = { ...opciones[indice], [propiedad]: valor }
    actualizarOpciones(opciones)
  }
}

function eliminarOpcion(indice: number): void {
  const opciones = obtenerOpciones()
  if (indice >= 0 && indice < opciones.length) {
    opciones.splice(indice, 1)
    actualizarOpciones(opciones)
  }
}

// Configuración de API
function actualizarConfigApi(parcial: Partial<ConfigApi>): void {
  if (!props.campo) return
  const meta = { ...metadatos.value } as Record<string, unknown>
  const actual = (meta.configuracionApi as ConfigApi) || {}
  meta.configuracionApi = { ...actual, ...parcial }
  almacen.actualizarCampo(props.campo.id, { metadatos: meta })
}

// Valor por defecto
function obtenerValorPorDefecto(): unknown {
  const meta = metadatos.value as Record<string, unknown>
  return meta.valorPorDefecto
}

function obtenerValorPorDefectoArray(): unknown[] {
  const valor = obtenerValorPorDefecto()
  return Array.isArray(valor) ? valor : []
}

function actualizarValorPorDefecto(valor: unknown): void {
  if (!props.campo) return
  const meta = { ...metadatos.value } as Record<string, unknown>
  meta.valorPorDefecto = valor
  almacen.actualizarCampo(props.campo.id, { metadatos: meta })
}

// Utilidades para API
function extraerPorRuta(obj: unknown, ruta: string | undefined): unknown {
  if (!ruta) return obj
  if (typeof obj !== 'object' || obj == null) return obj

  const partes = ruta.split('.')
  let actual: unknown = obj

  for (const parte of partes) {
    if (typeof actual === 'object' && actual !== null && parte in (actual as Record<string, unknown>)) {
      actual = (actual as Record<string, unknown>)[parte]
    } else {
      return undefined
    }
  }

  return actual
}

function detectarEstructuraApi(datos: unknown[]): { claveEtiqueta: string; claveValor: string } {
  if (!Array.isArray(datos) || datos.length === 0) {
    return { claveEtiqueta: 'label', claveValor: 'value' }
  }

  const primer = datos[0]
  if (typeof primer !== 'object' || primer === null) {
    return { claveEtiqueta: 'label', claveValor: 'value' }
  }

  const obj = primer as Record<string, unknown>
  const claves = Object.keys(obj)

  // Detectar claves comunes
  const clavesEtiqueta = ['etiqueta', 'label', 'texto', 'nombre', 'name', 'title']
  const clavesValor = ['valor', 'value', 'id', 'codigo', 'code']

  const claveEtiqueta = clavesEtiqueta.find(k => claves.includes(k)) || claves[0] || 'label'
  const claveValor = clavesValor.find(k => claves.includes(k)) || claves[1] || 'value'

  return { claveEtiqueta, claveValor }
}

// Función para obtener mensaje de error específico según el código HTTP
function obtenerMensajeError(status: number, message?: string): { titulo: string; mensaje: string } {
  switch (status) {
    case 400:
      return {
        titulo: 'Solicitud incorrecta',
        mensaje: 'La URL o los parámetros enviados son incorrectos. Verifique la configuración de la API.'
      }
    case 401:
      return {
        titulo: 'No autorizado',
        mensaje: 'Se requiere autenticación. Verifique los headers de autorización en la configuración.'
      }
    case 403:
      return {
        titulo: 'Acceso denegado',
        mensaje: 'No tiene permisos para acceder a este recurso. Contacte al administrador de la API.'
      }
    case 404:
      return {
        titulo: 'Recurso no encontrado',
        mensaje: 'La URL especificada no existe. Verifique que la dirección de la API sea correcta.'
      }
    case 408:
      return {
        titulo: 'Tiempo de espera agotado',
        mensaje: 'La API tardó demasiado en responder. Inténtelo nuevamente o contacte al administrador.'
      }
    case 429:
      return {
        titulo: 'Demasiadas solicitudes',
        mensaje: 'Ha excedido el límite de solicitudes. Espere un momento antes de intentar nuevamente.'
      }
    case 500:
      return {
        titulo: 'Error interno del servidor',
        mensaje: 'Hay un problema en el servidor de la API. Contacte al administrador del servicio.'
      }
    case 502:
      return {
        titulo: 'Puerta de enlace incorrecta',
        mensaje: 'El servidor está experimentando problemas. Inténtelo más tarde.'
      }
    case 503:
      return {
        titulo: 'Servicio no disponible',
        mensaje: 'La API está temporalmente fuera de servicio. Inténtelo más tarde.'
      }
    case 504:
      return {
        titulo: 'Tiempo de espera de puerta de enlace',
        mensaje: 'El servidor tardó demasiado en responder. Inténtelo nuevamente.'
      }
    default:
      if (status >= 400 && status < 500) {
        return {
          titulo: 'Error del cliente',
          mensaje: `Error HTTP ${status}: ${message || 'Verifique la configuración de la solicitud.'}`
        }
      } else if (status >= 500) {
        return {
          titulo: 'Error del servidor',
          mensaje: `Error HTTP ${status}: ${message || 'Hay un problema en el servidor de la API.'}`
        }
      } else {
        return {
          titulo: 'Error de conexión',
          mensaje: message || 'No se pudo conectar con la API. Verifique su conexión a internet y la URL.'
        }
      }
  }
}

// Función para mostrar modal de error
function mostrarError(status: number, message?: string): void {
  const { titulo, mensaje } = obtenerMensajeError(status, message)
  datosModalAlerta.value = {
    titulo,
    mensaje,
    detalle: status > 0 ? `Código de error: ${status}` : ''
  }
  mostrarModalAlerta.value = true
}
// Cargar opciones desde API
async function cargarOpcionesDesdeApi(modo: ModoCarga.AGREGAR | ModoCarga.REEMPLAZAR): Promise<void> {
  if (!props.campo) return

  const config = configApi.value
  errorApi.value = null

  if (!config.url) {
    mostrarError(0, 'Ingrese una URL para cargar opciones.')
    return
  }

  try {
    cargandoApi.value = true

    // Preparar headers
    const headers: Record<string, string> = {}
    if (config.contentType) headers['Content-Type'] = config.contentType

    if (config.headersJson) {
      try {
        const parsed = JSON.parse(config.headersJson) as Record<string, unknown>
        for (const [clave, valor] of Object.entries(parsed)) {
          if (typeof valor === 'string') headers[clave] = valor
        }
      } catch {
        mostrarError(0, 'El formato JSON de los headers es inválido.')
        return
      }
    }

    // Preparar body para POST
    let body: string | undefined
    if ((config.method || MetodoHttp.GET) === MetodoHttp.POST) {
      if (config.contentType && config.contentType.includes('application/json')) {
        if (config.body && config.body.trim()) {
          try {
            JSON.parse(config.body) // Validar JSON
            body = config.body
          } catch {
            body = config.body // Usar como texto plano si no es JSON válido
          }
        }
      } else {
        body = config.body && config.body.trim() ? config.body : undefined
      }
    }

    // Realizar petición
    const respuesta = await fetch(config.url, {
      method: config.method || MetodoHttp.GET,
      headers,
      body
    })

    if (!respuesta.ok) {
      mostrarError(respuesta.status, respuesta.statusText)
      return
    }

    const datos = await respuesta.json()
    const array = extraerPorRuta(datos, config.dataPath)
    const lista = Array.isArray(array) ? array : (Array.isArray(datos) ? datos : [])

    // Detectar estructura automáticamente si es necesario
    let claveEtiqueta = config.claveEtiqueta
    let claveValor = config.claveValor

    if (lista.length > 0 && (claveEtiqueta === 'label' || claveValor === 'value')) {
      const estructura = detectarEstructuraApi(lista)
      if (estructura.claveEtiqueta !== claveEtiqueta || estructura.claveValor !== claveValor) {
        claveEtiqueta = estructura.claveEtiqueta
        claveValor = estructura.claveValor
        actualizarConfigApi({ claveEtiqueta, claveValor })
      }
    }

    // Mapear datos
    const opcionesMapeadas = (lista as unknown[]).map((elemento) => {
      const obj = (typeof elemento === 'object' && elemento !== null)
        ? (elemento as Record<string, unknown>)
        : {}

      const label = claveEtiqueta ? obj[claveEtiqueta] : obj['label']
      const value = claveValor ? obj[claveValor] : obj['value']

      return {
        etiqueta: String(label ?? ''),
        valor: value as string | number || ''
      }
    })

    // Aplicar opciones según el modo
    if (modo === ModoCarga.REEMPLAZAR) {
      actualizarOpciones(opcionesMapeadas)
    } else {
      // Agregar sin duplicar
      const existentes = obtenerOpciones()
      const valoresVistos = new Set(existentes.map(o => JSON.stringify(o.valor)))
      const fusion = existentes.concat(
        opcionesMapeadas.filter(o => !valoresVistos.has(JSON.stringify(o.valor)))
      )
      actualizarOpciones(fusion)
    }

  } catch (error: unknown) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      mostrarError(0, 'No se pudo conectar con la API. Verifique la URL y su conexión a internet.')
    } else {
      mostrarError(0, error instanceof Error ? error.message : 'Error inesperado al cargar opciones')
    }
  } finally {
    cargandoApi.value = false
  }
}
</script>
<template>
  <div v-if="esCampoConOpciones()" class="mb-3">
    <h3 class="tamanio-fuente-miga text-color mb-2">Opciones</h3>

    <!-- Selector de fuente de opciones -->
    <div class="grid">
      <div class="col-12">
        <label class="tamanio-fuente-miga">Fuente de opciones</label>
        <PrimeSelect :model-value="obtenerModoOpciones()" :options="opcionesFuente" option-label="label"
          option-value="value" class="ancho-100 tamanio-fuente-miga"
          @update:model-value="(v: ModoOpciones) => actualizarModoOpciones(v)" />
      </div>
    </div>

    <!-- Opciones manuales -->
    <template v-if="obtenerModoOpciones() === ModoOpciones.MANUAL">
      <div class="flex justify-content-between align-items-center mb-2">
        <label class="tamanio-fuente-miga">Opciones</label>
        <PrimeButton label="Agregar" size="small" icon="pi pi-plus" @click="agregarOpcion" />
      </div>

      <div v-for="(opcion, indice) in obtenerOpciones()" :key="indice" class="grid align-items-end mb-2">
        <div class="col-12">
          <label class="tamanio-fuente-miga">Etiqueta</label>
          <PrimeInputText :model-value="String(opcion.etiqueta)"
            @update:model-value="(v: string | undefined) => actualizarOpcion(indice, 'etiqueta', v || '')"
            class="ancho-100 tamanio-fuente-miga" />
        </div>

        <div class="col-12">
          <label class="tamanio-fuente-miga">Valor</label>
          <PrimeInputText :model-value="String(opcion.valor ?? '')"
            @update:model-value="(v: string | undefined) => actualizarOpcion(indice, 'valor', v || '')"
            class="ancho-100 tamanio-fuente-miga" />
        </div>

        <div class="col-12 row-start-2 flex align-items-end">
          <PrimeButton icon="pi pi-trash" severity="danger" text @click="eliminarOpcion(indice)" />
        </div>
      </div>
    </template>

    <!-- Configuración de API -->
    <div v-if="obtenerModoOpciones() === ModoOpciones.API" class="mt-2 p-3 border-1 surface-border border-round">
      <div class="negrilla mb-2 tamanio-fuente-miga">Cargar opciones por API</div>

      <div class="grid">
        <!-- URL -->
        <div class="col-12">
          <label class="mb-2">URL</label>
          <PrimeInputText :model-value="configApi.url" placeholder="https://api.midominio.com/opciones"
            @update:model-value="(v: string | undefined) => actualizarConfigApi({ url: v || '' })"
            class="ancho-100 tamanio-fuente-miga" />
        </div>

        <!-- Método y Content-Type -->
        <div class="col-12">
          <label class="tamanio-fuente-miga">Método</label>
          <PrimeSelect :model-value="configApi.method || MetodoHttp.GET" :options="opcionesMetodo" option-label="label"
            option-value="value" class="ancho-100 tamanio-fuente-miga"
            @update:model-value="(v: MetodoHttp) => actualizarConfigApi({ method: v })" />
        </div>

        <div class="col-12">
          <label class="tamanio-fuente-miga">Content-Type</label>
          <PrimeSelect :model-value="configApi.contentType || 'application/json'" :options="opcionesContentType"
            option-label="label" option-value="value" class="ancho-100 tamanio-fuente-miga"
            @update:model-value="(v: string) => actualizarConfigApi({ contentType: v })" />
        </div>

        <!-- Configuración de claves -->
        <div class="col-12">
          <label class="tamanio-fuente-miga">Ruta datos (opcional)</label>
          <PrimeInputText :model-value="configApi.dataPath" class="ancho-100" placeholder="por ej.: data.items"
            @update:model-value="(v: string | undefined) => actualizarConfigApi({ dataPath: v || '' })" />
        </div>

        <div class="col-12">
          <label class="tamanio-fuente-miga">Clave Valor</label>
          <PrimeInputText :model-value="configApi.claveValor" class="ancho-100" placeholder="valor"
            @update:model-value="(v: string | undefined) => actualizarConfigApi({ claveValor: v || '' })" />
        </div>

        <div class="col-12">
          <label class="tamanio-fuente-miga">Clave Etiqueta</label>
          <PrimeInputText :model-value="configApi.claveEtiqueta" class="ancho-100" placeholder="etiqueta"
            @update:model-value="(v: string | undefined) => actualizarConfigApi({ claveEtiqueta: v || '' })" />
        </div>

        <!-- Body para POST -->
        <div class="col-12" v-if="(configApi.method || MetodoHttp.GET) === MetodoHttp.POST">
          <label class="tamanio-fuente-miga">Body (JSON o texto)</label>
          <PrimeTextarea :model-value="configApi.body" rows="4" placeholder='{"page":1}'
            @update:model-value="(v: string | undefined) => actualizarConfigApi({ body: v || '' })" />
        </div>

        <!-- Headers -->
        <div class="col-12">
          <label class="tamanio-fuente-miga">Headers (JSON opcional)</label>
          <PrimeTextarea :model-value="configApi.headersJson" rows="3" class="area-texto-seccion ancho-100"
            placeholder='{"Authorization":"Bearer ..."}'
            @update:model-value="(v: string | undefined) => actualizarConfigApi({ headersJson: v || '' })" />
        </div>

        <!-- Estructura detectada -->
        <div class="col-12" v-if="obtenerOpciones().length > 0">
          <div class="p-3 bg-blue-50 border-1 border-blue-200 border-round">
            <div class="tamanio-fuente-miga  text-blue-800 mb-1">Estructura detectada:</div>
            <div class="text-xs text-blue-700 font-mono">
              {{ JSON.stringify(obtenerOpciones()[0], null, 2) }}
            </div>
            <small class="text-blue-600 mt-1">
              Si tu API usa claves diferentes (como "etiqueta"/"valor"), se detectarán automáticamente al cargar desde
              la
              API.
            </small>
          </div>
        </div>
      </div>

      <!-- Botones de carga -->
      <div class="flex align-items-center gap-2 flex-wrap mt-3">
        <PrimeButton :disabled="cargandoApi" size="small" icon="pi pi-refresh"
          :label="cargandoApi ? 'Cargando…' : 'Reemplazar con API'"
          @click="cargarOpcionesDesdeApi(ModoCarga.REEMPLAZAR)" />
        <PrimeButton :disabled="cargandoApi" size="small" icon="pi pi-plus" severity="secondary"
          label="Añadir desde API" @click="cargarOpcionesDesdeApi(ModoCarga.AGREGAR)" />
        <small v-if="errorApi" class="color-rojo">{{ errorApi }}</small>
      </div>

      <small class="text-color-secondary mt-2">
        Reemplazar: sustituye todas las opciones. Añadir: agrega nuevas sin duplicar por valor.
      </small>
    </div>

    <!-- Valor por defecto -->
    <div class="mt-3">
      <label class="tamanio-fuente-miga">Valor por defecto</label>

      <template v-if="campo?.tipo === TipoCampoValor.Casilla">
        <PrimeMultiSelect :model-value="obtenerValorPorDefectoArray()" :options="obtenerOpciones()"
          option-label="etiqueta" option-value="valor" placeholder="(sin valores por defecto)"
          class="ancho-100 tamanio-fuente-miga mb-2" display="chip"
          @update:model-value="(v: unknown[]) => actualizarValorPorDefecto(v)" />
        <small class="text-color-secondary">
          Puedes preseleccionar varias opciones para el grupo de checkboxes.
        </small>
      </template>

      <template v-else>
        <PrimeSelect :model-value="obtenerValorPorDefecto()" :options="obtenerOpciones()" option-label="etiqueta"
          option-value="valor" placeholder="(sin valor por defecto)" class="ancho-100 tamanio-fuente-miga mb-2"
          @update:model-value="actualizarValorPorDefecto" />
        <small class="text-color-secondary">
          Selecciona qué opción quedará preseleccionada por defecto.
        </small>
      </template>
    </div>

    <!-- Dependencias -->
    <SeccionDependencias v-if="campo" :campo="campo" />

    <!-- Modal de alerta para errores de API -->
    <ModalAlerta v-model="mostrarModalAlerta" :titulo="datosModalAlerta.titulo" :mensaje="datosModalAlerta.mensaje"
      :mensaje-detalle="datosModalAlerta.detalle" tipo="error" />
  </div>
</template>
