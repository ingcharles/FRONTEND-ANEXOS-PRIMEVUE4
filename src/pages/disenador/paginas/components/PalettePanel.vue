<script setup lang="ts">
import draggable from 'vuedraggable'
import { ref } from 'vue'
import type { FieldSchema, FieldType } from '@/types/form-schema'
import { generarId } from '@/utils/id'

interface PaletteItem {
  type: FieldType
  icon: string
  defaultProps?: Partial<FieldSchema>
  label: string
}

const expandedKeys = ref({})

// Elementos de la paleta organizados por categorías
const paletteItems: PaletteItem[] = [
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

// Estructura para PanelMenu
const items = ref([
  {
    key: '0',
    label: 'Campos de Entrada',
    icon: 'pi pi-pencil',
    items: [
      { key: '0_0', label: 'Texto', type: 'text', icon: 'pi pi-pencil' },
      { key: '0_1', label: 'Email', type: 'email', icon: 'pi pi-at' },
      { key: '0_2', label: 'Password', type: 'password', icon: 'pi pi-lock' },
      { key: '0_3', label: 'Área', type: 'textarea', icon: 'pi pi-align-left' },
      { key: '0_4', label: 'Hora', type: 'time', icon: 'pi pi-clock' },
    ]
  },
  {
    key: '1',
    label: 'Selección',
    icon: 'pi pi-list',
    items: [
      { key: '1_0', label: 'Select', type: 'select', icon: 'pi pi-list' },
      { key: '1_1', label: 'Radio', type: 'radio', icon: 'pi pi-circle' },
    ]
  },
  {
    key: '2',
    label: 'Elementos UI',
    icon: 'pi pi-window-maximize',
    items: [
      { key: '2_0', label: 'Etiqueta', type: 'label', icon: 'pi pi-info-circle' },
      { key: '2_1', label: 'Botón', type: 'button', icon: 'pi pi-check' },
      { key: '2_2', label: 'Divisor', type: 'divider', icon: 'pi pi-minus' },
      { key: '2_3', label: 'Panel', type: 'panel', icon: 'pi pi-window-maximize' },
      { key: '2_4', label: 'Tabla', type: 'table', icon: 'pi pi-table' },
    ]
  }
])

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

// Función para obtener el elemento de la paleta por tipo
function getPaletteItemByType(type: FieldType): PaletteItem | undefined {
  return paletteItems.find(item => item.type === type)
}

// Función para clonar desde el menú
function clonarDesdeMenu(menuItem: any): FieldSchema | null {
  if (!menuItem.type) return null
  const paletteItem = getPaletteItemByType(menuItem.type)
  if (!paletteItem) return null
  return clonarDesdePaleta(paletteItem)
}

const toggleAll = () => {
  if (Object.keys(expandedKeys.value).length) collapseAll()
  else expandAll()
}

const expandAll = () => {
  for (let node of items.value) {
    expandNode(node)
  }
  expandedKeys.value = {...expandedKeys.value}
}

const collapseAll = () => {
  expandedKeys.value = {}
}

const expandNode = (node: any) => {
  if (node.items && node.items.length) {
    expandedKeys.value[node.key] = true
    for (let child of node.items) {
      expandNode(child)
    }
  }
}
</script>

<template>
  <div class="card flex flex-col items-center gap-4 w-full">
    <Button type="button" label="Toggle All" text @click="toggleAll" />
    <PrimePanelMenu v-model:expandedKeys="expandedKeys" :model="items" class="w-full">
      <template #item="{ item }">
        <div v-if="item.type" class="flex align-items-center gap-2">
          <draggable
            :list="[item]"
            item-key="key"
            :group="{ name: 'paleta', pull: 'clone', put: false }"
            :clone="() => clonarDesdeMenu(item)"
            :sort="false"
            class="w-full"
          >
            <template #item="{ element }">
              <div class="p-2 flex align-items-center gap-2 surface-hover border-round cursor-grab w-full">
                <i :class="['pi', element.icon]" />
                <span>{{ element.label }}</span>
              </div>
            </template>
          </draggable>
        </div>
        <div v-else class="flex align-items-center gap-2">
          <i :class="['pi', item.icon]" />
          <span>{{ item.label }}</span>
        </div>
      </template>
    </PrimePanelMenu>
  </div>
</template>

<style scoped>
.cursor-grab { cursor: grab; }
</style>
