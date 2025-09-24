<script setup lang="ts">
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import PanelPaleta from '@/paginas/disenador/componentes/PanelPaleta.vue'
import LienzoPagina from '@/paginas/disenador/componentes/LienzoPagina.vue'
import TabsPropiedades from '@/paginas/disenador/componentes/TabsPropiedades.vue'
import VistaPrevia from '@/paginas/disenador/componentes/VistaPrevia.vue'
import VistaJson from '@/paginas/disenador/componentes/VistaJson.vue'
import ModalConfirmar from '@/componentes/ModalConfirmar.vue'
import { ref, computed, nextTick } from 'vue'

const almacen = useAlmacenDisenador()

const paginaActual = computed(() => almacen.esquemaFormulario.paginas[almacen.indicePaginaActiva])
const totalPaginas = computed(() => almacen.esquemaFormulario.paginas.length)
const pestana = ref<string>('disenador')

// Estado para edición de título de página
const editandoTitulo = ref(false)
const tituloTemporal = ref('')

const tabTitles = [
  { value: 'disenador', label: 'Diseñador', icon: 'pi pi-sitemap' },
  { value: 'preview', label: 'Vista previa', icon: 'pi pi-eye' },
  { value: 'json', label: 'JSON', icon: 'pi pi-code' },
]

// Función para iniciar edición del título
function iniciarEdicionTitulo(): void {
  if (paginaActual.value) {
    tituloTemporal.value = paginaActual.value.titulo || `Página ${almacen.indicePaginaActiva + 1}`
    editandoTitulo.value = true
    // Enfocar el input después del próximo tick
    nextTick(() => {
      const input = document.querySelector('.titulo-input') as HTMLInputElement
      if (input) {
        input.focus()
        input.select()
      }
    })
  }
}

// Función para guardar el título
function guardarTitulo(): void {
  if (paginaActual.value && tituloTemporal.value.trim()) {
    almacen.actualizarTituloPagina(almacen.indicePaginaActiva, tituloTemporal.value.trim())
  }
  cancelarEdicionTitulo()
}

// Función para cancelar edición
function cancelarEdicionTitulo(): void {
  editandoTitulo.value = false
  tituloTemporal.value = ''
}

// Función para manejar Enter y Escape
function manejarTeclasTitulo(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    guardarTitulo()
  } else if (event.key === 'Escape') {
    cancelarEdicionTitulo()
  }
}
</script>

