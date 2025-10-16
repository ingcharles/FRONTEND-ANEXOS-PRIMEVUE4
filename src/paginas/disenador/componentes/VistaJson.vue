<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import { useToast } from 'primevue/usetoast'

// Composables y servicios
const almacen = useAlmacenDisenador()
const toast = useToast()
const inputArchivo = ref<HTMLInputElement | null>(null)

// Computed properties
const contenidoJson = computed(() => almacen.serializar())

// Función mejorada de importación
async function manejarImportacion(evento: Event): Promise<void> {
  const input = evento.target as HTMLInputElement
  const archivo = input.files?.[0]
  
  if (!archivo) return

  try {
    // Leer el archivo
    const texto = await archivo.text()
    
    // Intentar parsear para validar
    const json = JSON.parse(texto)
    
    // Deserializar en el almacén
    almacen.deserializar(texto)
    
    // Mostrar mensaje de éxito
    toast.add({
      severity: 'success',
      summary: 'Importación exitosa',
      detail: `Formulario "${json.titulo || 'Sin título'}" importado correctamente`,
      life: 3000
    })
    
    // Resetear el input para permitir importar el mismo archivo otra vez
    if (inputArchivo.value) {
      inputArchivo.value.value = ''
    }
  } catch (error) {
    console.error('Error al importar:', error)
    
    // Mensaje más descriptivo
    let mensaje = 'Formato de archivo inválido'
    if (error instanceof Error) {
      mensaje = error.message
      // Si es un error de Zod, mostrar los primeros errores
      if (mensaje.includes('JSON inválido')) {
        const lineas = mensaje.split('\n')
        mensaje = lineas.slice(0, 4).join('\n') // Mostrar primeras 3 líneas de error
      }
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error al importar',
      detail: mensaje,
      life: 8000
    })
    
    // Resetear el input
    if (inputArchivo.value) {
      inputArchivo.value.value = ''
    }
  }
}

// Función para copiar al portapapeles
function copiarAlPortapapeles(): void {
  navigator.clipboard.writeText(contenidoJson.value)
    .then(() => {
      toast.add({
        severity: 'success',
        summary: 'Copiado',
        detail: 'JSON copiado al portapapeles',
        life: 2000
      })
    })
    .catch(() => {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo copiar al portapapeles',
        life: 3000
      })
    })
}

</script>

<template>
  <div class="p-3">
    <div class="flex gap-2 mb-3">
      <PrimeButton label="Exportar" icon="pi pi-upload" @click="almacen.manejarExportarArchivo" severity="success"
        v-tooltip.top="'Descargar JSON'" />
      
      <label class="p-button p-component cursor-pointer">
        <i class="pi pi-download mr-2" />
        <span>Importar</span>
        <input ref="inputArchivo" type="file" accept="application/json" class="hidden" @change="manejarImportacion" />
      </label>

      <PrimeButton icon="pi pi-copy" @click="copiarAlPortapapeles" severity="secondary"
        v-tooltip.top="'Copiar JSON al portapapeles'" />
    </div>

    <PrimeMessage severity="info" :closable="false" class="mb-3">
      <p class="m-0 tamanio-fuente-miga">
        Exporta tu formulario como JSON o importa un JSON existente. El contenido se actualiza automáticamente.
      </p>
    </PrimeMessage>

    <pre class="bg-surface-100 p-3 overflow-auto border-round" style="max-height: 60vh; font-size: 0.85rem;">{{ contenidoJson }}</pre>
  </div>
</template>

<style scoped></style>
