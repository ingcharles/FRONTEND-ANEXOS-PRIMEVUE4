<template>
  <div class="mb-3">
    <div class="font-semibold mb-2">Comportamiento</div>

    <!-- Visibilidad -->
    <div class="field">
      <label class="inline-flex items-center gap-2">
        <Checkbox
          binary
          :model-value="!!campo?.visible"
          @update:model-value="(v: boolean) => actualizarPropiedad('visible', v)"
        />
        Visible
      </label>
    </div>

    <!-- Requerido -->
    <div class="field" v-if="esRequerible()">
      <label class="inline-flex items-center gap-2">
        <Checkbox
          binary
          :model-value="!!campo?.requerido"
          @update:model-value="(v: boolean) => actualizarPropiedad('requerido', v)"
        />
        Requerido
      </label>
    </div>

    <!-- Mensaje de requerido -->
    <div v-if="campo?.requerido" class="field">
      <label class="block mb-1">Mensaje de requerido</label>
      <InputText
        :model-value="obtenerMensajeRequerido()"
        @update:model-value="(v: string | undefined) => actualizarMensajeRequerido(v || '')"
      />
      <small class="text-muted-color">Se mostrará en la vista previa cuando el campo sea obligatorio.</small>
    </div>

    <!-- Deshabilitado -->
    <div class="field" v-if="esDeshabilitableOEscribible()">
      <label class="inline-flex items-center gap-2">
        <Checkbox
          binary
          :model-value="!!campo?.deshabilitado"
          @update:model-value="(v: boolean) => actualizarPropiedad('deshabilitado', v)"
        />
        Deshabilitado
      </label>
    </div>

    <!-- Solo lectura -->
    <div class="field" v-if="esSoloLectura()">
      <label class="inline-flex items-center gap-2">
        <Checkbox
          binary
          :model-value="!!campo?.soloLectura"
          @update:model-value="(v: boolean) => actualizarPropiedad('soloLectura', v)"
        />
        Solo lectura
      </label>
    </div>

    <!-- Layout para grupos de opciones -->
    <div class="field" v-if="tieneOpcionesMultiples()">
      <label class="block mb-1">Distribución de opciones</label>
      <SelectButton
        :model-value="obtenerLayoutGrupo()"
        :options="opcionesLayout"
        option-label="label"
        option-value="value"
        @update:model-value="(v: TipoLayout) => actualizarLayoutGrupo(v)"
      />
      <small class="text-muted-color">Controla si las opciones se muestran en columna o en fila.</small>
    </div>

    <!-- Eventos personalizados -->
    <!-- <div class="field">
      <label class="block mb-1">Eventos personalizados</label>
      <Textarea
        :model-value="obtenerEventosPersonalizados()"
        rows="4"
        placeholder="{ onClick: 'miFuncion', onBlur: 'otraFuncion' }"
        @update:model-value="(v: string | undefined) => actualizarEventosPersonalizados(v || '')"
      />
      <small class="text-muted-color">JSON con eventos personalizados para el campo.</small>
    </div> -->

    <!-- Dependencias condicionales -->
    <!-- <div class="field">
      <label class="block mb-1">Dependencias</label>
      <Textarea
        :model-value="obtenerDependencias()"
        rows="3"
        placeholder="Configuración de dependencias del campo"
        @update:model-value="(v: string | undefined) => actualizarDependencias(v || '')"
      />
      <small class="text-muted-color">Configuración de visibilidad condicional.</small>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import SelectButton from 'primevue/selectbutton'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { TipoCampo } from '@/tipos/Campos'
import type { ReglaValidacion } from '@/interfaces/Validacion'
import { TIPOS_CON_PLACEHOLDER } from '@/constantes/Campos'
import { ServicioCampos } from '@/servicios/disenador/ServiciosCampos'

type TipoLayout = 'vertical' | 'horizontal'

interface OpcionLayout {
  label: string
  value: TipoLayout
}

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
function esRequerible(): boolean {
  if (!props.campo) return false
  const tiposNoRequeribles: TipoCampo[] = ['divisor', 'etiqueta', 'panel', 'boton']
  return !tiposNoRequeribles.includes(props.campo.tipo)
}

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

function tieneOpcionesMultiples(): boolean {
  if (!props.campo) return false
  if (!ServicioCampos.soportaOpciones(props.campo.tipo)) return false

  const opciones = (metadatos.value as Record<string, unknown>).opciones
  return Array.isArray(opciones) && opciones.length > 0
}

// Actualizar propiedades del campo
function actualizarPropiedad(propiedad: keyof EsquemaCampo, valor: unknown): void {
  if (!props.campo) return
  almacen.actualizarCampo(props.campo.id, { [propiedad]: valor })
}

// Mensaje de requerido
function obtenerMensajeRequerido(): string {
  const validaciones = props.campo?.validaciones || []
  const validacionRequerido = validaciones.find((v: ReglaValidacion) => v.tipo === 'requerido')
  return validacionRequerido?.mensaje || ''
}

function actualizarMensajeRequerido(mensaje: string): void {
  if (!props.campo) return
  // TODO: Actualizar cuando el almacen esté en español
  console.log('Actualizando mensaje requerido:', mensaje)
}

// Layout de grupo
function obtenerLayoutGrupo(): TipoLayout {
  const meta = metadatos.value as Record<string, unknown>
  return meta.layout === 'horizontal' ? 'horizontal' : 'vertical'
}

function actualizarLayoutGrupo(layout: TipoLayout): void {
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

