<script setup lang="ts">
import { ref } from 'vue'

interface ElementoTecnologia {
  nombre: string
  version: string
  descripcion: string
  icono: string
  color: string
  url: string
}

interface ElementoCaracteristica {
  titulo: string
  descripcion: string
  icono: string
  color: string
}

const tecnologias = ref<ElementoTecnologia[]>([
  {
    nombre: 'Vue.js 3',
    version: '3.5.18',
    descripcion: 'Framework progresivo para construir interfaces de usuario modernas',
    icono: 'pi pi-shield',
    color: '#42b883',
    url: 'https://vuejs.org/'
  },
  {
    nombre: 'TypeScript',
    version: '5.8.0',
    descripcion: 'JavaScript tipado que compila a JavaScript plano',
    icono: 'pi pi-code',
    color: '#3178c6',
    url: 'https://www.typescriptlang.org/'
  },
  {
    nombre: 'PrimeVue',
    version: '4.1.1',
    descripcion: 'Suite completa de componentes UI para Vue.js',
    icono: 'pi pi-palette',
    color: '#007ad9',
    url: 'https://primevue.org/'
  },
  {
    nombre: 'Pinia',
    version: '3.0.3',
    descripcion: 'Gestión de estado moderna para Vue.js',
    icono: 'pi pi-database',
    color: '#ffd25c',
    url: 'https://pinia.vuejs.org/'
  },
  {
    nombre: 'Vite',
    version: '6.0.7',
    descripcion: 'Herramienta de desarrollo rápida para proyectos web modernos',
    icono: 'pi pi-bolt',
    color: '#646cff',
    url: 'https://vitejs.dev/'
  },
  {
    nombre: 'Vitest',
    version: '2.1.8',
    descripcion: 'Framework de testing unitario nativo para Vite',
    icono: 'pi pi-check-circle',
    color: '#6e9f18',
    url: 'https://vitest.dev/'
  }
])

const caracteristicas = ref<ElementoCaracteristica[]>([
  {
    titulo: 'Diseño Intuitivo',
    descripcion: 'Interfaz drag-and-drop fácil de usar para crear formularios complejos',
    icono: 'pi pi-palette',
    color: '#42b883'
  },
  {
    titulo: 'Validación Avanzada',
    descripcion: 'Sistema robusto de validación con reglas personalizables',
    icono: 'pi pi-shield',
    color: '#007ad9'
  },
  {
    titulo: 'Vista Previa en Tiempo Real',
    descripcion: 'Visualiza los cambios instantáneamente mientras diseñas',
    icono: 'pi pi-eye',
    color: '#ffd25c'
  },
  {
    titulo: 'Exportación JSON',
    descripcion: 'Exporta e importa esquemas de formularios en formato JSON',
    icono: 'pi pi-download',
    color: '#6e9f18'
  },
  {
    titulo: 'Componentes Responsivos',
    descripcion: 'Formularios que se adaptan automáticamente a cualquier dispositivo',
    icono: 'pi pi-mobile',
    color: '#ff6b6b'
  },
  {
    titulo: 'Arquitectura SOLID',
    descripcion: 'Código mantenible siguiendo principios de desarrollo sólidos',
    icono: 'pi pi-cog',
    color: '#4ecdc4'
  }
])

