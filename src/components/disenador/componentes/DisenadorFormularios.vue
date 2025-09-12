<template>
  <div class="disenador-formularios h-screen flex bg-surface-50 dark:bg-surface-950">
    <!-- Sección izquierda: Paleta de componentes -->
    <div class="paleta-componentes w-64 bg-surface-0 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 overflow-y-auto">
      <PaletaComponentes />
    </div>

    <!-- Sección central: Diseñador/Preview/JSON -->
    <div class="area-central flex-1 flex flex-col">
      <!-- Barra de herramientas -->
      <div class="barra-herramientas bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 p-3">
        <BarraHerramientas />
      </div>

      <!-- Pestañas principales -->
      <div class="pestanas-principales">
        <TabView v-model:activeIndex="tabActiva" class="h-full">
          <TabPanel value="0" header="Diseñador">
            <LienzoDiseñador class="h-full" />
          </TabPanel>
          
          <TabPanel value="1" header="Vista Previa">
            <VistaPrevia class="h-full" />
          </TabPanel>
          
          <TabPanel value="2" header="JSON">
            <VistaJson class="h-full" />
          </TabPanel>
        </TabView>
      </div>
    </div>

    <!-- Sección derecha: Panel de propiedades -->
    <div class="panel-propiedades w-80 bg-surface-0 dark:bg-surface-900 border-l border-surface-200 dark:border-surface-700 overflow-y-auto">
      <PanelPropiedades />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import { useDisenadorStore } from '@/stores/disenador'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'

// Componentes hijos
import PaletaComponentes from './PaletaComponentes.vue'
import BarraHerramientas from './BarraHerramientas.vue'
import LienzoDiseñador from './LienzoDiseñador.vue'
import VistaPrevia from './VistaPrevia.vue'
import VistaJson from './VistaJson.vue'
import PanelPropiedades from './PanelPropiedades.vue'

// Props del componente
interface Props {
  formularioInicial?: string // JSON del formulario para cargar inicialmente
  modoLectura?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  formularioInicial: '',
  modoLectura: false
})

// Emits
interface Emits {
  (e: 'formularioGuardado', formulario: string): void
  (e: 'formularioCambiado', formulario: string): void
  (e: 'error', error: string): void
}

const emit = defineEmits<Emits>()

// Composables
const store = useDisenadorStore()

// Estado local
const tabActiva = ref(0)

// Provide store para componentes hijos
provide('disenadorStore', store)

// Cargar formulario inicial si se proporciona
if (props.formularioInicial) {
  try {
    if (!store.importarJson(props.formularioInicial)) {
      emit('error', 'No se pudo cargar el formulario inicial')
    }
  } catch {
    emit('error', 'Error al cargar el formulario inicial')
  }
}

// Configurar modo de lectura
if (props.modoLectura) {
  // En modo lectura, cambiar a vista previa por defecto
  tabActiva.value = 1
}

// Funciones públicas del componente
function obtenerFormularioJson(): string {
  return store.exportarJson()
}

function cargarFormulario(json: string): boolean {
  try {
    const resultado = store.importarJson(json)
    if (resultado) {
      emit('formularioCambiado', store.exportarJson())
    }
    return resultado
  } catch {
    emit('error', 'Error al cargar el formulario')
    return false
  }
}

function limpiarFormulario(): void {
  store.limpiarFormulario()
  emit('formularioCambiado', store.exportarJson())
}

function guardarFormulario(): void {
  const json = store.exportarJson()
  emit('formularioGuardado', json)
}

// Exponer funciones para uso externo
defineExpose({
  obtenerFormularioJson,
  cargarFormulario,
  limpiarFormulario,
  guardarFormulario
})
</script>

<style scoped>
.disenador-formularios {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.paleta-componentes {
  min-width: 250px;
  max-width: 300px;
}

.panel-propiedades {
  min-width: 300px;
  max-width: 400px;
}

.barra-herramientas {
  min-height: 60px;
}

:deep(.p-tabview .p-tabview-panels) {
  padding: 0;
  height: calc(100vh - 120px);
}

:deep(.p-tabview .p-tabview-panel) {
  height: 100%;
}

/* Estilos para mejor UX */
.area-central {
  min-width: 0; /* Permite que el flex shrink funcione correctamente */
}

/* Estilos responsive */
@media (max-width: 1024px) {
  .disenador-formularios {
    flex-direction: column;
  }
  
  .paleta-componentes,
  .panel-propiedades {
    width: 100%;
    height: 200px;
    max-width: none;
    min-width: auto;
  }
  
  .area-central {
    height: calc(100vh - 400px);
  }
}

@media (max-width: 768px) {
  .paleta-componentes,
  .panel-propiedades {
    height: 150px;
  }
  
  .area-central {
    height: calc(100vh - 300px);
  }
}
</style>