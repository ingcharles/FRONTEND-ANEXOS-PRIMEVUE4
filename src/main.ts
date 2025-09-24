import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { MiPreset } from '@/styles/MiPreset'
import ToastService from 'primevue/toastservice'
import Ripple from 'primevue/ripple'
import Tooltip from 'primevue/tooltip'

// Components
import PrimeButton from 'primevue/button'
import PrimeInputText from 'primevue/inputtext'
import PrimeTextarea from 'primevue/textarea'
import PrimeInputNumber from 'primevue/inputnumber'
import PrimeSelect from 'primevue/select'
import PrimeMultiSelect from 'primevue/multiselect'
import PrimeCheckbox from 'primevue/checkbox'
import PrimeRadioButton from 'primevue/radiobutton'
import PrimeSlider from 'primevue/slider'
import PrimeSplitter from 'primevue/splitter'
import PrimeSplitterPanel from 'primevue/splitterpanel'
import PrimeCard from 'primevue/card'
import PrimePanel from 'primevue/panel'
import PrimeTab from 'primevue/tab'
import PrimeTabPanels from 'primevue/tabpanels'
import PrimeDialog from 'primevue/dialog'
import PrimeToast from 'primevue/toast'
import PrimeTabs from 'primevue/tabs'
import PrimeTabPanel from 'primevue/tabpanel'
import PrimeTabList from 'primevue/tablist'
// import Tabs from 'primevue/tabs'
// import TabList from 'primevue/tablist'
// import Tab from 'primevue/tab'
// import TabPanels from 'primevue/tabpanels'
// import TabPanel from 'primevue/tabpanel'
import PrimeMenu from 'primevue/menu'
import PrimeMenubar from 'primevue/menubar'
import PrimePanelMenu from 'primevue/panelmenu'
import PrimeDivider from 'primevue/divider'
import PrimeTreeSelect from 'primevue/treeselect'
import PrimeDatePicker from 'primevue/datepicker'
import PrimeColorPicker from 'primevue/colorpicker'
import PrimeFileUpload from 'primevue/fileupload'
import PrimeRating from 'primevue/rating'
import PrimeToggleButton from 'primevue/togglebutton'
import PrimeSelectButton from 'primevue/selectbutton'
import PrimeScrollPanel from 'primevue/scrollpanel'
import PrimeTag from 'primevue/tag'

// Styles
// import './assets/main.css' // TailwindCSS + estilos personalizados

import '@/assets/iconos/sri-menu-icon/sri-menu-icon-fuentes.min.css'
import '@/assets/iconos/sri-icon/sri-icono-fuentes.min.css'
import '@/assets/iconos/sri-app-icon/sri-app-icon-fuentes.min.css'

// import 'primevue/resources/themes/saga-blue/theme.css' // theme
// import 'primevue/resources/primevue.min.css' // core CSS
import 'primeicons/primeicons.css' // icons

import '@/assets/css/sri-en-linea-cargando.min.css'
import 'primeflex/primeflex.css'
import '@/assets/css/_sri-vue-cabecera.scss'
import '@/assets/css/_sri-vue-plantilla.scss' // Estilos globales personalizados
// import './assets/_sri-vue-variables.scss' // Variables SCSS globales
import App from './App.vue'
import router from './enrutador'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, {
  // Configurar tema styled para exponer tokens de color (requerido por tailwindcss-primeui)
  theme: {
    preset: MiPreset,
    options: {
      cssLayer: {
        name: 'primevue',
        order: 'primevue, theme, base',
      },
      // Alinear el selector de dark mode con Tailwind (ver @custom-variant en main.css)
      // darkModeSelector: '.dark',
    },
  },
})

app.use(ToastService)

app.directive('ripple', Ripple)
app.directive('tooltip', Tooltip)

app.component('PrimeButton', PrimeButton)
app.component('PrimeInputText', PrimeInputText)
app.component('PrimeTextarea', PrimeTextarea)
app.component('PrimeInputNumber', PrimeInputNumber)
app.component('PrimeSelect', PrimeSelect)
app.component('PrimeMultiSelect', PrimeMultiSelect)
app.component('PrimeCheckbox', PrimeCheckbox)
app.component('PrimeRadioButton', PrimeRadioButton)
app.component('PrimeSlider', PrimeSlider)
app.component('PrimeSplitter', PrimeSplitter)
app.component('PrimeSplitterPanel', PrimeSplitterPanel)
app.component('PrimeCard', PrimeCard)
app.component('PrimePanel', PrimePanel)
app.component('PrimeTabPanels', PrimeTabPanels)
app.component('PrimeTabList', PrimeTabList)
app.component('PrimeDialog', PrimeDialog)
app.component('PrimeToast', PrimeToast)
app.component('PrimeTab', PrimeTab)
app.component('PrimeTabs', PrimeTabs)
app.component('PrimeTabPanel', PrimeTabPanel)
// // eslint-disable-next-line vue/multi-word-component-names
// app.component('Tabs', Tabs)
// app.component('TabList', TabList)
// // eslint-disable-next-line vue/multi-word-component-names
// app.component('Tab', Tab)
// app.component('TabPanels', TabPanels)
// app.component('TabPanel', TabPanel)
app.component('PrimeMenu', PrimeMenu)
app.component('PrimeMenubar', PrimeMenubar)
app.component('PrimePanelMenu', PrimePanelMenu)
app.component('PrimeDivider', PrimeDivider)
app.component('PrimeTreeSelect', PrimeTreeSelect)
app.component('PrimeDatePicker', PrimeDatePicker)
app.component('PrimeColorPicker', PrimeColorPicker)
app.component('PrimeFileUpload', PrimeFileUpload)
app.component('PrimeRating', PrimeRating)
app.component('PrimeToggleButton', PrimeToggleButton)
app.component('PrimeSelectButton', PrimeSelectButton)
app.component('PrimeScrollPanel', PrimeScrollPanel)
app.component('PrimeTag', PrimeTag)

app.mount('#app')

// Asegurar que los cambios en el preset del tema recarguen la app (HMR no re-aplica el plugin de tema)
// if (import.meta.hot) {
//   import.meta.hot.accept(['@/styles/mi-preset'], () => {
//     // Invalida el módulo para forzar un reload completo y aplicar nuevos tokens del tema
//     import.meta.hot?.invalidate()
//   })
// }

