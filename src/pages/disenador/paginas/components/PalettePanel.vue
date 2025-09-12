<script setup lang="ts">
import draggable from 'vuedraggable'
import type { FieldSchema, FieldType } from '@/types/form-schema'
import { generarId } from '@/utils/id'

interface PaletteItem {
  type: FieldType
  icon: string
  defaultProps?: Partial<FieldSchema>
  label: string
}

const items: PaletteItem[] = [
  { type: 'text', icon: 'pi pi-pencil', label: 'Texto' },
  { type: 'email', icon: 'pi pi-at', label: 'Email' },
  { type: 'password', icon: 'pi pi-lock', label: 'Password' },
  { type: 'textarea', icon: 'pi pi-align-left', label: 'Área' },
  { type: 'time', icon: 'pi pi-clock', label: 'Hora' },
  { type: 'select', icon: 'pi pi-list', label: 'Select', defaultProps: { meta: { options: [] } } },
  { type: 'radio', icon: 'pi pi-circle', label: 'Radio', defaultProps: { meta: { options: [] } } },
  { type: 'label', icon: 'pi pi-info-circle', label: 'Etiqueta' },
  { type: 'button', icon: 'pi pi-check', label: 'Botón' },
  { type: 'divider', icon: 'pi pi-minus', label: 'Divisor' },
  { type: 'panel', icon: 'pi pi-window-maximize', label: 'Panel', defaultProps: { children: [] } },
  { type: 'table', icon: 'pi pi-table', label: 'Tabla', defaultProps: { meta: { columns: [], addRows: true } } },
]

function clonarDesdePaleta(item: PaletteItem): FieldSchema {
  const id = generarId('field')
  return {
    id,
    type: item.type,
    label: item.label,
    name: `${item.type}_${id.slice(-4)}`,
    grid: { sm: 12, md: 6, lg: 6 },
    visible: true,
    required: false,
    ...(item.defaultProps || {}),
    // Solo el tipo panel lleva children; para otros, forzamos children undefined
    ...(item.type === 'panel' ? {} : { children: undefined }),
  }
}
</script>

<template>
  <PrimePanel header="Paleta de componentes" class="w-full">
    <draggable
      :list="items"
      item-key="type"
      :group="{ name: 'paleta', pull: 'clone', put: false }"
      :clone="clonarDesdePaleta"
      :sort="false"
    >
      <template #item="{ element }">
        <div class="p-2 flex align-items-center gap-2 surface-hover border-round cursor-grab mb-2">
          <i :class="['pi', element.icon]" />
          <span>{{ element.label }}</span>
        </div>
      </template>
    </draggable>
  </PrimePanel>
</template>

<style scoped>
.cursor-grab { cursor: grab; }
</style>
