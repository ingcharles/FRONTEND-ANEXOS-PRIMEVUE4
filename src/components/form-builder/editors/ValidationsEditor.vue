<template>
  <div class="validations-editor">
    <div class="editor-header">
      <h4>Validaciones</h4>
      <button class="add-validation-button" @click="addValidation">
        <Plus class="add-icon" />
        Agregar Validación
      </button>
    </div>
    
    <div v-if="componentValidations.length === 0" class="no-validations">
      <Shield class="no-validations-icon" />
      <p>No hay validaciones configuradas</p>
      <p class="no-validations-subtitle">Agrega validaciones para asegurar la calidad de los datos</p>
    </div>
    
    <div v-else class="validations-list">
      <div
        v-for="(validation, index) in componentValidations"
        :key="validation.id"
        class="validation-item"
      >
        <div class="validation-header">
          <span class="validation-title">Validación {{ index + 1 }}</span>
          <button class="remove-validation-button" @click="removeValidation(validation.id)">
            <Trash2 class="remove-icon" />
          </button>
        </div>
        
        <div class="validation-content">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Tipo de Validación</label>
              <select
                v-model="validation.type"
                class="form-select"
                @change="updateValidation(validation)"
              >
                <option value="required">Requerido</option>
                <option value="email">Email válido</option>
                <option value="url">URL válida</option>
                <option value="min_length">Longitud mínima</option>
                <option value="max_length">Longitud máxima</option>
                <option value="min_value">Valor mínimo</option>
                <option value="max_value">Valor máximo</option>
                <option value="pattern">Patrón (Regex)</option>
                <option value="custom">Función personalizada</option>
              </select>
            </div>
            
            <div v-if="needsValue(validation.type)" class="form-group">
              <label class="form-label">Valor</label>
              <input
                v-model="validation.value"
                :type="getInputType(validation.type)"
                class="form-input"
                :placeholder="getPlaceholder(validation.type)"
                @input="updateValidation(validation)"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Mensaje de Error</label>
            <input
              v-model="validation.message"
              type="text"
              class="form-input"
              placeholder="Mensaje a mostrar cuando la validación falle"
              @input="updateValidation(validation)"
            />
          </div>
          
          <div v-if="validation.type === 'pattern'" class="form-group">
            <label class="form-label">Patrón Regex</label>
            <input
              v-model="validation.value"
              type="text"
              class="form-input"
              placeholder="ej: ^[0-9]+$"
              @input="updateValidation(validation)"
            />
            <div class="pattern-examples">
              <p class="pattern-examples-title">Ejemplos:</p>
              <ul class="pattern-examples-list">
                <li><code>^[0-9]+$</code> - Solo números</li>
                <li><code>^[a-zA-Z]+$</code> - Solo letras</li>
                <li><code>^[a-zA-Z0-9]+$</code> - Letras y números</li>
                <li><code>^[0-9]{4}-[0-9]{2}-[0-9]{2}$</code> - Fecha (YYYY-MM-DD)</li>
              </ul>
            </div>
          </div>
          
          <div v-if="validation.type === 'custom'" class="form-group">
            <label class="form-label">Función JavaScript</label>
            <textarea
              v-model="validation.customFunction"
              class="form-textarea"
              rows="4"
              placeholder="function(value) { return value.length > 0; }"
              @input="updateValidation(validation)"
            ></textarea>
            <div class="custom-function-info">
              <Info class="info-icon" />
              <p>La función debe retornar <code>true</code> si el valor es válido, <code>false</code> si no lo es.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="editor-footer">
      <div class="validation-info">
        <Info class="info-icon" />
        <p>Las validaciones se ejecutan cuando el usuario envía el formulario o cambia el valor del campo.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { FormComponent, FormValidation } from '@/types/form-builder';
import { Plus, Trash2, Shield, Info } from 'lucide-vue-next';

interface Props {
  component: FormComponent;
  formValidations: FormValidation[];
}

