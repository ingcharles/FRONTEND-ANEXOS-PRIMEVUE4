<script setup lang="ts">
import { computed, ref, watch, watchEffect, onMounted } from 'vue'
import type { EsquemaFormulario } from '@/interfaces/Formulario'
import type { EsquemaCampo, MetadatosCampo } from '@/interfaces/Campos'
import type { ConfiguracionDependencia } from '@/interfaces/Comunes'
import { evaluarReglasCampo, evaluarReglasDecisionRulesCampo } from '@/utilidades/Logica'
import { ServicioDependenciasFormulario } from '@/servicios/disenador/ServicioDependencias'
import { ServicioEsquemasFormulario } from '@/servicios/disenador/ServicioEsquemas'
import RenderizadorCampo from '@/paginas/disenador/componentes/RenderizadorCampo.vue'
import type { RegistroDatos, ValorDato } from '@/tipos/Comunes'
import { TipoCampoValor } from '@/enumeraciones/Campos'
import { ModoOpciones } from '@/tipos/TabAtributos'
import { esVacio, normalizarCasilla, normalizarFecha, normalizarNumero, normalizarTabla, parsearHoraCadenaAFecha } from '@/utilidades/Normalizar'
import { usarDecisionRules } from '@/composables/usarDecisionRules'

// Props
const props = defineProps<{
  esquema: EsquemaFormulario
}>()

// Composables y servicios
const servicioDependencias = new ServicioDependenciasFormulario()
const servicioEsquemas = new ServicioEsquemasFormulario()
const decisionRules = usarDecisionRules()

// Cargar configuración de DecisionRules
onMounted(() => {
  decisionRules.cargarConfiguracion()
})

// Estado reactivo local
const indicePagina = ref(0)
const errores = ref<Record<string, string>>({})
const valores = ref<Record<string, RegistroDatos>>({})

// Computed properties principales
const paginaActual = computed(() => props.esquema.paginas[indicePagina.value])
const totalPaginas = computed(() => props.esquema.paginas.length)
const campos = computed(() => (paginaActual.value?.campos || []) as EsquemaCampo[])
const valoresPaginaActual = computed(() => valores.value[paginaActual.value?.id || ''] || {})

// Mapa basado en campos originales
const mapaIdNombre = computed(() => servicioEsquemas.construirMapaIdNombre(campos.value as EsquemaCampo[]))

// Estado reactivo para campos con lógica aplicada
const camposConLogica = ref<EsquemaCampo[]>([])

// Inicializar valores para todas las páginas
watch(() => props.esquema, (nuevoEsquema) => {
  if (nuevoEsquema) {
    const nuevosValores: Record<string, RegistroDatos> = {}
    for (const pagina of nuevoEsquema.paginas) {
      nuevosValores[pagina.id] = {}
    }
    valores.value = nuevosValores
    indicePagina.value = 0
    errores.value = {}
  }
}, { immediate: true })

// Función para evaluar reglas (solo reglas simples, sin DecisionRules)
async function evaluarYActualizarCamposSinDecisionRules() {
  const camposOriginales = campos.value as EsquemaCampo[]
  const valoresActuales = valoresPaginaActual.value as RegistroDatos
  const mapa = mapaIdNombre.value as Record<string, string>

  const camposEvaluados = await Promise.all(
    camposOriginales.map(async (campo) => {
      const estado = await evaluarReglasCampo(campo, valoresActuales, mapa, { incluirDecisionRules: false })
      return {
        ...campo,
        visible: estado.visible,
        requerido: estado.requerido
      } as EsquemaCampo
    })
  )

  camposConLogica.value = camposEvaluados
}

// Watch para re-evaluar cuando cambien los valores o campos
watchEffect(() => {
  const _ = campos.value
  const __ = valoresPaginaActual.value
  evaluarYActualizarCamposSinDecisionRules()
})

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

function aplicarValoresPorDefecto(lista: EsquemaCampo[], sobrescribirSiVacio = false): void {
  if (!Array.isArray(lista)) return
  for (const campo of lista) {
    if (!campo) continue
    if (campo.nombre) {
      const valorDefecto = obtenerValorDefectoNormalizado(campo)
      aplicarValorSiCorresponde(campo, valorDefecto, sobrescribirSiVacio)
    }
    if (campo.hijos?.length) {
      aplicarValoresPorDefecto(campo.hijos, sobrescribirSiVacio)
    }
  }
}

