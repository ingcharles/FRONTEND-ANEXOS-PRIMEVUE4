<script setup lang="ts">
import draggable from 'vuedraggable'
import { computed, nextTick } from 'vue'
import type { FieldSchema } from '@/types/form-schema'
import FieldWrapper from './FieldWrapper.vue'
import { useDesignerStore } from '@/stores/useDesignerStore'

const props = withDefaults(defineProps<{ field: FieldSchema; collapsed?: boolean }>(), { collapsed: false })
const emit = defineEmits<{ (e: 'toggle'): void }>()
const store = useDesignerStore()

// Lista sincronizada directamente con el store para reflejar cambios de grid en vivo
const lista = computed<FieldSchema[]>({
  get: () => props.field.children ?? [],
  set: (v) => {
    // Solo panel puede tener hijos: el store ya impone esta restricción
    store.actualizarCampo(props.field.id, { children: [...v] })
  },
})

async function manejarAdd(evt: { newIndex: number }) {
  // Seleccionar el hijo recién añadido (desde paleta u otro contenedor)
  if (props.field.type !== 'panel') return
  const idx = evt.newIndex
  await nextTick()
  const arr = lista.value
  const elem = (idx != null && idx >= 0 && idx < arr.length) ? arr[idx] : arr[arr.length - 1]
  if (elem?.id) store.seleccionarCampo(elem.id)
}
</script>

<template>
  <PrimePanel :header="props.field.label || 'Panel'" :toggleable="true" :collapsed="props.collapsed" @toggle="emit('toggle')">
    <draggable
      class="grid w-full"
      v-model="lista"
      item-key="id"
      :group="{ name: 'paleta', pull: true, put: true }"
      handle=".handler-mover"
  @change="() => {}"
      @add="manejarAdd"
      ghost-class="drag-ghost"
      chosen-class="drag-chosen"
      drag-class="drag-active"
    >
      <template #item="{ element }">
        <div
          :class="[
            `col-${Math.min(12, Math.max(1, element.grid?.sm ?? 12))}`,
            `md:col-${Math.min(12, Math.max(1, element.grid?.md ?? 6))}`,
            `lg:col-${Math.min(12, Math.max(1, element.grid?.lg ?? 6))}`,
            'p-2',
          ]"
          @click.stop="store.seleccionarCampo(element.id)"
        >
          <FieldWrapper
            :field="element"
            :selected="store.selectedFieldId===element.id"
            @select="store.seleccionarCampo(element.id)"
          />
        </div>
      </template>
      <template #footer>
        <div v-if="lista.length===0" class="col-12 text-600 text-center p-2">
          Arrastre aquí elementos mientras esté vacío
        </div>
      </template>
    </draggable>
  </PrimePanel>
</template>

<style scoped>
.drag-ghost { opacity: .5; outline: 2px dashed var(--p-primary-400); }
.drag-chosen { outline: 2px solid var(--p-primary-500); }
.drag-active { cursor: grabbing; }
</style>
