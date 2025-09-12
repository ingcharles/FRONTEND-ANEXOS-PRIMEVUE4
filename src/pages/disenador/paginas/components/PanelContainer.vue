<script setup lang="ts">
import draggable from 'vuedraggable'
import { ref, watch } from 'vue'
import type { FieldSchema } from '@/types/form-schema'
import FieldWrapper from './FieldWrapper.vue'
import { useDesignerStore } from '@/stores/useDesignerStore'

const props = withDefaults(defineProps<{ field: FieldSchema; collapsed?: boolean }>(), { collapsed: false })
const emit = defineEmits<{ (e: 'toggle'): void }>()
const store = useDesignerStore()

// Lista local para evitar mutar props directamente
const lista = ref<FieldSchema[]>(props.field.children ? [...props.field.children] : [])
watch(
  () => props.field.children,
  (n) => {
    lista.value = n ? [...n] : []
  }
)

function sincronizar(): void {
  store.actualizarCampo(props.field.id, { children: [...lista.value] })
}
</script>

<template>
  <PrimePanel :header="props.field.label || 'Panel'" :toggleable="true" :collapsed="props.collapsed" @toggle="emit('toggle')">
    <div class="grid w-full">
      <draggable
        v-model="lista"
        item-key="id"
        :group="{ name: 'paleta', pull: true, put: true }"
        handle=".handler-mover"
        @change="sincronizar"
      >
        <template #item="{ element }">
          <div
            :class="[
              `col-${Math.min(12, Math.max(1, element.grid?.sm ?? 12))}`,
              `md:col-${Math.min(12, Math.max(1, element.grid?.md ?? 6))}`,
              `lg:col-${Math.min(12, Math.max(1, element.grid?.lg ?? 6))}`,
              'p-2',
            ]"
          >
            <FieldWrapper :field="element" />
          </div>
        </template>
        <template #footer>
          <div v-if="lista.length===0" class="col-12 text-600 text-center p-2">Suelta elementos aquí</div>
        </template>
      </draggable>
    </div>
  </PrimePanel>
</template>
