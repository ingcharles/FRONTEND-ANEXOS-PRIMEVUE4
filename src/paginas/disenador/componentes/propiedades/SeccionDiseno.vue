<template>
    <h3 class="tamanio-fuente-miga text-color mb-2">Ancho dispositivo</h3>
    <div class="grid">
      <div class="col-12">
        <label class="tamanio-fuente-miga">Pequeño</label>
        <PrimeSelect :model-value="campo?.grid?.sm ?? 12" :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
          class="tamanio-fuente-miga ancho-100"
          @update:model-value="(v: number | null) => actualizarGrid({ sm: Number(v ?? 12) })" />
      </div>

      <div class="col-12">
        <label class="tamanio-fuente-miga">Mediano</label>
        <PrimeSelect :model-value="campo?.grid?.md ?? 6" :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
          class="ancho-100 tamanio-fuente-miga"
          @update:model-value="(v: number | null) => actualizarGrid({ md: Number(v ?? 6) })" />
      </div>

      <div class="col-12">
        <label class="tamanio-fuente-miga">Grande</label>
        <PrimeSelect :model-value="campo?.grid?.lg ?? 6" :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
          class="ancho-100 tamanio-fuente-miga"
          @update:model-value="(v: number | null) => actualizarGrid({ lg: Number(v ?? 6) })" />
      </div>
    </div>



  <PrimeDivider class="my-3" />
</template>

<script setup lang="ts">
// import { computed } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { ColumnasGrid } from '@/interfaces/Comunes'

const props = defineProps<{
  campo: EsquemaCampo | null
}>()

const almacen = useAlmacenDisenador()

// const tamanosGrid = [
//   { clave: 'sm', etiqueta: 'Pequeño', defecto: 12 },
//   { clave: 'md', etiqueta: 'Mediano', defecto: 6 },
//   { clave: 'lg', etiqueta: 'Grande', defecto: 6 }
// ];

// const opcionesGrid = [1,2,3,4,5,6,7,8,9,10,11,12];

// Grid responsivo
function actualizarGrid(parcial: Partial<ColumnasGrid>): void {
  if (!props.campo) return
  const gridActual = props.campo.grid || { sm: 12, md: 12, lg: 12 }
  const nuevoGrid = { ...gridActual, ...parcial }
  almacen.actualizarCampo(props.campo.id, { grid: nuevoGrid })
}

// // Clases CSS personalizadas
// function obtenerClasesPersonalizadas(): string {
//   const meta = metadatos.value as Record<string, unknown>
//   return typeof meta.clasesPersonalizadas === 'string' ? meta.clasesPersonalizadas : ''
// }

// function actualizarClasesPersonalizadas(clases: string): void {
//   if (!props.campo) return
//   const meta = { ...metadatos.value } as Record<string, unknown>
//   meta.clasesPersonalizadas = clases
//   almacen.actualizarCampo(props.campo.id, { metadatos: meta })
// }

// // Estilos inline
// function obtenerEstilosInline(): string {
//   const meta = metadatos.value as Record<string, unknown>
//   return typeof meta.estilosInline === 'string' ? meta.estilosInline : ''
// }

// function actualizarEstilosInline(estilos: string): void {
//   if (!props.campo) return
//   const meta = { ...metadatos.value } as Record<string, unknown>
//   meta.estilosInline = estilos
//   almacen.actualizarCampo(props.campo.id, { metadatos: meta })
// }
</script>