const estadisticasProyecto = ref([
  { etiqueta: 'Componentes', valor: '15+', icono: 'pi pi-th-large' },
  { etiqueta: 'Tipos de Campo', valor: '8', icono: 'pi pi-list' },
  { etiqueta: 'Tests', valor: '53', icono: 'pi pi-check' },
  { etiqueta: 'Líneas de Código', valor: '5000+', icono: 'pi pi-code' }
])
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Encabezado Principal -->
    <div class="text-center mb-8">
      <h1 class="text-5xl font-bold text-gray-800 mb-4">
        <i class="pi pi-palette text-blue-500 mr-3"></i>
        Diseñador de Formularios
      </h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Una herramienta moderna y potente para crear formularios dinámicos con Vue.js 3 y PrimeVue 4.
        Construida siguiendo principios SOLID y las mejores prácticas de desarrollo.
      </p>
    </div>

    <!-- Estadísticas del Proyecto -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
      <div v-for="estadistica in estadisticasProyecto" :key="estadistica.etiqueta"
        class="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-blue-500">
        <i :class="estadistica.icono" class="text-3xl text-blue-500 mb-3"></i>
        <div class="text-2xl font-bold text-gray-800">{{ estadistica.valor }}</div>
        <div class="text-gray-600">{{ estadistica.etiqueta }}</div>
      </div>
    </div>

    <!-- Sección de Tecnologías -->
    <div class="mb-12">
      <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">
        <i class="pi pi-cog text-blue-500 mr-2"></i>
        Stack Tecnológico
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="tech in tecnologias" :key="tech.nombre"
          class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border-t-4"
          :style="{ borderTopColor: tech.color }">
          <div class="flex items-center mb-4">
            <i :class="tech.icono" class="text-2xl mr-3" :style="{ color: tech.color }"></i>
            <div>
              <h3 class=" negrilla text-gray-800">{{ tech.nombre }}</h3>
              <span class="texto-miga text-gray-500">v{{ tech.version }}</span>
            </div>
          </div>
          <p class="text-gray-600 mb-4">{{ tech.descripcion }}</p>
          <a :href="tech.url" target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-800 ">
            Documentación
            <i class="pi pi-external-link ml-1 texto-miga"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- Sección de Características -->
    <div class="mb-12">
      <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">
        <i class="pi pi-star text-yellow-500 mr-2"></i>
        Características Principales
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="caracteristica in caracteristicas" :key="caracteristica.titulo"
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4"
              :style="{ backgroundColor: caracteristica.color + '20' }">
              <i :class="caracteristica.icono" class="text-xl" :style="{ color: caracteristica.color }"></i>
            </div>
            <h3 class=" negrilla text-gray-800">{{ caracteristica.titulo }}</h3>
          </div>
          <p class="text-gray-600">{{ caracteristica.descripcion }}</p>
        </div>
      </div>
    </div>

    <!-- Sección de Arquitectura -->
    <div class="mb-12">
      <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">
        <i class="pi pi-sitemap text-green-500 mr-2"></i>
        Arquitectura del Proyecto
      </h2>
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Principios SOLID -->
          <div>
            <h3 class="text-xl negrilla mb-4 text-gray-800">
              <i class="pi pi-shield text-blue-500 mr-2"></i>
              Principios SOLID
            </h3>
            <ul class="space-y-3">
              <li class="flex items-start">
                <i class="pi pi-check text-green-500 mr-2 mt-1"></i>
                <div>
                  <strong>Single Responsibility:</strong> Cada componente tiene una responsabilidad específica
                </div>
              </li>
              <li class="flex items-start">
                <i class="pi pi-check text-green-500 mr-2 mt-1"></i>
                <div>
                  <strong>Open/Closed:</strong> Extensible sin modificar código existente
                </div>
              </li>
              <li class="flex items-start">
                <i class="pi pi-check text-green-500 mr-2 mt-1"></i>
                <div>
                  <strong>Interface Segregation:</strong> Interfaces específicas por funcionalidad
                </div>
              </li>
              <li class="flex items-start">
                <i class="pi pi-check text-green-500 mr-2 mt-1"></i>
                <div>
                  <strong>Dependency Inversion:</strong> Servicios independientes con inyección de dependencias
                </div>
              </li>
            </ul>
          </div>

          <!-- Estructura del Proyecto -->
          <div>
            <h3 class="text-xl negrilla mb-4 text-gray-800">
              <i class="pi pi-folder text-yellow-500 mr-2"></i>
              Estructura de Carpetas
            </h3>
            <div class="bg-gray-50 rounded-lg p-4 font-mono texto-miga">
              <div class="text-blue-600">src/</div>
              <div class="ml-2 text-green-600">├── vistas/ <span class="text-gray-500">(views en español)</span></div>
              <div class="ml-2 text-green-600">├── componentes/ <span class="text-gray-500">(components)</span></div>
              <div class="ml-2 text-green-600">├── almacenes/ <span class="text-gray-500">(stores Pinia)</span></div>
              <div class="ml-2 text-green-600">├── servicios/ <span class="text-gray-500">(service layer)</span></div>
              <div class="ml-2 text-green-600">├── tipos/ <span class="text-gray-500">(TypeScript types)</span></div>
              <div class="ml-2 text-green-600">├── utilidades/ <span class="text-gray-500">(utilities)</span></div>
              <div class="ml-2 text-green-600">└── enrutador/ <span class="text-gray-500">(router)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center py-8 border-t border-gray-200">
      <p class="text-gray-600">
        Desarrollado con ❤️ usando Vue.js 3, TypeScript y PrimeVue 4
      </p>
      <p class="texto-miga text-gray-500 mt-2">
        Siguiendo principios SOLID y mejores prácticas de desarrollo
      </p>
    </div>
  </div>
</template>

<style scoped>
.transition-shadow {
  transition: box-shadow 0.3s ease;
}

.hover\:shadow-xl:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
