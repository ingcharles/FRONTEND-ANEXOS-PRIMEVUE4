import { ref, computed } from 'vue'
import { configurarServicioDecisionRules } from '@/utilidades/Logica'

// Estado global
const apiKey = ref<string>('')
const urlBase = ref<string>('')
const estaConfigurado = ref<boolean>(false)

export function usarDecisionRules() {
  const configurar = (key: string, url?: string) => {
    apiKey.value = key
    urlBase.value = url || ''
    configurarServicioDecisionRules(key, url)
    estaConfigurado.value = true

    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('decisionrules_apikey', key)
      if (url) {
        localStorage.setItem('decisionrules_url', url)
      }
    }
  }

  const cargarConfiguracion = () => {
    if (typeof window !== 'undefined') {
      const key = localStorage.getItem('decisionrules_apikey')
      const url = localStorage.getItem('decisionrules_url')

      if (key) {
        configurar(key, url || undefined)
      }
    }
  }

  const limpiarConfiguracion = () => {
    apiKey.value = ''
    urlBase.value = ''
    estaConfigurado.value = false

    if (typeof window !== 'undefined') {
      localStorage.removeItem('decisionrules_apikey')
      localStorage.removeItem('decisionrules_url')
    }
  }

  return {
    apiKey: computed(() => apiKey.value),
    urlBase: computed(() => urlBase.value),
    estaConfigurado: computed(() => estaConfigurado.value),
    configurar,
    cargarConfiguracion,
    limpiarConfiguracion
  }
}
