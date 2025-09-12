import { config } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea'
import { beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Configuración global para componentes de PrimeVue
config.global.plugins = [[PrimeVue, { ripple: false }]]

// Componentes globales de PrimeVue para pruebas
config.global.components = {
  Button,
  InputText,
  InputNumber,
  Dropdown,
  Calendar,
  Checkbox,
  RadioButton,
  Textarea
}

// Stubs para transiciones y router
config.global.stubs = {
  transition: false,
  'router-link': { template: '<a><slot /></a>' },
  'router-view': { template: '<div><slot /></div>' }
}

// Configuración de Pinia para cada prueba
beforeEach(() => {
  setActivePinia(createPinia())
})

// Mocks globales para APIs del navegador que no están disponibles en jsdom
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'blob:mock-url')
})

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn()
})
