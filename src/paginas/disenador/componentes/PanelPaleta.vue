<script setup lang="ts">
import draggable from 'vuedraggable'
import { ref, computed } from 'vue'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { TipoCampo } from '@/tipos/Campos'
import { generarId } from '@/utilidades/id'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

interface CategoriaBase {
  clave: string
  etiqueta: string
  icono: string
  elementos: (ElementoPaleta)[]
}

interface ElementoPaleta {
  clave: string
  etiqueta: string
  icono: string
  tipo: TipoCampo
}

interface ElementoMenuPaleta {
  key: string
  label: string
  icon: string
  tipo?: TipoCampo
}

// Primera categoría expandida por defecto
const clavesExpandidas = ref<Record<string, boolean>>({ '0': true, '1': true })
const filtro = ref('')

// Elementos de la paleta organizados por categorías
const elementosPaleta: { tipo: TipoCampo; icono: string; propiedadesPorDefecto?: Partial<EsquemaCampo>; etiqueta: string }[] = [
  { tipo: 'texto', icono: 'pi pi-pencil', etiqueta: 'Texto' },
  { tipo: 'correo', icono: 'pi pi-at', etiqueta: 'Email' },
  { tipo: 'contrasena', icono: 'pi pi-lock', etiqueta: 'Password' },
  { tipo: 'area-texto', icono: 'pi pi-align-left', etiqueta: 'Área' },
  { tipo: 'numero', icono: 'pi pi-hashtag', etiqueta: 'Número', propiedadesPorDefecto: { metadatos: { valorPorDefecto: 0 } } },
  { tipo: 'hora', icono: 'pi pi-clock', etiqueta: 'Hora' },
  { tipo: 'fecha', icono: 'pi pi-calendar', etiqueta: 'Fecha' },
  {
    tipo: 'casilla',
    icono: 'pi pi-check-square',
    etiqueta: 'Checkbox',
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
  {
    tipo: 'seleccion',
    icono: 'pi pi-list',
    etiqueta: 'Select',
    propiedadesPorDefecto: {
      metadatos: {
        opciones: [
          { etiqueta: 'Opción 1', valor: 'opcion1' },
          { etiqueta: 'Opción 2', valor: 'opcion2' },
        ],
        options: [
          { label: 'Opción 1', value: 'opcion1' },
          { label: 'Opción 2', value: 'opcion2' },
        ],
        modoOpciones: 'manual',
      },
    },
  },
  {
    tipo: 'radio',
    icono: 'pi pi-circle',
    etiqueta: 'Radio',
    propiedadesPorDefecto: {
      metadatos: {
        opciones: [
          { etiqueta: 'Opción 1', valor: 'opcion1' },
          { etiqueta: 'Opción 2', valor: 'opcion2' },
        ],
      },
    },
  },
  { tipo: 'etiqueta', icono: 'pi pi-info-circle', etiqueta: 'Etiqueta' },
  { tipo: 'boton', icono: 'pi pi-check', etiqueta: 'Botón' },
  { tipo: 'divisor', icono: 'pi pi-minus', etiqueta: 'Divisor' },
  { tipo: 'panel', icono: 'pi pi-window-maximize', etiqueta: 'Panel', propiedadesPorDefecto: { hijos: [] } },
  {
    tipo: 'tabla',
    icono: 'pi pi-table',
    etiqueta: 'Tabla',
    propiedadesPorDefecto: {
      metadatos: {
        filas: 1,
        columnas: 2
      },
    },
  },
]

// Estructura para PanelMenu - siguiendo la estructura del código inglés
const elementos = ref<CategoriaBase[]>([
  {
    clave: '0',
    etiqueta: 'Contenedor',
    icono: 'pi pi-window-maximize',
    elementos: [
      { clave: '0_0', etiqueta: 'Panel', tipo: 'panel', icono: 'pi pi-window-maximize' },
    ]
  },
  {
    clave: '1',
    etiqueta: 'Campos de Entrada',
    icono: 'pi pi-pencil',
    elementos: [
      { clave: '1_0', etiqueta: 'Texto', tipo: 'texto', icono: 'pi pi-pencil' },
      { clave: '1_1', etiqueta: 'Email', tipo: 'correo', icono: 'pi pi-at' },
      { clave: '1_2', etiqueta: 'Password', tipo: 'contrasena', icono: 'pi pi-lock' },
      { clave: '1_3', etiqueta: 'Área', tipo: 'area-texto', icono: 'pi pi-align-left' },
      { clave: '1_4', etiqueta: 'Número', tipo: 'numero', icono: 'pi pi-hashtag' },
      { clave: '1_5', etiqueta: 'Hora', tipo: 'hora', icono: 'pi pi-clock' },
      { clave: '1_6', etiqueta: 'Fecha', tipo: 'fecha', icono: 'pi pi-calendar' },
    ]
  },
  {
    clave: '2',
    etiqueta: 'Selección',
    icono: 'pi pi-list',
    elementos: [
      { clave: '2_0', etiqueta: 'Select', tipo: 'seleccion', icono: 'pi pi-list' },
      { clave: '2_1', etiqueta: 'Radio', tipo: 'radio', icono: 'pi pi-circle' },
      { clave: '2_2', etiqueta: 'Checkbox', tipo: 'casilla', icono: 'pi pi-check-square' },
    ]
  },
   {
    clave: '3',
    etiqueta: 'Datos',
    icono: 'pi pi-database',
    elementos: [
      { clave: '3_0', etiqueta: 'Tabla', tipo: 'tabla', icono: 'pi pi-table' },
      { clave: '3_1', etiqueta: 'Tabla Precio/Tasa', tipo: 'tabla', icono: 'pi pi-percentage' },
    ]
  },
  {
    clave: '4',
    etiqueta: 'Elementos UI',
    icono: 'pi pi-window-maximize',
    elementos: [
      { clave: '4_0', etiqueta: 'Etiqueta', tipo: 'etiqueta', icono: 'pi pi-info-circle' },
      { clave: '4_1', etiqueta: 'Botón', tipo: 'boton', icono: 'pi pi-check' },
      { clave: '4_2', etiqueta: 'Divisor', tipo: 'divisor', icono: 'pi pi-minus' },
    ]
  }
])

// Crear modelo para PanelMenu usando la estructura requerida
const modeloPanelMenu = computed(() => {
  const consulta = filtro.value.trim().toLowerCase()
  let elementosParaProcesar = elementos.value

  // Filtrar si hay búsqueda
  if (consulta) {
    elementosParaProcesar = elementos.value
      .map(categoria => {
        const filtrados = categoria.elementos.filter(elemento => elemento.etiqueta.toLowerCase().includes(consulta))
        return { ...categoria, elementos: filtrados }
      })
      .filter(categoria => (categoria.elementos?.length || 0) > 0)
  }

  // Convertir a formato de PanelMenu
  return elementosParaProcesar.map(categoria => ({
    key: categoria.clave,
    label: categoria.etiqueta,
    icon: categoria.icono,
    items: categoria.elementos.map(elemento => ({
      key: elemento.clave,
      label: elemento.etiqueta,
      icon: elemento.icono,
      tipo: elemento.tipo
    }))
  }))
})

function clonarDesdePaleta(elemento: { tipo: TipoCampo; icono: string; propiedadesPorDefecto?: Partial<EsquemaCampo>; etiqueta: string }): EsquemaCampo {
  const id = generarId('field')
  return {
    id,
    tipo: elemento.tipo,
    etiqueta: elemento.etiqueta,
    nombre: `${elemento.tipo}_${id.slice(-4)}`,
    grid: { sm: 12, md: 6, lg: 6 },
    visible: true,
    requerido: false,
    ...(elemento.propiedadesPorDefecto || {}),
    // Solo el tipo panel lleva hijos; para otros, forzamos hijos undefined
    ...(elemento.tipo === 'panel' ? {} : { hijos: undefined }),
  }
}

// Función para obtener el elemento de la paleta por tipo
function obtenerElementoPaletaPorTipo(tipo: TipoCampo): { tipo: TipoCampo; icono: string; propiedadesPorDefecto?: Partial<EsquemaCampo>; etiqueta: string } | undefined {
  return elementosPaleta.find(elemento => elemento.tipo === tipo)
}

// Función para clonar desde el menú
function clonarDesdeMenu(elementoMenu: ElementoMenuPaleta): EsquemaCampo | null {
  if (!elementoMenu.tipo) return null

  let elementoPaleta = obtenerElementoPaletaPorTipo(elementoMenu.tipo) ?? {
    tipo: elementoMenu.tipo,
    icono: elementoMenu.icon,
    etiqueta: elementoMenu.label,
  }
  // preset especial para Precio/Tasa
  if (elementoMenu.key === '3_1') {
    elementoPaleta = {
      tipo: 'tabla',
      icono: 'pi pi-percentage',
      etiqueta: 'Tabla Precio/Tasa',
      propiedadesPorDefecto: {
        metadatos: {
          filas: 1,
          columnas: 2
        },
      },
    }
  }
  return clonarDesdePaleta(elementoPaleta)
}

function alternarTodo(): void {
  if (Object.keys(clavesExpandidas.value).length) colapsar()
  else expandir()
}

function expandir(): void {
  for (const nodo of elementos.value) {
    expandirNodo(nodo)
  }
  clavesExpandidas.value = { ...clavesExpandidas.value }
}

function colapsar(): void {
  clavesExpandidas.value = {}
}

function expandirNodo(nodo: CategoriaBase): void {
  if (nodo.elementos && nodo.elementos.length && nodo.clave) {
    clavesExpandidas.value[nodo.clave] = true
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
        <Button size="small" text severity="secondary" icon="pi pi-plus" class="hover:surface-hover" @click="expandir" :disabled="Object.keys(clavesExpandidas).length === modeloPanelMenu.length" v-tooltip.top="'Expandir todo'" />
        <Button size="small" text severity="secondary" icon="pi pi-minus" class="hover:surface-hover" @click="colapsar" :disabled="!Object.keys(clavesExpandidas).length" v-tooltip.top="'Colapsar todo'" />
        <Button size="small" text severity="secondary" icon="pi pi-refresh" class="hover:surface-hover" @click="alternarTodo" v-tooltip.top="'Alternar expansión'" />
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
    <PrimePanelMenu v-model:expandedKeys="clavesExpandidas" :model="modeloPanelMenu" class="w-full text-sm custom-panel-menu">
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
          <Tag :value="item.items?.length || 0" severity="contrast" class="text-[10px] py-0 px-1" />
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

