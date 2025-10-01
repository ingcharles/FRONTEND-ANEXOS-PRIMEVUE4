<template>
    <h3 class="tamanio-fuente-miga text-color mb-2">Comportamiento</h3>

    <!-- Visibilidad -->
    <div class="mb-2">
      <label class="tamanio-fuente-miga">
        <Checkbox binary :model-value="!!campo?.visible"
          @update:model-value="(v: boolean) => actualizarPropiedad('visible', v)" />
        Visible
      </label>
    </div>


    <!-- Deshabilitado -->
    <div class="mb-2" v-if="ServicioCampos.esDeshabilitable(campo?.tipo)">
      <label class="tamanio-fuente-miga">
        <Checkbox binary :model-value="!!campo?.deshabilitado"
          @update:model-value="(v: boolean) => actualizarPropiedad('deshabilitado', v)" />
        Deshabilitado
      </label>
    </div>

    <!-- Solo lectura -->
    <div class="mb-2" v-if="ServicioCampos.esSoloLectura(campo?.tipo)">
      <label class="tamanio-fuente-miga">
        <Checkbox binary :model-value="!!campo?.soloLectura"
          @update:model-value="(v: boolean) => actualizarPropiedad('soloLectura', v)" />
        Solo lectura
      </label>
    </div>

    <!-- Layout para grupos de opciones -->
    <div class="mb-2" v-if="ServicioCampos.soportaOpcionesHorizontalVertical(props?.campo?.tipo)">
      <label class="block mb-1">Distribución de opciones</label>
      <SelectButton :model-value="obtenerLayoutGrupo()" :options="opcionesLayout" option-label="label"
        option-value="value" @update:model-value="(v: TipoDiseno) => actualizarLayoutGrupo(v)" />
      <small class="color-negro">Controla si las opciones se muestran en columna o en fila.</small>
    </div>


  <PrimeDivider class="my-3" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Checkbox from 'primevue/checkbox'
import SelectButton from 'primevue/selectbutton'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '@/interfaces/Campos'
import { ServicioCampos } from '@/servicios/disenador/ServiciosCampos'
import type { OpcionLayout } from '@/interfaces/TabAtributos'
import type { TipoDiseno } from '@/tipos/Comunes'


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
</script>
