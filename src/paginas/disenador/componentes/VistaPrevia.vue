<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { EsquemaCampo, MetadatosCampo } from '@/interfaces/Campos'
import type { ConfiguracionDependencia } from '@/interfaces/Comunes'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import { evaluarReglasCampo } from '@/utilidades/Logica'
import { ServicioDependenciasFormulario } from '@/servicios/disenador/ServicioDependencias'
import { ServicioEsquemasFormulario } from '@/servicios/disenador/ServicioEsquemas'
import Button from 'primevue/button'
import RenderizadorCampo from './RenderizadorCampo.vue'
import type { RegistroDatos, ValorDato } from '@/tipos/Comunes'
import { TipoCampoValor } from '@/enumeraciones/Campos'

// Composables y servicios
const almacen = useAlmacenDisenador()
const servicioDependencias = new ServicioDependenciasFormulario()
const servicioEsquemas = new ServicioEsquemasFormulario()

// Estado reactivo local
const indicePagina = ref(0)
const errores = ref<Record<string, string>>({})

// Computed properties principales
const paginaActual = computed(() => almacen.esquemaFormulario.paginas[indicePagina.value])
const totalPaginas = computed(() => almacen.esquemaFormulario.paginas.length)
const campos = computed<EsquemaCampo[]>(() => paginaActual.value?.campos || [])
const valores = computed<RegistroDatos>(() => almacen.obtenerValoresPagina(paginaActual.value?.id || '') as RegistroDatos)
const mapaIdNombre = computed(() => servicioEsquemas.construirMapaIdNombre(campos.value))

// Gestión de dependencias
const registroDependencias = new Map<string, () => void>()

// Funciones para manejo de campos
function clasesColumna(campo: EsquemaCampo): string[] {
  const sm = campo.grid?.sm ?? 12
  const md = campo.grid?.md ?? 12
  const lg = campo.grid?.lg ?? 12
  return [
    `col-${Math.min(12, Math.max(1, sm))}`,
    `md:col-${Math.min(12, Math.max(1, md))}`,
    `lg:col-${Math.min(12, Math.max(1, lg))}`,
    'p-2',
  ]
}

function esVacio(valor: ValorDato | undefined): boolean {
  return valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '')
}

function parsearHoraCadenaAFecha(cadena: string): Date | null {
  const coincidencia = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(cadena)
  if (!coincidencia) return null
  const [, horas, minutos] = coincidencia
  const fecha = new Date()
  fecha.setHours(Number(horas), Number(minutos), 0, 0)
  return fecha
}

function obtenerOpciones(campo: EsquemaCampo): Array<{ label: string; value: string | number; disabled?: boolean }> {
  const metadatos = campo.metadatos as MetadatosCampo | undefined
  const opciones = (metadatos?.opciones ?? metadatos?.opciones) as
    | Array<{ label: string; value: string | number; disabled?: boolean }>
    | undefined
  return Array.isArray(opciones) ? opciones : []
}

function checkboxEsGrupo(campo: EsquemaCampo): boolean {
  return obtenerOpciones(campo).length > 0
}

