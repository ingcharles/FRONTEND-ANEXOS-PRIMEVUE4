<template>
  <h3 class="tamanio-fuente-miga text-color mb-2">Comportamiento</h3>

  <!-- Visibilidad -->
  <div>
    <label for="visibleComportamiento" class="flex align-items-center gap-2">
      <PrimeCheckbox id="visibleComportamiento" binary :model-value="!!campo?.visible"
        @update:model-value="(v: boolean) => actualizarPropiedad('visible', v)" />
      Visible
      <IconoAyuda mensaje="Controla si el campo se muestra o se oculta en el formulario" />
    </label>
  </div>


  <!-- Deshabilitado -->
  <div v-if="ServicioCampos.esDeshabilitable(campo?.tipo)">
    <label for="deshabilitadoComportamiento" class="flex align-items-center gap-2">
      <PrimeCheckbox id="deshabilitadoComportamiento" binary :model-value="!!campo?.deshabilitado"
        @update:model-value="(v: boolean) => actualizarPropiedad('deshabilitado', v)" />
      Deshabilitado
      <IconoAyuda mensaje="Controla si el campo permite interacción del usuario" />
    </label>
  </div>

  <!-- Solo lectura -->
  <div v-if="ServicioCampos.esSoloLectura(campo?.tipo)">
    <label for="soloLecturaComportamiento" class="flex align-items-center gap-2">
      <PrimeCheckbox id="soloLecturaComportamiento" binary :model-value="!!campo?.soloLectura"
        @update:model-value="(v: boolean) => actualizarPropiedad('soloLectura', v)" />
      Solo lectura
      <IconoAyuda mensaje="Controla si el campo muestra información pero no permite modificación" />
    </label>
  </div>

  <!-- Layout para grupos de opciones -->
  <div v-if="ServicioCampos.soportaOpcionesHorizontalVertical(props?.campo?.tipo)">
    <div class="flex align-items-center gap-2 mb-1">
      <label for="distribucionOpcionesHorizontalVertical" class="block">Distribución de opciones</label>
      <IconoAyuda mensaje="Controla si las opciones se muestran en columna (vertical) o en fila (horizontal)" />

    </div>
    <PrimeSelectButton :model-value="obtenerLayoutGrupo()" :options="opcionesLayout" option-label="label"
      option-value="value" @update:model-value="(v: TipoDiseno) => actualizarLayoutGrupo(v)" />
    <small class="color-negro">Controla si las opciones se muestran en columna o en fila.</small>
  </div>

  <!-- Plegable para paneles -->
  <div v-if="campo?.tipo === TipoCampoValor.Panel">
    <label for="colapsarExpanderPanel" class="flex align-items-center gap-2">
      <PrimeCheckbox binary :model-value="obtenerToggleable()"
        @update:model-value="(v: boolean) => actualizarToggleable(v)" />
      Plegable
      <i class="pi pi-info-circle texto-ayuda p-2" v-tooltip.top="'Permite al usuario colapsar/expandir el panel'"></i>
    </label>
  </div>

  <PrimeDivider class="my-3" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '@/interfaces/Campos'
import { ServicioCampos } from '@/servicios/disenador/ServiciosCampos'
import type { OpcionLayout } from '@/interfaces/TabAtributos'
import type { TipoDiseno } from '@/tipos/Comunes'
import IconoAyuda from '@/componentes/IconoAyuda.vue'
import { TipoCampoValor } from '@/enumeraciones/Campos'
const props = defineProps<{
  campo: EsquemaCampo
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


// Actualizar propiedades del campo
function actualizarPropiedad(propiedad: keyof EsquemaCampo, valor: unknown): void {
  if (!props.campo) return
  almacen.actualizarCampo(props.campo.id, { [propiedad]: valor })
}

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

// Toggleable para paneles
function obtenerToggleable(): boolean {
  const meta = metadatos.value as Record<string, unknown>
  return meta.toggleable === true || meta.toggleable === undefined // Por defecto es true
}

function actualizarToggleable(toggleable: boolean): void {
  if (!props.campo) return
  const meta = { ...metadatos.value } as Record<string, unknown>
  meta.toggleable = toggleable
  almacen.actualizarCampo(props.campo.id, { metadatos: meta })
}
</script>
