<template>
  <div 
    class="form-table-component"
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
    <div class="table-header" v-if="component.label">
      <label class="form-label" :style="labelStyles">
        {{ component.label }}
        <span v-if="component.required" class="required">*</span>
      </label>
    </div>
    
    <div class="table-container" :style="tableContainerStyles">
      <table class="form-table" :style="tableStyles">
        <thead>
          <tr>
            <th 
              v-for="column in component.columns" 
              :key="column.id"
              :style="{ width: column.width || 'auto' }"
            >
              {{ column.label }}
              <span v-if="column.required" class="required">*</span>
            </th>
            <th v-if="component.allowDeleteRows || component.allowEditRows" class="actions-column">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, rowIndex) in component.rows" 
            :key="row.id"
            :class="{ 'editing': editingRow === row.id }"
          >
            <td 
              v-for="column in component.columns" 
              :key="column.id"
            >
              <input
                v-if="column.type === 'text'"
                :type="column.type"
                :value="row.data[column.id] || ''"
                :required="column.required"
                :disabled="!component.allowEditRows && editingRow !== row.id"
                class="table-input"
                @input="updateCellValue(row.id, column.id, ($event.target as HTMLInputElement).value)"
                @dblclick="startEditRow(row.id)"
              />
              
              <input
                v-else-if="column.type === 'number'"
                type="number"
                :value="row.data[column.id] || ''"
                :required="column.required"
                :disabled="!component.allowEditRows && editingRow !== row.id"
                class="table-input"
                @input="updateCellValue(row.id, column.id, ($event.target as HTMLInputElement).value)"
                @dblclick="startEditRow(row.id)"
              />
              
              <input
                v-else-if="column.type === 'date'"
                type="date"
                :value="row.data[column.id] || ''"
                :required="column.required"
                :disabled="!component.allowEditRows && editingRow !== row.id"
                class="table-input"
                @input="updateCellValue(row.id, column.id, ($event.target as HTMLInputElement).value)"
                @dblclick="startEditRow(row.id)"
              />
              
              <select
                v-else-if="column.type === 'select'"
                :value="row.data[column.id] || ''"
                :required="column.required"
                :disabled="!component.allowEditRows && editingRow !== row.id"
                class="table-select"
                @change="updateCellValue(row.id, column.id, ($event.target as HTMLSelectElement).value)"
                @dblclick="startEditRow(row.id)"
              >
                <option value="">Seleccionar...</option>
                <option 
                  v-for="option in column.options" 
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              
              <input
                v-else-if="column.type === 'checkbox'"
                type="checkbox"
                :checked="row.data[column.id] || false"
                :disabled="!component.allowEditRows && editingRow !== row.id"
                class="table-checkbox"
                @change="updateCellValue(row.id, column.id, ($event.target as HTMLInputElement).checked)"
                @dblclick="startEditRow(row.id)"
              />
            </td>
            
            <td v-if="component.allowDeleteRows || component.allowEditRows" class="actions-cell">
              <button
                v-if="component.allowEditRows"
                class="action-button edit-button"
                @click="toggleEditRow(row.id)"
                :title="editingRow === row.id ? 'Guardar' : 'Editar'"
              >
                {{ editingRow === row.id ? '✓' : '✏️' }}
              </button>
              
              <button
                v-if="component.allowDeleteRows"
                class="action-button delete-button"
                @click="deleteRow(row.id)"
                title="Eliminar"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="component.rows.length === 0" class="empty-table">
        <p>No hay filas en la tabla</p>
        <button 
          v-if="component.allowAddRows"
          class="add-row-button"
          @click="addRow"
        >
          Agregar Fila
        </button>
      </div>
    </div>
    
    <div v-if="component.allowAddRows && component.rows.length > 0" class="table-footer">
      <button class="add-row-button" @click="addRow">
        + Agregar Fila
      </button>
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
import type { TableComponent } from '@/types/form-builder';
import { Trash2 } from 'lucide-vue-next';

