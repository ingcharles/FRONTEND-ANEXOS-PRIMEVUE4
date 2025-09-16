<script setup lang="ts">
import draggable from 'vuedraggable'
import { ref, computed } from 'vue'
import type { FieldSchema, FieldType } from '@/types/form-schema'
import { generarId } from '@/utils/id'

interface BaseCategoria {
  key: string
  label: string
  icon: string
  items: (ElementoPalette)[]
}

interface ElementoPalette {
  key: string
  label: string
  icon: string
  type: FieldType
}

// Unión para facilitar el modelado en PanelMenu
// (NodoPalette eliminado si se necesitara en futuro se reintroduce)

// Primera categoría expandida por defecto
const expandedKeys = ref<Record<string, boolean>>({ '0': true })
const filtro = ref('')

// Elementos de la paleta organizados por categorías
const paletteItems: { type: FieldType; icon: string; defaultProps?: Partial<FieldSchema>; label: string }[] = [
  { type: 'text', icon: 'pi pi-pencil', label: 'Texto' },
  { type: 'email', icon: 'pi pi-at', label: 'Email' },
  { type: 'password', icon: 'pi pi-lock', label: 'Password' },
  { type: 'textarea', icon: 'pi pi-align-left', label: 'Área' },
  { type: 'number', icon: 'pi pi-hashtag', label: 'Número', defaultProps: { meta: { valorPorDefecto: 0 } } },
  { type: 'time', icon: 'pi pi-clock', label: 'Hora' },
  { type: 'checkbox', icon: 'pi pi-check-square', label: 'Checkbox', defaultProps: { meta: { valorPorDefecto: false } } },
  {
    type: 'select',
    icon: 'pi pi-list',
    label: 'Select',
    defaultProps: {
      meta: {
        options: [
          { label: 'Item 1', value: 'item1' },
          { label: 'Item 2', value: 'item2' },
        ],
      },
    },
  },
  {
    type: 'radio',
    icon: 'pi pi-circle',
    label: 'Radio',
    defaultProps: {
      meta: {
        options: [
          { label: 'Item 1', value: 'item1' },
          { label: 'Item 2', value: 'item2' },
        ],
      },
    },
  },
  { type: 'label', icon: 'pi pi-info-circle', label: 'Etiqueta' },
  { type: 'button', icon: 'pi pi-check', label: 'Botón' },
  { type: 'divider', icon: 'pi pi-minus', label: 'Divisor' },
  { type: 'panel', icon: 'pi pi-window-maximize', label: 'Panel', defaultProps: { children: [] } },
  { type: 'table', icon: 'pi pi-table', label: 'Tabla', defaultProps: { meta: { columns: [], addRows: true } } },
]

