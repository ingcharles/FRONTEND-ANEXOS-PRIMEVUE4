<script setup lang="ts">
import { ref } from 'vue'

interface TechItem {
  name: string
  version: string
  description: string
  icon: string
  color: string
  url: string
}

interface FeatureItem {
  title: string
  description: string
  icon: string
  color: string
}

const tecnologias = ref<TechItem[]>([
  {
    name: 'Vue 3',
    version: '3.5.18',
    description: 'Framework progresivo para construir interfaces de usuario',
    icon: 'pi-desktop',
    color: 'green',
    url: 'https://vuejs.org/'
  },
  {
    name: 'TypeScript',
    version: '5.8.0',
    description: 'JavaScript tipado que se compila a JavaScript plano',
    icon: 'pi-code',
    color: 'blue',
    url: 'https://www.typescriptlang.org/'
  },
  {
    name: 'PrimeVue',
    version: '4.1.1',
    description: 'Biblioteca de componentes UI rica y completa',
    icon: 'pi-palette',
    color: 'purple',
    url: 'https://primevue.org/'
  },
  {
    name: 'Pinia',
    version: '3.0.3',
    description: 'Gestor de estado intuitivo, seguro y escalable',
    icon: 'pi-database',
    color: 'orange',
    url: 'https://pinia.vuejs.org/'
  },
  {
    name: 'Vite',
    version: '7.0.6',
    description: 'Herramienta de build rápida y moderna',
    icon: 'pi-bolt',
    color: 'yellow',
    url: 'https://vitejs.dev/'
  },
  {
    name: 'Vitest',
    version: '2.1.8',
    description: 'Framework de testing ultrarrápido para Vue',
    icon: 'pi-check-circle',
    color: 'teal',
    url: 'https://vitest.dev/'
  }
])

const caracteristicas = ref<FeatureItem[]>([
  {
    title: 'Drag & Drop Nativo',
    description: 'Interfaz intuitiva para arrastrar y soltar componentes del formulario',
    icon: 'pi-arrows-alt',
    color: 'blue'
  },
  {
    title: 'Validación Robusta',
    description: 'Sistema completo de validación con Zod y reglas personalizables',
    icon: 'pi-shield',
    color: 'green'
  },
  {
    title: 'Vista Previa en Tiempo Real',
    description: 'Ve los cambios instantáneamente mientras diseñas tu formulario',
    icon: 'pi-eye',
    color: 'purple'
  },
  {
    title: 'Exportación JSON',
    description: 'Guarda e importa formularios en formato JSON estándar',
    icon: 'pi-download',
    color: 'orange'
  },
  {
    title: 'Responsive Design',
    description: 'Formularios que se adaptan automáticamente a cualquier dispositivo',
    icon: 'pi-mobile',
    color: 'cyan'
  },
  {
    title: 'Componentes Extensibles',
    description: 'Arquitectura modular que permite añadir nuevos tipos de campo',
    icon: 'pi-plus-circle',
    color: 'pink'
  }
])

const estadisticas = ref([
  { label: 'Componentes Disponibles', valor: '15+', icon: 'pi-th-large', color: 'blue' },
  { label: 'Tipos de Validación', valor: '20+', icon: 'pi-check', color: 'green' },
  { label: 'Líneas de Código', valor: '3000+', icon: 'pi-code', color: 'purple' },
  { label: 'Cobertura de Tests', valor: '95%', icon: 'pi-chart-line', color: 'orange' }
])

function abrirUrl(url: string) {
  window.open(url, '_blank')
}
</script>

