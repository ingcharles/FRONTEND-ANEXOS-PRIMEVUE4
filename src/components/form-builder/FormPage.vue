<template>
  <div 
    class="form-page-component"
    :class="{ 
      'selected': isSelected,
      'dragging': isDragging,
      'disabled': component.disabled 
    }"
    :style="componentStyles"
    @click="selectComponent"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    draggable="true"
  >
    <div class="page-header" :style="headerStyles">
      <div class="page-title">
        <h3>{{ component.title }}</h3>
        <p v-if="component.description" class="page-description">{{ component.description }}</p>
      </div>
      
      <div class="page-layout-indicator">
        <span class="layout-badge" :class="`layout-${component.layout}`">
          {{ getLayoutLabel(component.layout) }}
        </span>
      </div>
    </div>
    
    <div class="page-content" :style="contentStyles">
      <div v-if="component.layout === 'tabs'" class="tabs-layout">
        <div class="tabs-header">
          <button
            v-for="(child, index) in component.children"
            :key="child.id"
            class="tab-button"
            :class="{ active: activeTab === index }"
            @click="setActiveTab(index)"
          >
            {{ getChildTitle(child) }}
          </button>
        </div>
        
        <div class="tabs-content">
          <div
            v-for="(child, index) in component.children"
            :key="child.id"
            v-show="activeTab === index"
            class="tab-panel"
            @drop="handleDrop($event, child.id)"
            @dragover="handleDragOver"
            @dragenter="handleDragEnter"
            @dragleave="handleDragLeave"
          >
            <div v-if="!hasChildComponents(child)" class="empty-tab">
              <p>Arrastra componentes aquí</p>
            </div>
            
            <FormComponentRenderer
              v-for="grandChild in getChildComponents(child)"
              :key="grandChild.id"
              :component="grandChild"
              :is-selected="selectedChildId === grandChild.id"
              @select="selectChild"
              @update="updateChild"
              @delete="deleteChild"
              @drag-start="handleChildDragStart"
              @drag-end="handleChildDragEnd"
              @resize="handleChildResize"
              @add-child="addChildComponent"
            />
            
            <!-- Renderizar el panel directamente si es un panel sin hijos -->
            <FormComponentRenderer
              v-if="child.type === 'panel' && !hasChildComponents(child)"
              :key="child.id"
              :component="child"
              :is-selected="selectedChildId === child.id"
              @select="selectChild"
              @update="updateChild"
              @delete="deleteChild"
              @drag-start="handleChildDragStart"
              @drag-end="handleChildDragEnd"
              @resize="handleChildResize"
              @add-child="addChildComponent"
            />
          </div>
        </div>
      </div>
      
      <div v-else-if="component.layout === 'single'" class="single-layout">
        <div 
          class="single-content"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
        >
          <div v-if="!component.children || component.children.length === 0" class="empty-page">
            <p>Arrastra componentes aquí</p>
          </div>
          
          <FormComponentRenderer
            v-for="child in (component.children || [])"
            :key="child.id"
            :component="child"
            :is-selected="selectedChildId === child.id"
            @select="selectChild"
            @update="updateChild"
            @delete="deleteChild"
            @drag-start="handleChildDragStart"
            @drag-end="handleChildDragEnd"
            @resize="handleChildResize"
            @add-child="addChildComponent"
          />
        </div>
      </div>
      
      <div v-else-if="component.layout === 'accordion'" class="accordion-layout">
        <div
          v-for="(child, index) in component.children"
          :key="child.id"
          class="accordion-item"
        >
          <div class="accordion-header" @click="toggleAccordion(index)">
            <span class="accordion-title">{{ getChildTitle(child) }}</span>
            <span class="accordion-icon">{{ expandedTabs.includes(index) ? '▼' : '▶' }}</span>
          </div>
          
          <div v-if="expandedTabs.includes(index)" class="accordion-content">
            <div 
              class="accordion-panel"
              @drop="handleDrop($event, child.id)"
              @dragover="handleDragOver"
              @dragenter="handleDragEnter"
              @dragleave="handleDragLeave"
            >
              <div v-if="!hasChildComponents(child)" class="empty-accordion">
                <p>Arrastra componentes aquí</p>
              </div>
              
              <FormComponentRenderer
                v-for="grandChild in getChildComponents(child)"
                :key="grandChild.id"
                :component="grandChild"
                :is-selected="selectedChildId === grandChild.id"
                @select="selectChild"
                @update="updateChild"
                @delete="deleteChild"
                @drag-start="handleChildDragStart"
                @drag-end="handleChildDragEnd"
                @resize="handleChildResize"
                @add-child="addChildComponent"
              />
              
              <!-- Renderizar el panel directamente si es un panel sin hijos -->
              <FormComponentRenderer
                v-if="child.type === 'panel' && !hasChildComponents(child)"
                :key="child.id"
                :component="child"
                :is-selected="selectedChildId === child.id"
                @select="selectChild"
                @update="updateChild"
                @delete="deleteChild"
                @drag-start="handleChildDragStart"
                @drag-end="handleChildDragEnd"
                @resize="handleChildResize"
                @add-child="addChildComponent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="component.showNavigation" class="page-navigation">
      <button class="nav-button prev-button" :disabled="!canGoPrevious">
        {{ component.previousButtonText || 'Anterior' }}
      </button>
      <button class="nav-button next-button" :disabled="!canGoNext">
        {{ component.nextButtonText || 'Siguiente' }}
      </button>
    </div>
    
    <!-- Delete button -->
    <button 
      v-if="isSelected"
      class="delete-button"
      @click.stop="deleteComponent"
      title="Eliminar componente"
    >
      <Trash2 class="delete-icon" />
    </button>
    
    <!-- Resize handles -->
    <div 
      v-if="isSelected"
      class="resize-handles"
    >
      <div 
        v-for="handle in resizeHandles" 
        :key="handle.position"
        :class="`resize-handle resize-${handle.position}`"
        :style="{ cursor: handle.cursor }"
        @mousedown="startResize($event, handle.position)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { PageComponent, FormComponent } from '@/types/form-builder';
