<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
// import TabAtributos from './propiedades/TabAtributos.vue'
// import TabLogica from './propiedades/TabLogica.vue'
// import TabValidacion from './propiedades/TabValidacion.vue'
import TabAtributos from '@/paginas/disenador/componentes/propiedades/TabAtributos.vue'
import TabLogica from '@/paginas/disenador/componentes/propiedades/TabLogica.vue'
import TabValidacion from '@/paginas/disenador/componentes/propiedades/TabValidacion.vue'
// import Panel from 'primevue/panel'
// import Tabs from 'primevue/tabs'
// import TabList from 'primevue/tablist'
// import Tab from 'primevue/tab'
// import TabPanels from 'primevue/tabpanels'
// import TabPanel from 'primevue/tabpanel'
const props = defineProps<{ sidebarVisible: boolean; }>()
const almacen = useAlmacenDisenador()
const seleccionado = computed(() => almacen.campoSeleccionado)
const tabPropiedades = ref<'attrs' | 'logic' | 'valid'>('attrs')
// const sidebarVisible = ref(props.sidebarVisible)
const emit = defineEmits<{
  'update:sidebarVisible': [value: boolean]
}>()
// const tabActivo = ref<'attrs' | 'logic' | 'valid'>('attrs')

// // Resetear el tab activo solo cuando se selecciona un campo DIFERENTE
// watch(() => seleccionado.value?.id, () => {
//   tabActivo.value = 'attrs'
// })
</script>

<template>
  <!-- Barra lateral derecha integrada en el grid -->
  <div v-show="props.sidebarVisible" class="col-12 lg:col-2 properties-sidebar-expanded">
    <div class="sidebar-content-expanded">
      <div class="sidebar-header">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-cog"></i>
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
  <!-- Tab vertical flotante siempre visible -->
  <div class="properties-sidebar-tab" @click="emit('update:sidebarVisible', !props.sidebarVisible)">
    <div class="sidebar-tab" :class="{ 'expanded': props.sidebarVisible }">
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
