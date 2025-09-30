<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import TabAtributos from '@/paginas/disenador/componentes/propiedades/TabAtributos.vue'
import TabLogica from '@/paginas/disenador/componentes/propiedades/TabLogica.vue'
import TabValidacion from '@/paginas/disenador/componentes/propiedades/TabValidacion.vue'

const props = defineProps<{ sidebarVisible: boolean; }>()
const almacen = useAlmacenDisenador()
const seleccionado = computed(() => almacen.campoSeleccionado)
const tabPropiedades = ref<'attrs' | 'logic' | 'valid' | null>(null)

const emit = defineEmits<{
  'update:sidebarVisible': [value: boolean]
}>()

// Función para manejar el click en los tabs
const handleTabClick = (tab: 'attrs' | 'logic' | 'valid') => {
  if (tabPropiedades.value === tab) {
    // Si el tab ya está activo, lo desactivamos y ocultamos sidebar
    tabPropiedades.value = null
    emit('update:sidebarVisible', false)
  } else {
    // Activamos el nuevo tab y mostramos sidebar
    tabPropiedades.value = tab
    emit('update:sidebarVisible', true)
  }
}
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
        <div v-if="!seleccionado" class="text-center p-3">
          <i class="pi pi-info-circle text-4xl text-color-secondary mb-3"></i>
          <p class="text-color-secondary">Selecciona un elemento para ver sus propiedades</p>
        </div>

        <template v-else-if="tabPropiedades">
          <div class="tab-content">
            <Transition name="fade" mode="out-in">
              <TabAtributos v-if="tabPropiedades === 'attrs'" :id-campo="seleccionado.id" key="attrs" />
              <TabLogica v-else-if="tabPropiedades === 'logic'" :id-campo="seleccionado.id" key="logic" />
              <TabValidacion v-else-if="tabPropiedades === 'valid'" :id-campo="seleccionado.id" key="valid" />
            </Transition>
          </div>
        </template>

        <div v-else-if="seleccionado" class="text-center p-3">
          <i class="pi pi-hand-point-up text-4xl text-color-secondary mb-3"></i>
          <p class="text-color-secondary">Selecciona una pestaña para ver las propiedades</p>
        </div>
      </div>
    </div>
  </div>
  <!-- Tab vertical flotante siempre visible -->
  <div class="properties-sidebar-tab">
    <div class="sidebar-tab" :class="{ 'expanded': props.sidebarVisible }">
      <div class="tab-icons">
        <div class="tab-icon" :class="{ 'active': tabPropiedades === 'attrs' }" @click.stop="handleTabClick('attrs')"
          v-tooltip.left="tabPropiedades === 'attrs' ? 'Cerrar Atributos' : 'Atributos'">
          <i class="pi pi-cog"></i>
        </div>
        <div class="tab-icon" :class="{ 'active': tabPropiedades === 'logic' }" @click.stop="handleTabClick('logic')"
          v-tooltip.left="tabPropiedades === 'logic' ? 'Cerrar Lógica' : 'Lógica'">
          <i class="pi pi-sitemap"></i>
        </div>
        <div class="tab-icon" :class="{ 'active': tabPropiedades === 'valid' }" @click.stop="handleTabClick('valid')"
          v-tooltip.left="tabPropiedades === 'valid' ? 'Cerrar Validaciones' : 'Validaciones'">
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