function obtenerValorDefectoNormalizado(campo: EsquemaCampo): ValorDato | undefined {
  const metadatos = campo.metadatos as MetadatosCampo | undefined
  const valorDefecto = metadatos?.valorPorDefecto as ValorDato | undefined

  switch (campo.tipo) {
    case TipoCampoValor.Hora:
      return typeof valorDefecto === 'string' ? parsearHoraCadenaAFecha(valorDefecto) : valorDefecto
    case TipoCampoValor.Numero:
      return normalizarNumero(valorDefecto)
    case TipoCampoValor.Fecha:
      return normalizarFecha(valorDefecto)
    case TipoCampoValor.Casilla:
      return normalizarCasilla(campo, valorDefecto)
    case TipoCampoValor.Tabla:
      return normalizarTabla(campo, valorDefecto)
    default:
      return valorDefecto
  }
}

function aplicarValorSiCorresponde(
  campo: EsquemaCampo,
  valorDefecto: ValorDato | undefined,
  sobrescribirSiVacio: boolean
): void {
  if (!campo.nombre) return

  evaluarReglasCampo(campo, valoresPaginaActual.value, mapaIdNombre.value).then(estado => {
    if (valorDefecto === undefined || !estado.visible) return

    const valorActual = valoresPaginaActual.value[campo.nombre!]
    const debeSobrescribir = sobrescribirSiVacio ? esVacio(valorActual) : valorActual === undefined

    if (debeSobrescribir) {
      actualizarValorCampo(campo.nombre!, valorDefecto)
    }
  })
}

// Función para actualizar valor de campo
function actualizarValorCampo(nombreCampo: string, valor: ValorDato): void {
  const paginaId = paginaActual.value.id
  if (!valores.value[paginaId]) {
    valores.value[paginaId] = {}
  }
  valores.value[paginaId][nombreCampo] = valor
}