<template>
  <div class="p-3 grid w-full" style="min-height: 70vh">
    <div class="col-12 md:col-2">
      <PanelPaleta />
    </div>
    <div class="col-12 md:col-7">
      <div class="flex items-center justify-between mb-2">
        <div class="flex gap-2 principal">
          <PrimeButton label="Añadir página" icon="pi pi-plus" @click="almacen.crearPaginaDespuesActual"/>
          <PrimeButton label="Duplicar página" icon="pi pi-copy" @click="almacen.duplicarPagina(almacen.indicePaginaActiva)" />
          <PrimeButton label="Eliminar página" severity="danger" icon="pi pi-trash" @click="almacen.confirmarEliminarPagina(almacen.indicePaginaActiva)" />
        </div>
        <div class="flex gap-2 items-center">
          <PrimeButton label="Exportar" icon="pi pi-upload" @click="almacen.exportarJson" />
          <label class="p-button p-component cursor-pointer">
            <i class="pi pi-download mr-2" />
            <span>Importar</span>
            <input type="file" accept="application/json" class="hidden" @change="(e: Event)=> { const input = e.target as HTMLInputElement; const f = input.files?.[0]; if (f) almacen.importarJson(f) }" />
          </label>
          <!-- <PrimeToggleButton :model-value="almacen.gridSnap" on-label="Grid" off-label="Grid" @update:model-value="(v:boolean)=> (almacen.gridSnap = v)" /> -->
        </div>
      </div>
      <PrimeTabs v-model:value="pestana" class="center-tabs">
        <div class="center-tabs-header">
          <PrimeTabList>
            <template v-for="tab in tabTitles" :key="tab.value">
              <PrimeTab :value="tab.value" as="div" class="flex items-center gap-2">
                <i :class="tab.icon"></i>
                <span class="font-bold whitespace-nowrap">{{ tab.label }}</span>
              </PrimeTab>
            </template>
          </PrimeTabList>
        </div>

        <PrimeTabPanels>
          <PrimeTabPanel value="disenador">
            <div class="flex justify-between items-center mb-3">
              <div v-if="totalPaginas>1" class="flex items-center gap-2">
                <PrimeButton label="Anterior" icon="pi pi-angle-left" :disabled="almacen.indicePaginaActiva===0" @click="async () => { almacen.indicePaginaActiva = Math.max(0, almacen.indicePaginaActiva-1); almacen.seleccionarCampo(null); await nextTick() }" />

                <!-- Título editable -->
                <div v-if="!editandoTitulo" class="flex items-center gap-2">
                  <div class="font-semibold cursor-pointer hover:bg-gray-100 px-2 py-1 border-round" @click="iniciarEdicionTitulo">
                    {{ paginaActual.titulo || ('Página ' + (almacen.indicePaginaActiva+1)) }}
                    <i class="pi pi-pencil ml-2 text-gray-500 text-sm"></i>
                  </div>
                </div>
                <div v-else class="flex items-center gap-2">
                  <PrimeInputText
                    v-model="tituloTemporal"
                    class="titulo-input w-48"
                    @keydown="manejarTeclasTitulo"
                    @blur="guardarTitulo"
                    placeholder="Título de la página"
                  />
                  <PrimeButton
                    icon="pi pi-check"
                    severity="success"
                    size="small"
                    @click="guardarTitulo"
                  />
                  <PrimeButton
                    icon="pi pi-times"
                    severity="secondary"
                    size="small"
                    @click="cancelarEdicionTitulo"
                  />
                </div>

                <PrimeButton label="Siguiente" icon-pos="right" icon="pi pi-angle-right" :disabled="almacen.indicePaginaActiva>=almacen.esquemaFormulario.paginas.length-1" @click="async () => { almacen.indicePaginaActiva = Math.min(almacen.esquemaFormulario.paginas.length-1, almacen.indicePaginaActiva+1); almacen.seleccionarCampo(null); await nextTick() }" />
              </div>

              <!-- Título editable para página única -->
              <div v-else class="flex items-center gap-2">
                <div v-if="!editandoTitulo" class="flex items-center gap-2">
                  <div class="font-semibold cursor-pointer hover:bg-gray-100 px-2 py-1 border-round" @click="iniciarEdicionTitulo">
                    {{ paginaActual.titulo || ('Página ' + (almacen.indicePaginaActiva+1)) }}
                    <i class="pi pi-pencil ml-2 text-gray-500 text-sm"></i>
                  </div>
                </div>
                <div v-else class="flex items-center gap-2">
                  <PrimeInputText
                    v-model="tituloTemporal"
                    class="titulo-input w-48"
                    @keydown="manejarTeclasTitulo"
                    @blur="guardarTitulo"
                    placeholder="Título de la página"
                  />
                  <PrimeButton
                    icon="pi pi-check"
                    severity="success"
                    size="small"
                    @click="guardarTitulo"
                  />
                  <PrimeButton
                    icon="pi pi-times"
                    severity="secondary"
                    size="small"
                    @click="cancelarEdicionTitulo"
                  />
                </div>
              </div>

              <!-- Sin botón enviar en el diseñador -->
            </div>
            <LienzoPagina :key="almacen.indicePaginaActiva + ':' + (paginaActual.id || '')" :pagina="paginaActual" />
          </PrimeTabPanel>
          <PrimeTabPanel value="preview">
            <VistaPrevia />
          </PrimeTabPanel>
          <PrimeTabPanel value="json">
            <VistaJson />
          </PrimeTabPanel>
        </PrimeTabPanels>
      </PrimeTabs>
    </div>
    <div class="col-12 md:col-3">
      <TabsPropiedades />
    </div>
  </div>

  <!-- Modal de confirmación para eliminar página -->
  <ModalConfirmar
    :visible="almacen.mostrarModalEliminarPagina"
    message="¿Estás seguro de que deseas eliminar esta página? Esta acción no se puede deshacer."
    @confirm="almacen.ejecutarEliminarPagina"
    @cancel="almacen.cancelarEliminarPagina"
  />
</template>