import FormComponentRenderer from './FormComponentRenderer.vue';
import { Trash2 } from 'lucide-vue-next';

interface Props {
  component: PageComponent;
  isSelected?: boolean;
  isDragging?: boolean;
}

interface Emits {
  (e: 'select', component: PageComponent): void;
  (e: 'update', component: PageComponent): void;
  (e: 'delete', component: PageComponent): void;
  (e: 'drag-start', event: DragEvent): void;
  (e: 'drag-end', event: DragEvent): void;
  (e: 'resize', component: PageComponent, size: { width: number; height: number }): void;
  (e: 'add-child', parentId: string, child: FormComponent): void;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isDragging: false
});

const emit = defineEmits<Emits>();

const selectedChildId = ref<string | null>(null);
const activeTab = ref(0);
const expandedTabs = ref<number[]>([0]);
const isDragOver = ref(false);

const resizeHandles = [
  { position: 'n', cursor: 'n-resize' },
  { position: 's', cursor: 's-resize' },
  { position: 'e', cursor: 'e-resize' },
  { position: 'w', cursor: 'w-resize' },
  { position: 'ne', cursor: 'ne-resize' },
  { position: 'nw', cursor: 'nw-resize' },
  { position: 'se', cursor: 'se-resize' },
  { position: 'sw', cursor: 'sw-resize' }
];

