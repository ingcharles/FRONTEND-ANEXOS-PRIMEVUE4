<!-- Componente para configurar opciones de selección (select, radio, checkbox) -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { OpcionSeleccion } from '@/interfaces/Comunes'

interface PropiedadesOpciones {
  campo: EsquemaCampo
}

const props = defineProps<PropiedadesOpciones>()
const emit = defineEmits<{
  actualizarOpciones: [opciones: OpcionSeleccion[]]
}>()

const nuevaOpcion = ref({ etiqueta: '', valor: '' })

const opcionesActuales = computed<OpcionSeleccion[]>(() => {
  if (!props.campo.metadatos?.opciones) return []
  return Array.isArray(props.campo.metadatos.opciones) ? props.campo.metadatos.opciones : []
})

const tieneOpciones = computed(() =>
  ['seleccion', 'radio', 'casilla'].includes(props.campo.tipo)
)

function agregarOpcion(): void {
  if (!nuevaOpcion.value.etiqueta.trim() || !nuevaOpcion.value.valor.toString().trim()) {
    return
  }

  const opcionesNuevas = [
    ...opcionesActuales.value,
    {
      etiqueta: nuevaOpcion.value.etiqueta.trim(),
      valor: nuevaOpcion.value.valor.toString().trim()
    }
  ]

  emit('actualizarOpciones', opcionesNuevas)

  // Limpiar formulario
  nuevaOpcion.value = { etiqueta: '', valor: '' }
}

function eliminarOpcion(indice: number): void {
  const opcionesNuevas = opcionesActuales.value.filter((_, i) => i !== indice)
  emit('actualizarOpciones', opcionesNuevas)
}

function actualizarOpcion(indice: number, campo: keyof OpcionSeleccion, valor: string | number | undefined): void {
  if (valor === undefined) return

  const opcionesNuevas = [...opcionesActuales.value]
  opcionesNuevas[indice] = {
    ...opcionesNuevas[indice],
    [campo]: valor
  }
  emit('actualizarOpciones', opcionesNuevas)
}

interface EventoDragDrop {
  moved?: {
    oldIndex: number
    newIndex: number
  }
}

function manejarCambioDragDrop(evento: EventoDragDrop): void {
  if (evento.moved) {
    const opcionesNuevas = [...opcionesActuales.value]
    const [elemento] = opcionesNuevas.splice(evento.moved.oldIndex, 1)
    opcionesNuevas.splice(evento.moved.newIndex, 0, elemento)
    emit('actualizarOpciones', opcionesNuevas)
  }
}

function generarOpcionesPorDefecto(): void {
  const opcionesPorDefecto: OpcionSeleccion[] = [
    { etiqueta: 'Opción 1', valor: 'opcion-1' },
    { etiqueta: 'Opción 2', valor: 'opcion-2' },
    { etiqueta: 'Opción 3', valor: 'opcion-3' }
  ]
  emit('actualizarOpciones', opcionesPorDefecto)
}
</script>

<template>
  <div v-if="tieneOpciones" class="configuracion-opciones p-4 border-round border-1 surface-border">
    <div class="flex justify-content-between align-items-center mb-3">
      <h4 class="text-base negrilla m-0">Opciones de selección</h4>
      <PrimeButton
        v-if="opcionesActuales.length === 0"
        label="Generar opciones"
        icon="pi pi-plus"
        size="small"
        text
        @click="generarOpcionesPorDefecto"
      />
    </div>

    <!-- Lista de opciones existentes -->
    <div v-if="opcionesActuales.length > 0" class="opciones-existentes mb-4">
      <draggable
        v-model="opcionesActuales"
        item-key="valor"
        handle=".handle-ordenar"
        @change="manejarCambioDragDrop"
      >
        <template #item="{ element: opcion, index }">
          <div class="opcion-item flex align-items-center gap-2 p-2 mb-2 border-round surface-ground">
            <i class="pi pi-bars handle-ordenar cursor-move text-muted-color"></i>

            <div class="flex-1 grid">
              <div class="col-6">
                <PrimeInputText
                  :model-value="opcion.etiqueta"
                  placeholder="Etiqueta"
                  class="ancho-100 texto-miga"
                  @update:model-value="(valor) => valor && actualizarOpcion(index, 'etiqueta', valor)"
                />
              </div>
              <div class="col-6">
                <PrimeInputText
                  :model-value="opcion.valor.toString()"
                  placeholder="Valor"
                  class="ancho-100 texto-miga"
                  @update:model-value="(valor) => valor && actualizarOpcion(index, 'valor', valor)"
                />
              </div>
            </div>

            <PrimeButton
              icon="pi pi-trash"
              size="small"
              text
              severity="danger"
              @click="eliminarOpcion(index)"
            />
          </div>
        </template>
      </draggable>
    </div>

    <!-- Formulario para agregar nueva opción -->
    <div class="agregar-opcion border-top-1 surface-border pt-3">
      <div class="grid">
        <div class="col-5">
          <PrimeInputText
            v-model="nuevaOpcion.etiqueta"
            placeholder="Etiqueta de la opción"
            class="ancho-100 texto-miga"
            @keydown.enter="agregarOpcion"
          />
        </div>
        <div class="col-5">
          <PrimeInputText
            v-model="nuevaOpcion.valor"
            placeholder="Valor técnico"
            class="ancho-100 texto-miga"
            @keydown.enter="agregarOpcion"
          />
        </div>
        <div class="col-2">
          <PrimeButton
            icon="pi pi-plus"
            label="Agregar"
            size="small"
            class="ancho-100 texto-miga"
            :disabled="!nuevaOpcion.etiqueta.trim() || !nuevaOpcion.valor.toString().trim()"
            @click="agregarOpcion"
          />
        </div>
      </div>
    </div>

    <!-- Información de ayuda -->
    <div class="mt-3">
      <small class="text-muted-color">
        <i class="pi pi-info-circle mr-1"></i>
        La etiqueta es lo que ve el usuario, el valor es lo que se envía con el formulario.
        Puedes arrastrar las opciones para reordenarlas.
      </small>
    </div>
  </div>
</template>

<style scoped>
.configuracion-opciones {
  background: var(--surface-ground);
}

.opcion-item {
  border: 1px solid var(--surface-border);
  transition: all 0.2s;
}

.opcion-item:hover {
  background: var(--surface-hover);
}

.handle-ordenar {
  cursor: grab;
}

.handle-ordenar:active {
  cursor: grabbing;
}

.text-muted-color {
  color: var(--text-color-secondary);
}

.cursor-move {
  cursor: move;
}
</style>
