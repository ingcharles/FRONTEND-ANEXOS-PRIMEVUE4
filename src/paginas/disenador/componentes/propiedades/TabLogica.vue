<script setup lang="ts">
import { computed } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { ReglaLogica } from '@/interfaces/Validacion'
import { generarId } from '@/utilidades/GeneraId'
import type { OpcionAccion, OpcionOperador, PropiedadesTabLogica } from '@/interfaces/Propiedades'
import type { EsquemaCampo } from '@/interfaces/Campos'
import { ServicioEsquemasFormulario } from '@/servicios/disenador/ServicioEsquemas'

// Props del componente
defineProps<PropiedadesTabLogica>()

// Servicios
const servicioEsquemas = new ServicioEsquemasFormulario()

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

// Computed para obtener todos los campos disponibles
const camposDisponibles = computed(() => {
  const todosCampos: Array<{ etiqueta: string; valor: string }> = []

  // Obtener todos los campos de todas las páginas
  for (const pagina of almacen.esquemaFormulario.paginas) {
    const camposAplanados = servicioEsquemas.aplanarCampos(pagina.campos, [])

    for (const campo of camposAplanados) {
      // Excluir el campo actual para evitar auto-referencias
      if (campo.nombre && campo.id !== campoSeleccionado.value?.id) {
        todosCampos.push({
          etiqueta: `${campo.etiqueta || campo.nombre} (${campo.nombre})`,
          valor: campo.id // Usar ID del campo, no el nombre
        })
      }
    }
  }

  return todosCampos.sort((a, b) => a.etiqueta.localeCompare(b.etiqueta))
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

function obtenerNombreCampo(campoId: string): string {
  // Buscar el campo por ID en todas las páginas
  for (const pagina of almacen.esquemaFormulario.paginas) {
    const camposAplanados = servicioEsquemas.aplanarCampos(pagina.campos, [])
    const campo = camposAplanados.find(c => c.id === campoId)
    if (campo) {
      // Usar el mismo formato que en el select: "Etiqueta (nombre)"
      return `${campo.etiqueta || campo.nombre} (${campo.nombre})`
    }
  }
  return `Campo no encontrado (${campoId})`
}

function obtenerTextoOperador(operador: ReglaLogica['operador']): string {
  const operadorConfig = opcionesOperadores.find(op => op.valor === operador)
  const textoOperador = operadorConfig ? operadorConfig.etiqueta.toLowerCase() : operador
  return ` ${textoOperador} ` // Agregar espacios antes y después
}

function obtenerTextoAccion(accion: ReglaLogica['accion']): string {
  switch (accion) {
    case 'mostrar': return 'mostrar'
    case 'ocultar': return 'ocultar'
    case 'requerir': return 'hacer requerido'
    case 'opcional': return 'hacer opcional'
    default: return accion
  }
}
</script>

<template>
  <div class="flex flex-column gap-4">
    <!-- Botón para agregar nueva regla -->
    <div class="flex justify-content-end">
      <PrimeButton label="Añadir regla" icon="pi pi-plus" size="small" @click="agregarReglaLogica" class="shadow-1" />
    </div>

    <!-- Estado vacío -->
    <div v-if="reglasLogica.length === 0" class="text-center p-6 surface-50 border-round-lg border-1 surface-border">
      <i class="pi pi-sitemap text-4xl text-primary mb-3"></i>
      <p class="contenido m-0 font-semibold">No hay reglas de lógica configuradas</p>
      <small class="text-500 mt-2 block">
        Las reglas de lógica permiten mostrar/ocultar campos y hacerlos requeridos según los valores de otros campos
      </small>
      <PrimeButton label="Crear Primera Regla" icon="pi pi-plus" size="small" class="mt-3"
        @click="agregarReglaLogica" />
    </div>

    <!-- Lista de reglas existentes -->
    <div v-for="(regla, indice) in reglasLogica" :key="regla.id" class="surface-0 border-round-lg p-4 shadow-1"
      style="border: 1px solid var(--surface-200);">

      <!-- Header de la regla -->
      <div class="flex align-items-center justify-content-between mb-3 pb-2"
        style="border-bottom: 1px solid var(--surface-100);">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-arrow-right text-primary"></i>
          <span class="font-semibold text-700">Regla {{ indice + 1 }}</span>
        </div>
        <PrimeButton icon="pi pi-trash" severity="danger" size="small" text rounded
          @click="eliminarReglaLogica(regla.id)" v-tooltip.top="'Eliminar regla'" />
      </div>

      <!-- Configuración principal de la regla -->
      <div class="grid align-items-end">
        <!-- Campo objetivo -->
        <div class="col-12">
          <label class="texto-miga">Campo</label>
          <PrimeSelect v-model="regla.campoCondicionId" :options="camposDisponibles" option-label="etiqueta"
            option-value="valor" class="ancho-100 texto-miga" placeholder="Seleccionar campo..." :filter="true"
            filter-placeholder="Buscar campo..." />
        </div>

        <!-- Operador de comparación -->
        <div class="col-12">
          <label class="texto-miga">Operador</label>
          <PrimeSelect v-model="regla.operador" :options="opcionesOperadores" option-label="etiqueta"
            option-value="valor" class="ancho-100 texto-miga" placeholder="Seleccionar operador..." />
        </div>

        <!-- Valor de comparación -->
        <div class="col-12">
          <label class="texto-miga">Valor</label>
          <PrimeInputText :model-value="String(regla.valor || '')"
            @update:model-value="regla.valor = ($event || '') as string | number | boolean | Date"
            class="ancho-100 texto-miga" placeholder="Valor de comparación..."
            :disabled="esOperadorPersonalizado(regla.operador)" />
          <small v-if="esOperadorPersonalizado(regla.operador)" class="text-500 mt-1 block">
            Para operadores personalizados, usa la expresión JavaScript abajo
          </small>
        </div>

        <!-- Acción a ejecutar -->
        <div class="col-12">
          <label class="texto-miga">Acción</label>
          <PrimeSelect v-model="regla.accion" :options="opcionesAcciones" option-label="etiqueta" option-value="valor"
            class="ancho-100 texto-miga" placeholder="Seleccionar acción..." />
        </div>
      </div>

      <!-- Expresión personalizada para operadores custom -->
      <div v-if="esOperadorPersonalizado(regla.operador)" class="mt-3 p-3 surface-50 border-round">
        <label class="texto-miga">
          <i class="pi pi-code mr-2"></i>Expresión personalizada
        </label>
        <PrimeTextarea v-model="regla.expresion" rows="3" class="ancho-100 texto-miga"
          placeholder="Escribir expresión JavaScript..." />
        <small class=" mt-1">
          Ejemplo: campo.valor > 18 && campo.visible === true
        </small>
      </div>

      <!-- Resumen de la regla -->
      <div class="mt-3 p-3 surface-50 border-round text-sm">
        <i class="pi pi-info-circle text-primary mr-2"></i>
        <span class="text-600">
          <strong>Si</strong> el campo
          <span class="text-primary font-semibold">{{ obtenerNombreCampo(regla.campoCondicionId) }}</span><strong>{{
            obtenerTextoOperador(regla.operador) }}</strong><span class="text-primary font-semibold">"{{ regla.valor
            }}"</span>
          <strong> entonces {{ obtenerTextoAccion(regla.accion) }}</strong> este campo.
        </span>
      </div>
    </div>
  </div>
</template>