// Función para aplicar valores por defecto
function aplicarValoresPorDefecto(lista: EsquemaCampo[], sobrescribirSiVacio = false): void {
  if (!Array.isArray(lista)) return
  for (const campo of lista) {
    if (!campo) continue

    if (campo.nombre) {
      const metadatos = campo.metadatos as MetadatosCampo | undefined
      let valorDefecto = metadatos?.valorPorDefecto as ValorDato | undefined

      // Normalizar defaults por tipo
      if (campo.tipo === TipoCampoValor.Hora  && typeof valorDefecto === 'string') {
        valorDefecto = parsearHoraCadenaAFecha(valorDefecto)
      }

      if (campo.tipo === TipoCampoValor.Numero && typeof valorDefecto === 'string' && valorDefecto.trim() !== '') {
        const numeroParseado = Number(valorDefecto)
        if (!isNaN(numeroParseado)) valorDefecto = numeroParseado
      }

      if (campo.tipo === TipoCampoValor.Fecha) {
        if (typeof valorDefecto === 'string' && valorDefecto.trim() !== '') {
          const fechaParseada = new Date(valorDefecto)
          if (!isNaN(fechaParseada.getTime())) valorDefecto = fechaParseada
        }
      }

      if (campo.tipo === TipoCampoValor.Casilla && typeof valorDefecto === 'string') {
        valorDefecto = valorDefecto.toLowerCase() === 'true'
      }

      if (campo.tipo === TipoCampoValor.Casilla && checkboxEsGrupo(campo)) {
        if (!Array.isArray(valorDefecto)) valorDefecto = []
      }

      if (campo.tipo === TipoCampoValor.Tabla && Array.isArray(valorDefecto)) {
        const columnas = servicioEsquemas.obtenerColumnasTabla(campo)
        const filas = servicioEsquemas.obtenerFilasTabla(campo)
        if (!Array.isArray(valorDefecto)) {
          valorDefecto = Array.from({ length: filas }, () => servicioEsquemas.crearFilaVacia(columnas))
        }
      }

    // Respetar visibilidad
    const estado = evaluarReglasCampo(campo, valores.value, mapaIdNombre.value)
      if (valorDefecto !== undefined && estado.visible) {
        const valorActual = valores.value[campo.nombre]
        if (sobrescribirSiVacio ? esVacio(valorActual) : valorActual === undefined) {
          almacen.actualizarValorCampo(paginaActual.value.id, campo.nombre, valorDefecto)
        }
      }
    }

    if (campo.hijos?.length) {
      aplicarValoresPorDefecto(campo.hijos, sobrescribirSiVacio)
    }
  }
}

// Función para configurar dependencias
function reconfigurarDependencias(): void {
  registroDependencias.forEach(detener => detener())
  registroDependencias.clear()

  const todosCampos = servicioEsquemas.aplanarCampos(campos.value, [])

  for (const campo of todosCampos) {
  const metadatos = (campo.metadatos || {}) as MetadatosCampo
  const dependencia = (metadatos.dependencia || {}) as ConfiguracionDependencia

    // Cargar opciones independientes (sin dependencias) que usan API
    const tieneConfiguracionApi = metadatos.modoOpciones === 'api' ||
      metadatos.urlApi ||
      (metadatos as Record<string, unknown>).apiUrl ||
      (metadatos.configuracionApi as Record<string, unknown>)?.url

    if (campo.nombre && tieneConfiguracionApi && !dependencia.campoPadre) {
      servicioDependencias.cargarOpcionesIndependientes(campo)
    }

    // Configurar dependencias para campos que SÍ tienen padre
    if (!campo.nombre || !dependencia.campoPadre) continue

    const padres = String(dependencia.campoPadre).split(',').map(s => s.trim()).filter(Boolean)

    const leerValoresPadres = (): RegistroDatos | ValorDato | undefined => {
      if (padres.length <= 1) return valores.value[padres[0]]
      const mapa: RegistroDatos = {}
      for (const nombre of padres) mapa[nombre] = valores.value[nombre]
      return mapa
    }

    const detener = watch(
      () => padres.map(nombre => valores.value[nombre]),
      async () => {
        const valorActual = leerValoresPadres()

        if (dependencia.limpiarAlCambiar !== false) {
          almacen.actualizarValorCampo(paginaActual.value.id, campo.nombre!, undefined)
        }

        const estaVacio = (v: ValorDato | undefined): boolean =>
          v === null || v === undefined || (typeof v === 'string' && v.trim() === '')

        if (dependencia.deshabilitarHastaValor !== false) {
          const algunPadreVacio = padres.some(nombre => estaVacio(valores.value[nombre]))
          const metadatosHelper = (campo.metadatos ||= {}) as MetadatosCampo
          metadatosHelper.deshabilitado = algunPadreVacio
        }

  await servicioDependencias.cargarOpcionesDependientes(campo, (valorActual ?? null) as ValorDato | RegistroDatos)
      },
      { immediate: true }
    )

    registroDependencias.set(campo.id, detener)
  }
}