<template>
  <div class="about-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="max-w-4xl mx-auto text-center px-4 py-16">
        <div class="hero-icon mb-6">
          <i class="pi pi-cog text-6xl text-white"></i>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-6">
          Constructor de Formularios Dinámicos
        </h1>
        <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Una aplicación moderna construida con Vue 3 y TypeScript que permite crear
          formularios interactivos mediante una interfaz de arrastrar y soltar.
        </p>
        <div class="version-badge">
          <i class="pi pi-tag mr-2"></i>
          Versión 1.0.0
        </div>
      </div>
    </section>

    <!-- Estadísticas -->
    <section class="stats-section py-16">
      <div class="max-w-6xl mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div
            v-for="stat in estadisticas"
            :key="stat.label"
            class="stat-card"
          >
            <div :class="`stat-icon bg-${stat.color}-100`">
              <i :class="`pi ${stat.icon} text-${stat.color}-600`"></i>
            </div>
            <div class="stat-value">{{ stat.valor }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tecnologías -->
    <section class="tech-section py-16 bg-gray-50">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Tecnologías Utilizadas
          </h2>
          <p class="text-lg text-gray-600">
            Stack moderno y confiable para máximo rendimiento
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="tech in tecnologias"
            :key="tech.name"
            class="tech-card group cursor-pointer"
            @click="abrirUrl(tech.url)"
          >
            <div class="tech-header">
              <div :class="`tech-icon bg-${tech.color}-100`">
                <i :class="`pi ${tech.icon} text-${tech.color}-600`"></i>
              </div>
              <div class="tech-info">
                <h3 class="tech-name">{{ tech.name }}</h3>
                <span class="tech-version">v{{ tech.version }}</span>
              </div>
            </div>
            <p class="tech-description">{{ tech.description }}</p>
            <div class="tech-arrow">
              <i class="pi pi-external-link text-gray-400 group-hover:text-blue-600"></i>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Características -->
    <section class="features-section py-16">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Características Principales
          </h2>
          <p class="text-lg text-gray-600">
            Funcionalidades diseñadas para desarrolladores modernos
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            v-for="feature in caracteristicas"
            :key="feature.title"
            class="feature-card"
          >
            <div :class="`feature-icon bg-${feature.color}-100`">
              <i :class="`pi ${feature.icon} text-${feature.color}-600`"></i>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Arquitectura -->
    <section class="architecture-section py-16 bg-gray-900">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold text-white mb-8">
          Arquitectura del Proyecto
        </h2>

        <div class="architecture-diagram bg-gray-800 rounded-lg p-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Capa de Presentación -->
            <div class="arch-layer">
              <div class="arch-icon bg-blue-100">
                <i class="pi pi-desktop text-blue-600"></i>
              </div>
              <h3 class="arch-title text-white">Presentación</h3>
              <ul class="arch-list">
                <li>Vue 3 Components</li>
                <li>Composition API</li>
                <li>PrimeVue UI</li>
                <li>Responsive Design</li>
              </ul>
            </div>

            <!-- Capa de Lógica -->
            <div class="arch-layer">
              <div class="arch-icon bg-green-100">
                <i class="pi pi-cog text-green-600"></i>
              </div>
              <h3 class="arch-title text-white">Lógica de Negocio</h3>
              <ul class="arch-list">
                <li>Pinia Stores</li>
                <li>Composables</li>
                <li>TypeScript Types</li>
                <li>Validación Zod</li>
              </ul>
            </div>

            <!-- Capa de Datos -->
            <div class="arch-layer">
              <div class="arch-icon bg-purple-100">
                <i class="pi pi-database text-purple-600"></i>
              </div>
              <h3 class="arch-title text-white">Gestión de Datos</h3>
              <ul class="arch-list">
                <li>JSON Schema</li>
                <li>Local Storage</li>
                <li>Import/Export</li>
                <li>State Management</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="mt-8 text-gray-300">
          <p class="mb-4">
            <strong>Patrón de Diseño:</strong> Model-View-ViewModel (MVVM) con Composition API
          </p>
          <p>
            <strong>Principios:</strong> Separación de responsabilidades, reutilización de código,
            tipado estricto y testing
          </p>
        </div>
      </div>
    </section>

    <!-- Información del Proyecto -->
    <section class="project-info py-16">
      <div class="max-w-4xl mx-auto px-4">
        <div class="info-grid">
          <div class="info-card">
            <i class="pi pi-github text-3xl text-gray-700 mb-4"></i>
            <h3 class="text-xl font-semibold mb-2">Código Abierto</h3>
            <p class="text-gray-600">
              Proyecto desarrollado siguiendo las mejores prácticas de Vue.js y TypeScript
            </p>
          </div>

          <div class="info-card">
            <i class="pi pi-users text-3xl text-gray-700 mb-4"></i>
            <h3 class="text-xl font-semibold mb-2">Contribuciones</h3>
            <p class="text-gray-600">
              Desarrollado con amor por la comunidad. ¡Las contribuciones son bienvenidas!
            </p>
          </div>

          <div class="info-card">
            <i class="pi pi-book text-3xl text-gray-700 mb-4"></i>
            <h3 class="text-xl font-semibold mb-2">Documentación</h3>
            <p class="text-gray-600">
              Código autodocumentado con TypeScript y comentarios detallados
            </p>
          </div>

          <div class="info-card">
            <i class="pi pi-heart text-3xl text-gray-700 mb-4"></i>
            <h3 class="text-xl font-semibold mb-2">Hecho con ❤️</h3>
            <p class="text-gray-600">
              Creado para desarrolladores que buscan herramientas modernas y eficientes
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-view {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.version-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: 500;
}

/* Stats Section */
.stat-card {
  text-align: center;
  padding: 1.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Tech Section */
.tech-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tech-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.tech-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.tech-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.25rem;
}

.tech-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.tech-version {
  font-size: 0.875rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-left: 0.5rem;
}

.tech-description {
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.tech-arrow {
  position: absolute;
  top: 1rem;
  right: 1rem;
  transition: all 0.3s ease;
}

/* Features Section */
.feature-card {
  display: flex;
  align-items: flex-start;
  padding: 1.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
}

.feature-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.feature-description {
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

/* Architecture Section */
.architecture-diagram {
  border: 1px solid #374151;
}

.arch-layer {
  text-align: center;
  padding: 1rem;
}

.arch-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
}

.arch-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.arch-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.arch-list li {
  color: #9ca3af;
  padding: 0.25rem 0;
  font-size: 0.875rem;
}

/* Project Info Section */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.info-card {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.info-card:hover {
  transform: translateY(-4px);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 0;
  }

  .hero-section h1 {
    font-size: 2rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .tech-card {
    padding: 1rem;
  }

  .feature-card {
    flex-direction: column;
    text-align: center;
  }

  .feature-icon {
    margin: 0 auto 1rem auto;
  }
}

/* Color Classes */
.bg-blue-100 { background-color: #dbeafe; }
.text-blue-600 { color: #2563eb; }
.bg-green-100 { background-color: #dcfce7; }
.text-green-600 { color: #16a34a; }
.bg-purple-100 { background-color: #e9d5ff; }
.text-purple-600 { color: #9333ea; }
.bg-orange-100 { background-color: #fed7aa; }
.text-orange-600 { color: #ea580c; }
.bg-yellow-100 { background-color: #fef3c7; }
.text-yellow-600 { color: #d97706; }
.bg-teal-100 { background-color: #ccfbf1; }
.text-teal-600 { color: #0d9488; }
.bg-cyan-100 { background-color: #cffafe; }
.text-cyan-600 { color: #0891b2; }
.bg-pink-100 { background-color: #fce7f3; }
.text-pink-600 { color: #db2777; }
</style>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
