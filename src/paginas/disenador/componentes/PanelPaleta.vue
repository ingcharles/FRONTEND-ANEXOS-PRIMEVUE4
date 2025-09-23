<script setup lang="ts">
import draggable from 'vuedraggable'
import { ref, computed } from 'vue'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { TipoCampo } from '@/tipos/Campos'
import { generarId } from '@/utilidades/GeneraId'
import { TipoCampoEtiqueta, TipoCampoValor } from '@/constantes/Campos'

// Primera categoría expandida por defecto
const clavesExpandidas = ref<Record<string, boolean>>({ '0': true, '1': true })
const filtro = ref('')

// Estructura directa en formato PanelMenu de PrimeVue
const categoriasPaleta = ref([
  {
    key: '0',
    label: 'Contenedor',
    icon: 'pi pi-window-maximize',
    items: [
      {
        key: '0_0',
        label: TipoCampoEtiqueta.Panel,
        icon: 'pi pi-window-maximize',
        tipo: TipoCampoValor.Panel,
        propiedadesPorDefecto: { hijos: [] }
      },
    ]
  },
  {
    key: '1',
    label: 'Campos de Entrada',
    icon: 'pi pi-pencil',
    items: [
      { key: '1_0', label: TipoCampoEtiqueta.Texto, icon: 'pi pi-pencil', tipo: TipoCampoValor.Texto },
      { key: '1_1', label: TipoCampoEtiqueta.Correo, icon: 'pi pi-at', tipo: TipoCampoValor.Correo },
      { key: '1_2', label: TipoCampoEtiqueta.Contrasena, icon: 'pi pi-lock', tipo: TipoCampoValor.Contrasena },
      { key: '1_3', label: TipoCampoEtiqueta.AreaTexto, icon: 'pi pi-align-left', tipo: TipoCampoValor.AreaTexto },
      {
        key: '1_4',
        label: TipoCampoEtiqueta.Numero,
        icon: 'pi pi-hashtag',
        tipo: TipoCampoValor.Numero,
        propiedadesPorDefecto: { metadatos: { valorPorDefecto: 0 } }
      },
      { key: '1_5', label: TipoCampoEtiqueta.Hora, icon: 'pi pi-clock', tipo: TipoCampoValor.Hora },
      { key: '1_6', label: TipoCampoEtiqueta.Fecha, icon: 'pi pi-calendar', tipo: TipoCampoValor.Fecha },
    ]
  },
  {
    key: '2',
    label: 'Selección',
    icon: 'pi pi-list',
    items: [
      {
        key: '2_0',
        label: TipoCampoEtiqueta.Seleccion,
        icon: 'pi pi-list',
        tipo: TipoCampoValor.Seleccion,
        propiedadesPorDefecto: {
          metadatos: {
            opciones: [
              { etiqueta: 'Opción 1', valor: 'opcion1' },
              { etiqueta: 'Opción 2', valor: 'opcion2' },
            ],
            modoOpciones: 'manual',
          },
        }
      },
      {
        key: '2_1',
        label: TipoCampoEtiqueta.Radio,
        icon: 'pi pi-circle',
        tipo: TipoCampoValor.Radio,
        propiedadesPorDefecto: {
          metadatos: {
            opciones: [
              { etiqueta: 'Opción 1', valor: 'opcion1' },
              { etiqueta: 'Opción 2', valor: 'opcion2' },
            ],
          },
        }
      },
      {
        key: '2_2',
        label: TipoCampoEtiqueta.Casilla,
        icon: 'pi pi-check-square',
        tipo: TipoCampoValor.Casilla,
        propiedadesPorDefecto: {
          metadatos: {
            valorPorDefecto: false,
            opciones: [
              { etiqueta: 'Opción 1', valor: 'opcion1' },
              { etiqueta: 'Opción 2', valor: 'opcion2' },
            ],
          }
        }
      },
    ]
  },
  {
    key: '3',
    label: 'Datos',
    icon: 'pi pi-database',
    items: [
      {
        key: '3_0',
        label: TipoCampoEtiqueta.Tabla,
        icon: 'pi pi-table',
        tipo: TipoCampoValor.Tabla,
        propiedadesPorDefecto: {
          metadatos: {
            filas: 1,
            columnas: 2
          },
        }
      },
      {
        key: '3_1',
        label: 'Tabla Precio/Tasa',
        icon: 'pi pi-percentage',
        tipo: TipoCampoValor.Tabla,
        propiedadesPorDefecto: {
          metadatos: {
            filas: 1,
            columnas: 2
          },
        }
      },
    ]
  },
  {
    key: '4',
    label: 'Elementos UI',
    icon: 'pi pi-window-maximize',
    items: [
      { key: '4_0', label: 'Etiqueta', icon: 'pi pi-info-circle', tipo: TipoCampoValor.Etiqueta },
      { key: '4_1', label: 'Botón', icon: 'pi pi-check', tipo: TipoCampoValor.Boton },
      { key: '4_2', label: 'Divisor', icon: 'pi pi-minus', tipo: TipoCampoValor.Divisor },
    ]
  }
])

