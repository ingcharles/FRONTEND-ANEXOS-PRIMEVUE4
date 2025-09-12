<template>
  <div id="app" class="app-container min-h-screen bg-surface-50 dark:bg-surface-950">
    <!-- Barra de navegación principal -->
    <nav class="navbar bg-surface-0 dark:bg-surface-900 shadow-sm border-b border-surface-200 dark:border-surface-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo y título -->
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <img class="h-8 w-8" src="/favicon.ico" alt="Logo" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-surface-900 dark:text-surface-0">Constructor de Formularios</h1>
              <p class="text-sm text-surface-600 dark:text-surface-400">Diseñador dinámico con Vue 3 + PrimeVue</p>
            </div>
          </div>

          <!-- Menú de navegación -->
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <router-link
                v-for="item in menuItems"
                :key="item.name"
                :to="item.to"
                class="nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                :class="{
                  'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300': $route.name === item.name,
                  'text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-100 dark:hover:bg-surface-800': $route.name !== item.name
                }"
              >
                <i :class="item.icon" class="mr-2"></i>
                {{ item.label }}
              </router-link>
            </div>
          </div>

          <!-- Botón de menú móvil -->
          <div class="md:hidden">
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="p-2 rounded-md text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <i :class="mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'" class="text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Menú móvil -->
      <div v-if="mobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-surface-0 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700">
          <router-link
            v-for="item in menuItems"
            :key="item.name"
            :to="item.to"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            :class="{
              'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300': $route.name === item.name,
              'text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-100 dark:hover:bg-surface-800': $route.name !== item.name
            }"
          >
            <i :class="item.icon" class="mr-2"></i>
            {{ item.label }}
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Contenido principal -->
    <main class="main-content flex-1">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="footer bg-surface-0 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700 mt-auto">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="flex items-center space-x-4 mb-4 md:mb-0">
            <p class="text-sm text-surface-600 dark:text-surface-400">
              © 2025 Constructor de Formularios. Desarrollado con Vue 3 + PrimeVue.
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 text-sm text-surface-500 dark:text-surface-400">
              <i class="pi pi-code"></i>
              <span>Versión 1.0.0</span>
            </div>
            <div class="flex items-center space-x-2 text-sm text-surface-500 dark:text-surface-400">
              <i class="pi pi-users"></i>
              <span>{{ estadisticas.totalFormularios }} formularios</span>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Toast global -->
    <Toast ref="toast" />

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="loading-content bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">Cargando...</h3>
            <p class="text-sm text-gray-500">{{ loadingMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import { useDisenadorStore } from '@/stores/disenador'
import Toast from 'primevue/toast'

// Refs
const toast = ref()
const mobileMenuOpen = ref(false)
const loading = ref(false)
const loadingMessage = ref('')

// Store
const store = useDisenadorStore()

// Proporcionar el store globalmente
provide('disenadorStore', store)

// Datos del menú
const menuItems = ref([
  {
    name: 'Home',
    label: 'Inicio',
    to: '/',
    icon: 'pi pi-home'
  },
  {
    name: 'About',
    label: 'Acerca de',
    to: '/about',
    icon: 'pi pi-info-circle'
  }
])

// Estadísticas globales
const estadisticas = computed(() => ({
  totalFormularios: 1, // Por ahora solo tenemos uno
  totalCampos: store.currentForm.pages.reduce((total, pagina) => total + pagina.fields.length, 0)
}))

// Funciones de utilidad
function mostrarToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
  toast.value.add({
    severity,
    summary,
    detail,
    life: 3000
  })
}

function mostrarLoading(mensaje: string): void {
  loading.value = true
  loadingMessage.value = mensaje
}

function ocultarLoading(): void {
  loading.value = false
  loadingMessage.value = ''
}

// Manejo de errores globales
function manejarError(error: Error): void {
  console.error('Error de aplicación:', error)
  mostrarToast('error', 'Error', error.message || 'Ha ocurrido un error inesperado')
}

// Funciones del ciclo de vida
onMounted(() => {
  // Configurar manejo de errores globales
  window.addEventListener('unhandledrejection', (event) => {
    manejarError(new Error(event.reason?.message || 'Error no manejado'))
    event.preventDefault()
  })

  window.addEventListener('error', (event) => {
    manejarError(new Error(event.message || 'Error de JavaScript'))
  })

  // Mostrar mensaje de bienvenida
  setTimeout(() => {
    mostrarToast('success', '¡Bienvenido!', 'Constructor de formularios dinámicos está listo')
  }, 1000)
})

// Proporcionar funciones globalmente
provide('showToast', mostrarToast)
provide('showLoading', mostrarLoading)
provide('hideLoading', ocultarLoading)
provide('handleError', manejarError)
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.nav-link {
  display: flex;
  align-items: center;
  font-weight: 500;
  text-decoration: none;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.footer {
  margin-top: auto;
}

.loading-overlay {
  backdrop-filter: blur(4px);
}

/* Transiciones de página */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.main-content {
  animation: fadeInUp 0.5s ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar .max-w-7xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .footer .max-w-7xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Scroll suave */
html {
  scroll-behavior: smooth;
}

/* Estilos para el tema oscuro (futuro) */
.dark-mode {
  background-color: #1a1a1a;
  color: #e5e5e5;
}

.dark-mode .navbar {
  background-color: #2d2d2d;
  border-color: #404040;
}

.dark-mode .footer {
  background-color: #2d2d2d;
  border-color: #404040;
}

/* Override de estilos PrimeVue */
:deep(.p-toast) {
  z-index: 1100;
}

:deep(.p-toast-message) {
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Indicador de carga personalizado */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>