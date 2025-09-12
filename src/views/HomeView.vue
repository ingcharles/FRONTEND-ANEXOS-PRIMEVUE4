<script setup lang="ts">
import DisenadorFormularios from '@/components/disenador/componentes/DisenadorFormularios.vue'
</script>

<template>
  <main class="home-view">
    <!-- Hero Section -->
    <section class="hero-section bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Constructor de Formularios
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-blue-100">
            Crea formularios dinámicos con arrastra y suelta
          </p>
          <div class="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div class="feature-badge bg-white bg-opacity-20 px-4 py-2 rounded-full">
              <i class="pi pi-desktop mr-2"></i>
              Vue 3 + TypeScript
            </div>
            <div class="feature-badge bg-white bg-opacity-20 px-4 py-2 rounded-full">
              <i class="pi pi-palette mr-2"></i>
              PrimeVue 4
            </div>
            <div class="feature-badge bg-white bg-opacity-20 px-4 py-2 rounded-full">
              <i class="pi pi-check-circle mr-2"></i>
              Validación con Zod
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Diseñador Section -->
    <section class="designer-section py-8">
      <div class="max-w-full mx-auto">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Diseñador de Formularios</h2>
                <p class="text-gray-600 mt-1">
                  Arrastra componentes desde la paleta para crear tu formulario
                </p>
              </div>
              <div class="flex items-center space-x-4">
                <div class="stats-item text-center">
                  <div class="text-2xl font-bold text-blue-600">15+</div>
                  <div class="text-sm text-gray-500">Componentes</div>
                </div>
                <div class="stats-item text-center">
                  <div class="text-2xl font-bold text-green-600">100%</div>
                  <div class="text-sm text-gray-500">Responsive</div>
                </div>
                <div class="stats-item text-center">
                  <div class="text-2xl font-bold text-purple-600">∞</div>
                  <div class="text-sm text-gray-500">Validaciones</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- El componente del diseñador -->
          <div class="designer-container h-screen">
            <DisenadorFormularios />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Características Principales
          </h2>
          <p class="text-lg text-gray-600">
            Todo lo que necesitas para crear formularios profesionales
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="feature-card bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div class="feature-icon w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <i class="pi pi-palette text-blue-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Drag & Drop Visual</h3>
            <p class="text-gray-600">
              Diseña formularios intuitivamente arrastrando componentes desde la paleta
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="feature-card bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div class="feature-icon w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <i class="pi pi-mobile text-green-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Responsive Design</h3>
            <p class="text-gray-600">
              Formularios que se adaptan automáticamente a cualquier dispositivo
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="feature-card bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div class="feature-icon w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <i class="pi pi-check-circle text-purple-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Validación Avanzada</h3>
            <p class="text-gray-600">
              Sistema de validación robusto con Zod y reglas personalizables
            </p>
          </div>

          <!-- Feature 4 -->
          <div class="feature-card bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div class="feature-icon w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <i class="pi pi-eye text-orange-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Vista Previa en Tiempo Real</h3>
            <p class="text-gray-600">
              Ve cómo se verá tu formulario mientras lo diseñas
            </p>
          </div>

          <!-- Feature 5 -->
          <div class="feature-card bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div class="feature-icon w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <i class="pi pi-download text-red-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Exportación JSON</h3>
            <p class="text-gray-600">
              Exporta e importa formularios en formato JSON estándar
            </p>
          </div>

          <!-- Feature 6 -->
          <div class="feature-card bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div class="feature-icon w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <i class="pi pi-cog text-indigo-600 text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Altamente Configurable</h3>
            <p class="text-gray-600">
              Múltiples opciones de configuración para cada componente
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.feature-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.designer-container {
  min-height: calc(100vh - 200px);
}

.stats-item {
  min-width: 80px;
}

.feature-card {
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  border-color: #d1d5db;
}

.feature-icon {
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card {
  animation: fadeInUp 0.6s ease-out;
}

.feature-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3) { animation-delay: 0.3s; }
.feature-card:nth-child(4) { animation-delay: 0.4s; }
.feature-card:nth-child(5) { animation-delay: 0.5s; }
.feature-card:nth-child(6) { animation-delay: 0.6s; }

/* Responsive */
@media (max-width: 768px) {
  .designer-container {
    height: 80vh;
  }
  
  .hero-section {
    padding: 3rem 0;
  }
  
  .hero-section h1 {
    font-size: 2.5rem;
  }
  
  .hero-section p {
    font-size: 1.125rem;
  }
  
  .feature-badge {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
}
</style>
