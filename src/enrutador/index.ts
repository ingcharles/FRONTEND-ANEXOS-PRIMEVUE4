import { createRouter, createWebHistory } from 'vue-router'
import VistaInicio from '../vistas/PaginaInicio.vue'

const enrutador = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'inicio',
      component: VistaInicio,
    },
    {
      path: '/acerca-de',
      name: 'acerca-de',
      // División de código a nivel de ruta
      // Esto genera un chunk separado (AcercaDe.[hash].js) para esta ruta
      // que se carga de forma diferida cuando se visita la ruta.
      component: () => import('../vistas/AcercaDe.vue'),
    },
    {
      path: '/disenador',
      name: 'disenador',
      component: () => import('../vistas/DisenadorHome.vue'),
    },
    {
      path: '/disenador-avanzado',
      name: 'disenador-avanzado',
      component: () => import('../vistas/VistaDisenador.vue'),
    }
  ],
})

export default enrutador