const componentStyles = computed(() => ({
  width: props.component.width || '100%',
  minWidth: props.component.minWidth || '400px',
  maxWidth: props.component.maxWidth || 'none',
  margin: props.component.margin || '8px 0',
  padding: props.component.padding || '0',
  backgroundColor: props.component.backgroundColor || '#fff',
  border: props.component.borderWidth ? 
    `${props.component.borderWidth} solid ${props.component.borderColor || '#dee2e6'}` : 
    '1px solid #dee2e6',
  borderRadius: props.component.borderRadius || '8px',
  position: 'relative' as const,
  cursor: props.isSelected ? 'move' : 'pointer',
  minHeight: '200px'
}));

const headerStyles = computed(() => ({
  padding: '16px 20px',
  backgroundColor: '#f8f9fa',
  borderBottom: '1px solid #dee2e6',
  borderRadius: '8px 8px 0 0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const contentStyles = computed(() => ({
  padding: '20px',
  minHeight: '150px'
}));

const canGoPrevious = computed(() => {
  if (props.component.layout === 'tabs') {
    return activeTab.value > 0;
  }
  return false;
});

const canGoNext = computed(() => {
  if (props.component.layout === 'tabs') {
    return activeTab.value < props.component.children.length - 1;
  }
  return false;
});

function selectComponent(event: Event) {
  // Solo bloquear propagación si se hace clic en la página misma, no en sus hijos
  const target = event.target as HTMLElement;
  const isClickOnChild = target.closest('.form-text-component, .form-label-component, .form-combobox-component, .form-table-component, .form-button-component, .form-panel-component');
  
  if (!isClickOnChild) {
    event.stopPropagation();
  }
  
  emit('select', props.component);
  selectedChildId.value = null;
}

function selectChild(child: FormComponent) {
  selectedChildId.value = child.id;
  emit('select', child);
}

function updateChild(child: FormComponent) {
  const currentChildren = props.component.children || [];
  const updatedChildren = currentChildren.map(c => 
    c.id === child.id ? child : c
  );
  
  const updatedComponent = {
    ...props.component,
    children: updatedChildren
  };
  emit('update', updatedComponent);
}

function deleteChild(child: FormComponent) {
  const currentChildren = props.component.children || [];
  const updatedChildren = currentChildren.filter(c => c.id !== child.id);
  
  const updatedComponent = {
    ...props.component,
    children: updatedChildren
  };
  emit('update', updatedComponent);
}

function addChildComponent(parentId: string, child: FormComponent) {
  const currentChildren = props.component.children || [];
  const updatedComponent = {
    ...props.component,
    children: [...currentChildren, child]
  };
  emit('update', updatedComponent);
}

function getLayoutLabel(layout: string): string {
  const labels: Record<string, string> = {
    tabs: 'Pestañas',
    single: 'Página Única',
    accordion: 'Acordeón'
  };
  return labels[layout] || layout;
}

function getChildTitle(child: FormComponent): string {
  if (child.type === 'panel' && 'title' in child) {
    return child.title || `Panel ${child.id}`;
  }
  return child.label || child.name || `Componente ${child.id}`;
}

function hasChildComponents(child: FormComponent): boolean {
  if (child.type === 'panel' && 'children' in child) {
    return child.children && child.children.length > 0;
  }
  return false;
}

function getChildComponents(child: FormComponent): FormComponent[] {
  if (child.type === 'panel' && 'children' in child) {
    return child.children || [];
  }
  return [];
}

function setActiveTab(index: number) {
  activeTab.value = index;
}

function toggleAccordion(index: number) {
  const currentIndex = expandedTabs.value.indexOf(index);
  if (currentIndex > -1) {
    expandedTabs.value.splice(currentIndex, 1);
  } else {
    expandedTabs.value.push(index);
  }
}

