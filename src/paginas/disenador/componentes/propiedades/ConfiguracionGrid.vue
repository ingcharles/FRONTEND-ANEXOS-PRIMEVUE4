<!-- Componente para configurar propiedades de grid responsivo -->
<script setup lang="ts">
import { computed } from 'vue'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { ColumnasGrid } from '@/interfaces/Comunes'

interface PropiedadesGrid {
  campo: EsquemaCampo
}

const props = defineProps<PropiedadesGrid>()
const emit = defineEmits<{
  actualizarGrid: [parcial: Partial<ColumnasGrid>]
}>()

const gridActual = computed<ColumnasGrid>(() => props.campo.grid ?? {})

const opcionesColumnas = [
  { etiqueta: '1 columna', valor: 1 },
  { etiqueta: '2 columnas', valor: 2 },
  { etiqueta: '3 columnas', valor: 3 },
  { etiqueta: '4 columnas', valor: 4 },
  { etiqueta: '6 columnas', valor: 6 },
  { etiqueta: '12 columnas', valor: 12 }
]

function actualizarBreakpoint(breakpoint: keyof ColumnasGrid, valor: number | undefined): void {
  emit('actualizarGrid', { [breakpoint]: valor })
}

function restablecerGrid(): void {
  emit('actualizarGrid', { sm: undefined, md: undefined, lg: undefined })
}

function aplicarPreset(preset: 'completo' | 'mitad' | 'tercio' | 'cuarto'): void {
  const presets: Record<string, ColumnasGrid> = {
    completo: { sm: 12, md: 12, lg: 12 },
    mitad: { sm: 12, md: 6, lg: 6 },
    tercio: { sm: 12, md: 6, lg: 4 },
    cuarto: { sm: 12, md: 6, lg: 3 }
  }

  emit('actualizarGrid', presets[preset])
}
</script>

<template>
  <div class="configuracion-grid p-4 border-1">
    <div class="flex justify-content-between align-items-center mb-3">
      <h4 class="text-base negrilla m-0">Diseño responsivo</h4>
      <PrimeButton label="Restablecer" icon="pi pi-refresh" class='boton-pequenio' @click="restablecerGrid" />
    </div>

    <!-- Presets rápidos -->
    <div class="presets-grid mb-3">
      <h5 class="tamanio-fuente-miga  mb-2">Presets comunes</h5>
      <div class="flex gap-2 flex-wrap">
        <PrimeButton label="Completo" @click="aplicarPreset('completo')" />
        <PrimeButton label="Mitad" @click="aplicarPreset('mitad')" />
        <PrimeButton label="Tercio" @click="aplicarPreset('tercio')" />
        <PrimeButton label="Cuarto" @click="aplicarPreset('cuarto')" />
      </div>
    </div>

    <!-- Configuración por breakpoint -->
    <div class="breakpoints-config">
      <h5 class="tamanio-fuente-miga  mb-3">Configuración por dispositivo</h5>

      <!-- Móvil (sm) -->
      <div class="breakpoint-config mb-3">
        <div class="flex align-items-center justify-content-between mb-2">
          <label for="configuracionResponsivoMovil" class="tamanio-fuente-miga ">
            <i class="pi pi-mobile mr-1"></i>
            Móvil (sm)
          </label>
          <span class="text-xs color-negro">&lt; 768px</span>
        </div>
        <PrimeSelect :model-value="gridActual.sm" :options="opcionesColumnas" option-label="etiqueta"
          option-value="valor" placeholder="Auto" class="ancho-100 tamanio-fuente-miga"
          @update:model-value="(valor: number | undefined) => actualizarBreakpoint('sm', valor)" />
      </div>

      <!-- Tablet (md) -->
      <div class="breakpoint-config mb-3">
        <div class="flex align-items-center justify-content-between mb-2">
          <label for="configuracionResponsivoTableta" class="tamanio-fuente-miga ">
            <i class="pi pi-tablet mr-1"></i>
            Tableta (md)
          </label>
          <span class="text-xs color-negro">768px - 1024px</span>
        </div>
        <PrimeSelect :model-value="gridActual.md" :options="opcionesColumnas" option-label="etiqueta"
          option-value="valor" placeholder="Auto" class="ancho-100 tamanio-fuente-miga"
          @update:model-value="(valor: number | undefined) => actualizarBreakpoint('md', valor)" />
      </div>

      <!-- Desktop (lg) -->
      <div class="breakpoint-config mb-3">
        <div class="flex align-items-center justify-content-between mb-2">
          <label for="configuracionResponsivoEscritorio" class="tamanio-fuente-miga ">
            <i class="pi pi-desktop mr-1"></i>
            Escritorio (lg)
          </label>
          <span class="text-xs color-negro">&gt; 1024px</span>
        </div>
        <PrimeSelect :model-value="gridActual.lg" :options="opcionesColumnas" option-label="etiqueta"
          option-value="valor" placeholder="Auto" class="ancho-100 tamanio-fuente-miga"
          @update:model-value="(valor: number | undefined) => actualizarBreakpoint('lg', valor)" />
      </div>
    </div>

    <!-- Vista previa del grid -->
    <div class="vista-previa-grid mt-4 p-3 surface-ground">
      <h6 class="text-xs  mb-2">Vista previa</h6>
      <div class="grid-preview flex gap-1">
        <div v-for="n in 12" :key="n" class="grid-cell" :class="{
          'cell-ocupada': (gridActual.lg || gridActual.md || gridActual.sm || 12) >= n
        }" />
      </div>
      <div class="grid-info mt-2">
        <small class="color-negro">
          El campo ocupará
          {{ gridActual.lg || gridActual.md || gridActual.sm || 12 }}
          de 12 columnas disponibles
        </small>
      </div>
    </div>

    <!-- Información de ayuda -->
    <div class="mt-3">
      <small class="color-negro">
        <i class="pi pi-info-circle mr-1"></i>
        El sistema de grid usa 12 columnas. Configura cuántas columnas ocupa el campo en cada tipo de dispositivo.
      </small>
    </div>
  </div>
</template>

<style scoped>
.configuracion-grid {
  background: var(--surface-ground);
}

.breakpoint-config {
  border-bottom: 1px solid var(--surface-border);
  padding-bottom: 0.75rem;
}

.breakpoint-config:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.color-negro {
  color: var(--text-color-secondary);
}

.grid-preview {
  height: 20px;
}

.grid-cell {
  flex: 1;
  height: 100%;
  background: var(--surface-200);
  border-radius: 2px;
  transition: background-color 0.2s;
}

.cell-ocupada {
  background: var(--primary-color);
}

.grid-info {
  text-align: center;
}

.vista-previa-grid {
  border: 1px solid var(--surface-border);
}
</style>
