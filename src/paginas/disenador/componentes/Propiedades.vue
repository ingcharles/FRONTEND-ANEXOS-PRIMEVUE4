<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import TabAtributos from '@/paginas/disenador/componentes/propiedades/TabAtributos.vue'
import TabLogica from '@/paginas/disenador/componentes/propiedades/TabLogica.vue'
import TabValidacion from '@/paginas/disenador/componentes/propiedades/TabValidacion.vue'

interface Props {
  sidebarVisible: boolean
}

interface Emits {
  'update:sidebarVisible': [value: boolean]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const almacen = useAlmacenDisenador()
const seleccionado = computed(() => almacen.campoSeleccionado)
const tabPropiedades = ref<'attrs' | 'logic' | 'valid' | null>(null)

const tabs = [
  {
    key: 'attrs' as const,
    label: 'Atributos',
    icon: 'pi pi-cog',
    component: TabAtributos,
    tooltip: 'Atributos'
  },
  {
    key: 'logic' as const,
    label: 'Lógica',
    icon: 'pi pi-sitemap',
    component: TabLogica,
    tooltip: 'Lógica'
  },
  {
    key: 'valid' as const,
    label: 'Validaciones',
    icon: 'pi pi-shield',
    component: TabValidacion,
    tooltip: 'Validaciones'
  }
]

const handleTabClick = (tabKey: 'attrs' | 'logic' | 'valid') => {
  if (tabPropiedades.value === tabKey) {
    // Si el tab ya está activo, lo desactivamos y ocultamos sidebar
    tabPropiedades.value = null
    emit('update:sidebarVisible', false)
  } else {
    // Activamos el nuevo tab y mostramos sidebar
    tabPropiedades.value = tabKey
    emit('update:sidebarVisible', true)
  }
}

const getTooltipText = (tab: typeof tabs[0]) => {
  return tabPropiedades.value === tab.key ? `Cerrar ${tab.tooltip}` : tab.tooltip
}
</script>

<template>
  <!-- Barra lateral derecha integrada en el grid -->
  <div v-show="props.sidebarVisible" class="col-12 lg:col-2 properties-sidebar-expanded">
    <div class="sidebar-content-expanded">
      <div class="sidebar-header">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-cog text-primary"></i>
          <span class="negrilla">Propiedades</span>
        </div>
      </div>

      <div class="sidebar-body">
        <!-- Empty state when no element selected -->
        <div v-if="!seleccionado" class="centrar-texto">
          <i class="pi pi-info-circle tamanio-fuente-24 mb-3"></i>
          <p class="tamanio-fuente-miga">
            Selecciona un elemento para ver sus propiedades
          </p>
        </div>

        <!-- Tab content with transition -->
        <template v-else-if="tabPropiedades">
          <div class="tab-content">
            <Transition name="fade" mode="out-in">
              <component
                :is="tabs.find(t => t.key === tabPropiedades)?.component"
                :id-campo="seleccionado.id"
                :key="tabPropiedades"
              />
            </Transition>
          </div>
        </template>

        <!-- Prompt to select tab -->
        <div v-else-if="seleccionado" class="centrar-texto">
          <i class="pi pi-hand-point-up tamanio-fuente-24 mb-3"></i>
          <p class="tamanio-fuente-miga">
            Selecciona una pestaña para ver las propiedades
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Tab vertical flotante siempre visible -->
  <div class="properties-sidebar-tab">
    <div class="sidebar-tab" :class="{ 'expanded': props.sidebarVisible }">
      <div class="tab-icons">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-icon"
          :class="{ 'active': tabPropiedades === tab.key }"
          @click.stop="handleTabClick(tab.key)"
          v-tooltip.left="getTooltipText(tab)"
        >
          <i :class="tab.icon"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.properties-sidebar-expanded {
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-border-radius-md);
  height: 100vh;
  position: sticky;
  top: 0;
  box-shadow: var(--p-shadow-sm);
}

.sidebar-content-expanded {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--p-surface-200);
  background: var(--p-surface-50);
  border-radius: var(--p-border-radius-md) var(--p-border-radius-md) 0 0;
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
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
  border-radius: var(--p-border-radius-md) 0 0 var(--p-border-radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: var(--p-shadow-md);
  padding: 1rem 0;
}

.sidebar-tab.expanded {
  background: var(--p-surface-200);
  border-color: var(--p-primary-200);
}

.tab-icons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tab-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--p-border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  /* transition: all 0.3s ease; */
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-300);
  color: var(--p-text-color);
  font-size: 1rem;
}

.tab-icon:hover {
  background: var(--p-primary-100);
  color: var(--p-primary-600);
  transform: scale(1.05);
  border-color: var(--p-primary-300);
}

.tab-icon.active {
  background: var(--p-primary-500);
  color: var(--p-primary-contrast-color);
  border-color: var(--p-primary-500);
  box-shadow: var(--p-shadow-sm);
}

.tab-content {
  position: relative;
  height: 100%;
}

/* Transiciones mejoradas */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* Responsive */
@media (max-width: 1024px) {
  .properties-sidebar-expanded {
    position: fixed;
    right: 0;
    top: 0;
    z-index: 999;
    width: 350px;
    max-width: 90vw;
  }
}

@media (max-width: 768px) {
  .properties-sidebar-expanded {
    width: 100vw;
    border-radius: 0;
  }

  .sidebar-tab {
    width: 45px;
  }

  .tab-icon {
    width: 35px;
    height: 35px;
    font-size: 0.875rem;
  }
}
</style>
