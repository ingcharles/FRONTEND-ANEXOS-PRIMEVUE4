<template>
  <div 
    class="form-button-component"
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
    <button
      :id="component.id"
      :name="component.name"
      :type="component.buttonType"
      :disabled="component.disabled"
      :class="buttonClasses"
      :style="buttonStyles"
      @click="handleClick"
    >
      <component 
        v-if="component.icon" 
        :is="getIconComponent(component.icon)" 
        class="button-icon"
      />
      <span v-if="component.label">{{ component.label }}</span>
      <span v-else>Botón</span>
    </button>
    
    <!-- Delete button -->
    <button 
      v-if="isSelected"
      class="delete-button"
      @click="deleteComponent"
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
import { computed } from 'vue';
import type { ButtonComponent } from '@/types/form-builder';
import { Trash2, MousePointer, Save, Upload, Download, Plus, Minus, Edit, Delete } from 'lucide-vue-next';

interface Props {
  component: ButtonComponent;
  isSelected?: boolean;
  isDragging?: boolean;
}

interface Emits {
  (e: 'select', component: ButtonComponent): void;
  (e: 'update', component: ButtonComponent): void;
  (e: 'delete', component: ButtonComponent): void;
  (e: 'drag-start', event: DragEvent): void;
  (e: 'drag-end', event: DragEvent): void;
  (e: 'resize', component: ButtonComponent, size: { width: number; height: number }): void;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isDragging: false
});

const emit = defineEmits<Emits>();

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

const iconComponents = {
  MousePointer,
  Save,
  Upload,
  Download,
  Plus,
  Minus,
  Edit,
  Delete
};

const componentStyles = computed(() => ({
  width: props.component.width || 'auto',
  minWidth: props.component.minWidth || 'auto',
  maxWidth: props.component.maxWidth || 'none',
  margin: props.component.margin || '8px 0',
  padding: props.component.padding || '0',
  backgroundColor: props.component.backgroundColor || 'transparent',
  border: props.component.borderWidth ? 
    `${props.component.borderWidth} solid ${props.component.borderColor || '#ccc'}` : 
    '1px solid transparent',
  borderRadius: props.component.borderRadius || '4px',
  position: 'relative' as const,
  cursor: props.isSelected ? 'move' : 'pointer',
  display: 'inline-block'
}));

const buttonClasses = computed(() => {
  const classes = ['form-button'];
  
  // Variant classes
  classes.push(`btn-${props.component.variant}`);
  
  // Size classes
  classes.push(`btn-${props.component.size}`);
  
  // State classes
  if (props.component.disabled) {
    classes.push('disabled');
  }
  
  if (props.component.loading) {
    classes.push('loading');
  }
  
  return classes;
});

const buttonStyles = computed(() => ({
  fontSize: props.component.fontSize || '14px',
  fontWeight: props.component.fontWeight || '500',
  color: props.component.color || 'inherit'
}));

function getIconComponent(iconName: string) {
  return iconComponents[iconName as keyof typeof iconComponents] || MousePointer;
}

function selectComponent() {
  emit('select', props.component);
}

function handleClick(event: Event) {
  if (props.isSelected) {
    event.preventDefault();
    event.stopPropagation();
  }
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

function startResize(event: MouseEvent, position: string) {
  event.preventDefault();
  event.stopPropagation();
  
  const startX = event.clientX;
  const startY = event.clientY;
  const startWidth = props.component.size?.width || 100;
  const startHeight = props.component.size?.height || 40;
  
  function handleMouseMove(e: MouseEvent) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    let newWidth = startWidth;
    let newHeight = startHeight;
    
    switch (position) {
      case 'e':
        newWidth = Math.max(80, startWidth + deltaX);
        break;
      case 'w':
        newWidth = Math.max(80, startWidth - deltaX);
        break;
      case 's':
        newHeight = Math.max(30, startHeight + deltaY);
        break;
      case 'n':
        newHeight = Math.max(30, startHeight - deltaY);
        break;
      case 'se':
        newWidth = Math.max(80, startWidth + deltaX);
        newHeight = Math.max(30, startHeight + deltaY);
        break;
      case 'sw':
        newWidth = Math.max(80, startWidth - deltaX);
        newHeight = Math.max(30, startHeight + deltaY);
        break;
      case 'ne':
        newWidth = Math.max(80, startWidth + deltaX);
        newHeight = Math.max(30, startHeight - deltaY);
        break;
      case 'nw':
        newWidth = Math.max(80, startWidth - deltaX);
        newHeight = Math.max(30, startHeight - deltaY);
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
.form-button-component {
  transition: all 0.2s ease;
}

.form-button-component.selected {
  border: 2px solid #007bff !important;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-button-component.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.form-button-component.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.form-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;
}

.form-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-icon {
  width: 16px;
  height: 16px;
}

/* Button variants */
.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
  border-color: #545b62;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
  color: #fff;
}

.btn-success:hover:not(:disabled) {
  background-color: #218838;
  border-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: #fff;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
  border-color: #c82333;
}

.btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background-color: #e0a800;
  border-color: #e0a800;
}

.btn-info {
  background-color: #17a2b8;
  border-color: #17a2b8;
  color: #fff;
}

.btn-info:hover:not(:disabled) {
  background-color: #138496;
  border-color: #138496;
}

.btn-light {
  background-color: #f8f9fa;
  border-color: #f8f9fa;
  color: #212529;
}

.btn-light:hover:not(:disabled) {
  background-color: #e2e6ea;
  border-color: #e2e6ea;
}

.btn-dark {
  background-color: #343a40;
  border-color: #343a40;
  color: #fff;
}

.btn-dark:hover:not(:disabled) {
  background-color: #23272b;
  border-color: #23272b;
}

/* Button sizes */
.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-md {
  padding: 8px 16px;
  font-size: 14px;
}

.btn-lg {
  padding: 12px 24px;
  font-size: 16px;
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