// Funciones para firmas de detección de cambios
/*function recolectarFirmaSchema(
  lista: EsquemaCampo[],
  salida: Array<Record<string, ValorDato>> = []
): Array<Record<string, ValorDato>> {
  if (!lista || !Array.isArray(lista)) {
    return salida
  }

  for (const campo of lista) {
    if (!campo) continue

    const metadatos = (campo.metadatos || {}) as MetadatosCampo
    const grid = campo.grid
      ? {
          sm: typeof campo.grid.sm === 'number' ? campo.grid.sm : null,
          md: typeof campo.grid.md === 'number' ? campo.grid.md : null,
          lg: typeof campo.grid.lg === 'number' ? campo.grid.lg : null,
        }
      : null

    const opciones = (metadatos.opciones ?? metadatos.opciones) as
      | Array<{ deshabilitado?: boolean; etiqueta?: string; valor?: string | number }>
      | undefined

  const opcionesNormalizadas: Array<Record<string, ValorDato>> = Array.isArray(opciones)
      ? opciones.map(o => ({
          etiqueta: String(o.etiqueta ?? ''),
          valor: (typeof o.valor === 'string' || typeof o.valor === 'number')
              ? o.valor
              : '',
          deshabilitado: typeof o.deshabilitado === 'boolean' ? o.deshabilitado : null,
        }))
      : []

  const minDateRaw = (metadatos.fechaMinima ?? metadatos.fechaMinima)
  const maxDateRaw = (metadatos.fechaMaxima ?? metadatos.fechaMaxima)
    const minDateOut: ValorDato | null =
      minDateRaw instanceof Date ? minDateRaw : (typeof minDateRaw === 'string' ? minDateRaw : null)
    const maxDateOut: ValorDato | null =
      maxDateRaw instanceof Date ? maxDateRaw : (typeof maxDateRaw === 'string' ? maxDateRaw : null)

    salida.push({
      id: campo.id,
      type: campo.tipo,
      name: campo.nombre || '',
      required: Boolean(campo.requerido),
      grid,
      m: {
        min: typeof (metadatos.minimo ?? metadatos.minimo) === 'number' ? (metadatos.minimo ?? metadatos.minimo) as number : null,
        max: typeof (metadatos.maximo ?? metadatos.maximo) === 'number' ? (metadatos.maximo ?? metadatos.maximo) as number : null,
        minDate: minDateOut,
        maxDate: maxDateOut,
        options: opcionesNormalizadas,
        valorPorDefecto: (metadatos?.valorPorDefecto ?? null) as ValorDato | null,
      },
      v: (campo.validaciones || []).map(v => ({ t: v.tipo, val: (v.valor ?? null) as ValorDato | null })),
    })

    if (campo.hijos?.length) {
      recolectarFirmaSchema(campo.hijos, salida)
    }
  }
  return salida
}*/

function recolectarFirmasDefaults(lista: EsquemaCampo[], salida: Array<string> = []): Array<string> {
  if (!Array.isArray(lista)) return salida
  for (const campo of lista) {
    if (!campo) continue
    const valorDefecto = (campo.metadatos as MetadatosCampo | undefined)?.valorPorDefecto as ValorDato | undefined
    if (campo.nombre) salida.push(`${campo.nombre}::${JSON.stringify(valorDefecto)}`)
    if (campo.hijos?.length) recolectarFirmasDefaults(campo.hijos, salida)
  }
  return salida
}

function recolectarFirmaDependencias(): string {
  const arreglo: Array<Record<string, ValorDato>> = []
  const camposArray = Array.isArray(campos.value) ? campos.value : []
  const pila: EsquemaCampo[] = [...camposArray]

  while (pila.length) {
    const campo = pila.shift()!
    if (!campo) continue

    const metadatos = (campo.metadatos || {}) as MetadatosCampo
    const dependencia = (metadatos.dependencia || {}) as ConfiguracionDependencia
    const depMin: Record<string, ValorDato> = {
      campoPadre: dependencia.campoPadre || '',
      deshabilitarHastaValor: dependencia.deshabilitarHastaValor ?? null,
      valorCondicion:
        typeof dependencia.valorCondicion === 'string'
          || typeof dependencia.valorCondicion === 'number'
          || typeof dependencia.valorCondicion === 'boolean'
          ? dependencia.valorCondicion
          : null,
    }
    arreglo.push({ id: campo.id, name: campo.nombre || '', dep: depMin })

    if (campo.hijos?.length) pila.push(...campo.hijos)
  }

  return JSON.stringify(arreglo)
}

