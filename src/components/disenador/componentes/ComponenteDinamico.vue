<template>
  <div class="componente-dinamico h-full" :class="clasesContenedor">
    <!-- Input de texto -->
    <template v-if="['text', 'email', 'password', 'number', 'url', 'tel'].includes(elemento.type)">
      <label v-if="mostrarLabel" :for="elemento.id" class="etiqueta-campo">
        {{ elemento.label }}
        <span v-if="elemento.required" class="texto-requerido">*</span>
      </label>
      <InputText
        :id="elemento.id"
        :placeholder="elemento.placeholder"
        :disabled="elemento.disabled || modo === 'diseno'"
        :readonly="elemento.readonly"
        :type="elemento.type"
        :value="valorInterno"
        :class="clasesCampo"
        @input="manejarInput"
      />
    </template>

    <!-- Área de texto -->
    <template v-else-if="elemento.type === 'textarea'">
      <label v-if="mostrarLabel" :for="elemento.id" class="etiqueta-campo">
        {{ elemento.label }}
        <span v-if="elemento.required" class="texto-requerido">*</span>
      </label>
      <Textarea
        :id="elemento.id"
        :placeholder="elemento.placeholder"
        :disabled="elemento.disabled || modo === 'diseno'"
        :readonly="elemento.readonly"
        :value="valorInterno as string"
        :rows="elemento.properties?.rows || 3"
        :class="clasesCampo"
        @input="manejarInput"
      />
    </template>

    <!-- Select/Dropdown -->
    <template v-else-if="elemento.type === 'select'">
      <label v-if="mostrarLabel" :for="elemento.id" class="etiqueta-campo">
        {{ elemento.label }}
        <span v-if="elemento.required" class="texto-requerido">*</span>
      </label>
      <Dropdown
        :id="elemento.id"
        :placeholder="elemento.placeholder || 'Selecciona una opción'"
        :disabled="elemento.disabled || modo === 'diseno'"
        :options="opciones"
        option-label="label"
        option-value="value"
        :value="valorInterno"
        :class="clasesCampo"
        @change="manejarInput"
      />
    </template>

    <!-- Checkbox -->
    <template v-else-if="elemento.type === 'checkbox'">
      <div class="checkbox-wrapper">
        <Checkbox
          :id="elemento.id"
          :disabled="elemento.disabled || modo === 'diseno'"
          :binary="true"
          :value="valorInterno"
          :class="clasesCampo"
          @change="manejarInput"
        />
        <label v-if="mostrarLabel" :for="elemento.id" class="etiqueta-checkbox">
          {{ elemento.label }}
          <span v-if="elemento.required" class="texto-requerido">*</span>
        </label>
      </div>
    </template>

    <!-- Radio Group -->
    <template v-else-if="elemento.type === 'radio'">
      <fieldset class="radio-fieldset">
        <legend v-if="mostrarLabel" class="etiqueta-campo">
          {{ elemento.label }}
          <span v-if="elemento.required" class="texto-requerido">*</span>
        </legend>
        <div class="radio-group" :class="{ 'radio-inline': elemento.properties?.inline }">
          <div
            v-for="opcion in opciones"
            :key="String(opcion.value)"
            class="radio-item"
          >
            <RadioButton
              :id="`${elemento.id}_${opcion.value}`"
              :value="opcion.value"
              :disabled="elemento.disabled || modo === 'diseno'"
              :name="elemento.id"
              :checked="valorInterno === opcion.value"
              @change="manejarInput"
            />
            <label :for="`${elemento.id}_${opcion.value}`" class="etiqueta-radio">
              {{ opcion.label }}
            </label>
          </div>
        </div>
      </fieldset>
    </template>

    <!-- File Upload -->
    <template v-else-if="elemento.type === 'file'">
      <label v-if="mostrarLabel" :for="elemento.id" class="etiqueta-campo">
        {{ elemento.label }}
        <span v-if="elemento.required" class="texto-requerido">*</span>
      </label>
      <FileUpload
        :id="elemento.id"
        mode="basic"
        :disabled="elemento.disabled || modo === 'diseno'"
        :multiple="elemento.properties?.multiple || false"
        :accept="elemento.properties?.accept"
        :max-file-size="elemento.properties?.maxFileSize"
        :class="clasesCampo"
        @select="manejarInput"
      />
    </template>

    <!-- Date/DateTime -->
    <template v-else-if="['date', 'datetime', 'time'].includes(elemento.type)">
      <label v-if="mostrarLabel" :for="elemento.id" class="etiqueta-campo">
        {{ elemento.label }}
        <span v-if="elemento.required" class="texto-requerido">*</span>
      </label>
      <Calendar
        :id="elemento.id"
        :disabled="elemento.disabled || modo === 'diseno'"
        :show-time="elemento.type === 'datetime' || elemento.type === 'time'"
        :time-only="elemento.type === 'time'"
        :value="valorInterno"
        :placeholder="elemento.placeholder"
        :class="clasesCampo"
        @date-select="manejarInput"
      />
    </template>

    <!-- Buttons -->
    <template v-else-if="['button', 'submit', 'reset'].includes(elemento.type)">
      <Button
        :id="elemento.id"
        :label="elemento.label"
        :disabled="elemento.disabled || modo === 'diseno'"
        :severity="severidadBoton"
        :type="elemento.type === 'submit' ? 'submit' : elemento.type === 'reset' ? 'button' : 'button'"
        :class="clasesCampo"
        @click="manejarClick"
      />
    </template>

    <!-- Divisor -->
    <template v-else-if="elemento.type === 'divider'">
      <Divider
        :type="elemento.properties?.orientation || 'horizontal'"
        :class="clasesCampo"
      />
    </template>

    <!-- HTML/Texto estático -->
    <template v-else-if="elemento.type === 'html'">
      <div
        class="contenido-html"
        :class="clasesCampo"
        v-html="elemento.properties?.content || elemento.label"
      ></div>
    </template>

    <!-- Spacer -->
    <template v-else-if="elemento.type === 'spacer'">
      <div
        class="spacer"
        :style="{ height: `${elemento.properties?.height || 20}px` }"
      ></div>
    </template>

    <!-- Tipo no soportado -->
    <template v-else>
      <div class="campo-no-soportado bg-gray-100 border border-gray-300 rounded p-2 text-center">
        <i class="pi pi-exclamation-triangle text-yellow-500 mb-1"></i>
        <p class="text-sm text-gray-600">Tipo no soportado: {{ elemento.type }}</p>
      </div>
    </template>

    <!-- Mensaje de error -->
    <small v-if="errorMensaje && modo !== 'diseno'" class="error-mensaje p-error">
      {{ errorMensaje }}
    </small>

    <!-- Texto de ayuda -->
    <small v-if="elemento.helpText && modo !== 'diseno'" class="texto-ayuda">
      {{ elemento.helpText }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FieldSchema, ComboOption } from '@/types/disenador'