function handleDrop(event: DragEvent, targetId?: string) {
  event.preventDefault();
  event.stopPropagation(); // Evitar que se propague al diseñador principal
  isDragOver.value = false;
  
  try {
    const dragData = JSON.parse(event.dataTransfer?.getData('application/json') || '{}');
    
    if (dragData.source === 'palette' && dragData.componentType) {
      // Solo crear componente si se está soltando específicamente en el contenido de la página
      const dropTarget = event.target as HTMLElement;
      const isDroppingInPageContent = dropTarget.closest('.page-content') || 
                                     dropTarget.closest('.single-content') ||
                                     dropTarget.closest('.tab-panel') ||
                                     dropTarget.closest('.accordion-panel');
      
      if (isDroppingInPageContent) {
        const newChild: FormComponent = {
          id: `component_${Date.now()}`,
          type: dragData.componentType,
          name: `${dragData.componentType}_${Date.now()}`,
          label: `Nuevo ${dragData.componentType}`,
          parentId: targetId || props.component.id,
          ...getDefaultComponentProps(dragData.componentType)
        } as FormComponent;
        
        if (targetId) {
        // Add to specific panel
        const currentChildren = props.component.children || [];
        const updatedChildren = currentChildren.map(child => {
          if (child.id === targetId && child.type === 'panel' && 'children' in child) {
            return {
              ...child,
              children: [...(child.children || []), newChild]
            };
          }
          return child;
        });
        
        const updatedComponent = {
          ...props.component,
          children: updatedChildren
        };
        emit('update', updatedComponent);
      } else {
        // Add to page directly
        const currentChildren = props.component.children || [];
        const updatedComponent = {
          ...props.component,
          children: [...currentChildren, newChild]
        };
        emit('update', updatedComponent);
        }
      }
    }
  } catch (error) {
    console.error('Error al procesar drop:', error);
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = true;
}

function handleDragEnter(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = true;
}

function handleDragLeave(event: DragEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragOver.value = false;
  }
}

function handleChildDragStart(event: DragEvent) {
  // Propagate child drag events
}

function handleChildDragEnd(event: DragEvent) {
  // Propagate child drag events
}

function handleChildResize(component: FormComponent, size: { width: number; height: number }) {
  updateChild({ ...component, size });
}

function deleteComponent() {
  if (confirm('¿Estás seguro de que quieres eliminar este componente?')) {
    emit('delete', props.component);
  }
}

function handleDragStart(event: DragEvent) {
  emit('drag-start', event);
}

function handleDragEnd(event: DragEvent) {
  emit('drag-end', event);
}

function getDefaultComponentProps(type: string) {
  const defaults: Record<string, any> = {
    text: {
      placeholder: 'Ingrese texto...',
      maxLength: 255
    },
    combobox: {
      options: [
        { label: 'Opción 1', value: 'option1' },
        { label: 'Opción 2', value: 'option2' }
      ],
      multiple: false,
      searchable: false
    },
    label: {
      text: 'Nueva etiqueta'
    },
    table: {
      columns: [
        { id: 'col1', label: 'Columna 1', type: 'text', required: false },
        { id: 'col2', label: 'Columna 2', type: 'text', required: false }
      ],
      rows: [],
      allowAddRows: true,
      allowDeleteRows: true,
      allowEditRows: true
    },
    panel: {
      title: 'Nuevo Panel',
      collapsible: true,
      collapsed: false,
      children: []
    },
    button: {
      label: 'Nuevo Botón',
      buttonType: 'button',
      variant: 'primary',
      size: 'md'
    }
  };
  
  return defaults[type] || {};
}