// Computed para firmas
//const firmaSchema = computed(() => JSON.stringify(recolectarFirmaSchema(campos.value, [])))
const firmaDependencias = computed(() => recolectarFirmaDependencias())
const firmaDefaults = computed(() => recolectarFirmasDefaults(campos.value, []).join('|'))

// Watchers para reactividad
// watch([firmaSchema, indicePagina], () => {
//   aplicarValoresPorDefecto(campos.value, false)
// }, { immediate: true })

watch([firmaDependencias, indicePagina], () => {
  reconfigurarDependencias()
}, { immediate: true })

watch(firmaDefaults, () => {
  aplicarValoresPorDefecto(campos.value, true)
})

// Función principal de envío
function enviar(): void {
  errores.value = {}

  // Validar TODO el formulario: iterar todas las páginas y sus campos
  const erroresGlobales: Record<string, string> = {}
  const valoresGlobales: RegistroDatos = {}

  for (const pagina of almacen.esquemaFormulario.paginas) {
    const valoresPagina = almacen.obtenerValoresPagina(pagina.id) as RegistroDatos
    Object.assign(valoresGlobales, valoresPagina)

    const esquemaPagina = servicioEsquemas.crearEsquemaValidacion(pagina.campos)
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

  if (Object.keys(erroresGlobales).length > 0) {
    errores.value = erroresGlobales
    return
  }

  alert('Formulario válido:\n' + JSON.stringify(valoresGlobales, null, 2))
}

// Funciones de navegación
function irPaginaAnterior(): void {
  if (indicePagina.value > 0) {
    indicePagina.value--
  }
}

function irPaginaSiguiente(): void {
  if (indicePagina.value < almacen.esquemaFormulario.paginas.length - 1) {
    indicePagina.value++
  }
}
</script>

<template>
  <div class="p-3">
    <!-- Navegación entre páginas -->
    <div class="flex justify-between items-center mb-3" v-if="totalPaginas > 1">
      <Button
        label="Anterior"
        icon="pi pi-angle-left"
        :disabled="indicePagina === 0"
        @click="irPaginaAnterior"
      />
      <div class="font-semibold">
        {{ paginaActual.titulo || ('Página ' + (indicePagina + 1)) }}
      </div>
      <Button
        label="Siguiente"
        icon-pos="right"
        icon="pi pi-angle-right"
        :disabled="indicePagina >= almacen.esquemaFormulario.paginas.length - 1"
        @click="irPaginaSiguiente"
      />
    </div>

    <!-- Título de página única -->
    <div class="mb-2" v-else>
      <div class="font-semibold">
        {{ paginaActual.titulo || ('Página ' + (indicePagina + 1)) }}
      </div>
    </div>

    <!-- Formulario principal -->
    <form class="grid" @submit.prevent="enviar">
      <template v-for="campo in campos" :key="campo.id">
        <div :class="clasesColumna(campo)">
          <RenderizadorCampo
            :campo="campo"
            :valores-campos="valores"
            :errores-campos="errores"
            :mapa-id-nombre="mapaIdNombre"
            @valor-cambiado="(nombre: string, valor: ValorDato) => almacen.actualizarValorCampo(paginaActual.id, nombre, valor)"
          />
        </div>
      </template>

      <!-- Botón Enviar de respaldo: si no hay botón en la página y es la última o única -->
      <div
        class="col-12"
        v-if="(totalPaginas === 1 || indicePagina >= almacen.esquemaFormulario.paginas.length - 1) && !paginaActual?.campos?.some(f => f.tipo === 'boton')"
      >
        <Button type="submit" label="Enviar" icon="pi pi-check" class="w-full" />
      </div>
    </form>
  </div>
</template>

