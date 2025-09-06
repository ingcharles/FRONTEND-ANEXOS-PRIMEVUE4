<template>
  <div 
    class="form-text-component"
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
    <label 
      v-if="component.label" 
      :for="component.id"
      class="form-label"
      :style="labelStyles"
    >
      {{ component.label }}
      <span v-if="component.required" class="required">*</span>
    </label>
    
    <input
      v-if="component.type !== 'textarea'"
      :id="component.id"
      :name="component.name"
      :type="getInputType()"
      :placeholder="component.placeholder"
      :required="component.required"
      :disabled="component.disabled"
      :maxlength="component.maxLength"
      :minlength="component.minLength"
      :pattern="component.pattern"
      :min="component.min"
      :max="component.max"
      :step="component.step"
      :value="component.value"
      class="form-input"
      :style="inputStyles"
      @input="handleInput"
    />
    
    <textarea
      v-else
      :id="component.id"
      :name="component.name"
      :placeholder="component.placeholder"
      :required="component.required"
      :disabled="component.disabled"
      :maxlength="component.maxLength"
      :minlength="component.minLength"
      :rows="component.rows || 3"
      :value="component.value"
      class="form-textarea"
      :style="inputStyles"
      @input="handleInput"
    ></textarea>
    
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
import { computed, ref } from 'vue';
import type { TextComponent } from '@/types/form-builder';
import { Trash2 } from 'lucide-vue-next';

interface Props {
  component: TextComponent;
  isSelected?: boolean;
  isDragging?: boolean;
}

interface Emits {
  (e: 'select', component: TextComponent): void;
  (e: 'update', component: TextComponent): void;
  (e: 'delete', component: TextComponent): void;
  (e: 'drag-start', event: DragEvent): void;
  (e: 'drag-end', event: DragEvent): void;
  (e: 'resize', component: TextComponent, size: { width: number; height: number }): void;
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

const componentStyles = computed(() => ({
  width: props.component.width || '100%',
  minWidth: props.component.minWidth || '200px',
  maxWidth: props.component.maxWidth || 'none',
  margin: props.component.margin || '8px 0',
  padding: props.component.padding || '0',
  backgroundColor: props.component.backgroundColor || 'transparent',
  border: props.component.borderWidth ? 
    `${props.component.borderWidth} solid ${props.component.borderColor || '#ccc'}` : 
    '1px solid transparent',
  borderRadius: props.component.borderRadius || '4px',
  position: 'relative' as const,
  cursor: props.isSelected ? 'move' : 'pointer'
}));

const labelStyles = computed(() => ({
  fontSize: props.component.fontSize || '14px',
  fontWeight: props.component.fontWeight || '500',
  color: props.component.color || '#333',
  display: 'block',
  marginBottom: '4px'
}));

const inputStyles = computed(() => ({
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: props.component.fontSize || '14px',
  backgroundColor: props.component.disabled ? '#f5f5f5' : '#fff',
  color: props.component.color || '#333'
}));

function selectComponent() {
  emit('select', props.component);
}

function getInputType(): string {
  const typeMap: Record<string, string> = {
    text: 'text',
    email: 'email',
    password: 'password',
    number: 'number',
    date: 'date'
  };
  return typeMap[props.component.type] || 'text';
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  const updatedComponent = {
    ...props.component,
    value: target.value
  };
  emit('update', updatedComponent);
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
  const startWidth = props.component.size?.width || 200;
  const startHeight = props.component.size?.height || 40;
  
  function handleMouseMove(e: MouseEvent) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    let newWidth = startWidth;
    let newHeight = startHeight;
    
    switch (position) {
      case 'e':
        newWidth = Math.max(100, startWidth + deltaX);
        break;
      case 'w':
        newWidth = Math.max(100, startWidth - deltaX);
        break;
      case 's':
        newHeight = Math.max(30, startHeight + deltaY);
        break;
      case 'n':
        newHeight = Math.max(30, startHeight - deltaY);
        break;
      case 'se':
        newWidth = Math.max(100, startWidth + deltaX);
        newHeight = Math.max(30, startHeight + deltaY);
        break;
      case 'sw':
        newWidth = Math.max(100, startWidth - deltaX);
        newHeight = Math.max(30, startHeight + deltaY);
        break;
      case 'ne':
        newWidth = Math.max(100, startWidth + deltaX);
        newHeight = Math.max(30, startHeight - deltaY);
        break;
      case 'nw':
        newWidth = Math.max(100, startWidth - deltaX);
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
.form-text-component {
  transition: all 0.2s ease;
}

.form-text-component.selected {
  border: 2px solid #007bff !important;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-text-component.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.form-text-component.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.form-label {
  user-select: none;
}

.required {
  color: #dc3545;
  margin-left: 2px;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  background-color: #fff;
  color: #333;
  resize: vertical;
  min-height: 80px;
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
