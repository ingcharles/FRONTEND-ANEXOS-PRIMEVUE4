<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { ReglaLogica } from '@/interfaces/Validacion'
import { generarId } from '@/utilidades/GeneraId'

// Tipos específicos para este componente
interface PropiedadesTabLogica {
  idCampo: string
}

interface OpcionOperador {
  etiqueta: string
  valor: ReglaLogica['operador']
}

interface OpcionAccion {
  etiqueta: string
  valor: ReglaLogica['accion']
}

// Props del componente
defineProps<PropiedadesTabLogica>()

// Almacén de estado
const almacen = useAlmacenDisenador()

// Estado computado
const campoSeleccionado = computed(() => almacen.campoSeleccionado)

const reglasLogica = computed<ReglaLogica[]>({
  get: () => campoSeleccionado.value?.logica ?? [],
  set: (nuevasReglas) => {
    if (campoSeleccionado.value) {
      almacen.actualizarCampo(campoSeleccionado.value.id, { logica: nuevasReglas })
    }
  },
})

// Opciones de configuración
const opcionesOperadores: OpcionOperador[] = [
  { etiqueta: 'Es igual a', valor: 'igual' },
  { etiqueta: 'No es igual a', valor: 'diferente' },
  { etiqueta: 'Contiene', valor: 'contiene' },
  { etiqueta: 'Mayor que', valor: 'mayor-que' },
  { etiqueta: 'Menor que', valor: 'menor-que' },
  { etiqueta: 'Personalizado', valor: 'personalizado' }
]

const opcionesAcciones: OpcionAccion[] = [
  { etiqueta: 'Mostrar', valor: 'mostrar' },
  { etiqueta: 'Ocultar', valor: 'ocultar' },
  { etiqueta: 'Requerir', valor: 'requerir' },
  { etiqueta: 'Opcional', valor: 'opcional' }
]

// Funciones de gestión
function crearNuevaRegla(): ReglaLogica {
  return {
    id: generarId('logic'),
    campoCondicionId: '',
    operador: 'igual',
    valor: '',
    accion: 'mostrar',
  }
}

function agregarReglaLogica(): void {
  const nuevaRegla = crearNuevaRegla()
  reglasLogica.value = [...reglasLogica.value, nuevaRegla]
}

function eliminarReglaLogica(idRegla: string): void {
  reglasLogica.value = reglasLogica.value.filter(regla => regla.id !== idRegla)
}

function esOperadorPersonalizado(operador: ReglaLogica['operador']): boolean {
  return operador === 'personalizado'
}
</script>

<template>
  <div class="flex flex-column gap-4">
    <!-- Botón para agregar nueva regla -->
    <div class="flex justify-content-end">
      <Button
        label="Añadir regla"
        icon="pi pi-plus"
        size="small"
        @click="agregarReglaLogica"
        class="shadow-1"
      />
    </div>

    <!-- Estado vacío -->
    <div
      v-if="reglasLogica.length === 0"
      class="text-center p-6 surface-50 border-round-lg border-1 surface-border"
    >
      <i class="pi pi-info-circle text-4xl text-500 mb-3"></i>
      <p class="text-600 m-0">No hay reglas de lógica configuradas</p>
      <small class="text-500">
        Añade reglas para controlar la visibilidad y comportamiento de campos
      </small>
    </div>

    <!-- Lista de reglas existentes -->
    <div
      v-for="regla in reglasLogica"
      :key="regla.id"
      class="surface-0 border-round-lg p-4 shadow-1"
      style="border: 1px solid var(--surface-200);"
    >
      <!-- Configuración principal de la regla -->
      <div class="grid align-items-end">
        <!-- Campo objetivo -->
        <div class="col-12 md:col-6 lg:col-3">
          <label class="block mb-2 text-700 font-medium">Campo</label>
          <InputText
            v-model="regla.campoCondicionId"
            class="w-full"
            placeholder="Seleccionar campo..."
          />
        </div>

        <!-- Operador de comparación -->
        <div class="col-12 md:col-6 lg:col-3">
          <label class="block mb-2 text-700 font-medium">Operador</label>
          <Select
            v-model="regla.operador"
            :options="opcionesOperadores"
            option-label="etiqueta"
            option-value="valor"
            class="w-full"
            placeholder="Seleccionar operador..."
          />
        </div>

        <!-- Valor de comparación -->
        <div class="col-12 md:col-6 lg:col-3">
          <label class="block mb-2 text-700 font-medium">Valor</label>
          <InputText
            :model-value="String(regla.valor || '')"
            @update:model-value="regla.valor = ($event || '') as string | number | boolean | Date"
            class="w-full"
            placeholder="Valor de comparación..."
          />
        </div>

        <!-- Acción a ejecutar -->
        <div class="col-12 md:col-6 lg:col-3">
          <label class="block mb-2 text-700 font-medium">Acción</label>
          <Select
            v-model="regla.accion"
            :options="opcionesAcciones"
            option-label="etiqueta"
            option-value="valor"
            class="w-full"
            placeholder="Seleccionar acción..."
          />
        </div>
      </div>

      <!-- Expresión personalizada para operadores custom -->
      <div
        v-if="esOperadorPersonalizado(regla.operador)"
        class="mt-3 p-3 surface-50 border-round"
      >
        <label class="block mb-2 text-700 font-medium">
          <i class="pi pi-code mr-2"></i>Expresión personalizada
        </label>
        <Textarea
          v-model="regla.expresion"
          rows="3"
          class="w-full"
          placeholder="Escribir expresión JavaScript..."
        />
        <small class="text-500 mt-1 block">
          Ejemplo: campo.valor > 18 && campo.visible === true
        </small>
      </div>

      <!-- Acciones de la regla -->
      <div class="flex justify-content-end mt-3 pt-3" style="border-top: 1px solid var(--surface-100);">
        <Button
          icon="pi pi-trash"
          severity="danger"
          size="small"
          outlined
          @click="eliminarReglaLogica(regla.id)"
          aria-label="Eliminar regla"
          class="hover:bg-red-50"
        />
      </div>
    </div>
  </div>
</template>

