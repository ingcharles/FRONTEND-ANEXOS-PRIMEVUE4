import { ref, computed } from 'vue'
import { configurarServicioDecisionRules } from '@/utilidades/Logica'

// Estado global
const apiKey = ref<string>('')
const urlBase = ref<string>('')
const estaConfigurado = ref<boolean>(false)
const origenConfiguracion = ref<'env' | 'localStorage' | 'manual'>('env')

export function usarDecisionRules() {
  const configurar = (key: string, url?: string, origen: 'env' | 'localStorage' | 'manual' = 'manual') => {
    apiKey.value = key
    urlBase.value = url || ''
    origenConfiguracion.value = origen
    configurarServicioDecisionRules(key, url)
    estaConfigurado.value = true

    // Solo guardar en localStorage si es configuración manual
    if (origen === 'manual' && typeof window !== 'undefined') {
      localStorage.setItem('decisionrules_apikey', key)
      if (url) {
        localStorage.setItem('decisionrules_url', url)
      }
    }
  }

  const cargarConfiguracion = () => {
    // 1. Prioridad: Variables de entorno (producción)
    const envApiKey = import.meta.env.VITE_DECISIONRULES_API_KEY
    const envUrl = import.meta.env.VITE_DECISIONRULES_URL

    if (envApiKey && envApiKey.trim() !== '') {
      console.log('✅ [DecisionRules] Configuración cargada desde variables de entorno')
      configurar(envApiKey, envUrl || undefined, 'env')
      return
    }

    // 2. Fallback: localStorage (desarrollo/testing)
    if (typeof window !== 'undefined') {
      const localKey = localStorage.getItem('decisionrules_apikey')
      const localUrl = localStorage.getItem('decisionrules_url')

      if (localKey) {
        console.log('⚠️ [DecisionRules] Configuración cargada desde localStorage (considera usar variables de entorno)')
        configurar(localKey, localUrl || undefined, 'localStorage')
        return
      }
    }

    console.warn('❌ [DecisionRules] No se encontró configuración. Configura VITE_DECISIONRULES_API_KEY en .env o usa la UI')
  }

  const limpiarConfiguracion = () => {
    // Solo limpiar si no viene de variables de entorno
    if (origenConfiguracion.value !== 'env') {
      apiKey.value = ''
      urlBase.value = ''
      estaConfigurado.value = false

      if (typeof window !== 'undefined') {
        localStorage.removeItem('decisionrules_apikey')
        localStorage.removeItem('decisionrules_url')
      }
    } else {
      console.warn('⚠️ [DecisionRules] No se puede limpiar configuración de variables de entorno')
    }
  }

  return {
    apiKey: computed(() => apiKey.value),
    urlBase: computed(() => urlBase.value),
    estaConfigurado: computed(() => estaConfigurado.value),
    origenConfiguracion: computed(() => origenConfiguracion.value),
    configurar,
    cargarConfiguracion,
    limpiarConfiguracion
  }
}