// Estructura para PanelMenu
const items = ref<BaseCategoria[]>([
  {
    key: '0',
    label: 'Campos de Entrada',
    icon: 'pi pi-pencil',
    items: [
      { key: '0_0', label: 'Texto', type: 'text', icon: 'pi pi-pencil' },
      { key: '0_1', label: 'Email', type: 'email', icon: 'pi pi-at' },
      { key: '0_2', label: 'Password', type: 'password', icon: 'pi pi-lock' },
      { key: '0_3', label: 'Área', type: 'textarea', icon: 'pi pi-align-left' },
  { key: '0_4', label: 'Número', type: 'number', icon: 'pi pi-hashtag' },
  { key: '0_5', label: 'Hora', type: 'time', icon: 'pi pi-clock' },
    ]
  },
  {
    key: '1',
    label: 'Selección',
    icon: 'pi pi-list',
    items: [
      { key: '1_0', label: 'Select', type: 'select', icon: 'pi pi-list' },
      { key: '1_1', label: 'Radio', type: 'radio', icon: 'pi pi-circle' },
      { key: '1_2', label: 'Checkbox', type: 'checkbox', icon: 'pi pi-check-square' },
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

// Items filtrados por texto de búsqueda conservando estructura de categorías
const itemsFiltrados = computed<BaseCategoria[]>(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value
    .map(cat => {
      const filtered = cat.items.filter(it => it.label.toLowerCase().includes(q))
      return { ...cat, items: filtered }
    })
    .filter(cat => (cat.items?.length || 0) > 0)
})

function clonarDesdePaleta(item: { type: FieldType; icon: string; defaultProps?: Partial<FieldSchema>; label: string }): FieldSchema {
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
function getPaletteItemByType(type: FieldType): { type: FieldType; icon: string; defaultProps?: Partial<FieldSchema>; label: string } | undefined {
  return paletteItems.find(item => item.type === type)
}

// Función para clonar desde el menú
function clonarDesdeMenu(menuItem: ElementoPalette): FieldSchema | null {
  const paletteItem = getPaletteItemByType(menuItem.type) ?? {
    type: menuItem.type,
    icon: menuItem.icon,
    label: menuItem.label,
  }
  return clonarDesdePaleta(paletteItem)
}

const toggleAll = () => {
  if (Object.keys(expandedKeys.value).length) collapseAll()
  else expandAll()
}

const expandAll = () => {
  for (const node of items.value) {
    expandNode(node)
  }
  expandedKeys.value = { ...expandedKeys.value }
}

const collapseAll = () => {
  expandedKeys.value = {}
}

const expandNode = (node: BaseCategoria) => {
  if (node.items && node.items.length && node.key) {
    expandedKeys.value[node.key] = true
  }
}
function limpiarFiltro() {
  filtro.value = ''
}

// Accesibilidad: atajos básicos (Ctrl+K enfoca buscador)
function manejarAtajos(e: KeyboardEvent) {
  if (e.ctrlKey && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    const el = document.getElementById('buscador-paleta') as HTMLInputElement | null
    el?.focus()
  }
}
window.addEventListener('keydown', manejarAtajos)
// Limpieza opcional si el componente se desmontara (no crítico en paleta fija)
</script>

<template>

  <div class="w-full rounded-xl border border-surface-200/70 dark:border-surface-700/60 bg-surface-0/80 dark:bg-surface-900/70 backdrop-blur-sm shadow-sm p-3 flex flex-col gap-3">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <h3 class="m-0 text-sm font-semibold tracking-wide text-primary flex items-center gap-2">
        <i class="pi pi-box" /> Componentes
      </h3>

      <div class="ml-auto flex gap-1">
        <PrimeButton size="small" text severity="secondary" icon="pi pi-plus" class="hover:surface-hover" @click="expandAll" :disabled="Object.keys(expandedKeys).length === itemsFiltrados.length" v-tooltip.top="'Expandir todo'" />
        <PrimeButton size="small" text severity="secondary" icon="pi pi-minus" class="hover:surface-hover" @click="collapseAll" :disabled="!Object.keys(expandedKeys).length" v-tooltip.top="'Colapsar todo'" />
        <PrimeButton size="small" text severity="secondary" icon="pi pi-refresh" class="hover:surface-hover" @click="toggleAll" v-tooltip.top="'Alternar expansión'" />
      </div>
    </div>
    <!-- Buscador -->
    <div class="relative">
      <span class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-muted-color text-xs">
        <i class="pi pi-search" />
      </span>
      <input
        id="buscador-paleta"
        v-model="filtro"
        type="text"
        autocomplete="off"
        placeholder="Filtrar (Ctrl+K)"
        class="w-full pl-7 pr-6 py-2 rounded-md bg-surface-50/60 dark:bg-surface-800/70 border border-surface-300 dark:border-surface-700 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors"
      />
      <button
        v-if="filtro"
        @click="limpiarFiltro"
        type="button"
        class="absolute inset-y-0 right-0 px-2 text-muted-color hover:text-primary text-xs"
        aria-label="Limpiar filtro"
      >
        <i class="pi pi-times" />
      </button>
    </div>
    <!-- Contenido -->
    <PrimePanelMenu v-model:expandedKeys="expandedKeys" :model="itemsFiltrados" class="w-full text-sm custom-panel-menu">
      <template #item="{ item }">
        <!-- Item de campo (draggable) -->
        <div v-if="item.type" class="flex items-center gap-2 w-full">
          <draggable
            :list="[item]"
            item-key="key"
            :group="{ name: 'paleta', pull: 'clone', put: false }"
            :clone="() => clonarDesdeMenu(item)"
            :sort="false"
            class="w-full"
          >
            <template #item="{ element }">
              <div
                class="group p-2 flex items-center gap-2 rounded-md border border-transparent hover:border-primary-300/60 dark:hover:border-primary-400/40 bg-surface-50/60 dark:bg-surface-800/60 hover:bg-primary-50/70 dark:hover:bg-primary-900/30 transition-colors cursor-grab w-full select-none"
                :title="'Arrastrar ' + element.label"
              >
                <i class="pi pi-grip-vertical text-muted-color text-xs opacity-50 group-hover:opacity-90 transition-opacity" />
                <i :class="['pi', element.icon, 'text-muted-color']" />
                <span class="font-medium leading-none">{{ element.label }}</span>
                <PrimeTag severity="secondary" v-if="element.type==='panel'" value="Contenedor" class="ml-auto text-[10px] py-0 px-1" />
                <PrimeTag severity="contrast" v-else-if="element.type==='table'" value="Data" class="ml-auto text-[10px] py-0 px-1" />
              </div>
            </template>
          </draggable>
        </div>
        <!-- Cabecera de categoría -->
        <div v-else class="flex items-center gap-2 py-1 px-2 rounded-md font-semibold text-[12px] tracking-wide uppercase">
          <i :class="['pi', item.icon, 'text-sky-500 dark:text-sky-400']" />
          <span class="flex-1">{{ item.label }}</span>
          <span v-if="item.items" class="pi pi-angle-down text-primary ml-auto" />
          <PrimeTag :value="item.items?.length || 0" severity="contrast" class="text-[10px] py-0 px-1" />
        </div>
      </template>
      <template #empty>
        <div class="p-3 text-xs text-muted-color flex items-center gap-2">
          <i class="pi pi-inbox" /> No hay resultados
        </div>
      </template>
    </PrimePanelMenu>
  </div>
</template>

<style scoped>
.cursor-grab { cursor: grab; }

/* Ajustes ligeros al PanelMenu para modernizar sin romper tema */
:deep(.p-panelmenu-panel) {
  background: transparent;
  border: 0;
}




/* Suavizar transiciones */
.custom-panel-menu :deep(a) { transition: background-color .15s ease, color .15s ease; }
</style>
