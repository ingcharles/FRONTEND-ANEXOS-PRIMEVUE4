<template>
  <div class="form-builder">
    <div class="builder-layout">
      <!-- Sección izquierda: Paleta de componentes -->
      <div class="left-panel">
        <ComponentPalette
          @drag-start="handlePaletteDragStart"
          @drag-end="handlePaletteDragEnd"
        />
      </div>
      
      <!-- Sección central: Diseñador -->
      <div class="center-panel">
        <FormDesigner
          :form-components="formComponents"
          :selected-component="selectedComponent"
          @select-component="selectComponent"
          @update-component="updateComponent"
          @add-component="addComponent"
          @remove-component="removeComponent"
          @clear-form="clearForm"
          @save-form="saveForm"
          @load-form="loadForm"
        />
      </div>
      
      <!-- Sección derecha: Panel de propiedades -->
      <div class="right-panel">
        <PropertiesPanel
          :selected-component="selectedComponent"
          :form-logic="formLogic"
          :form-validations="formValidations"
          @update-component="updateComponent"
          @update-logic="updateFormLogic"
          @update-validations="updateFormValidations"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FormComponent, FormLogic, FormValidation } from '@/types/form-builder';
import ComponentPalette from './ComponentPalette.vue';
import FormDesigner from './FormDesigner.vue';
import PropertiesPanel from './PropertiesPanel.vue';

// Estado del formulario
const formComponents = ref<FormComponent[]>([]);
const selectedComponent = ref<FormComponent | null>(null);
const formLogic = ref<FormLogic[]>([]);
const formValidations = ref<FormValidation[]>([]);

// Funciones de manejo de componentes
function selectComponent(component: FormComponent | null) {
  selectedComponent.value = component;
}

function updateComponent(component: FormComponent) {
  const index = formComponents.value.findIndex(c => c.id === component.id);
  if (index !== -1) {
    formComponents.value[index] = component;
  }
}

function addComponent(component: FormComponent) {
  formComponents.value.push(component);
  selectedComponent.value = component;
}

function removeComponent(componentId: string) {
  formComponents.value = formComponents.value.filter(c => c.id !== componentId);
  
  // Limpiar lógica y validaciones del componente eliminado
  formLogic.value = formLogic.value.filter(l => l.componentId !== componentId);
  formValidations.value = formValidations.value.filter(v => v.componentId !== componentId);
  
  // Deseleccionar si el componente eliminado estaba seleccionado
  if (selectedComponent.value?.id === componentId) {
    selectedComponent.value = null;
  }
}

function clearForm() {
  formComponents.value = [];
  selectedComponent.value = null;
  formLogic.value = [];
  formValidations.value = [];
}

function saveForm() {
  const formData = {
    components: formComponents.value,
    logic: formLogic.value,
    validations: formValidations.value,
    metadata: {
      name: 'Mi Formulario',
      description: 'Formulario creado con el constructor',
      version: '1.0.0',
      createdAt: new Date().toISOString()
    }
  };
  
  const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'formulario.json';
  a.click();
  URL.revokeObjectURL(url);
}

function loadForm() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const formData = JSON.parse(e.target?.result as string);
          
          if (formData.components) {
            formComponents.value = formData.components;
          }
          if (formData.logic) {
            formLogic.value = formData.logic;
          }
          if (formData.validations) {
            formValidations.value = formData.validations;
          }
          
          selectedComponent.value = null;
          console.log('Formulario cargado exitosamente');
        } catch (error) {
          alert('Error al cargar el formulario: ' + error);
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

// Funciones de manejo de lógica
function updateFormLogic(logic: FormLogic[]) {
  formLogic.value = logic;
}

// Funciones de manejo de validaciones
function updateFormValidations(validations: FormValidation[]) {
  formValidations.value = validations;
}

// Funciones de drag and drop
function handlePaletteDragStart(event: DragEvent) {
  // El drag start se maneja en el componente ComponentPalette
}

function handlePaletteDragEnd(event: DragEvent) {
  // El drag end se maneja en el componente ComponentPalette
}
</script>

<style scoped>
.form-builder {
  width: 100%;
  height: 100vh;
  background-color: #f8f9fa;
  overflow: hidden;
}

.builder-layout {
  display: flex;
  height: 100%;
}

.left-panel {
  width: 280px;
  flex-shrink: 0;
  background-color: #fff;
  border-right: 1px solid #dee2e6;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

.center-panel {
  flex: 1;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.right-panel {
  width: 320px;
  flex-shrink: 0;
  background-color: #fff;
  border-left: 1px solid #dee2e6;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
}

/* Responsive design */
@media (max-width: 1200px) {
  .right-panel {
    width: 280px;
  }
}

@media (max-width: 992px) {
  .left-panel {
    width: 240px;
  }
  
  .right-panel {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .builder-layout {
    flex-direction: column;
  }
  
  .left-panel,
  .right-panel {
    width: 100%;
    height: 200px;
    border-right: none;
    border-left: none;
    border-bottom: 1px solid #dee2e6;
  }
  
  .center-panel {
    flex: 1;
    min-height: 400px;
  }
}

/* Scrollbar styling */
.left-panel::-webkit-scrollbar,
.right-panel::-webkit-scrollbar {
  width: 6px;
}

.left-panel::-webkit-scrollbar-track,
.right-panel::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.left-panel::-webkit-scrollbar-thumb,
.right-panel::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-thumb:hover,
.right-panel::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
