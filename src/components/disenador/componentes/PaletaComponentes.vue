<template>
  <div class="paleta-componentes h-full flex flex-col">
    <!-- Encabezado -->
    <div class="p-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-800">
        <i class="pi pi-palette mr-2"></i>
        Componentes
      </h3>
    </div>

    <!-- Búsqueda -->
    <div class="p-3 border-b border-gray-200">
      <div class="p-input-icon-left w-full">
        <i class="pi pi-search"></i>
        <InputText 
          v-model="filtroTexto"
          placeholder="Buscar componentes..."
          class="w-full pl-8"
          @input="filtrarComponentes"
        />
      </div>
    </div>

    <!-- Categorías y componentes -->
    <div class="flex-1 overflow-y-auto">
      <Accordion 
        v-model:activeIndex="categoriasActivas"
        multiple
        class="w-full"
      >
        <AccordionTab 
          v-for="categoria in categoriasFiltradas" 
          :key="categoria.nombre"
          :header="categoria.titulo"
        >
          <template #headericon>
            <i :class="categoria.icono" class="mr-2"></i>
          </template>
          
          <div class="grid grid-cols-1 gap-2">
            <div
              v-for="item in categoria.items"
              :key="item.type"
              class="componente-item p-3 border border-gray-200 rounded-lg cursor-grab hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
              :draggable="true"
              @dragstart="iniciarArrastre($event, item)"
              @dragend="finalizarArrastre"
              @click="agregarComponente(item)"
            >
              <div class="flex items-center space-x-2">
                <i :class="item.icon" class="text-lg text-gray-600"></i>
                <span class="text-sm font-medium text-gray-800">
                  {{ item.label }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{ obtenerDescripcionComponente(item.type) }}
              </p>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </div>

    <!-- Información adicional -->
    <div class="p-3 border-t border-gray-200 bg-gray-50">
      <div class="text-xs text-gray-600">
        <p><strong>Tip:</strong> Arrastra los componentes al lienzo o haz clic para agregarlos.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useDisenadorStore } from '@/stores/disenador'
import type { PaletteItem, FieldType } from '@/types/disenador'
import InputText from 'primevue/inputtext'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'

// Store
const store = inject('disenadorStore') as ReturnType<typeof useDisenadorStore> || useDisenadorStore()

// Estado local
const filtroTexto = ref('')
const categoriasActivas = ref([0, 1, 2, 3]) // Todas las categorías abiertas por defecto

// Definición de categorías
const categorias = computed(() => [
  {
    nombre: 'input',
    titulo: 'Campos de Entrada',
    icono: 'pi pi-pencil',
    items: store.paletteItems.filter(item => item.category === 'input')
  },
  {
    nombre: 'display',
    titulo: 'Elementos de Visualización',
    icono: 'pi pi-eye',
    items: store.paletteItems.filter(item => item.category === 'display')
  },
  {
    nombre: 'layout',
    titulo: 'Elementos de Diseño',
    icono: 'pi pi-th-large',
    items: store.paletteItems.filter(item => item.category === 'layout')
  },
  {
    nombre: 'action',
    titulo: 'Elementos de Acción',
    icono: 'pi pi-bolt',
    items: store.paletteItems.filter(item => item.category === 'action')
  }
])

// Computed para filtrar categorías según búsqueda
const categoriasFiltradas = computed(() => {
  if (!filtroTexto.value) {
    return categorias.value
  }

  const filtro = filtroTexto.value.toLowerCase()
  return categorias.value.map(categoria => ({
    ...categoria,
    items: categoria.items.filter((item: PaletteItem) => 
      item.label.toLowerCase().includes(filtro) ||
      item.type.toLowerCase().includes(filtro)
    )
  })).filter(categoria => categoria.items.length > 0)
})

// Funciones
function filtrarComponentes(): void {
  // La reactividad se encarga automáticamente del filtrado
}

function obtenerDescripcionComponente(tipo: FieldType): string {
  const descripciones: Record<FieldType, string> = {
    TextField: 'Campo de texto simple para entrada de datos',
    TextArea: 'Área de texto multilínea para textos largos',
    ComboBox: 'Lista desplegable con opciones seleccionables',
    RadioGroup: 'Grupo de botones de radio para selección única',
    Label: 'Etiqueta de texto estático para mostrar información',
    Panel: 'Contenedor para agrupar otros elementos',
    Table: 'Tabla para mostrar y editar datos tabulares',
    Button: 'Botón para ejecutar acciones',
    Divider: 'Separador visual entre secciones'
  }
  
  return descripciones[tipo] || 'Componente del formulario'
}

function iniciarArrastre(event: DragEvent, item: PaletteItem): void {
  if (!event.dataTransfer) return
  
  // Configurar datos del drag
  event.dataTransfer.setData('application/json', JSON.stringify(item))
  event.dataTransfer.effectAllowed = 'copy'
  
  // Agregar clase visual
  const elemento = event.target as HTMLElement
  elemento.classList.add('arrastrando')
  
  // Notificar al store
  store.iniciarArrastre(item, true)
}

function finalizarArrastre(event: DragEvent): void {
  // Quitar clase visual
  const elemento = event.target as HTMLElement
  elemento.classList.remove('arrastrando')
  
  // Si el arrastre no se completó en el lienzo, cancelar
  if (!store.dragContext.isDragging) {
    store.cancelarArrastre()
  }
}

function agregarComponente(item: PaletteItem): void {
  // Agregar componente en el centro del lienzo
  const elemento = store.crearElementoDesdeItem(item, { x: 100, y: 100 })
  store.agregarElemento(elemento)
  
  // Seleccionar el nuevo elemento
  store.seleccionarElemento(elemento.id)
}
</script>

<style scoped>
.paleta-componentes {
  user-select: none;
}

.componente-item {
  transition: all 0.2s ease;
}

.componente-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.componente-item:active {
  transform: translateY(0);
}

.componente-item.arrastrando {
  opacity: 0.5;
  transform: rotate(5deg);
}

/* Estilos para el accordion */
:deep(.p-accordion .p-accordion-header-link) {
  padding: 0.75rem 1rem;
  font-weight: 600;
}

:deep(.p-accordion .p-accordion-content) {
  padding: 1rem;
}

/* Efecto visual para drag and drop */
.componente-item[draggable="true"] {
  cursor: grab;
}

.componente-item[draggable="true"]:active {
  cursor: grabbing;
}

/* Indicador visual para elementos focuseables */
.componente-item:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Animaciones suaves */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.componente-item {
  animation: fadeIn 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .componente-item {
    padding: 0.75rem;
  }
  
  .componente-item .flex {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .componente-item i {
    margin-bottom: 0.25rem;
  }
}
</style>