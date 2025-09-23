<!-- Componente para editar propiedades básicas de campos -->
<script setup lang="ts">
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { TipoCampo } from '@/tipos/Campos'
import { OPCIONES_TIPO_ESPANOL } from '@/constantes/Campos'
import { soportaPlaceholder } from '@/utilidades/Comunes'

interface PropiedadesBasicas {
  campo: EsquemaCampo
}

const props = defineProps<PropiedadesBasicas>()
const emit = defineEmits<{
  actualizarTexto: [clave: keyof Pick<EsquemaCampo, 'etiqueta' | 'nombre' | 'marcadorPosicion'>, valor: string]
  cambiarTipo: [nuevoTipo: TipoCampo]
  actualizarBooleano: [clave: keyof Pick<EsquemaCampo, 'visible' | 'requerido'>, valor: boolean]
}>()

function manejarCambioTexto(clave: keyof Pick<EsquemaCampo, 'etiqueta' | 'nombre' | 'marcadorPosicion'>, evento: Event): void {
  const objetivo = evento.target as HTMLInputElement
  emit('actualizarTexto', clave, objetivo.value)
}

function manejarCambioTipo(nuevoTipo: TipoCampo): void {
  emit('cambiarTipo', nuevoTipo)
}

function manejarCambioBooleano(clave: keyof Pick<EsquemaCampo, 'visible' | 'requerido'>, valor: boolean): void {
  emit('actualizarBooleano', clave, valor)
}
</script>

<template>
  <div class="propiedades-basicas p-4 border-round border-1 surface-border">
    <h3 class="text-lg font-semibold mb-3">Propiedades básicas</h3>

    <!-- Tipo de campo -->
    <div class="field mb-3">
      <label for="tipo-campo" class="block text-sm font-medium mb-2">Tipo de campo</label>
      <PrimeSelect
        id="tipo-campo"
        :model-value="props.campo.tipo"
        :options="[...OPCIONES_TIPO_ESPANOL]"
        option-label="etiqueta"
        option-value="valor"
        class="w-full"
        @update:model-value="manejarCambioTipo"
      />
    </div>

    <!-- Etiqueta -->
    <div class="field mb-3">
      <label for="etiqueta-campo" class="block text-sm font-medium mb-2">Etiqueta</label>
      <InputText
        id="etiqueta-campo"
        :model-value="props.campo.etiqueta || ''"
        class="w-full"
        placeholder="Etiqueta del campo"
        @input="(e) => manejarCambioTexto('etiqueta', e)"
      />
    </div>

    <!-- Nombre técnico -->
    <div class="field mb-3">
      <label for="nombre-campo" class="block text-sm font-medium mb-2">Nombre técnico</label>
      <InputText
        id="nombre-campo"
        :model-value="props.campo.nombre || ''"
        class="w-full"
        placeholder="nombre_campo"
        @input="(e) => manejarCambioTexto('nombre', e)"
      />
      <small class="text-muted-color">
        Nombre único para identificar el campo en el formulario
      </small>
    </div>

    <!-- Marcador de posición -->
    <div v-if="soportaPlaceholder(props.campo.tipo)" class="field mb-3">
      <label for="placeholder-campo" class="block text-sm font-medium mb-2">Marcador de posición</label>
      <InputText
        id="placeholder-campo"
        :model-value="props.campo.marcadorPosicion || ''"
        class="w-full"
        placeholder="Texto de ayuda para el usuario"
        @input="(e) => manejarCambioTexto('marcadorPosicion', e)"
      />
    </div>

    <!-- Propiedades booleanas -->
    <div class="field mb-3">
      <div class="flex align-items-center mb-2">
        <Checkbox
          :model-value="props.campo.visible ?? true"
          input-id="visible-campo"
          binary
          @update:model-value="(valor) => manejarCambioBooleano('visible', valor)"
        />
        <label for="visible-campo" class="ml-2">Visible</label>
      </div>

      <div class="flex align-items-center">
        <Checkbox
          :model-value="props.campo.requerido ?? false"
          input-id="requerido-campo"
          binary
          @update:model-value="(valor) => manejarCambioBooleano('requerido', valor)"
        />
        <label for="requerido-campo" class="ml-2">Requerido</label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.propiedades-basicas {
  background: var(--surface-ground);
}

.field {
  margin-bottom: 1rem;
}

.text-muted-color {
  color: var(--text-color-secondary);
}
</style>
