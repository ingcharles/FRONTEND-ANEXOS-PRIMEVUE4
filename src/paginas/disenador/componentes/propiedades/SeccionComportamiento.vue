<template>
  <div class="mb-2 mt-2" >
    <h3 class="texto-sm text-color mb-2">Comportamiento</h3>

    <!-- Visibilidad -->
    <div class="mb-2">
      <label class="texto-sm">
        <Checkbox
          binary
          :model-value="!!campo?.visible"
          @update:model-value="(v: boolean) => actualizarPropiedad('visible', v)"
        />
        Visible
      </label>
    </div>

    <!-- Requerido -->
    <!-- <div class="mb-2" v-if="esRequerible()">
      <label class="texto-sm">
        <Checkbox
          binary
          :model-value="!!campo?.requerido"
          @update:model-value="(v: boolean) => actualizarPropiedad('requerido', v)"
        />
        Requerido
      </label>
    </div> -->

    <!-- Mensaje de requerido -->
    <!-- <div v-if="campo?.requerido" class="mb-2">
      <label class="block mb-1">Mensaje de requerido</label>
      <PrimeInputText
        :model-value="obtenerMensajeRequerido()"
        @update:model-value="(v: string | undefined) => actualizarMensajeRequerido(v || '')"
      />
      <small class="text-muted-color">Se mostrará en la vista previa cuando el campo sea obligatorio.</small>
    </div> -->

    <!-- Deshabilitado -->
    <div class="mb-2" v-if="esDeshabilitableOEscribible()">
      <label class="texto-sm">
        <Checkbox
          binary
          :model-value="!!campo?.deshabilitado"
          @update:model-value="(v: boolean) => actualizarPropiedad('deshabilitado', v)"
        />
        Deshabilitado
      </label>
    </div>

    <!-- Solo lectura -->
    <div class="mb-2" v-if="esSoloLectura()">
      <label class="texto-sm">
        <Checkbox
          binary
          :model-value="!!campo?.soloLectura"
          @update:model-value="(v: boolean) => actualizarPropiedad('soloLectura', v)"
        />
        Solo lectura
      </label>
    </div>

    <!-- Layout para grupos de opciones -->
    <div class="mb-2" v-if="tieneOpcionesHorizontalVertical()">
      <label class="block mb-1">Distribución de opciones</label>
      <SelectButton
        :model-value="obtenerLayoutGrupo()"
        :options="opcionesLayout"
        option-label="label"
        option-value="value"
        @update:model-value="(v: TipoDiseno) => actualizarLayoutGrupo(v)"
      />
      <small class="text-muted-color">Controla si las opciones se muestran en columna o en fila.</small>
    </div>

    <!-- Eventos personalizados -->
    <!-- <div class="mb-2">
      <label class="block mb-1">Eventos personalizados</label>
      <PrimeTextarea
        :model-value="obtenerEventosPersonalizados()"
        rows="4"
        placeholder="{ onClick: 'miFuncion', onBlur: 'otraFuncion' }"
        @update:model-value="(v: string | undefined) => actualizarEventosPersonalizados(v || '')"
      />
      <small class="text-muted-color">JSON con eventos personalizados para el campo.</small>
    </div> -->

    <!-- Dependencias condicionales -->
    <!-- <div class="mb-2">
      <label class="block mb-1">Dependencias</label>
      <PrimeTextarea
        :model-value="obtenerDependencias()"
        rows="3"
        placeholder="Configuración de dependencias del campo"
        @update:model-value="(v: string | undefined) => actualizarDependencias(v || '')"
      />
      <small class="text-muted-color">Configuración de visibilidad condicional.</small>
    </div> -->
  </div>
  <PrimeDivider class="my-3" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Checkbox from 'primevue/checkbox'
import SelectButton from 'primevue/selectbutton'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { TipoCampo } from '@/tipos/Campos'
import { TIPOS_CON_PLACEHOLDER } from '@/constantes/Campos'
import { ServicioCampos } from '@/servicios/disenador/ServiciosCampos'
import type { OpcionLayout } from '@/interfaces/TabAtributos'
import type { TipoDiseno } from '@/tipos/Comunes'