// Función para configurar dependencias
function reconfigurarDependencias(): void {
  registroDependencias.forEach(detener => detener())
  registroDependencias.clear()

  const todosCampos = servicioEsquemas.aplanarCampos(campos.value, [])

  for (const campo of todosCampos) {
    const metadatos = (campo.metadatos || {}) as MetadatosCampo
    const dependencia = (metadatos.dependencia || {}) as ConfiguracionDependencia

    const tieneConfiguracionApi = metadatos.modoOpciones === ModoOpciones.API ||
      metadatos.urlApi ||
      (metadatos as Record<string, unknown>).apiUrl ||
      (metadatos.configuracionApi as Record<string, unknown>)?.url

    if (campo.nombre && tieneConfiguracionApi && !dependencia.campoPadre) {
      servicioDependencias.cargarOpcionesIndependientes(campo)
    }

    if (!campo.nombre || !dependencia.campoPadre) continue

    const padres = String(dependencia.campoPadre).split(',').map(s => s.trim()).filter(Boolean)

    const leerValoresPadres = (): RegistroDatos | ValorDato | undefined => {
      if (padres.length <= 1) return valoresPaginaActual.value[padres[0]]
      const mapa: RegistroDatos = {}
      for (const nombre of padres) mapa[nombre] = valoresPaginaActual.value[nombre]
      return mapa
    }

    const detener = watch(
      () => padres.map(nombre => valoresPaginaActual.value[nombre]),
      async () => {
        const valorActual = leerValoresPadres()

        if (dependencia.limpiarAlCambiar !== false) {
          actualizarValorCampo(campo.nombre!, undefined)
        }

        const estaVacio = (v: ValorDato | undefined): boolean =>
          v === null || v === undefined || (typeof v === 'string' && v.trim() === '')

        if (dependencia.deshabilitarHastaValor !== false) {
          const algunPadreVacio = padres.some(nombre => estaVacio(valoresPaginaActual.value[nombre]))
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

const firmaDependencias = computed(() => recolectarFirmaDependencias())
const firmaDefaults = computed(() => recolectarFirmasDefaults(campos.value, []).join('|'))

watch([firmaDependencias, indicePagina], () => {
  reconfigurarDependencias()
}, { immediate: true })

watch(firmaDefaults, () => {
  aplicarValoresPorDefecto(campos.value, true)
})

// Función para manejar eventos de campos y ejecutar reglas DecisionRules
async function manejarEventoCampo(nombreCampo: string, tipoEvento: 'change' | 'blur' | 'input'): Promise<void> {
  console.log(`🎯 [RenderizadorFormulario] Evento ${tipoEvento} en campo: ${nombreCampo}`)

  const valoresActuales = valoresPaginaActual.value as RegistroDatos
  const mapa = mapaIdNombre.value as Record<string, string>

  const todosCampos = servicioEsquemas.aplanarCampos(campos.value, [])
  let algunaReglaEjecutada = false

  for (const campo of todosCampos) {
    if (!campo.logica) continue

    const tieneReglasParaEsteEvento = campo.logica.some(regla => {
      if (regla.tipo !== 'decisionrules') return false
      if (!regla.camposEntrada) return false

      const tieneElCampo = regla.camposEntrada.some(ce => ce.nombreCampo === nombreCampo)
      if (!tieneElCampo) return false

      const eventoRegla = regla.eventoEjecucion || 'change'
      return eventoRegla === tipoEvento
    })

    if (tieneReglasParaEsteEvento) {
      console.log(`   📋 Evaluando reglas DecisionRules para campo: ${campo.nombre}`)
      algunaReglaEjecutada = true

      const estado = await evaluarReglasDecisionRulesCampo(campo, valoresActuales, mapa, nombreCampo, tipoEvento)

      const indice = camposConLogica.value.findIndex(c => c.id === campo.id)
      if (indice !== -1) {
        camposConLogica.value[indice] = {
          ...camposConLogica.value[indice],
          visible: estado.visible,
          requerido: estado.requerido
        }
      }
    }
  }

  if (algunaReglaEjecutada) {
    console.log(`✅ [RenderizadorFormulario] Reglas DecisionRules ejecutadas para evento ${tipoEvento}`)
  }
}

// Función principal de envío
function enviar(): void {
  errores.value = {}

  const erroresGlobales: Record<string, string> = {}
  const valoresGlobales: RegistroDatos = {}

  for (const pagina of props.esquema.paginas) {
    const valoresPagina = valores.value[pagina.id] || {}
    Object.assign(valoresGlobales, valoresPagina)

    const camposConLogicaPagina = pagina.campos.map(campo => {
      const estado = evaluarReglasCampoSync(campo, valoresPagina, mapaIdNombre.value)
      return {
        ...campo,
        visible: estado.visible,
        requerido: estado.requerido
      }
    })

    const esquemaPagina = servicioEsquemas.crearEsquemaValidacion(camposConLogicaPagina)
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

  console.log('✅ Formulario válido:', valoresGlobales)
  alert('Formulario enviado correctamente!\n\n' + JSON.stringify(valoresGlobales, null, 2))
}

// Funciones de navegación
function irPaginaAnterior(): void {
  if (indicePagina.value > 0) {
    indicePagina.value--
  }
}

function irPaginaSiguiente(): void {
  if (indicePagina.value < props.esquema.paginas.length - 1) {
    indicePagina.value++
  }
}

// Helper para evaluación síncrona (para validación)
function evaluarReglasCampoSync(
  campo: EsquemaCampo,
  valores: RegistroDatos,
  mapa: Record<string, string>
): { visible: boolean; requerido: boolean } {
  // Versión simplificada síncrona para validación
  return {
    visible: campo.visible !== false,
    requerido: !!campo.requerido
  }
}
</script>

<template>
  <div class="p-3">
    <!-- Navegación entre páginas -->
    <div class="flex justify-between mb-3" v-if="totalPaginas > 1">
      <PrimeButton label="Anterior" icon="pi pi-angle-left" :disabled="indicePagina === 0" @click="irPaginaAnterior" />
      <div class="negrilla">
        {{ paginaActual.titulo || ('Página ' + (indicePagina + 1)) }}
      </div>
      <PrimeButton label="Siguiente" icon-pos="right" icon="pi pi-angle-right"
        :disabled="indicePagina >= esquema.paginas.length - 1" @click="irPaginaSiguiente" />
    </div>

    <!-- Título de página única -->
    <div class="mb-2" v-else>
      <div class="negrilla">
        {{ paginaActual.titulo || ('Página ' + (indicePagina + 1)) }}
      </div>
    </div>

    <!-- Formulario principal -->
    <form class="grid" @submit.prevent="enviar">
      <template v-for="campo in camposConLogica" :key="campo.id">
        <div :class="clasesColumna(campo)">
          <RenderizadorCampo :campo="campo" :valores-campos="valoresPaginaActual" :errores-campos="errores"
            :mapa-id-nombre="mapaIdNombre"
            @valor-cambiado="(nombre: string, valor: unknown) => actualizarValorCampo(nombre, valor as ValorDato)"
            @evento-campo="manejarEventoCampo" />
        </div>
      </template>

      <!-- Botón Enviar -->
      <div class="col-12 sm:col-12 md:col-4"
        v-if="(totalPaginas === 1 || indicePagina >= esquema.paginas.length - 1) && !paginaActual?.campos?.some(f => f.tipo === 'boton')">
        <PrimeButton type="submit" label="Enviar" icon="pi pi-check" class="ancho-100 tamanio-fuente-miga" />
      </div>
    </form>
  </div>
</template>