// Componentes PrimeVue
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import RadioButton from 'primevue/radiobutton'
import FileUpload from 'primevue/fileupload'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'
import Divider from 'primevue/divider'

// Props
interface Props {
  elemento: FieldSchema
  modo?: 'diseno' | 'preview' | 'runtime'
  errorMensaje?: string
  modelValue?: unknown
}

const props = withDefaults(defineProps<Props>(), {
  modo: 'diseno',
  modelValue: undefined
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  input: [value: unknown]
  click: [event: Event]
}>()

// Estado local
const valorInterno = ref<unknown>(props.modelValue ?? props.elemento.defaultValue ?? '')

// Computed
const mostrarLabel = computed(() =>
  props.elemento.label && !['button', 'submit', 'reset', 'checkbox'].includes(props.elemento.type)
)

const opciones = computed((): ComboOption[] => {
  if (props.elemento.options) {
    return props.elemento.options
  }

  // Opciones por defecto para algunos tipos
  if (props.elemento.type === 'radio' || props.elemento.type === 'select') {
    return [
      { value: 'opcion1', label: 'Opción 1' },
      { value: 'opcion2', label: 'Opción 2' },
      { value: 'opcion3', label: 'Opción 3' }
    ]
  }

  return []
})

const severidadBoton = computed(() => {
  if (props.elemento.type === 'submit') return 'primary'
  if (props.elemento.type === 'reset') return 'secondary'
  return props.elemento.properties?.severity || 'primary'
})

const clasesContenedor = computed(() => ({
  'campo-requerido': props.elemento.required,
  'campo-deshabilitado': props.elemento.disabled,
  'campo-readonly': props.elemento.readonly,
  'campo-error': props.errorMensaje,
  'modo-diseno': props.modo === 'diseno',
  'modo-preview': props.modo === 'preview',
  'modo-runtime': props.modo === 'runtime'
}))

const clasesCampo = computed(() => {
  const clases = ['w-full']

  if (props.elemento.properties?.customClass) {
    clases.push(props.elemento.properties.customClass)
  }

  if (props.errorMensaje) {
    clases.push('p-invalid')
  }

  return clases
})

// Watchers
watch(() => props.modelValue, (nuevoValor) => {
  valorInterno.value = nuevoValor ?? props.elemento.defaultValue ?? ''
})

watch(valorInterno, (nuevoValor) => {
  emit('update:modelValue', nuevoValor)
  emit('input', nuevoValor)
})

// Funciones
function manejarInput(event: Event | unknown): void {
  let valor: unknown

  if (event instanceof Event) {
    const target = event.target as HTMLInputElement

    switch (props.elemento.type) {
      case 'checkbox':
        valor = target.checked
        break
      case 'number':
        valor = target.value ? Number(target.value) : null
        break
      case 'file':
        valor = target.files
        break
      default:
        valor = target.value
    }
  } else {
    // Para componentes PrimeVue que emiten el valor directamente
    valor = event
  }

  valorInterno.value = valor
}

function manejarClick(event: Event): void {
  emit('click', event)
}

// Inicializar valor
if (props.modelValue !== undefined) {
  valorInterno.value = props.modelValue
} else if (props.elemento.defaultValue !== undefined) {
  valorInterno.value = props.elemento.defaultValue
}
</script>

<style scoped>
.componente-dinamico {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.etiqueta-campo {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  display: block;
}

.texto-requerido {
  color: #ef4444;
  margin-left: 0.125rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.etiqueta-checkbox {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
}

.radio-fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

.radio-fieldset legend {
  padding: 0;
  margin-bottom: 0.5rem;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-group.radio-inline {
  flex-direction: row;
  gap: 1rem;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.etiqueta-radio {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.error-mensaje {
  margin-top: 0.25rem;
  font-size: 0.75rem;
}

.texto-ayuda {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.campo-no-soportado {
  min-height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.contenido-html {
  line-height: 1.5;
}

.spacer {
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 5px,
    rgba(0, 0, 0, 0.1) 5px,
    rgba(0, 0, 0, 0.1) 10px
  );
  border-radius: 4px;
  opacity: 0.3;
}

/* Estados del componente */
.modo-diseno {
  pointer-events: none;
  position: relative;
}

.modo-diseno::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.01);
  z-index: 1;
}

.campo-deshabilitado {
  opacity: 0.6;
}

.campo-error .p-inputtext,
.campo-error .p-dropdown,
.campo-error .p-calendar input {
  border-color: #ef4444;
}

/* Responsive */
@media (max-width: 768px) {
  .radio-group.radio-inline {
    flex-direction: column;
    gap: 0.5rem;
  }

  .etiqueta-campo {
    font-size: 0.8rem;
  }

  .componente-dinamico {
    gap: 0.125rem;
  }
}
</style>
