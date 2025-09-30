<!-- Pestaña de atributos refactorizada - Principios SOLID aplicados -->
<script setup lang="ts">
import { computed } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { TipoCampo } from '@/tipos/Campos'
import type { ColumnasGrid, OpcionSeleccion } from '@/interfaces/Comunes'
import PropiedadesBasicas from './PropiedadesBasicas.vue'
import ConfiguracionOpciones from './ConfiguracionOpciones.vue'
import ConfiguracionGrid from './ConfiguracionGrid.vue'

interface PropiedadesPestanaAtributos {
  idCampo: string
}

defineProps<PropiedadesPestanaAtributos>()

const almacen = useAlmacenDisenador()

const campoSeleccionado = computed(() => almacen.campoSeleccionado)

/**
 * Manejar cambios en propiedades de texto
 */
function manejarActualizacionTexto(clave: keyof Pick<EsquemaCampo, 'etiqueta' | 'nombre' | 'marcadorPosicion'>, valor: string): void {
  if (!campoSeleccionado.value) return
  almacen.actualizarCampo(campoSeleccionado.value.id, { [clave]: valor })
}

/**
 * Manejar cambio de tipo de campo
 */
function manejarCambioTipo(nuevoTipo: TipoCampo): void {
  if (!campoSeleccionado.value) return

  const metadatosActuales = { ...(campoSeleccionado.value.metadatos ?? {}) }
  const metadatosPorDefecto = obtenerMetadatosPorDefecto(nuevoTipo)
  const metadatosFinales = metadatosPorDefecto ? { ...metadatosActuales, ...metadatosPorDefecto } : metadatosActuales

  almacen.actualizarCampo(campoSeleccionado.value.id, {
    tipo: nuevoTipo,
    metadatos: metadatosFinales
  })
}

/**
 * Manejar cambios en propiedades booleanas
 */
function manejarCambioBooleano(clave: keyof Pick<EsquemaCampo, 'visible' | 'requerido'>, valor: boolean): void {
  if (!campoSeleccionado.value) return
  almacen.actualizarCampo(campoSeleccionado.value.id, { [clave]: valor })
}

/**
 * Manejar cambios en configuración de grid
 */
function manejarActualizacionGrid(parcial: Partial<ColumnasGrid>): void {
  if (!campoSeleccionado.value) return
  const gridActual = campoSeleccionado.value.grid ?? {}
  almacen.actualizarCampo(campoSeleccionado.value.id, {
    grid: { ...gridActual, ...parcial }
  })
}

/**
 * Manejar cambios en opciones de selección
 */
function manejarActualizacionOpciones(opciones: OpcionSeleccion[]): void {
  if (!campoSeleccionado.value) return
  const metadatos = { ...(campoSeleccionado.value.metadatos ?? {}) }
  metadatos.opciones = opciones
  almacen.actualizarCampo(campoSeleccionado.value.id, { metadatos })
}

/**
 * Obtener metadatos por defecto para un tipo de campo
 */
function obtenerMetadatosPorDefecto(tipo: TipoCampo): Record<string, unknown> | undefined {
  const metadatosPorTipo: Record<TipoCampo, Record<string, unknown> | undefined> = {
    'seleccion': {
      opciones: [
        { etiqueta: 'Opción 1', valor: 'opcion-1' },
        { etiqueta: 'Opción 2', valor: 'opcion-2' }
      ]
    },
    'radio': {
      opciones: [
        { etiqueta: 'Opción 1', valor: 'opcion-1' },
        { etiqueta: 'Opción 2', valor: 'opcion-2' }
      ]
    },
    'casilla': { valorPorDefecto: false },
    'tabla': {
      columnas: [
        { nombre: 'col1', etiqueta: 'Columna 1', tipo: 'texto' },
        { nombre: 'col2', etiqueta: 'Columna 2', tipo: 'numero' }
      ],
      filas: 1,
      permitirAgregarFilas: true,
      mostrarResumen: true,
      etiquetaResumen: 'Total',
      estiloTabla: {
        conBordes: true,
        rayada: true,
        efectoHover: true,
        espaciado: 'md'
      }
    },
    // Tipos sin metadatos específicos
    'texto': undefined,
    'area-texto': undefined,
    'correo': undefined,
    'contrasena': undefined,
    'numero': undefined,
    'hora': undefined,
    'fecha': undefined,
    'etiqueta': undefined,
    'boton': undefined,
    'divisor': undefined,
    'panel': undefined,
  }

  return metadatosPorTipo[tipo]
}

const mostrarConfiguracionOpciones = computed(() => {
  if (!campoSeleccionado.value) return false
  return ['seleccion', 'radio', 'casilla'].includes(campoSeleccionado.value.tipo)
})

const mostrarConfiguracionGrid = computed(() => {
  if (!campoSeleccionado.value) return false
  // Todos los campos excepto divisor pueden tener configuración de grid
  return campoSeleccionado.value.tipo !== 'divisor'
})
</script>

<template>
  <div class="pestana-atributos">
    <div v-if="!campoSeleccionado" class="sin-campo-seleccionado p-4 text-center">
      <i class="pi pi-info-circle text-4xl text-muted-color mb-3"></i>
      <p class="text-muted-color m-0">
        Selecciona un campo para editar sus propiedades
      </p>
    </div>

    <div v-else class="contenido-atributos flex flex-column gap-3">
      <!-- Propiedades básicas -->
      <PropiedadesBasicas :campo="campoSeleccionado" @actualizar-texto="manejarActualizacionTexto"
        @cambiar-tipo="manejarCambioTipo" @actualizar-booleano="manejarCambioBooleano" />

      <!-- Configuración de opciones (para select, radio, checkbox) -->
      <ConfiguracionOpciones v-if="mostrarConfiguracionOpciones" :campo="campoSeleccionado"
        @actualizar-opciones="manejarActualizacionOpciones" />

      <!-- Configuración de grid responsivo -->
      <ConfiguracionGrid v-if="mostrarConfiguracionGrid" :campo="campoSeleccionado"
        @actualizar-grid="manejarActualizacionGrid" />

      <!-- Información de depuración (solo en desarrollo) -->
      <div v-if="import.meta.env.DEV" class="debug-info p-3 border-round surface-100">
        <details>
          <summary class="cursor-pointer tamanio-fuente-miga ">
            <i class="pi pi-code mr-1"></i>
            Información de depuración
          </summary>
          <pre class="text-xs mt-2 p-2 border-round surface-0">{{ JSON.stringify(campoSeleccionado, null, 2) }}</pre>
        </details>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* .pestana-atributos {
  height: 100%;
  overflow-y: auto;
}

.sin-campo-seleccionado {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.contenido-atributos {
  padding: 1rem;
}

.text-muted-color {
  color: var(--text-color-secondary);
}

.debug-info {
  border: 1px dashed var(--surface-border);
}

.debug-info pre {
  max-height: 200px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  line-height: 1.2;
} */
</style>
