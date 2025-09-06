<template>
  <div 
    class="form-combobox-component"
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
    
    <div class="combobox-container" :style="inputStyles">
      <select
        v-if="!component.searchable"
        :id="component.id"
        :name="component.name"
        :required="component.required"
        :disabled="component.disabled"
        :multiple="component.multiple"
        class="form-select"
        @change="handleChange"
      >
        <option value="" disabled>{{ component.placeholder || 'Seleccionar...' }}</option>
        <option 
          v-for="option in component.options" 
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
          :selected="isOptionSelected(option.value)"
        >
          {{ option.label }}
        </option>
      </select>
      
      <div v-else class="searchable-select">
        <input
          :id="component.id"
          :name="component.name"
          type="text"
          :placeholder="component.placeholder || 'Buscar...'"
          :required="component.required"
          :disabled="component.disabled"
          class="form-input"
          :value="searchValue"
          @input="handleSearch"
          @focus="showDropdown = true"
          @blur="hideDropdown"
        />
        
        <div v-if="showDropdown" class="dropdown-options">
          <div 
            v-for="option in filteredOptions" 
            :key="option.value"
            class="dropdown-option"
            :class="{ 'selected': isOptionSelected(option.value) }"
            @mousedown="selectOption(option)"
          >
            {{ option.label }}
          </div>
        </div>
      </div>
    </div>
    
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
import type { ComboboxComponent } from '@/types/form-builder';
import { Trash2 } from 'lucide-vue-next';

interface Props {
  component: ComboboxComponent;
  isSelected?: boolean;
  isDragging?: boolean;
}

interface Emits {
  (e: 'select', component: ComboboxComponent): void;
  (e: 'update', component: ComboboxComponent): void;
  (e: 'delete', component: ComboboxComponent): void;
  (e: 'drag-start', event: DragEvent): void;
  (e: 'drag-end', event: DragEvent): void;
  (e: 'resize', component: ComboboxComponent, size: { width: number; height: number }): void;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isDragging: false
});

const emit = defineEmits<Emits>();

const showDropdown = ref(false);
const searchValue = ref('');

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
  position: 'relative'
}));

const filteredOptions = computed(() => {
  if (!props.component.searchable || !searchValue.value) {
    return props.component.options;
  }
  
  return props.component.options.filter(option =>
    option.label.toLowerCase().includes(searchValue.value.toLowerCase())
  );
});

function selectComponent() {
  emit('select', props.component);
}

function isOptionSelected(value: string): boolean {
  if (props.component.multiple) {
    return Array.isArray(props.component.value) && props.component.value.includes(value);
  }
  return props.component.value === value;
}

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  let newValue: string | string[];
  
  if (props.component.multiple) {
    newValue = Array.from(target.selectedOptions).map(option => option.value);
  } else {
    newValue = target.value;
  }
  
  const updatedComponent = {
    ...props.component,
    value: newValue
  };
  emit('update', updatedComponent);
}

function handleSearch(event: Event) {
  const target = event.target as HTMLInputElement;
  searchValue.value = target.value;
}

function selectOption(option: { label: string; value: string }) {
  let newValue: string | string[];
  
  if (props.component.multiple) {
    const currentValue = Array.isArray(props.component.value) ? props.component.value : [];
    if (currentValue.includes(option.value)) {
      newValue = currentValue.filter(v => v !== option.value);
    } else {
      newValue = [...currentValue, option.value];
    }
  } else {
    newValue = option.value;
    showDropdown.value = false;
  }
  
  const updatedComponent = {
    ...props.component,
    value: newValue
  };
  emit('update', updatedComponent);
}

function hideDropdown() {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
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
.form-combobox-component {
  transition: all 0.2s ease;
}

.form-combobox-component.selected {
  border: 2px solid #007bff !important;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-combobox-component.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.form-combobox-component.disabled {
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

.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: #fff;
  color: #333;
}

.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.searchable-select {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: #fff;
  color: #333;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.dropdown-option {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-option:hover {
  background-color: #f8f9fa;
}

.dropdown-option.selected {
  background-color: #007bff;
  color: #fff;
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
