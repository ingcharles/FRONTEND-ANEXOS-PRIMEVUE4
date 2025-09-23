<script setup lang="ts">
import { ref } from 'vue'

const mensajeBienvenida = ref('¡Bienvenido al Diseñador de Formularios!')
const descripcionAplicacion = ref('Una herramienta moderna para crear formularios dinámicos con Vue.js 3 y PrimeVue 4.')

const caracteristicasPrincipales = ref([
  {
    titulo: 'Diseño Visual',
    descripcion: 'Interfaz intuitiva drag-and-drop para diseñar formularios',
    icono: 'pi pi-palette',
    color: '#42b883'
  },
  {
    titulo: 'Vista Previa',
    descripcion: 'Visualiza tus formularios en tiempo real mientras los creas',
    icono: 'pi pi-eye',
    color: '#007ad9'
  },
  {
    titulo: 'Exportación JSON',
    descripcion: 'Exporta e importa esquemas de formularios fácilmente',
    icono: 'pi pi-download',
    color: '#ffd25c'
  }
])
</script>

<template>
  <div class="inicio p-6 max-w-6xl mx-auto">
    <!-- Sección de Bienvenida -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">
        <i class="pi pi-home text-blue-500 mr-3"></i>
        {{ mensajeBienvenida }}
      </h1>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        {{ descripcionAplicacion }}
      </p>
    </div>

    <!-- Características Principales -->
    <div class="mb-8">
      <h2 class="text-2xl font-semibold text-center mb-6 text-gray-800">
        Características Destacadas
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          v-for="caracteristica in caracteristicasPrincipales" 
          :key="caracteristica.titulo"
          class="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300"
        >
          <div 
            class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            :style="{ backgroundColor: caracteristica.color + '20' }"
          >
            <i 
              :class="caracteristica.icono" 
              class="text-2xl" 
              :style="{ color: caracteristica.color }"
            ></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">
            {{ caracteristica.titulo }}
          </h3>
          <p class="text-gray-600">
            {{ caracteristica.descripcion }}
          </p>
        </div>
      </div>
    </div>

    <!-- Llamada a la Acción -->
    <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8">
      <h2 class="text-2xl font-bold mb-4">
        ¿Listo para comenzar?
      </h2>
      <p class="text-lg mb-6">
        Empieza a crear formularios increíbles con nuestro diseñador intuitivo.
      </p>
      <router-link 
        to="/disenador" 
        class="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300"
      >
        <i class="pi pi-play mr-2"></i>
        Ir al Diseñador
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.inicio {
  min-height: 70vh;
}

.transition-shadow {
  transition: box-shadow 0.3s ease;
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