interface Emits {
  (e: 'update-validations', validations: FormValidation[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localValidations = ref<FormValidation[]>([...props.formValidations]);

watch(() => props.formValidations, (newValidations) => {
  localValidations.value = [...newValidations];
}, { deep: true });

const componentValidations = computed(() => {
  return localValidations.value.filter(validation => validation.componentId === props.component.id);
});

function addValidation() {
  const newValidation: FormValidation = {
    id: `validation_${Date.now()}`,
    componentId: props.component.id,
    type: 'required',
    message: 'Este campo es requerido',
    value: undefined,
    customFunction: undefined
  };
  
  localValidations.value.push(newValidation);
  emit('update-validations', [...localValidations.value]);
}

function removeValidation(validationId: string) {
  localValidations.value = localValidations.value.filter(validation => validation.id !== validationId);
  emit('update-validations', [...localValidations.value]);
}

function updateValidation(validation: FormValidation) {
  const index = localValidations.value.findIndex(v => v.id === validation.id);
  if (index !== -1) {
    localValidations.value[index] = { ...validation };
    emit('update-validations', [...localValidations.value]);
  }
}

function needsValue(type: string): boolean {
  return ['min_length', 'max_length', 'min_value', 'max_value', 'pattern'].includes(type);
}

function getInputType(type: string): string {
  switch (type) {
    case 'min_value':
    case 'max_value':
      return 'number';
    case 'min_length':
    case 'max_length':
      return 'number';
    default:
      return 'text';
  }
}

function getPlaceholder(type: string): string {
  switch (type) {
    case 'min_length':
      return 'ej: 3';
    case 'max_length':
      return 'ej: 50';
    case 'min_value':
      return 'ej: 0';
    case 'max_value':
      return 'ej: 100';
    case 'pattern':
      return 'ej: ^[0-9]+$';
    default:
      return '';
  }
}
</script>

<style scoped>
.validations-editor {
  padding: 16px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.editor-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.add-validation-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.add-validation-button:hover {
  background-color: #218838;
}

.add-icon {
  width: 14px;
  height: 14px;
}

.no-validations {
  text-align: center;
  padding: 32px 16px;
  color: #6c757d;
}

.no-validations-icon {
  width: 32px;
  height: 32px;
  margin: 0 auto 12px;
  color: #adb5bd;
}

.no-validations p {
  margin: 0 0 4px;
  font-size: 14px;
}

.no-validations-subtitle {
  font-size: 12px !important;
  color: #adb5bd !important;
}

.validations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.validation-item {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: #fff;
  overflow: hidden;
}

.validation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.validation-title {
  font-size: 13px;
  font-weight: 500;
  color: #495057;
}

.remove-validation-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-validation-button:hover {
  background-color: #c82333;
}

.remove-icon {
  width: 12px;
  height: 12px;
}

.validation-content {
  padding: 16px;
}

.form-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 12px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #495057;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 12px;
  color: #495057;
  background-color: #fff;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-textarea {
  font-family: 'Courier New', monospace;
  resize: vertical;
  min-height: 80px;
}

.pattern-examples {
  margin-top: 8px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.pattern-examples-title {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 500;
  color: #495057;
}

.pattern-examples-list {
  margin: 0;
  padding-left: 16px;
  font-size: 11px;
  color: #6c757d;
}

.pattern-examples-list li {
  margin-bottom: 2px;
}

.pattern-examples-list code {
  background-color: #e9ecef;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 10px;
  color: #495057;
}

.custom-function-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #fff3cd;
  border-radius: 4px;
  color: #856404;
}

.info-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

.custom-function-info p {
  margin: 0;
  font-size: 11px;
  line-height: 1.4;
}

.custom-function-info code {
  background-color: #f8d7da;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 10px;
  color: #721c24;
}

.editor-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #dee2e6;
}

.validation-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background-color: #d1ecf1;
  border-radius: 4px;
  color: #0c5460;
}

.validation-info .info-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

.validation-info p {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
}
</style>
