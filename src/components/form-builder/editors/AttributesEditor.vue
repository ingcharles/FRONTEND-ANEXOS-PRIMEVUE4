<template>
  <div class="attributes-editor">
    <div class="editor-section">
      <h4>Básico</h4>
      
      <div class="form-group">
        <label class="form-label">Nombre</label>
        <input
          v-model="localComponent.name"
          type="text"
          class="form-input"
          @input="updateComponent"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Etiqueta</label>
        <input
          v-model="localComponent.label"
          type="text"
          class="form-input"
          @input="updateComponent"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Placeholder</label>
        <input
          v-model="localComponent.placeholder"
          type="text"
          class="form-input"
          @input="updateComponent"
        />
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="localComponent.required"
            type="checkbox"
            @change="updateComponent"
          />
          Requerido
        </label>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="localComponent.disabled"
            type="checkbox"
            @change="updateComponent"
          />
          Deshabilitado
        </label>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="localComponent.visible"
            type="checkbox"
            @change="updateComponent"
          />
          Visible
        </label>
      </div>
    </div>
    
    <div class="editor-section">
      <h4>Dimensiones</h4>
      
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Ancho</label>
          <input
            v-model="localComponent.width"
            type="text"
            class="form-input"
            placeholder="ej: 100%, 200px"
            @input="updateComponent"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">Alto</label>
          <input
            v-model="localComponent.height"
            type="text"
            class="form-input"
            placeholder="ej: auto, 40px"
            @input="updateComponent"
          />
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Ancho Mín.</label>
          <input
            v-model="localComponent.minWidth"
            type="text"
            class="form-input"
            placeholder="ej: 100px"
            @input="updateComponent"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">Ancho Máx.</label>
          <input
            v-model="localComponent.maxWidth"
            type="text"
            class="form-input"
            placeholder="ej: 500px"
            @input="updateComponent"
          />
        </div>
      </div>
    </div>
    
    <div class="editor-section">
      <h4>Espaciado</h4>
      
      <div class="form-group">
        <label class="form-label">Margen</label>
        <input
          v-model="localComponent.margin"
          type="text"
          class="form-input"
          placeholder="ej: 8px 0, 10px"
          @input="updateComponent"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Relleno</label>
        <input
          v-model="localComponent.padding"
          type="text"
          class="form-input"
          placeholder="ej: 8px, 10px 15px"
          @input="updateComponent"
        />
      </div>
    </div>
    
    <div class="editor-section">
      <h4>Estilo</h4>
      
      <div class="form-group">
        <label class="form-label">Color de Fondo</label>
        <input
          v-model="localComponent.backgroundColor"
          type="color"
          class="form-input color-input"
          @input="updateComponent"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Color del Borde</label>
        <input
          v-model="localComponent.borderColor"
          type="color"
          class="form-input color-input"
          @input="updateComponent"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Grosor del Borde</label>
        <input
          v-model="localComponent.borderWidth"
          type="text"
          class="form-input"
          placeholder="ej: 1px, 2px"
          @input="updateComponent"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Radio del Borde</label>
        <input
          v-model="localComponent.borderRadius"
          type="text"
          class="form-input"
          placeholder="ej: 4px, 8px"
          @input="updateComponent"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Tamaño de Fuente</label>
        <input
          v-model="localComponent.fontSize"
          type="text"
          class="form-input"
          placeholder="ej: 14px, 1rem"
          @input="updateComponent"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Peso de Fuente</label>
        <select
          v-model="localComponent.fontWeight"
          class="form-select"
          @change="updateComponent"
        >
          <option value="">Normal</option>
          <option value="bold">Negrita</option>
          <option value="lighter">Ligera</option>
          <option value="bolder">Más Negrita</option>
          <option value="100">100</option>
          <option value="200">200</option>
          <option value="300">300</option>
          <option value="400">400</option>
          <option value="500">500</option>
          <option value="600">600</option>
          <option value="700">700</option>
          <option value="800">800</option>
          <option value="900">900</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Color del Texto</label>
        <input
          v-model="localComponent.color"
          type="color"
          class="form-input color-input"
          @input="updateComponent"
        />
      </div>
    </div>
    
    <!-- Propiedades específicas por tipo -->
    <div v-if="['text', 'email', 'password', 'number', 'date'].includes(component.type)" class="editor-section">
      <h4>Propiedades de Campo</h4>
      
      <div class="form-group">
        <label class="form-label">Tipo de Campo</label>
        <select
          v-model="fieldType"
          class="form-select"
          @change="changeFieldType"
        >
          <option value="text">Texto</option>
          <option value="email">Email</option>
          <option value="password">Contraseña</option>
          <option value="number">Número</option>
          <option value="date">Fecha</option>
          <option value="textarea">Área de Texto</option>
        </select>
      </div>
      
      <div v-if="['text', 'email', 'password'].includes(fieldType)" class="form-group">
        <label class="form-label">Longitud Máxima</label>
        <input
          v-model="localComponent.maxLength"
          type="number"
          class="form-input"
          @input="updateComponent"
        />
      </div>
      
      <div v-if="['text', 'email', 'password'].includes(fieldType)" class="form-group">
        <label class="form-label">Longitud Mínima</label>
        <input
          v-model="localComponent.minLength"
          type="number"
          class="form-input"
          @input="updateComponent"
        />
      </div>
      
      <div v-if="fieldType === 'text'" class="form-group">
        <label class="form-label">Patrón (Regex)</label>
        <input
          v-model="localComponent.pattern"
          type="text"
          class="form-input"
          placeholder="ej: [0-9]+"
          @input="updateComponent"
        />
      </div>
      
      <div v-if="fieldType === 'number'" class="form-row">
        <div class="form-group">
          <label class="form-label">Valor Mínimo</label>
          <input
            v-model="localComponent.min"
            type="number"
            class="form-input"
            @input="updateComponent"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">Valor Máximo</label>
          <input
            v-model="localComponent.max"
            type="number"
            class="form-input"
            @input="updateComponent"
          />
        </div>
      </div>
      
      <div v-if="fieldType === 'number'" class="form-group">
        <label class="form-label">Paso</label>
        <input
          v-model="localComponent.step"
          type="number"
          class="form-input"
          placeholder="1"
          @input="updateComponent"
        />
      </div>
      
      <div v-if="fieldType === 'textarea'" class="form-group">
        <label class="form-label">Filas</label>
        <input
          v-model="localComponent.rows"
          type="number"
          class="form-input"
          placeholder="3"
          @input="updateComponent"
        />
      </div>
    </div>
    
    <div v-if="component.type === 'combobox'" class="editor-section">
      <h4>Propiedades de Lista</h4>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="localComponent.multiple"
            type="checkbox"
            @change="updateComponent"
          />
          Selección Múltiple
        </label>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="localComponent.searchable"
            type="checkbox"
            @change="updateComponent"
          />
          Búsqueda Habilitada
        </label>
      </div>
      
      <div class="form-group">
        <label class="form-label">Opciones</label>
        <div class="options-list">
          <div
            v-for="(option, index) in localComponent.options"
            :key="index"
            class="option-item"
          >
            <input
              v-model="option.label"
              type="text"
              class="form-input"
              placeholder="Etiqueta"
              @input="updateComponent"
            />
            <input
              v-model="option.value"
              type="text"
              class="form-input"
              placeholder="Valor"
              @input="updateComponent"
            />
            <label class="checkbox-label">
              <input
                v-model="option.disabled"
                type="checkbox"
                @change="updateComponent"
              />
              Deshabilitado
            </label>
            <button
              class="remove-button"
              @click="removeOption(index)"
            >
              ×
            </button>
          </div>
          <button class="add-option-button" @click="addOption">
            + Agregar Opción
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="component.type === 'panel'" class="editor-section">
      <h4>Propiedades de Panel</h4>
      
      <div class="form-group">
        <label class="form-label">Título</label>
        <input
          v-model="localComponent.title"
          type="text"
          class="form-input"
          @input="updateComponent"
        />
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="localComponent.collapsible"
            type="checkbox"
            @change="updateComponent"
          />
          Colapsable
        </label>
      </div>
      
      <div v-if="localComponent.collapsible" class="form-group">
        <label class="checkbox-label">
          <input
            v-model="localComponent.collapsed"
            type="checkbox"
            @change="updateComponent"
          />
          Colapsado por Defecto
        </label>
      </div>
    </div>
    
    <div v-if="component.type === 'table'" class="editor-section">
      <h4>Propiedades de Tabla</h4>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="localComponent.allowAddRows"
            type="checkbox"
            @change="updateComponent"
          />
          Permitir Agregar Filas
        </label>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="localComponent.allowDeleteRows"
            type="checkbox"
            @change="updateComponent"
          />
          Permitir Eliminar Filas
        </label>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="localComponent.allowEditRows"
            type="checkbox"
            @change="updateComponent"
          />
          Permitir Editar Filas
        </label>
      </div>
      
      <div class="form-group">
        <label class="form-label">Filas Mínimas</label>
        <input
          v-model="localComponent.minRows"
          type="number"
          class="form-input"
          @input="updateComponent"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Filas Máximas</label>
        <input
          v-model="localComponent.maxRows"
          type="number"
          class="form-input"
          @input="updateComponent"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Columnas</label>
        <div class="columns-list">
          <div
            v-for="(column, index) in localComponent.columns"
            :key="index"
            class="column-item"
          >
            <input
              v-model="column.label"
              type="text"
              class="form-input"
              placeholder="Etiqueta de columna"
              @input="updateComponent"
            />
            <select
              v-model="column.type"
              class="form-select"
              @change="updateComponent"
            >
              <option value="text">Texto</option>
              <option value="number">Número</option>
              <option value="date">Fecha</option>
              <option value="select">Lista</option>
              <option value="checkbox">Casilla</option>
            </select>
            <input
              v-model="column.width"
              type="text"
              class="form-input"
              placeholder="Ancho"
              @input="updateComponent"
            />
            <label class="checkbox-label">
              <input
                v-model="column.required"
                type="checkbox"
                @change="updateComponent"
              />
              Requerido
            </label>
            <button
              class="remove-button"
              @click="removeColumn(index)"
            >
              ×
            </button>
          </div>
          <button class="add-column-button" @click="addColumn">
            + Agregar Columna
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="component.type === 'label'" class="editor-section">
      <h4>Propiedades de Etiqueta</h4>
      
      <div class="form-group">
        <label class="form-label">Texto</label>
        <textarea
          v-model="localComponent.text"
          class="form-textarea"
          rows="3"
          @input="updateComponent"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label">Asociar con Campo</label>
        <input
          v-model="localComponent.htmlFor"
          type="text"
          class="form-input"
          placeholder="ID del campo"
          @input="updateComponent"
        />
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="localComponent.bold"
            type="checkbox"
            @change="updateComponent"
          />
          Negrita
        </label>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="localComponent.italic"
            type="checkbox"
            @change="updateComponent"
          />
          Cursiva
        </label>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="localComponent.underline"
            type="checkbox"
            @change="updateComponent"
          />
          Subrayado
        </label>
      </div>
    </div>
    
    <div v-if="component.type === 'button'" class="editor-section">
      <h4>Propiedades de Botón</h4>
      
      <div class="form-group">
        <label class="form-label">Texto del Botón</label>
        <input
          v-model="localComponent.label"
          type="text"
          class="form-input"
          placeholder="Texto del botón"
          @input="updateComponent"
        />
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Tipo de Botón</label>
          <select
            v-model="localComponent.buttonType"
            class="form-select"
            @change="updateComponent"
          >
            <option value="button">Botón</option>
            <option value="submit">Enviar</option>
            <option value="reset">Limpiar</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Variante</label>
          <select
            v-model="localComponent.variant"
            class="form-select"
            @change="updateComponent"
          >
            <option value="primary">Primario</option>
            <option value="secondary">Secundario</option>
            <option value="success">Éxito</option>
            <option value="danger">Peligro</option>
            <option value="warning">Advertencia</option>
            <option value="info">Información</option>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Tamaño</label>
        <select
          v-model="localComponent.size"
          class="form-select"
          @change="updateComponent"
        >
          <option value="sm">Pequeño</option>
          <option value="md">Mediano</option>
          <option value="lg">Grande</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Icono</label>
        <select
          v-model="localComponent.icon"
          class="form-select"
          @change="updateComponent"
        >
          <option value="">Sin icono</option>
          <option value="MousePointer">Puntero</option>
          <option value="Save">Guardar</option>
          <option value="Upload">Subir</option>
          <option value="Download">Descargar</option>
          <option value="Plus">Agregar</option>
          <option value="Minus">Quitar</option>
          <option value="Edit">Editar</option>
          <option value="Delete">Eliminar</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="localComponent.loading"
            type="checkbox"
            @change="updateComponent"
          />
          Estado de Carga
        </label>
      </div>
    </div>
    
    <div v-if="component.type === 'page'" class="editor-section">
      <h4>Propiedades de Página</h4>
      
      <div class="form-group">
        <label class="form-label">Título</label>
        <input
          v-model="localComponent.title"
          type="text"
          class="form-input"
          placeholder="Título de la página"
          @input="updateComponent"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Descripción</label>
        <textarea
          v-model="localComponent.description"
          class="form-textarea"
          rows="2"
          placeholder="Descripción de la página"
          @input="updateComponent"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label">Diseño</label>
        <select
          v-model="localComponent.layout"
          class="form-select"
          @change="updateComponent"
        >
          <option value="single">Página Única</option>
          <option value="tabs">Pestañas</option>
          <option value="accordion">Acordeón</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="localComponent.showNavigation"
            type="checkbox"
            @change="updateComponent"
          />
          Mostrar Navegación
        </label>
      </div>
      
      <div v-if="localComponent.showNavigation" class="form-row">
        <div class="form-group">
          <label class="form-label">Texto Botón Anterior</label>
          <input
            v-model="localComponent.previousButtonText"
            type="text"
            class="form-input"
            placeholder="Anterior"
            @input="updateComponent"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">Texto Botón Siguiente</label>
          <input
            v-model="localComponent.nextButtonText"
            type="text"
            class="form-input"
            placeholder="Siguiente"
            @input="updateComponent"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FormComponent } from '@/types/form-builder';

