<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { EsquemaCampo, MetadatosCampo } from '@/interfaces/Campos'
import type { ConfiguracionDependencia } from '@/interfaces/Comunes'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import { evaluarReglasCampo } from '@/utilidades/Logica'
import { ServicioDependenciasFormulario } from '@/servicios/disenador/ServicioDependencias'
import { ServicioEsquemasFormulario } from '@/servicios/disenador/ServicioEsquemas'
import RenderizadorCampo from './RenderizadorCampo.vue'
import type { RegistroDatos, ValorDato } from '@/tipos/Comunes'
import { TipoCampoValor } from '@/enumeraciones/Campos'
import { ModoOpciones } from '@/tipos/TabAtributos'

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
const campos = computed(() => (paginaActual.value?.campos || []) as EsquemaCampo[])
const valores = computed(() => almacen.obtenerValoresPagina(paginaActual.value?.id || '') as RegistroDatos)

// Mapa basado en campos originales (sin lógica aplicada)
const mapaIdNombre = computed(() => servicioEsquemas.construirMapaIdNombre(campos.value as EsquemaCampo[]))

// Computed para aplicar reglas de lógica a los campos
const camposConLogica = computed(() => {
  const camposOriginales = campos.value as EsquemaCampo[]
  const valoresActuales = valores.value as RegistroDatos
  const mapa = mapaIdNombre.value as Record<string, string>

  return camposOriginales.map(campo => {
    const estado = evaluarReglasCampo(campo, valoresActuales, mapa)
    return {
      ...campo,
      visible: estado.visible,
      requerido: estado.requerido
    } as EsquemaCampo
  })
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


function aplicarValoresPorDefecto(lista: EsquemaCampo[], sobrescribirSiVacio = false): void {
  if (!Array.isArray(lista)) return;
  for (const campo of lista) {
    if (!campo) continue;
    if (campo.nombre) {
      const valorDefecto = obtenerValorDefectoNormalizado(campo);
      aplicarValorSiCorresponde(campo, valorDefecto, sobrescribirSiVacio);
    }
    if (campo.hijos?.length) {
      aplicarValoresPorDefecto(campo.hijos, sobrescribirSiVacio);
    }
  }
}

function obtenerValorDefectoNormalizado(campo: EsquemaCampo): ValorDato | undefined {
  const metadatos = campo.metadatos as MetadatosCampo | undefined;
  const valorDefecto = metadatos?.valorPorDefecto as ValorDato | undefined;

  switch (campo.tipo) {
    case TipoCampoValor.Hora:
      return typeof valorDefecto === 'string' ? parsearHoraCadenaAFecha(valorDefecto) : valorDefecto;
    case TipoCampoValor.Numero:
      return normalizarNumero(valorDefecto);
    case TipoCampoValor.Fecha:
      return normalizarFecha(valorDefecto);
    case TipoCampoValor.Casilla:
      return normalizarCasilla(campo, valorDefecto);
    case TipoCampoValor.Tabla:
      return normalizarTabla(campo, valorDefecto);
    default:
      return valorDefecto;
  }
}

function normalizarNumero(valor: ValorDato | undefined): number | undefined {
  if (typeof valor === 'string' && valor.trim() !== '') {
    const numero = Number(valor);
    return isNaN(numero) ? undefined : numero;
  }
  return valor as number | undefined;
}

function normalizarFecha(valor: ValorDato | undefined): Date | undefined {
  if (typeof valor === 'string' && valor.trim() !== '') {
    const fecha = new Date(valor);
    return isNaN(fecha.getTime()) ? undefined : fecha;
  }
  return valor as Date | undefined;
}

function normalizarCasilla(campo: EsquemaCampo, valor: ValorDato | undefined): ValorDato {
  if (obtenerOpciones(campo).length > 0) {
    return Array.isArray(valor) ? valor : [];
  }
  if (typeof valor === 'string') {
    return valor.toLowerCase() === 'true';
  }
  if (typeof valor === 'boolean') {
    return valor;
  }
  // Si no hay valor, retorna false por defecto para casilla simple
  return false;
}

function normalizarTabla(campo: EsquemaCampo, valor: ValorDato | undefined): ValorDato {
  if (Array.isArray(valor)) return valor;
  const columnas = servicioEsquemas.obtenerColumnasTabla(campo);
  const filas = servicioEsquemas.obtenerFilasTabla(campo);
  return Array.from({ length: filas }, () => servicioEsquemas.crearFilaVacia(columnas));
}

function aplicarValorSiCorresponde(
  campo: EsquemaCampo,
  valorDefecto: ValorDato | undefined,
  sobrescribirSiVacio: boolean
): void {
  if (!campo.nombre) return; // <-- Asegura que nombre existe

  const estado = evaluarReglasCampo(campo, valores.value, mapaIdNombre.value);
  if (valorDefecto === undefined || !estado.visible) return;

  const valorActual = valores.value[campo.nombre];
  const debeSobrescribir = sobrescribirSiVacio ? esVacio(valorActual) : valorActual === undefined;

  if (debeSobrescribir) {
    almacen.actualizarValorCampo(paginaActual.value.id, campo.nombre, valorDefecto);
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
    const tieneConfiguracionApi = metadatos.modoOpciones === ModoOpciones.API ||
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

  const erroresGlobales: Record<string, string> = {}
  const valoresGlobales: RegistroDatos = {}

  for (const pagina of almacen.esquemaFormulario.paginas) {
    const valoresPagina = almacen.obtenerValoresPagina(pagina.id) as RegistroDatos
    Object.assign(valoresGlobales, valoresPagina)

    // Aplicar reglas de lógica a los campos antes de validar
    const mapaIdNombrePagina = servicioEsquemas.construirMapaIdNombre(pagina.campos)
    const camposConLogicaPagina = pagina.campos.map(campo => {
      const estado = evaluarReglasCampo(campo, valoresPagina, mapaIdNombrePagina)
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
      <PrimeButton label="Anterior" icon="pi pi-angle-left" :disabled="indicePagina === 0" @click="irPaginaAnterior" />
      <div class="negrilla">
        {{ paginaActual.titulo || ('Página ' + (indicePagina + 1)) }}
      </div>
      <PrimeButton label="Siguiente" icon-pos="right" icon="pi pi-angle-right"
        :disabled="indicePagina >= almacen.esquemaFormulario.paginas.length - 1" @click="irPaginaSiguiente" />
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
          <RenderizadorCampo :campo="campo" :valores-campos="valores" :errores-campos="errores"
            :mapa-id-nombre="mapaIdNombre"
            @valor-cambiado="(nombre: string, valor: unknown) => almacen.actualizarValorCampo(paginaActual.id, nombre, valor as ValorDato)" />
        </div>
      </template>

      <!-- Botón Enviar de respaldo: si no hay botón en la página y es la última o única -->
      <div class="col-2 sm:col-12 md:col-4"
        v-if="(totalPaginas === 1 || indicePagina >= almacen.esquemaFormulario.paginas.length - 1) && !paginaActual?.campos?.some(f => f.tipo === 'boton')">
        <PrimeButton type="submit" label="Enviar" icon="pi pi-check" class="ancho-100 tamanio-fuente-miga" />
      </div>
    </form>
  </div>
</template>
