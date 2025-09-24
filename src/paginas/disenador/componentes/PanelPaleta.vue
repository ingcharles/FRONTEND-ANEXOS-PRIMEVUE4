<script setup lang="ts">
import draggable from 'vuedraggable'
import { ref, computed } from 'vue'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { TipoCampo } from '@/tipos/Campos'
import { generarId } from '@/utilidades/GeneraId'
import { TipoCampoEtiqueta, TipoCampoValor } from '@/enumeraciones/Campos'

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
    // Configuración de grid según el tipo de campo
  const configuracionGrid = elemento.tipo === 'panel'
    ? { sm: 12, md: 12, lg: 12 }  // Panel ocupa ancho completo
    : { sm: 12, md: 6, lg: 6 }    // Otros campos mitad del ancho en md/lg

  return {
    id,
    tipo: elemento.tipo,
    etiqueta: elemento.label,
    nombre: `${elemento.tipo}_${id.slice(-4)}`,
    grid: configuracionGrid,
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
  <div class="p-card p-p-3">
    <!-- Header -->
    <div class="p-d-flex p-ai-center p-mb-2">
      <h3 class="p-m-0 p-text-primary p-d-flex p-ai-center">
        <i class="pi pi-box p-mr-2" /> Componentes
      </h3>

    </div>
    <!-- Buscador -->
    <div class="p-inputgroup mb-3 mt-3">
      <span class="p-inputgroup-addon">
        <i class="pi pi-search" />
      </span>
      <PrimeInputText
        id="buscador-paleta"
        v-model="filtro"
        type="text"
        autocomplete="off"
        placeholder="Filtrar (Ctrl+K)"
        class="p-inputtext"
      />
      <PrimeButton
        v-if="filtro"
        @click="limpiarFiltro"
        type="button"
        class="p-button p-button-text"
        aria-label="Limpiar filtro"
      >
        <i class="pi pi-times" />
      </PrimeButton>
      <div class="p-ml-auto p-d-flex p-ai-center">
        <PrimeButton size="small" text severity="secondary" icon="pi pi-plus" @click="expandir" :disabled="Object.keys(clavesExpandidas).length === modeloPanelMenuFiltrado.length" v-tooltip.top="'Expandir todo'" />
        <PrimeButton size="small" text severity="secondary" icon="pi pi-minus" @click="colapsar" :disabled="!Object.keys(clavesExpandidas).length" v-tooltip.top="'Colapsar todo'" />
        <PrimeButton size="small" text severity="secondary" icon="pi pi-refresh" @click="alternarTodo" v-tooltip.top="'Alternar expansión'" />
      </div>
    </div>
    <!-- Contenido -->
    <PrimePanelMenu v-model:expandedKeys="clavesExpandidas" :model="modeloPanelMenuFiltrado">
      <template #item="{ item }">
        <!-- Item de campo (draggable) -->
        <div v-if="item.tipo">
          <draggable
            :list="[item]"
            item-key="key"
            :group="{ name: 'paleta', pull: 'clone', put: false }"
            :clone="() => clonarDesdeMenu(item)"
            :sort="false"
          >
            <template #item="{ element }">
              <a v-ripple class="flex items-center pl-4 pr-2 py-2 cursor-pointer group w-full">
                <i class="pi pi-grip-vertical p-mr-2" />
                <i :class="['pi', element.icon, 'group-hover:text-inherit']" />
                <span class="ml-2">{{ element.label }}</span>
              </a>
            </template>
          </draggable>
        </div>
        <!-- Cabecera de categoría -->
        <div v-else class="flex items-center px-3 pt-3 pb-2 font-semibold tracking-wide">
          <i :class="['pi', item.icon]" />
          <span class="ml-2 flex-1">{{ item.label }}</span>
          <span v-if="item.items" class="pi pi-angle-down ml-auto" />
          <PrimeTag :value="item.items?.length || 0" severity="contrast" class="ml-2 py-1 px-2 text-xs" />
        </div>
      </template>
    </PrimePanelMenu>
  </div>
</template>
<style scoped>

</style>

