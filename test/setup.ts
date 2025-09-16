import { config } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea'
import Panel from 'primevue/panel'
import Divider from 'primevue/divider'
import Tag from 'primevue/tag'
import PanelMenu from 'primevue/panelmenu'
import SelectButton from 'primevue/selectbutton'
import Tooltip from 'primevue/tooltip'
import { beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Configuración global para componentes de PrimeVue
config.global.plugins = [[PrimeVue, { ripple: false }]]

// Componentes globales de PrimeVue para pruebas
config.global.components = {
  Button,
  InputText,
  InputNumber,
  Select,
  MultiSelect,
  DatePicker,
  Checkbox,
  RadioButton,
  Textarea,
  Panel,
  Divider,
  Tag,
  // Alias con prefijo usado en componentes
  PrimeButton: Button,
  PrimeInputText: InputText,
  PrimeInputNumber: InputNumber,
  PrimeSelect: Select,
  PrimeMultiSelect: MultiSelect,
  PrimeDatePicker: DatePicker,
  PrimeCheckbox: Checkbox,
  PrimeRadioButton: RadioButton,
  PrimeTextarea: Textarea,
  PrimePanel: Panel,
  PrimeDivider: Divider,
  PrimeTag: Tag,
  PrimePanelMenu: PanelMenu,
  PrimeSelectButton: SelectButton,
  // Stubs de Tabs de PrimeVue 4 (Headless)
  Tabs: { template: '<div><slot /></div>' },
  TabList: { template: '<div><slot /></div>' },
  Tab: { template: '<div><slot /></div>' },
  TabPanels: { template: '<div><slot /></div>' },
  TabPanel: { template: '<div><slot /></div>' },
}

// Stubs para transiciones y router
config.global.stubs = {
  transition: false,
  'router-link': { template: '<a><slot /></a>' },
  'router-view': { template: '<div><slot /></div>' }
}

// Directivas
config.global.directives = {
  tooltip: Tooltip,
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

// Mock de matchMedia requerido por algunos componentes (Select)
if (!('matchMedia' in window)) {
  // @ts-expect-error jsdom no define matchMedia
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })
}
