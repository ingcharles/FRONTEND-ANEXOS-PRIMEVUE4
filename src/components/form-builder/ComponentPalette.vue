<template>
  <div class="component-palette">
    <div class="palette-header">
      <h3>Componentes</h3>
    </div>
    
    <div class="palette-content">
      <div 
        v-for="category in componentCategories" 
        :key="category.name"
        class="palette-category"
      >
        <div class="category-header" @click="toggleCategory(category.name)">
          <span class="category-title">{{ category.label }}</span>
          <span class="category-icon">{{ category.expanded ? '▼' : '▶' }}</span>
        </div>
        
        <div v-if="category.expanded" class="category-items">
          <div
            v-for="item in category.items"
            :key="item.type"
            class="palette-item"
            :class="{ 'dragging': draggingItem === item.type }"
            draggable="true"
            @dragstart="handleDragStart($event, item)"
            @dragend="handleDragEnd"
          >
            <div class="item-icon">
              <component :is="getIconComponent(item.icon)" />
            </div>
            <div class="item-info">
              <div class="item-label">{{ item.label }}</div>
              <div class="item-description">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ComponentPaletteItem, ComponentType } from '@/types/form-builder';
import { 
  Type, 
  ChevronDown, 
  Square, 
  Table, 
  Tag, 
  MousePointer,
  CheckSquare,
  Circle,
  FileText,
  Hash,
  Calendar,
  Mail,
  Lock,
  FileText as PageIcon
} from 'lucide-vue-next';

interface Props {
  // No props needed for now
}

interface Emits {
  (e: 'drag-start', event: DragEvent, item: ComponentPaletteItem): void;
  (e: 'drag-end', event: DragEvent): void;
}

const emit = defineEmits<Emits>();

const draggingItem = ref<ComponentType | null>(null);

const componentItems: ComponentPaletteItem[] = [
  // Input components
  { type: 'text', label: 'Texto', icon: 'Type', description: 'Campo de texto simple', category: 'input' },
  { type: 'textarea', label: 'Área de texto', icon: 'FileText', description: 'Campo de texto multilínea', category: 'input' },
  { type: 'number', label: 'Número', icon: 'Hash', description: 'Campo numérico', category: 'input' },
  { type: 'email', label: 'Email', icon: 'Mail', description: 'Campo de correo electrónico', category: 'input' },
  { type: 'password', label: 'Contraseña', icon: 'Lock', description: 'Campo de contraseña', category: 'input' },
  { type: 'date', label: 'Fecha', icon: 'Calendar', description: 'Selector de fecha', category: 'input' },
  { type: 'combobox', label: 'Lista desplegable', icon: 'ChevronDown', description: 'Lista de opciones', category: 'input' },
  { type: 'checkbox', label: 'Casilla de verificación', icon: 'CheckSquare', description: 'Opción múltiple', category: 'input' },
  { type: 'radio', label: 'Botón de radio', icon: 'Circle', description: 'Selección única', category: 'input' },
  
  // Layout components
  { type: 'panel', label: 'Panel', icon: 'Square', description: 'Contenedor agrupado', category: 'layout' },
  { type: 'page', label: 'Página', icon: 'PageIcon', description: 'Página con pestañas o acordeón', category: 'layout' },
  
  // Display components
  { type: 'label', label: 'Etiqueta', icon: 'Tag', description: 'Texto de etiqueta', category: 'display' },
  { type: 'table', label: 'Tabla', icon: 'Table', description: 'Tabla de datos', category: 'display' },
  
  // Action components
  { type: 'button', label: 'Botón', icon: 'MousePointer', description: 'Botón de acción', category: 'action' }
];

const componentCategories = computed(() => {
  const categories = [
    { name: 'input', label: 'Entrada', expanded: true },
    { name: 'layout', label: 'Diseño', expanded: true },
    { name: 'display', label: 'Visualización', expanded: true },
    { name: 'action', label: 'Acción', expanded: true }
  ];
  
  return categories.map(category => ({
    ...category,
    items: componentItems.filter(item => item.category === category.name)
  }));
});

const iconComponents = {
  Type,
  ChevronDown,
  Square,
  Table,
  Tag,
  MousePointer,
  CheckSquare,
  Circle,
  FileText,
  Hash,
  Calendar,
  Mail,
  Lock,
  PageIcon
};

function getIconComponent(iconName: string) {
  return iconComponents[iconName as keyof typeof iconComponents] || Type;
}

function toggleCategory(categoryName: string) {
  const category = componentCategories.value.find(c => c.name === categoryName);
  if (category) {
    category.expanded = !category.expanded;
  }
}

function handleDragStart(event: DragEvent, item: ComponentPaletteItem) {
  draggingItem.value = item.type;
  
  const dragData = {
    componentType: item.type,
    source: 'palette'
  };
  
  event.dataTransfer?.setData('application/json', JSON.stringify(dragData));
  event.dataTransfer!.effectAllowed = 'copy';
  
  emit('drag-start', event, item);
}

function handleDragEnd(event: DragEvent) {
  draggingItem.value = null;
  emit('drag-end', event);
}
</script>

<style scoped>
.component-palette {
  width: 280px;
  height: 100vh;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.palette-header {
  padding: 16px;
  background-color: #e9ecef;
  border-bottom: 1px solid #dee2e6;
}

.palette-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #495057;
}

.palette-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.palette-category {
  margin-bottom: 8px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #e9ecef;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.category-header:hover {
  background-color: #dee2e6;
}

.category-title {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.category-icon {
  font-size: 12px;
  color: #6c757d;
}

.category-items {
  margin-top: 4px;
}

.palette-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin: 2px 0;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.palette-item:hover {
  background-color: #f8f9fa;
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
}

.palette-item.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
  cursor: grabbing;
}

.item-icon {
  margin-right: 12px;
  color: #007bff;
  flex-shrink: 0;
}

.item-icon svg {
  width: 16px;
  height: 16px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-label {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 2px;
}

.item-description {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.3;
}

/* Scrollbar styling */
.palette-content::-webkit-scrollbar {
  width: 6px;
}

.palette-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.palette-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.palette-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