function startResize(event: MouseEvent, position: string) {
  event.preventDefault();
  event.stopPropagation();
  
  const startX = event.clientX;
  const startY = event.clientY;
  const startWidth = props.component.size?.width || 400;
  const startHeight = props.component.size?.height || 300;
  
  function handleMouseMove(e: MouseEvent) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    let newWidth = startWidth;
    let newHeight = startHeight;
    
    switch (position) {
      case 'e':
        newWidth = Math.max(300, startWidth + deltaX);
        break;
      case 'w':
        newWidth = Math.max(300, startWidth - deltaX);
        break;
      case 's':
        newHeight = Math.max(200, startHeight + deltaY);
        break;
      case 'n':
        newHeight = Math.max(200, startHeight - deltaY);
        break;
      case 'se':
        newWidth = Math.max(300, startWidth + deltaX);
        newHeight = Math.max(200, startHeight + deltaY);
        break;
      case 'sw':
        newWidth = Math.max(300, startWidth - deltaX);
        newHeight = Math.max(200, startHeight + deltaY);
        break;
      case 'ne':
        newWidth = Math.max(300, startWidth + deltaX);
        newHeight = Math.max(200, startHeight - deltaY);
        break;
      case 'nw':
        newWidth = Math.max(300, startWidth - deltaX);
        newHeight = Math.max(200, startHeight - deltaY);
        break;
    }
    
    const updatedComponent = {
      ...props.component,
      size: { width: newWidth, height: newHeight },
      width: `${newWidth}px`
    };
    emit('update', updatedComponent);
  }
  
  function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}
</script>

<style scoped>
.form-page-component {
  transition: all 0.2s ease;
}

.form-page-component.selected {
  border: 2px solid #007bff !important;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-page-component.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.form-page-component.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.page-header {
  user-select: none;
}

.page-title h3 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: #495057;
}

.page-description {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
}

.layout-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.layout-tabs {
  background-color: #e3f2fd;
  color: #1976d2;
}

.layout-single {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.layout-accordion {
  background-color: #fff3e0;
  color: #f57c00;
}

/* Tabs Layout */
.tabs-header {
  display: flex;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 16px;
}

.tab-button {
  padding: 8px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  color: #6c757d;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #495057;
  background-color: #f8f9fa;
}

.tab-button.active {
  color: #007bff;
  border-bottom-color: #007bff;
  background-color: #f8f9fa;
}

.tab-panel {
  min-height: 100px;
  padding: 16px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.empty-tab {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  border: 2px dashed #ccc;
  border-radius: 8px;
}

/* Single Layout */
.single-content {
  min-height: 100px;
  padding: 16px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.empty-page {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  border: 2px dashed #ccc;
  border-radius: 8px;
}

/* Accordion Layout */
.accordion-item {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-bottom: 8px;
  overflow: hidden;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: background-color 0.2s;
}

.accordion-header:hover {
  background-color: #e9ecef;
}

.accordion-title {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.accordion-icon {
  font-size: 12px;
  color: #6c757d;
}

.accordion-content {
  background-color: #fff;
}

.accordion-panel {
  padding: 16px;
  min-height: 80px;
}

.empty-accordion {
  text-align: center;
  padding: 20px;
  color: #6c757d;
  border: 2px dashed #ccc;
  border-radius: 4px;
}

/* Navigation */
.page-navigation {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  border-radius: 0 0 8px 8px;
}

.nav-button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #fff;
  color: #495057;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.nav-button:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.nav-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.next-button {
  background-color: #007bff;
  border-color: #007bff;
  color: #fff;
}

.next-button:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
}

.delete-button {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background-color 0.2s;
}

.delete-button:hover {
  background-color: #c82333;
}

.delete-icon {
  width: 12px;
  height: 12px;
}

.resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  background: #007bff;
  pointer-events: all;
}

.resize-n, .resize-s {
  width: 100%;
  height: 4px;
  left: 0;
}

.resize-e, .resize-w {
  width: 4px;
  height: 100%;
  top: 0;
}

.resize-n { top: -2px; }
.resize-s { bottom: -2px; }
.resize-e { right: -2px; }
.resize-w { left: -2px; }

.resize-ne, .resize-nw, .resize-se, .resize-sw {
  width: 8px;
  height: 8px;
  background: #007bff;
  border: 1px solid #fff;
}

.resize-ne { top: -4px; right: -4px; }
.resize-nw { top: -4px; left: -4px; }
.resize-se { bottom: -4px; right: -4px; }
.resize-sw { bottom: -4px; left: -4px; }
</style>
