<template>
  <div class="properties-panel">
    <div class="panel-header">
      <h3>Propiedades</h3>
    </div>
    
    <div class="panel-content">
      <div v-if="!selectedComponent" class="no-selection">
        <Settings class="no-selection-icon" />
        <p>Selecciona un componente para editar sus propiedades</p>
      </div>
      
      <div v-else class="properties-content">
        <div class="component-info">
          <div class="component-type">
            <component :is="getComponentIcon(selectedComponent.type)" class="type-icon" />
            <span class="type-name">{{ getComponentTypeName(selectedComponent.type) }}</span>
          </div>
          <div class="component-id">ID: {{ selectedComponent.id }}</div>
        </div>
        
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
        
        <div class="tab-content">
          <!-- Atributos -->
          <div v-if="activeTab === 'attributes'" class="attributes-tab">
            <AttributesEditor
              :component="selectedComponent"
              @update="updateComponent"
            />
          </div>
          
          <!-- Lógica -->
          <div v-else-if="activeTab === 'logic'" class="logic-tab">
            <LogicEditor
              :component="selectedComponent"
              :form-logic="formLogic"
              @update-logic="updateFormLogic"
            />
          </div>
          
          <!-- Validaciones -->
          <div v-else-if="activeTab === 'validations'" class="validations-tab">
            <ValidationsEditor
              :component="selectedComponent"
              :form-validations="formValidations"
              @update-validations="updateFormValidations"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FormComponent, FormLogic, FormValidation } from '@/types/form-builder';
import AttributesEditor from './editors/AttributesEditor.vue';
import LogicEditor from './editors/LogicEditor.vue';
import ValidationsEditor from './editors/ValidationsEditor.vue';
import { 
  Settings, 
  Palette, 
  Zap, 
  Shield,
  Type,
  ChevronDown,
  Square,
  Table,
  Tag
} from 'lucide-vue-next';

interface Props {
  selectedComponent: FormComponent | null;
  formLogic: FormLogic[];
  formValidations: FormValidation[];
}

interface Emits {
  (e: 'update-component', component: FormComponent): void;
  (e: 'update-logic', logic: FormLogic[]): void;
  (e: 'update-validations', validations: FormValidation[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const activeTab = ref<'attributes' | 'logic' | 'validations'>('attributes');

const tabs = [
  { id: 'attributes', label: 'Atributos', icon: 'Palette' },
  { id: 'logic', label: 'Lógica', icon: 'Zap' },
  { id: 'validations', label: 'Validaciones', icon: 'Shield' }
];

const iconComponents = {
  Settings,
  Palette,
  Zap,
  Shield,
  Type,
  ChevronDown,
  Square,
  Table,
  Tag
};

const componentIcons = {
  text: Type,
  combobox: ChevronDown,
  panel: Square,
  table: Table,
  label: Tag
};

function getIconComponent(iconName: string) {
  return iconComponents[iconName as keyof typeof iconComponents] || Settings;
}

function getComponentIcon(componentType: string) {
  return componentIcons[componentType as keyof typeof componentIcons] || Type;
}

function getComponentTypeName(componentType: string): string {
  const names: Record<string, string> = {
    text: 'Campo de Texto',
    combobox: 'Lista Desplegable',
    panel: 'Panel',
    table: 'Tabla',
    label: 'Etiqueta'
  };
  return names[componentType] || componentType;
}

function setActiveTab(tabId: 'attributes' | 'logic' | 'validations') {
  activeTab.value = tabId;
}

function updateComponent(component: FormComponent) {
  emit('update-component', component);
}

function updateFormLogic(logic: FormLogic[]) {
  emit('update-logic', logic);
}

function updateFormValidations(validations: FormValidation[]) {
  emit('update-validations', validations);
}
</script>

<style scoped>
.properties-panel {
  width: 320px;
  height: 100vh;
  background-color: #f8f9fa;
  border-left: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 16px;
  background-color: #e9ecef;
  border-bottom: 1px solid #dee2e6;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #495057;
}

.panel-content {
  flex: 1;
  overflow: hidden;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px;
  text-align: center;
  color: #6c757d;
}

.no-selection-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: #adb5bd;
}

.no-selection p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.properties-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.component-info {
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #dee2e6;
}

.component-type {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.type-icon {
  width: 16px;
  height: 16px;
  color: #007bff;
}

.type-name {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.component-id {
  font-size: 12px;
  color: #6c757d;
  font-family: 'Courier New', monospace;
}

.tab-buttons {
  display: flex;
  background-color: #fff;
  border-bottom: 1px solid #dee2e6;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 12px;
  color: #6c757d;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.tab-button.active {
  color: #007bff;
  border-bottom-color: #007bff;
  background-color: #f8f9fa;
}

.tab-icon {
  width: 14px;
  height: 14px;
}

.tab-content {
  flex: 1;
  overflow: auto;
}

.attributes-tab,
.logic-tab,
.validations-tab {
  height: 100%;
  overflow: auto;
}

/* Scrollbar styling */
.tab-content::-webkit-scrollbar {
  width: 6px;
}

.tab-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.tab-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