interface Props {
  component: TableComponent;
  isSelected?: boolean;
  isDragging?: boolean;
}

interface Emits {
  (e: 'select', component: TableComponent): void;
  (e: 'update', component: TableComponent): void;
  (e: 'delete', component: TableComponent): void;
  (e: 'drag-start', event: DragEvent): void;
  (e: 'drag-end', event: DragEvent): void;
  (e: 'resize', component: TableComponent, size: { width: number; height: number }): void;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isDragging: false
});

const emit = defineEmits<Emits>();

const editingRow = ref<string | null>(null);

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
  marginBottom: '8px'
}));

const tableContainerStyles = computed(() => ({
  overflowX: 'auto' as const,
  border: '1px solid #ddd',
  borderRadius: '4px'
}));

const tableStyles = computed(() => ({
  width: '100%',
  borderCollapse: 'collapse' as const,
  fontSize: props.component.fontSize || '14px'
}));

function selectComponent() {
  emit('select', props.component);
}

function addRow() {
  const newRow = {
    id: `row_${Date.now()}`,
    data: props.component.columns.reduce((acc, column) => {
      acc[column.id] = column.type === 'checkbox' ? false : '';
      return acc;
    }, {} as Record<string, any>)
  };
  
  const updatedComponent = {
    ...props.component,
    rows: [...props.component.rows, newRow]
  };
  emit('update', updatedComponent);
}

function deleteRow(rowId: string) {
  const updatedComponent = {
    ...props.component,
    rows: props.component.rows.filter(row => row.id !== rowId)
  };
  emit('update', updatedComponent);
}

function updateCellValue(rowId: string, columnId: string, value: any) {
  const updatedRows = props.component.rows.map(row => {
    if (row.id === rowId) {
      return {
        ...row,
        data: {
          ...row.data,
          [columnId]: value
        }
      };
    }
    return row;
  });
  
  const updatedComponent = {
    ...props.component,
    rows: updatedRows
  };
  emit('update', updatedComponent);
}

function startEditRow(rowId: string) {
  if (props.component.allowEditRows) {
    editingRow.value = rowId;
  }
}

function toggleEditRow(rowId: string) {
  if (editingRow.value === rowId) {
    editingRow.value = null;
  } else {
    editingRow.value = rowId;
  }
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
  const startWidth = props.component.size?.width || 400;
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
.form-table-component {
  transition: all 0.2s ease;
}

.form-table-component.selected {
  border: 2px solid #007bff !important;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-table-component.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.form-table-component.disabled {
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

.form-table {
  background-color: #fff;
}

.form-table th {
  background-color: #f8f9fa;
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
  border-right: 1px solid #dee2e6;
}

.form-table th:last-child {
  border-right: none;
}

.form-table td {
  padding: 8px;
  border-bottom: 1px solid #dee2e6;
  border-right: 1px solid #dee2e6;
  vertical-align: middle;
}

.form-table td:last-child {
  border-right: none;
}

.form-table tr:hover {
  background-color: #f8f9fa;
}

.form-table tr.editing {
  background-color: #e3f2fd;
}

.table-input, .table-select {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: #fff;
}

.table-input:focus, .table-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.table-input:disabled, .table-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.table-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.table-checkbox:disabled {
  cursor: not-allowed;
}

.actions-column {
  width: 120px;
  text-align: center;
}

.actions-cell {
  text-align: center;
  white-space: nowrap;
}

.action-button {
  background: none;
  border: none;
  padding: 4px 8px;
  margin: 0 2px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background-color: #e3f2fd;
}

.delete-button:hover {
  background-color: #ffebee;
}

.empty-table {
  padding: 40px;
  text-align: center;
  color: #6c757d;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.add-row-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.add-row-button:hover {
  background-color: #0056b3;
}

.table-footer {
  margin-top: 8px;
  text-align: center;
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
