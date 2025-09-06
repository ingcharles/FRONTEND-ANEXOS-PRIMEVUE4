<template>
  <div class="logic-editor">
    <div class="editor-header">
      <h4>Lógica Condicional</h4>
      <button class="add-rule-button" @click="addRule">
        <Plus class="add-icon" />
        Agregar Regla
      </button>
    </div>
    
    <div v-if="componentRules.length === 0" class="no-rules">
      <Zap class="no-rules-icon" />
      <p>No hay reglas de lógica configuradas</p>
      <p class="no-rules-subtitle">Agrega reglas para mostrar/ocultar o habilitar/deshabilitar componentes</p>
    </div>
    
    <div v-else class="rules-list">
      <div
        v-for="(rule, index) in componentRules"
        :key="rule.id"
        class="rule-item"
      >
        <div class="rule-header">
          <span class="rule-title">Regla {{ index + 1 }}</span>
          <button class="remove-rule-button" @click="removeRule(rule.id)">
            <Trash2 class="remove-icon" />
          </button>
        </div>
        
        <div class="rule-content">
          <div class="condition-section">
            <h5>Condición</h5>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Campo</label>
                <select
                  v-model="rule.condition.field"
                  class="form-select"
                  @change="updateRule(rule)"
                >
                  <option value="">Seleccionar campo...</option>
                  <option
                    v-for="field in availableFields"
                    :key="field.id"
                    :value="field.id"
                  >
                    {{ field.label || field.name }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Operador</label>
                <select
                  v-model="rule.condition.operator"
                  class="form-select"
                  @change="updateRule(rule)"
                >
                  <option value="equals">Es igual a</option>
                  <option value="not_equals">No es igual a</option>
                  <option value="contains">Contiene</option>
                  <option value="not_contains">No contiene</option>
                  <option value="greater_than">Mayor que</option>
                  <option value="less_than">Menor que</option>
                  <option value="is_empty">Está vacío</option>
                  <option value="is_not_empty">No está vacío</option>
                </select>
              </div>
            </div>
            
            <div v-if="!['is_empty', 'is_not_empty'].includes(rule.condition.operator)" class="form-group">
              <label class="form-label">Valor</label>
              <input
                v-model="rule.condition.value"
                type="text"
                class="form-input"
                placeholder="Valor a comparar"
                @input="updateRule(rule)"
              />
            </div>
          </div>
          
          <div class="action-section">
            <h5>Acción</h5>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Tipo de Acción</label>
                <select
                  v-model="rule.action.type"
                  class="form-select"
                  @change="updateRule(rule)"
                >
                  <option value="show">Mostrar</option>
                  <option value="hide">Ocultar</option>
                  <option value="enable">Habilitar</option>
                  <option value="disable">Deshabilitar</option>
                  <option value="require">Hacer requerido</option>
                  <option value="unrequire">No requerir</option>
                </select>
              </div>
              
              <div v-if="rule.action.type === 'require' || rule.action.type === 'unrequire'" class="form-group">
                <label class="form-label">Campo Objetivo</label>
                <select
                  v-model="rule.action.target"
                  class="form-select"
                  @change="updateRule(rule)"
                >
                  <option value="">Este componente</option>
                  <option
                    v-for="field in availableFields"
                    :key="field.id"
                    :value="field.id"
                  >
                    {{ field.label || field.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="editor-footer">
      <div class="logic-info">
        <Info class="info-icon" />
        <p>Las reglas se evalúan en orden. Puedes arrastrar para reordenar.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { FormComponent, FormLogic } from '@/types/form-builder';
import { Plus, Trash2, Zap, Info } from 'lucide-vue-next';

interface Props {
  component: FormComponent;
  formLogic: FormLogic[];
}

interface Emits {
  (e: 'update-logic', logic: FormLogic[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localLogic = ref<FormLogic[]>([...props.formLogic]);

watch(() => props.formLogic, (newLogic) => {
  localLogic.value = [...newLogic];
}, { deep: true });

const componentRules = computed(() => {
  return localLogic.value.filter(rule => rule.componentId === props.component.id);
});

const availableFields = computed(() => {
  // This would typically come from the form components
  // For now, we'll return a mock list
  return [
    { id: 'field1', name: 'campo1', label: 'Campo 1' },
    { id: 'field2', name: 'campo2', label: 'Campo 2' },
    { id: 'field3', name: 'campo3', label: 'Campo 3' }
  ];
});

function addRule() {
  const newRule: FormLogic = {
    id: `rule_${Date.now()}`,
    componentId: props.component.id,
    condition: {
      field: '',
      operator: 'equals',
      value: ''
    },
    action: {
      type: 'show',
      target: ''
    }
  };
  
  localLogic.value.push(newRule);
  emit('update-logic', [...localLogic.value]);
}

function removeRule(ruleId: string) {
  localLogic.value = localLogic.value.filter(rule => rule.id !== ruleId);
  emit('update-logic', [...localLogic.value]);
}

function updateRule(rule: FormLogic) {
  const index = localLogic.value.findIndex(r => r.id === rule.id);
  if (index !== -1) {
    localLogic.value[index] = { ...rule };
    emit('update-logic', [...localLogic.value]);
  }
}
</script>

<style scoped>
.logic-editor {
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

.add-rule-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.add-rule-button:hover {
  background-color: #0056b3;
}

.add-icon {
  width: 14px;
  height: 14px;
}

.no-rules {
  text-align: center;
  padding: 32px 16px;
  color: #6c757d;
}

.no-rules-icon {
  width: 32px;
  height: 32px;
  margin: 0 auto 12px;
  color: #adb5bd;
}

.no-rules p {
  margin: 0 0 4px;
  font-size: 14px;
}

.no-rules-subtitle {
  font-size: 12px !important;
  color: #adb5bd !important;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: #fff;
  overflow: hidden;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.rule-title {
  font-size: 13px;
  font-weight: 500;
  color: #495057;
}

.remove-rule-button {
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

.remove-rule-button:hover {
  background-color: #c82333;
}

.remove-icon {
  width: 12px;
  height: 12px;
}

.rule-content {
  padding: 16px;
}

.condition-section,
.action-section {
  margin-bottom: 16px;
}

.condition-section:last-child,
.action-section:last-child {
  margin-bottom: 0;
}

.condition-section h5,
.action-section h5 {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: #495057;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 4px;
}

.form-row {
  display: flex;
  gap: 8px;
}

.form-row .form-group {
  flex: 1;
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
.form-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 12px;
  color: #495057;
  background-color: #fff;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.editor-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #dee2e6;
}

.logic-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background-color: #e3f2fd;
  border-radius: 4px;
  color: #1976d2;
}

.info-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

.logic-info p {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
}
</style>