interface Props {
  component: FormComponent;
}

interface Emits {
  (e: 'update', component: FormComponent): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localComponent = ref<FormComponent>({ ...props.component });

const fieldType = ref<string>(props.component.type);

watch(() => props.component, (newComponent) => {
  localComponent.value = { ...newComponent };
  fieldType.value = newComponent.type;
}, { deep: true });

function updateComponent() {
  emit('update', { ...localComponent.value });
}

function changeFieldType() {
  const updatedComponent = {
    ...localComponent.value,
    type: fieldType.value as any
  };
  
  // Limpiar propiedades específicas del tipo anterior
  if (fieldType.value === 'number') {
    delete updatedComponent.maxLength;
    delete updatedComponent.minLength;
    delete updatedComponent.pattern;
  } else if (['text', 'email', 'password'].includes(fieldType.value)) {
    delete updatedComponent.min;
    delete updatedComponent.max;
    delete updatedComponent.step;
  } else if (fieldType.value === 'textarea') {
    delete updatedComponent.maxLength;
    delete updatedComponent.minLength;
    delete updatedComponent.pattern;
    delete updatedComponent.min;
    delete updatedComponent.max;
    delete updatedComponent.step;
  }
  
  localComponent.value = updatedComponent;
  emit('update', updatedComponent);
}

function addOption() {
  if (localComponent.value.type === 'combobox') {
    localComponent.value.options.push({
      label: 'Nueva Opción',
      value: `option_${Date.now()}`,
      disabled: false
    });
    updateComponent();
  }
}

function removeOption(index: number) {
  if (localComponent.value.type === 'combobox') {
    localComponent.value.options.splice(index, 1);
    updateComponent();
  }
}

function addColumn() {
  if (localComponent.value.type === 'table') {
    localComponent.value.columns.push({
      id: `col_${Date.now()}`,
      label: 'Nueva Columna',
      type: 'text',
      width: 'auto',
      required: false
    });
    updateComponent();
  }
}

function removeColumn(index: number) {
  if (localComponent.value.type === 'table') {
    localComponent.value.columns.splice(index, 1);
    updateComponent();
  }
}
</script>

<style scoped>
.attributes-editor {
  padding: 16px;
}

.editor-section {
  margin-bottom: 24px;
}

.editor-section h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 4px;
}

.form-group {
  margin-bottom: 12px;
}

.form-row {
  display: flex;
  gap: 8px;
}

.form-row .form-group {
  flex: 1;
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

.color-input {
  height: 32px;
  padding: 2px;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #495057;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

.options-list,
.columns-list {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 8px;
  background-color: #f8f9fa;
}

.option-item,
.column-item {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 8px;
  padding: 6px;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.option-item:last-child,
.column-item:last-child {
  margin-bottom: 0;
}

.option-item .form-input,
.column-item .form-input {
  flex: 1;
  margin-bottom: 0;
}

.option-item .form-select,
.column-item .form-select {
  flex: 1;
  margin-bottom: 0;
}

.remove-button {
  width: 24px;
  height: 24px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.remove-button:hover {
  background-color: #c82333;
}

.add-option-button,
.add-column-button {
  width: 100%;
  padding: 8px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 8px;
}

.add-option-button:hover,
.add-column-button:hover {
  background-color: #218838;
}
</style>
