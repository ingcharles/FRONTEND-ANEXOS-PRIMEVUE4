<template>
  <div 
    class="form-panel-component"
    :class="{ 
      'selected': isSelected,
      'dragging': isDragging,
      'collapsed': component.collapsed 
    }"
    :style="componentStyles"
    @click="selectComponent"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    draggable="true"
  >
    <div class="panel-header" :style="headerStyles">
      <div class="panel-title" v-if="component.title">
        {{ component.title }}
      </div>
      
      <button 
        v-if="component.collapsible"
        class="collapse-button"
        @click.stop="toggleCollapse"
        :style="buttonStyles"
      >
        {{ component.collapsed ? '▼' : '▲' }}
      </button>
    </div>
    
      <div 
        v-if="!component.collapsed" 
        class="panel-content"
        :style="contentStyles"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
      >
        <div 
          v-if="!component.children || component.children.length === 0"
          class="empty-panel"
          :class="{ 'drag-over': isDragOver }"
        >
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
        />
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
import type { PanelComponent, FormComponent } from '@/types/form-builder';
import FormComponentRenderer from './FormComponentRenderer.vue';
import { Trash2 } from 'lucide-vue-next';

interface Props {
  component: PanelComponent;
  isSelected?: boolean;
  isDragging?: boolean;
}

interface Emits {
  (e: 'select', component: PanelComponent): void;
  (e: 'update', component: PanelComponent): void;
  (e: 'delete', component: PanelComponent): void;
  (e: 'drag-start', event: DragEvent): void;
  (e: 'drag-end', event: DragEvent): void;
  (e: 'resize', component: PanelComponent, size: { width: number; height: number }): void;
  (e: 'add-child', parentId: string, child: FormComponent): void;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isDragging: false
});

const emit = defineEmits<Emits>();

const selectedChildId = ref<string | null>(null);
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
  minWidth: props.component.minWidth || '300px',
  maxWidth: props.component.maxWidth || 'none',
  margin: props.component.margin || '8px 0',
  padding: props.component.padding || '0',
  backgroundColor: props.component.backgroundColor || '#f8f9fa',
  border: props.component.borderWidth ? 
    `${props.component.borderWidth} solid ${props.component.borderColor || '#dee2e6'}` : 
    '1px solid #dee2e6',
  borderRadius: props.component.borderRadius || '8px',
  position: 'relative' as const,
  cursor: props.isSelected ? 'move' : 'pointer',
  minHeight: props.component.collapsed ? 'auto' : '100px'
}));

const headerStyles = computed(() => ({
  padding: '12px 16px',
  backgroundColor: '#e9ecef',
  borderBottom: '1px solid #dee2e6',
  borderRadius: props.component.collapsed ? '8px' : '8px 8px 0 0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: props.component.fontSize || '16px',
  fontWeight: props.component.fontWeight || '600',
  color: props.component.color || '#495057'
}));

const contentStyles = computed(() => ({
  padding: '16px',
  minHeight: '100px'
}));

const buttonStyles = computed(() => ({
  background: 'none',
  border: 'none',
  fontSize: '14px',
  cursor: 'pointer',
  color: props.component.color || '#495057'
}));

function selectComponent(event: Event) {
  // Solo bloquear propagación si se hace clic en el panel mismo, no en sus hijos
  const target = event.target as HTMLElement;
  const isClickOnChild = target.closest('.form-text-component, .form-label-component, .form-combobox-component, .form-table-component, .form-button-component');
  
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

function toggleCollapse() {
  const updatedComponent = {
    ...props.component,
    collapsed: !props.component.collapsed
  };
  emit('update', updatedComponent);
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

function handleDragStart(event: DragEvent) {
  emit('drag-start', event);
}

function handleDragEnd(event: DragEvent) {
  emit('drag-end', event);
}

function deleteComponent() {
  if (confirm('¿Estás seguro de que quieres eliminar este componente?')) {
    emit('delete', props.component);
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

function handleDrop(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation(); // Evitar que se propague al diseñador principal
  isDragOver.value = false;
  
  try {
    const dragData = JSON.parse(event.dataTransfer?.getData('application/json') || '{}');
    
    if (dragData.source === 'palette' && dragData.componentType) {
      // Solo crear componente si se está soltando específicamente en el contenido del panel
      const dropTarget = event.target as HTMLElement;
      const isDroppingInPanelContent = dropTarget.closest('.panel-content');
      
      if (isDroppingInPanelContent) {
        const newChild: FormComponent = {
          id: `component_${Date.now()}`,
          type: dragData.componentType,
          name: `${dragData.componentType}_${Date.now()}`,
          label: `Nuevo ${dragData.componentType}`,
          parentId: props.component.id,
          ...getDefaultComponentProps(dragData.componentType)
        } as FormComponent;
        
        const currentChildren = props.component.children || [];
        const updatedComponent = {
          ...props.component,
          children: [...currentChildren, newChild]
        };
        emit('update', updatedComponent);
      }
    } else if (dragData.source === 'designer' && dragData.componentId) {
      // Mover componente existente al panel
      emit('move-to-panel', dragData.componentId, props.component.id);
    }
  } catch (error) {
    console.error('Error al procesar drop:', error);
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
    button: {
      label: 'Nuevo Botón',
      buttonType: 'button',
      variant: 'primary',
      size: 'md'
    },
    page: {
      title: 'Nueva Página',
      description: 'Descripción de la página',
      layout: 'single',
      showNavigation: false,
      nextButtonText: 'Siguiente',
      previousButtonText: 'Anterior',
      children: []
    }
  };
  
  return defaults[type] || {};
}

function startResize(event: MouseEvent, position: string) {
  event.preventDefault();
  event.stopPropagation();
  
  const startX = event.clientX;
  const startY = event.clientY;
  const startWidth = props.component.size?.width || 300;
  const startHeight = props.component.size?.height || 200;
  
  function handleMouseMove(e: MouseEvent) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    let newWidth = startWidth;
    let newHeight = startHeight;
    
    switch (position) {
      case 'e':
        newWidth = startWidth + deltaX;
        break;
      case 'w':
        newWidth = startWidth - deltaX;
        break;
      case 's':
        newHeight = startHeight + deltaY;
        break;
      case 'n':
        newHeight = startHeight - deltaY;
        break;
      case 'se':
        newWidth = startWidth + deltaX;
        newHeight = startHeight + deltaY;
        break;
      case 'sw':
        newWidth = startWidth - deltaX;
        newHeight = startHeight + deltaY;
        break;
      case 'ne':
        newWidth = startWidth + deltaX;
        newHeight = startHeight - deltaY;
        break;
      case 'nw':
        newWidth = startWidth - deltaX;
        newHeight = startHeight - deltaY;
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
.form-panel-component {
  transition: all 0.2s ease;
}

.form-panel-component.selected {
  border: 2px solid #007bff !important;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-panel-component.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.form-panel-component.collapsed .panel-content {
  display: none;
}

.panel-header {
  user-select: none;
}

.collapse-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.empty-panel {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  color: #6c757d;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}

.empty-panel.drag-over {
  border-color: #007bff;
  background-color: rgba(0, 123, 255, 0.1);
  color: #007bff;
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
</style>
