<script setup lang="ts">
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import PanelPaleta from '@/paginas/disenador/componentes/PanelPaleta.vue'
import LienzoPagina from '@/paginas/disenador/componentes/LienzoPagina.vue'
import TabAtributos from '@/paginas/disenador/componentes/propiedades/TabAtributos.vue'
import TabLogica from '@/paginas/disenador/componentes/propiedades/TabLogica.vue'
import TabValidacion from '@/paginas/disenador/componentes/propiedades/TabValidacion.vue'
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

// Estado para barra lateral de propiedades
const sidebarVisible = ref(false)
const tabPropiedades = ref<'attrs' | 'logic' | 'valid'>('attrs')
const seleccionado = computed(() => almacen.campoSeleccionado)

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
  <div class="p-3 grid ancho-100 texto-miga" style="min-height: 70vh">
    <div class="col-12 lg:col-2">
      <PanelPaleta />
    </div>
    <div class="col-12 main-content" :class="sidebarVisible ? 'lg:col-8' : 'lg:col-10'">
      <div class="grid">
        <div class="col-12 lg:col-3">
          <PrimeButton label="Añadir página" class="ancho-100" icon="pi pi-plus"
            @click="almacen.crearPaginaDespuesActual" />
        </div>
        <div class="col-12 lg:col-3">
          <PrimeButton label="Duplicar página" class="ancho-100" icon="pi pi-copy"
            @click="almacen.duplicarPagina(almacen.indicePaginaActiva)" />
        </div>
        <div class="col-12 lg:col-3">
          <PrimeButton label="Eliminar página" severity="danger" class="ancho-100" icon="pi pi-trash"
            @click="almacen.confirmarEliminarPagina(almacen.indicePaginaActiva)" />
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
              <div v-if="totalPaginas > 1" class="flex items-center gap-2">
                <PrimeButton label="Anterior" icon="pi pi-angle-left" :disabled="almacen.indicePaginaActiva === 0"
                  @click="async () => { almacen.indicePaginaActiva = Math.max(0, almacen.indicePaginaActiva - 1); almacen.seleccionarCampo(null); await nextTick() }" />

                <!-- Título editable -->
                <div v-if="!editandoTitulo" class="flex items-center gap-2">
                  <div class="negrilla cursor-pointer hover:bg-gray-100 px-2 py-1 border-round"
                    @click="iniciarEdicionTitulo">
                    {{ paginaActual.titulo || ('Página ' + (almacen.indicePaginaActiva + 1)) }}
                    <i class="pi pi-pencil ml-2 text-gray-500 texto-miga"></i>
                  </div>
                </div>
                <div v-else class="flex items-center gap-2">
                  <PrimeInputText v-model="tituloTemporal" class="titulo-input w-48" @keydown="manejarTeclasTitulo"
                    @blur="guardarTitulo" placeholder="Título de la página" />
                  <PrimeButton icon="pi pi-check" severity="success" size="small" @click="guardarTitulo" />
                  <PrimeButton icon="pi pi-times" severity="secondary" size="small" @click="cancelarEdicionTitulo" />
                </div>

                <PrimeButton label="Siguiente" icon-pos="right" icon="pi pi-angle-right"
                  :disabled="almacen.indicePaginaActiva >= almacen.esquemaFormulario.paginas.length - 1"
                  @click="async () => { almacen.indicePaginaActiva = Math.min(almacen.esquemaFormulario.paginas.length - 1, almacen.indicePaginaActiva + 1); almacen.seleccionarCampo(null); await nextTick() }" />
              </div>

              <!-- Título editable para página única -->
              <div v-else class="flex items-center gap-2">
                <div v-if="!editandoTitulo" class="flex items-center gap-2">
                  <div class="negrilla cursor-pointer hover:bg-gray-100 px-2 py-1 border-round"
                    @click="iniciarEdicionTitulo">
                    {{ paginaActual.titulo || ('Página ' + (almacen.indicePaginaActiva + 1)) }}
                    <i class="pi pi-pencil ml-2 text-gray-500 texto-miga"></i>
                  </div>
                </div>
                <div v-else class="flex items-center gap-2">
                  <PrimeInputText v-model="tituloTemporal" class="titulo-input w-48" @keydown="manejarTeclasTitulo"
                    @blur="guardarTitulo" placeholder="Título de la página" />
                  <PrimeButton icon="pi pi-check" severity="success" size="small" @click="guardarTitulo" />
                  <PrimeButton icon="pi pi-times" severity="secondary" size="small" @click="cancelarEdicionTitulo" />
                </div>
              </div>
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

    <!-- Barra lateral derecha integrada en el grid -->
    <div v-show="sidebarVisible" class="col-12 lg:col-2 properties-sidebar-expanded" @mouseenter="sidebarVisible = true"
      @mouseleave="sidebarVisible = false">
      <div class="sidebar-content-expanded">
        <div class="sidebar-header">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-cog text-primary"></i>
            <span class="font-semibold">Propiedades</span>
          </div>
        </div>

        <div class="sidebar-body">
          <div v-if="!seleccionado" class="text-center p-4">
            <i class="pi pi-info-circle text-4xl text-color-secondary mb-3"></i>
            <p class="text-color-secondary">Selecciona un elemento para ver sus propiedades</p>
          </div>

          <template v-else>
            <div class="tab-content">
              <Transition name="fade" mode="out-in">
                <TabAtributos v-if="tabPropiedades === 'attrs'" :id-campo="seleccionado.id" key="attrs" />
                <TabLogica v-else-if="tabPropiedades === 'logic'" :id-campo="seleccionado.id" key="logic" />
                <TabValidacion v-else-if="tabPropiedades === 'valid'" :id-campo="seleccionado.id" key="valid" />
              </Transition>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <!-- Tab vertical flotante siempre visible -->
  <div class="properties-sidebar-tab" @mouseenter="sidebarVisible = true">
    <div class="sidebar-tab" :class="{ 'expanded': sidebarVisible }">
      <div class="tab-icons">
        <div class="tab-icon" :class="{ 'active': tabPropiedades === 'attrs' }" @click="tabPropiedades = 'attrs'"
          v-tooltip.left="'Atributos'">
          <i class="pi pi-cog"></i>
        </div>
        <div class="tab-icon" :class="{ 'active': tabPropiedades === 'logic' }" @click="tabPropiedades = 'logic'"
          v-tooltip.left="'Lógica'">
          <i class="pi pi-sitemap"></i>
        </div>
        <div class="tab-icon" :class="{ 'active': tabPropiedades === 'valid' }" @click="tabPropiedades = 'valid'"
          v-tooltip.left="'Validaciones'">
          <i class="pi pi-shield"></i>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación para eliminar página -->
  <ModalConfirmar :visible="almacen.mostrarModalEliminarPagina"
    message="¿Estás seguro de que deseas eliminar esta página? Esta acción no se puede deshacer."
    @confirm="almacen.ejecutarEliminarPagina" @cancel="almacen.cancelarEliminarPagina" />
</template>

<style scoped>
.properties-sidebar-expanded {
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  height: 100vh;
  position: sticky;
  top: 0;
}

.sidebar-content-expanded {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.properties-sidebar-tab {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 1000;
}

.sidebar-tab {
  width: 50px;
  background: var(--p-surface-100);
  border: 1px solid var(--p-surface-200);
  border-radius: 8px 0 0 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
}

.sidebar-tab.expanded {
  background: var(--p-surface-200);
}

.tab-icons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tab-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-300);
  color: var(--p-text-color);
}

.tab-icon:hover {
  background: var(--p-primary-100);
  color: var(--p-primary-600);
  transform: scale(1.05);
}

.tab-icon.active {
  background: var(--p-primary-500);
  color: var(--p-primary-contrast-color);
  border-color: var(--p-primary-500);
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--p-surface-200);
  background: var(--p-surface-50);
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.tab-content {
  position: relative;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.main-content {
  transition: all 0.4s ease;
}
</style>
