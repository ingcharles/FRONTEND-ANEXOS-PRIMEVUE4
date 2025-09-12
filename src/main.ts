import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Ripple from 'primevue/ripple'
import Tooltip from 'primevue/tooltip'
// import Aura from '@primevue/themes/aura'

// Components
import PrimeButton from 'primevue/button'
import PrimeInputText from 'primevue/inputtext'
import PrimeTextarea from 'primevue/textarea'
import PrimeInputNumber from 'primevue/inputnumber'
import PrimeDropdown from 'primevue/dropdown'
import PrimeMultiSelect from 'primevue/multiselect'
import PrimeCheckbox from 'primevue/checkbox'
import PrimeRadioButton from 'primevue/radiobutton'
import PrimeSlider from 'primevue/slider'
import PrimeSplitter from 'primevue/splitter'
import PrimeSplitterPanel from 'primevue/splitterpanel'
import PrimeCard from 'primevue/card'
import PrimePanel from 'primevue/panel'
import PrimeDialog from 'primevue/dialog'
import PrimeToast from 'primevue/toast'
import PrimeTabView from 'primevue/tabview'
import PrimeTabPanel from 'primevue/tabpanel'
import PrimeMenu from 'primevue/menu'
import PrimeMenubar from 'primevue/menubar'
import PrimeDivider from 'primevue/divider'
import PrimeTreeSelect from 'primevue/treeselect'
import PrimeCalendar from 'primevue/calendar'
import PrimeColorPicker from 'primevue/colorpicker'
import PrimeFileUpload from 'primevue/fileupload'
import PrimeRating from 'primevue/rating'
import PrimeToggleButton from 'primevue/togglebutton'
import PrimeSelectButton from 'primevue/selectbutton'
import PrimeScrollPanel from 'primevue/scrollpanel'

// Styles
import './assets/main.css' // TailwindCSS + estilos personalizados
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, {
  // No necesita configuración de tema al usar tailwindcss-primeui
  // El estilo viene de las clases de Tailwind CSS
})

app.use(ToastService)

app.directive('ripple', Ripple)
app.directive('tooltip', Tooltip)

app.component('PrimeButton', PrimeButton)
app.component('PrimeInputText', PrimeInputText)
app.component('PrimeTextarea', PrimeTextarea)
app.component('PrimeInputNumber', PrimeInputNumber)
app.component('PrimeDropdown', PrimeDropdown)
app.component('PrimeMultiSelect', PrimeMultiSelect)
app.component('PrimeCheckbox', PrimeCheckbox)
app.component('PrimeRadioButton', PrimeRadioButton)
app.component('PrimeSlider', PrimeSlider)
app.component('PrimeSplitter', PrimeSplitter)
app.component('PrimeSplitterPanel', PrimeSplitterPanel)
app.component('PrimeCard', PrimeCard)
app.component('PrimePanel', PrimePanel)
app.component('PrimeDialog', PrimeDialog)
app.component('PrimeToast', PrimeToast)
app.component('PrimeTabView', PrimeTabView)
app.component('PrimeTabPanel', PrimeTabPanel)
app.component('PrimeMenu', PrimeMenu)
app.component('PrimeMenubar', PrimeMenubar)
app.component('PrimeDivider', PrimeDivider)
app.component('PrimeTreeSelect', PrimeTreeSelect)
app.component('PrimeCalendar', PrimeCalendar)
app.component('PrimeColorPicker', PrimeColorPicker)
app.component('PrimeFileUpload', PrimeFileUpload)
app.component('PrimeRating', PrimeRating)
app.component('PrimeToggleButton', PrimeToggleButton)
app.component('PrimeSelectButton', PrimeSelectButton)
app.component('PrimeScrollPanel', PrimeScrollPanel)

app.mount('#app')