// Computed para filtrar el modelo basado en la búsqueda
const modeloPanelMenuFiltrado = computed(() => {
  const consulta = filtro.value.trim().toLowerCase()

  if (!consulta) {
    return categoriasPaleta.value
  }

  // Filtrar categorías y sus items basado en la búsqueda
  return categoriasPaleta.value
    .map(categoria => ({
      ...categoria,
      items: categoria.items?.filter(item =>
        item.label.toLowerCase().includes(consulta)
      )
    }))
    .filter(categoria => categoria.items && categoria.items.length > 0)
})

function clonarDesdePaleta(elemento: { tipo: TipoCampo; label: string; propiedadesPorDefecto?: Record<string, unknown> }): EsquemaCampo {
  const id = generarId('field')
  return {
    id,
    tipo: elemento.tipo,
    etiqueta: elemento.label,
    nombre: `${elemento.tipo}_${id.slice(-4)}`,
    grid: { sm: 12, md: 6, lg: 6 },
    visible: true,
    requerido: false,
    ...(elemento.propiedadesPorDefecto || {}),
    // Solo el tipo panel lleva hijos; para otros, forzamos hijos undefined
    ...(elemento.tipo === 'panel' ? {} : { hijos: undefined }),
  }
}

// Función para buscar elemento en categorías
function buscarElementoPorClave(clave: string): { tipo: TipoCampo; label: string; propiedadesPorDefecto?: Record<string, unknown> } | undefined {
  for (const categoria of categoriasPaleta.value) {
    const elemento = categoria.items?.find((el: { key: string }) => el.key === clave)
    if (elemento) return elemento
  }
  return undefined
}

// Función simplificada para clonar desde el menú
function clonarDesdeMenu(elementoMenu: { key?: string; tipo?: TipoCampo }): EsquemaCampo | null {
  if (!elementoMenu.tipo || !elementoMenu.key) return null

  const elemento = buscarElementoPorClave(elementoMenu.key)
  if (!elemento) return null

  return clonarDesdePaleta(elemento)
}

function alternarTodo(): void {
  if (Object.keys(clavesExpandidas.value).length) colapsar()
  else expandir()
}

function expandir(): void {
  for (const nodo of categoriasPaleta.value) {
    expandirNodo(nodo)
  }
  clavesExpandidas.value = { ...clavesExpandidas.value }
}

function colapsar(): void {
  clavesExpandidas.value = {}
}

function expandirNodo(nodo: { key: string; items?: unknown[] }): void {
  if (nodo.items && nodo.items.length && nodo.key) {
    clavesExpandidas.value[nodo.key] = true
  }
}

function limpiarFiltro(): void {
  filtro.value = ''
}

// Accesibilidad: atajos básicos (Ctrl+K enfoca buscador)
function manejarAtajos(evento: KeyboardEvent): void {
  if (evento.ctrlKey && evento.key.toLowerCase() === 'k') {
    evento.preventDefault()
    const elemento = document.getElementById('buscador-paleta') as HTMLInputElement | null
    elemento?.focus()
  }
}

window.addEventListener('keydown', manejarAtajos)
</script>

<template>
  <div class="w-full rounded-xl border border-surface-200/70 dark:border-surface-700/60 bg-surface-0/80 dark:bg-surface-900/70 backdrop-blur-sm shadow-sm p-3 flex flex-col gap-3">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <h3 class="m-0 text-sm font-semibold tracking-wide text-primary flex items-center gap-2">
        <i class="pi pi-box" /> Componentes
      </h3>

      <div class="ml-auto flex gap-1">
        <PrimeButton size="small" text severity="secondary" icon="pi pi-plus" class="hover:surface-hover" @click="expandir" :disabled="Object.keys(clavesExpandidas).length === modeloPanelMenuFiltrado.length" v-tooltip.top="'Expandir todo'" />
        <PrimeButton size="small" text severity="secondary" icon="pi pi-minus" class="hover:surface-hover" @click="colapsar" :disabled="!Object.keys(clavesExpandidas).length" v-tooltip.top="'Colapsar todo'" />
        <PrimeButton size="small" text severity="secondary" icon="pi pi-refresh" class="hover:surface-hover" @click="alternarTodo" v-tooltip.top="'Alternar expansión'" />
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
    <PrimePanelMenu v-model:expandedKeys="clavesExpandidas" :model="modeloPanelMenuFiltrado" class="w-full text-sm custom-panel-menu">
      <template #item="{ item }">
        <!-- Item de campo (draggable) -->
        <div v-if="item.tipo" class="flex items-center gap-2 w-full">
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
    </PrimePanelMenu>
  </div>
</template>

<style scoped>

</style>

