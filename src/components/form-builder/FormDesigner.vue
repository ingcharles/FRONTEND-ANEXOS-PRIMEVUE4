<template>
  <div class="form-designer">
    <div class="designer-header">
      <div class="tab-buttons">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
          @click="setActiveTab(tab.id)"
        >
          <component :is="getIconComponent(tab.icon)" class="tab-icon" />
          {{ tab.label }}
        </button>
      </div>
      
      <div class="designer-actions">
        <button class="action-button" @click="clearForm" title="Limpiar formulario">
          <Trash2 class="action-icon" />
        </button>
        <button class="action-button" @click="saveForm" title="Guardar formulario">
          <Save class="action-icon" />
        </button>
        <button class="action-button" @click="loadForm" title="Cargar formulario">
          <Upload class="action-icon" />
        </button>
      </div>
    </div>
    
    <div class="designer-content">
      <!-- Diseñador -->
      <div v-if="activeTab === 'designer'" class="designer-canvas">
        <div 
          class="canvas-container"
          :class="{ 'drag-over': isDragOver }"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
        >
          <div v-if="formComponents.length === 0" class="empty-canvas">
            <div class="empty-message">
              <Layout class="empty-icon" />
              <h3>Diseñador de Formularios</h3>
              <p>Arrastra componentes desde la paleta para comenzar a diseñar tu formulario</p>
            </div>
          </div>
          
          <div v-else class="form-components">
            <template v-for="(component, index) in formComponents" :key="component.id">
              <!-- Drop indicator -->
              <div
                v-if="dragOverIndex === index"
                class="drop-indicator"
              ></div>
              
              <div
                :data-component-id="component.id"
                class="component-wrapper"
                :class="{ 'drag-over': isDragOver && dragOverIndex === index }"
              >
                <FormComponentRenderer
                  :component="component"
                  :is-selected="selectedComponent?.id === component.id"
                  @select="selectComponent"
                  @update="updateComponent"
                  @delete="deleteComponent"
                  @drag-start="handleComponentDragStart"
                  @drag-end="handleComponentDragEnd"
                  @resize="handleComponentResize"
                  @add-child="addChildComponent"
                />
              </div>
            </template>
            
            <!-- Drop indicator at the end -->
            <div
              v-if="dragOverIndex === formComponents.length"
              class="drop-indicator"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- Vista previa -->
      <div v-else-if="activeTab === 'preview'" class="preview-container">
        <div class="preview-header">
          <h3>Vista Previa del Formulario</h3>
          <button class="preview-button" @click="previewForm">
            <Play class="preview-icon" />
            Ejecutar Vista Previa
          </button>
        </div>
        
        <div class="preview-content">
          <form v-if="previewMode" class="preview-form" @submit.prevent="handlePreviewSubmit">
            <FormComponentRenderer
              v-for="component in formComponents"
              :key="component.id"
              :component="component"
              :is-selected="false"
              :is-dragging="false"
              @select="() => {}"
              @update="() => {}"
              @drag-start="() => {}"
              @drag-end="() => {}"
              @resize="() => {}"
              @add-child="() => {}"
            />
            
            <div class="preview-actions">
              <button type="submit" class="submit-button">Enviar Formulario</button>
              <button type="button" class="reset-button" @click="resetPreview">Limpiar</button>
            </div>
          </form>
          
          <div v-else class="preview-placeholder">
            <Eye class="placeholder-icon" />
            <p>Haz clic en "Ejecutar Vista Previa" para ver cómo se verá tu formulario</p>
          </div>
        </div>
      </div>
      
      <!-- JSON -->
      <div v-else-if="activeTab === 'json'" class="json-container">
        <div class="json-header">
          <h3>Estructura JSON del Formulario</h3>
          <div class="json-actions">
            <button class="json-button" @click="copyJson" title="Copiar JSON">
              <Copy class="json-icon" />
            </button>
            <button class="json-button" @click="downloadJson" title="Descargar JSON">
              <Download class="json-icon" />
            </button>
            <button class="json-button" @click="importJson" title="Importar JSON">
              <Upload class="json-icon" />
            </button>
          </div>
        </div>
        
        <div class="json-content">
          <pre class="json-display">{{ formattedJson }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { FormComponent, ComponentType } from '@/types/form-builder';
import FormComponentRenderer from './FormComponentRenderer.vue';
import { 
  Layout, 
  Eye, 
  Code, 
  Trash2, 
  Save, 
  Upload, 
  Play, 
  Copy, 
  Download 
} from 'lucide-vue-next';

interface Props {
  formComponents: FormComponent[];
  selectedComponent: FormComponent | null;
}

interface Emits {
  (e: 'select-component', component: FormComponent | null): void;
  (e: 'update-component', component: FormComponent): void;
  (e: 'update-components', components: FormComponent[]): void;
  (e: 'add-component', component: FormComponent): void;
  (e: 'remove-component', componentId: string): void;
  (e: 'clear-form'): void;
  (e: 'save-form'): void;
  (e: 'load-form'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const activeTab = ref<'designer' | 'preview' | 'json'>('designer');
const isDragOver = ref(false);
const dragOverIndex = ref<number | null>(null);
const previewMode = ref(false);

const tabs = [
  { id: 'designer', label: 'Diseñador', icon: 'Layout' },
  { id: 'preview', label: 'Vista Previa', icon: 'Eye' },
  { id: 'json', label: 'JSON', icon: 'Code' }
];

const iconComponents = {
  Layout,
  Eye,
  Code,
  Trash2,
  Save,
  Upload,
  Play,
  Copy,
  Download
};

const formattedJson = computed(() => {
  return JSON.stringify(props.formComponents, null, 2);
});

function getIconComponent(iconName: string) {
  return iconComponents[iconName as keyof typeof iconComponents] || Layout;
}

function setActiveTab(tabId: 'designer' | 'preview' | 'json') {
  activeTab.value = tabId;
  if (tabId === 'preview') {
    previewMode.value = false;
  }
}

function selectComponent(component: FormComponent) {
  emit('select-component', component);
}

function updateComponent(component: FormComponent) {
  emit('update-component', component);
}

function deleteComponent(component: FormComponent) {
  emit('remove-component', component.id);
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation(); // Evitar que se propague a otros elementos
  isDragOver.value = false;
  dragOverIndex.value = null;
  
  try {
    const dragData = JSON.parse(event.dataTransfer?.getData('application/json') || '{}');
    
    if (dragData.source === 'palette' && dragData.componentType) {
      // Solo crear componente si se está soltando en el área principal del diseñador
      // Verificar que el drop sea específicamente en el diseñador principal
      const dropTarget = event.target as HTMLElement;
      const designerCanvas = dropTarget.closest('.designer-canvas');
      const isDroppingInPanel = dropTarget.closest('.panel-content') || 
                               dropTarget.closest('.page-content') ||
                               dropTarget.closest('.form-panel-component') ||
                               dropTarget.closest('.form-page-component');
      
      // Solo crear si está en el canvas del diseñador y NO en un panel/página
      if (designerCanvas && !isDroppingInPanel) {
        const newComponent: FormComponent = {
          id: `component_${Date.now()}`,
          type: dragData.componentType,
          name: `${dragData.componentType}_${Date.now()}`,
          label: `Nuevo ${dragData.componentType}`,
          ...getDefaultComponentProps(dragData.componentType)
        } as FormComponent;
        
        emit('add-component', newComponent);
      }
    } else if (dragData.source === 'designer' && dragData.componentId) {
      // Mover componente existente - encontrar la posición de drop
      const dropTarget = event.target as HTMLElement;
      const componentToMove = props.formComponents.find(c => c.id === dragData.componentId);
      
      if (componentToMove) {
        // Calcular la nueva posición basada en la posición del mouse
        const rect = dropTarget.getBoundingClientRect();
        const y = event.clientY - rect.top;
        
        // Determinar si insertar antes o después del elemento más cercano
        let insertIndex = props.formComponents.length;
        
        for (let i = 0; i < props.formComponents.length; i++) {
          const element = document.querySelector(`[data-component-id="${props.formComponents[i].id}"]`) as HTMLElement;
          if (element) {
            const elementRect = element.getBoundingClientRect();
            const elementY = elementRect.top - rect.top;
            
            if (y < elementY + elementRect.height / 2) {
              insertIndex = i;
              break;
            }
          }
        }
        
        // Reordenar componentes
        const updatedComponents = props.formComponents.filter(c => c.id !== dragData.componentId);
        updatedComponents.splice(insertIndex, 0, componentToMove);
        emit('update-components', updatedComponents);
      }
    }
  } catch (error) {
    console.error('Error al procesar drop:', error);
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = true;
  
  // Calcular el índice de inserción basado en la posición del mouse
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const y = event.clientY - rect.top;
  
  let insertIndex = props.formComponents.length;
  
  for (let i = 0; i < props.formComponents.length; i++) {
    const element = document.querySelector(`[data-component-id="${props.formComponents[i].id}"]`) as HTMLElement;
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const elementY = elementRect.top - rect.top;
      
      if (y < elementY + elementRect.height / 2) {
        insertIndex = i;
        break;
      }
    }
  }
  
  dragOverIndex.value = insertIndex;
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
    dragOverIndex.value = null;
  }
}

function handleComponentDragStart(event: DragEvent) {
  // Handle component reordering if needed
}

function handleComponentDragEnd(event: DragEvent) {
  isDragOver.value = false;
  dragOverIndex.value = null;
}

function handleComponentResize(component: FormComponent, size: { width: number; height: number }) {
  const updatedComponent = {
    ...component,
    size
  };
  emit('update-component', updatedComponent);
}

function addChildComponent(parentId: string, child: FormComponent) {
  emit('add-component', child);
}

function getDefaultComponentProps(type: ComponentType) {
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

function previewForm() {
  previewMode.value = true;
}

function handlePreviewSubmit() {
  console.log('Formulario enviado desde vista previa');
  alert('Formulario enviado correctamente (Vista Previa)');
}

function resetPreview() {
  // Reset form values in preview mode
  previewMode.value = false;
  setTimeout(() => {
    previewMode.value = true;
  }, 100);
}

function copyJson() {
  navigator.clipboard.writeText(formattedJson.value).then(() => {
    alert('JSON copiado al portapapeles');
  });
}

function downloadJson() {
  const blob = new Blob([formattedJson.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'formulario.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importJson() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          // Emit event to load the imported form
          console.log('JSON importado:', json);
        } catch (error) {
          alert('Error al importar JSON: ' + error);
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function clearForm() {
  if (confirm('¿Estás seguro de que quieres limpiar el formulario?')) {
    emit('clear-form');
  }
}

function saveForm() {
  emit('save-form');
}

function loadForm() {
  emit('load-form');
}

// Watch for tab changes to reset drag state
watch(activeTab, () => {
  isDragOver.value = false;
});
</script>

<style scoped>
.form-designer {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;
}

.designer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.tab-buttons {
  display: flex;
  gap: 4px;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.tab-button.active {
  background-color: #007bff;
  border-color: #007bff;
  color: #fff;
}

.tab-icon {
  width: 16px;
  height: 16px;
}

.designer-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  color: #495057;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.action-icon {
  width: 16px;
  height: 16px;
}

.designer-content {
  flex: 1;
  overflow: hidden;
}

.designer-canvas {
  height: 100%;
  padding: 16px;
  overflow: auto;
}

.canvas-container {
  min-height: 100%;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.canvas-container.drag-over {
  border-color: #007bff;
  background-color: rgba(0, 123, 255, 0.1);
}

.empty-canvas {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.empty-message {
  text-align: center;
  color: #6c757d;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #adb5bd;
}

.empty-message h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #495057;
}

.empty-message p {
  margin: 0;
  font-size: 14px;
}

.form-components {
  padding: 16px;
}

.component-wrapper {
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.component-wrapper:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.component-wrapper.drag-over {
  border: 2px dashed #007bff;
  background-color: rgba(0, 123, 255, 0.1);
}

.drop-indicator {
  height: 2px;
  background-color: #007bff;
  margin: 4px 0;
  border-radius: 1px;
  opacity: 0.8;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 0.4; }
  100% { opacity: 0.8; }
}

.preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
  color: #495057;
}

.preview-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.preview-button:hover {
  background-color: #218838;
}

.preview-icon {
  width: 16px;
  height: 16px;
}

.preview-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.preview-form {
  max-width: 600px;
  margin: 0 auto;
}

.preview-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #dee2e6;
}

.submit-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.submit-button:hover {
  background-color: #0056b3;
}

.reset-button {
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.reset-button:hover {
  background-color: #545b62;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6c757d;
}

.placeholder-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: #adb5bd;
}

.json-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.json-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.json-header h3 {
  margin: 0;
  font-size: 16px;
  color: #495057;
}

.json-actions {
  display: flex;
  gap: 8px;
}

.json-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  color: #495057;
  transition: all 0.2s ease;
}

.json-button:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.json-icon {
  width: 16px;
  height: 16px;
}

.json-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.json-display {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 16px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #495057;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
</style>
