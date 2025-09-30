<!-- Componente para editar propiedades básicas de campos -->
<script setup lang="ts">
import type { EsquemaCampo } from '@/interfaces/Campos'
import { TipoCampoValor, TIPOS_OPCIONES } from '@/constantes/Campos'
import { ServicioCampos } from '@/servicios/disenador/ServiciosCampos'

interface PropiedadesBasicas {
  campo: EsquemaCampo
}

const props = defineProps<PropiedadesBasicas>()
const emit = defineEmits<{
  actualizarTexto: [clave: keyof Pick<EsquemaCampo, 'etiqueta' | 'nombre' | 'marcadorPosicion'>, valor: string]
  cambiarTipo: [nuevoTipo: TipoCampoValor]
  actualizarBooleano: [clave: keyof Pick<EsquemaCampo, 'visible' | 'requerido'>, valor: boolean]
}>()

function manejarCambioTexto(clave: keyof Pick<EsquemaCampo, 'etiqueta' | 'nombre' | 'marcadorPosicion'>, evento: Event): void {
  const objetivo = evento.target as HTMLInputElement
  emit('actualizarTexto', clave, objetivo.value)
}

function manejarCambioTipo(nuevoTipo: TipoCampoValor): void {
  emit('cambiarTipo', nuevoTipo)
}

function manejarCambioBooleano(clave: keyof Pick<EsquemaCampo, 'visible' | 'requerido'>, valor: boolean): void {
  emit('actualizarBooleano', clave, valor)
}
</script>

<template>
  <div class="propiedades-basicas p-4 border-round border-1 surface-border">
    <h3 class=" negrilla mb-3">Propiedades básicas</h3>

    <!-- Tipo de campo -->
    <div class="field mb-3">
      <label for="campo-tipo" class="block tamanio-fuente-miga  mb-2">Tipo de campo</label>
      <PrimeSelect id="campo-tipo" :model-value="props.campo.tipo" :options="[...TIPOS_OPCIONES]"
        option-label="etiqueta" option-value="valor" class="ancho-100 tamanio-fuente-miga"
        @update:model-value="manejarCambioTipo" />
    </div>

    <!-- Etiqueta -->
    <div class="field mb-3">
      <label for="campo-etiqueta" class="block tamanio-fuente-miga  mb-2">Etiqueta</label>
      <InputText id="campo-etiqueta" :model-value="props.campo.etiqueta || ''" class="ancho-100 tamanio-fuente-miga"
        placeholder="Etiqueta del campo" @input="(e: Event) => manejarCambioTexto('etiqueta', e)" />
    </div>

    <!-- Nombre técnico -->
    <div class="field mb-3">
      <label for="nombre-campo" class="block tamanio-fuente-miga  mb-2">Nombre técnico</label>
      <InputText id="nombre-campo" :model-value="props.campo.nombre || ''" class="ancho-100 tamanio-fuente-miga"
        placeholder="nombre_campo" @input="(e: Event) => manejarCambioTexto('nombre', e)" />
      <small class="text-muted-color">
        Nombre único para identificar el campo en el formulario
      </small>
    </div>

    <!-- Marcador de posición -->
    <div v-if="ServicioCampos.soportaPlaceholder(props.campo.tipo)" class="field mb-3">
      <label for="placeholder-campo" class="block tamanio-fuente-miga  mb-2">Marcador de posición</label>
      <InputText id="placeholder-campo" :model-value="props.campo.marcadorPosicion || ''"
        class="ancho-100 tamanio-fuente-miga" placeholder="Texto de ayuda para el usuario"
        @input="(e: Event) => manejarCambioTexto('marcadorPosicion', e)" />
    </div>

    <!-- Propiedades booleanas -->
    <div class="field mb-3">
      <div class="flex align-items-center mb-2">
        <Checkbox :model-value="props.campo.visible ?? true" input-id="campo-visible" binary
          @update:model-value="(valor: boolean) => manejarCambioBooleano('visible', valor)" />
        <label for="campo-visible" class="ml-2">Visible</label>
      </div>

      <div class="flex align-items-center">
        <Checkbox :model-value="props.campo.requerido ?? false" input-id="campo-requerido" binary
          @update:model-value="(valor: boolean) => manejarCambioBooleano('requerido', valor)" />
        <label for="campo-requerido" class="ml-2">Requerido</label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.propiedades-basicas {
  background: var(--surface-ground);
}

/* .field {
  margin-bottom: 1rem;
} */

.text-muted-color {
  color: var(--text-color-secondary);
}
</style>