// // Interfaz temporal para compatibilidad con el almacen
// interface ActualizacionCampo {
//   validations?: ReglaValidacion[]
//   meta?: Record<string, unknown>
//   [key: string]: unknown
// }

const props = defineProps<{
  campo: EsquemaCampo | null
}>()

const almacen = useAlmacenDisenador()

// Opciones de layout
const opcionesLayout: OpcionLayout[] = [
  { label: 'Vertical', value: 'vertical' },
  { label: 'Horizontal', value: 'horizontal' }
]

// Metadatos tipados
const metadatos = computed(() => {
  if (!props.campo) return {}
  return props.campo.metadatos || {}
})

// Verificaciones de tipo de campo
// function esRequerible(): boolean {
//   if (!props.campo) return false
//   const tiposNoRequeribles: TipoCampo[] = ['divisor', 'etiqueta', 'panel', 'boton']
//   return !tiposNoRequeribles.includes(props.campo.tipo)
// }

function esDeshabilitableOEscribible(): boolean {
  if (!props.campo) return false
  const tiposPermitidos: TipoCampo[] = [
    'texto', 'area-texto', 'correo', 'contrasena', 'seleccion',
    'radio', 'hora', 'fecha', 'boton', 'numero', 'casilla'
  ]
  return tiposPermitidos.includes(props.campo.tipo)
}

function esSoloLectura(): boolean {
  if (!props.campo) return false
  return TIPOS_CON_PLACEHOLDER.includes(props.campo.tipo)
}

function tieneOpcionesHorizontalVertical(): boolean {
  if (!props.campo) return false
  if (!ServicioCampos.soportaOpcionesHorizontalVertical(props.campo.tipo)) return false

  const opciones = (metadatos.value as Record<string, unknown>).opciones
  return Array.isArray(opciones) && opciones.length > 0
}

// Actualizar propiedades del campo
function actualizarPropiedad(propiedad: keyof EsquemaCampo, valor: unknown): void {
  if (!props.campo) return
  almacen.actualizarCampo(props.campo.id, { [propiedad]: valor })
}

// Mensaje de requerido
// function obtenerMensajeRequerido(): string {
//   const validaciones = props.campo?.validaciones || []
//   const validacionRequerido = validaciones.find((v: ReglaValidacion) => v.tipo === 'requerido')
//   return validacionRequerido?.mensaje || ''
// }

// function actualizarMensajeRequerido(mensaje: string): void {
//   if (!props.campo) return
//   // TODO: Actualizar cuando el almacen esté en español
//   console.log('Actualizando mensaje requerido:', mensaje)
// }

// Layout de grupo
function obtenerLayoutGrupo(): TipoDiseno {
  const meta = metadatos.value as Record<string, unknown>
  return meta.layout === 'horizontal' ? 'horizontal' : 'vertical'
}

function actualizarLayoutGrupo(layout: TipoDiseno): void {
  if (!props.campo) return
  const meta = { ...metadatos.value } as Record<string, unknown>
  meta.layout = layout
  almacen.actualizarCampo(props.campo.id, { metadatos: meta })
}

// // Eventos personalizados
// function obtenerEventosPersonalizados(): string {
//   const meta = metadatos.value as Record<string, unknown>
//   const eventos = meta.eventosPersonalizados
//   return typeof eventos === 'string' ? eventos : ''
// }

// function actualizarEventosPersonalizados(eventos: string): void {
//   if (!props.campo) return
//   const meta = { ...metadatos.value } as Record<string, unknown>
//   meta.eventosPersonalizados = eventos
//   almacen.actualizarCampo(props.campo.id, { metadatos: meta })
// }

// // Dependencias
// function obtenerDependencias(): string {
//   const meta = metadatos.value as Record<string, unknown>
//   const dependencias = meta.dependencias
//   if (typeof dependencias === 'string') return dependencias
//   if (typeof dependencias === 'object' && dependencias !== null) {
//     return JSON.stringify(dependencias, null, 2)
//   }
//   return ''
// }

// function actualizarDependencias(dependencias: string): void {
//   if (!props.campo) return
//   const meta = { ...metadatos.value } as Record<string, unknown>
//   meta.dependencias = dependencias
//   almacen.actualizarCampo(props.campo.id, { metadatos: meta })
// }
</script>

