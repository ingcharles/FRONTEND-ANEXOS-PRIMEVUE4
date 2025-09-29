<template>
  <div class="mb-2 mt-2">
    <h3 class="texto-sm text-color mb-2">Ancho dispositivo</h3>
    <div class="grid">
      <div class="col-12">
        <label class="texto-sm">Pequeño</label>
        <PrimeSelect :model-value="campo?.grid?.sm ?? 12" :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
          class="texto-sm ancho-100"
          @update:model-value="(v: number | null) => actualizarGrid({ sm: Number(v ?? 12) })" />
      </div>

      <div class="col-12">
        <label class="texto-sm">Mediano</label>
        <PrimeSelect :model-value="campo?.grid?.md ?? 6" :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
          class="ancho-100 texto-sm"
          @update:model-value="(v: number | null) => actualizarGrid({ md: Number(v ?? 6) })" />
      </div>

      <div class="col-12">
        <label class="texto-sm">Grande</label>
        <PrimeSelect :model-value="campo?.grid?.lg ?? 6" :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
          class="ancho-100 texto-sm"
          @update:model-value="(v: number | null) => actualizarGrid({ lg: Number(v ?? 6) })" />
      </div>
    </div>

    <!-- Clases CSS personalizadas -->
    <!-- <div class="field">
      <label class="block mb-1">Clases CSS</label>
      <PrimeInputText
        :model-value="obtenerClasesPersonalizadas()"
        placeholder="p-2 text-center border-round"
        @update:model-value="(v: string | undefined) => actualizarClasesPersonalizadas(v || '')"
      />
      <small class="text-muted-color">Clases CSS adicionales para el campo.</small>
    </div> -->

    <!-- Estilos inline -->
    <!-- <div class="field">
      <label class="block mb-1">Estilos CSS</label>
      <PrimeTextarea
        :model-value="obtenerEstilosInline()"
        rows="3"
        placeholder="color: #333; font-weight: bold;"
        @update:model-value="(v: string | undefined) => actualizarEstilosInline(v || '')"
      />
      <small class="text-muted-color">Estilos CSS inline para el campo.</small>
    </div> -->

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

// Metadatos tipados para diseño
// const metadatos = computed(() => {
//   if (!props.campo) return {}
//   return props.campo.metadatos || {}
// })

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
