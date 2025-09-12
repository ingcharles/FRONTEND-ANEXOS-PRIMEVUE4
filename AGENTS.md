# AGENTS.md

Guía para agentes (humanos y de IA como Cursor) que contribuyen a este proyecto con Vue 3, Pinia, TypeScript, PrimeVue, PrimeFlex y pruebas con Vitest. Todo el código generado en español y funciones (methods, computed, watch, emit) deben ser descriptivos y escritos
en infinitivo indicando así la acción que van a realizar, apunta a calidad, consistencia y velocidad.

## Objetivos

- Código claro, tipado y probado.
- UI accesible y consistente con PrimeVue/PrimeFlex.
- Estado predecible con Pinia.
- DX rápida con Vite + Vitest.

## Stack recomendado

- Node >=22.12.0 LTS
- Vite 7.0.6, Vue 3.5.18, TypeScript 5.8.0
- Pinia 3.0.3
- PrimeVue 4.1.1, PrimeIcons 7.0.0, PrimeFlex 3.3.1
- Vitest 2.1.8, Vue Test Utils 2.4.6
- ESLint + Prettier (reglas de TypeScript y Vue)

## Estructura de carpetas sugerida

```src/
  app/ # App.vue, main.ts, boot files
  components/disenador/componentes/  # Presentacionales y reutilizables
  pages/disenador/paginas /          # Vistas de router
  stores/ # Pinia stores
  composables/ # Lógica reutilizable (Composition API)
  services/disenador/servicios/      # API clients y adaptadores
  router/ # Configuración de rutas
  styles/ # CSS global, variables y tema
  types/ # Tipos y contratos TS
  utils/ # Utilidades puras
  test/ # Config y helpers de test
assets/
```

## Principios de código

- TypeScript estricto: evita `any` implícito, usa tipos/`interface` y genéricos.
- Composition API + `<script setup>` por defecto.
- Componentes pequeños (<200 líneas), con `name` y `props`/`emits` tipados.
- No mutar `props`; usar `v-model` con nombres explícitos (`v-model:valor`).
- Lógica de datos en composables/servicios; componentes solo presentan.
- Estado global en Pinia (acciones para mutaciones, no manipular fuera de acciones).
- Importar solo los componentes de PrimeVue usados; evita import masivo.
- Accesibilidad: etiquetas ARIA, foco manejado, contraste, navegación por teclado.
- Estilos con PrimeFlex, primevue/themes y variables CSS; evita estilos inline.
- Rutas y componentes pesados con carga diferida (code splitting).
  
## Uso estilos u componentes

- Utilizar componentes de la libreria primeVue.
- Utilizar estilos de libreria tailwindcss-primeui.

## Convenciones de commits y ramas

- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Ramas: `feature/…`, `fix/…`, `chore/…`.
- PR checklist: pruebas pasan, cobertura OK, accesibilidad básica, sin TODOs.

## Configuración de PrimeVue/PrimeFlex (ejemplo)

```ts
// src/app/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'

//import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

const app = createApp(App)
/*app.use(PrimeVue, {
 theme: {
  preset: Aura
 }
})*/
app.component('Button', Button)
app.mount('#app')
```

## Patrones de componentes (SFC) con TypeScript

```vue
<!-- src/components/nombreModulo/componentes/Saludo.vue -->
<script setup lang="ts">
const props = defineProps<{ mensaje: string }>()
const emit = defineEmits<{ (e: 'clicked'): void }>()

function onClick() {
  emit('clicked')
}
</script>

<template>
  <div class="p-4 surface-card border-round shadow-1">
    <p class="text-2xl font-medium m-0">{{ props.mensaje }}</p>
    <Button label="Haz clic" @click="onClick" />
  </div>
</template>
```

## Pinia: buenas prácticas

- Usa la sintaxis `setup` para mejor tipado.
- `state` mínimo y serializable; deriva con `computed`.
- Mutaciones solo dentro de `actions`; efectúa I/O (API) dentro de acciones.
- `storeToRefs(store)` para exponer estado a componentes.

```ts
// src/stores/contador.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useContador = defineStore('contador', () => {
  const valor = ref(0)
  const doble = computed(() => valor.value * 2)
  function incrementar(n = 1) { valor.value += n }
  return { valor, doble, incrementar }
})
```

## Servicios y composables de datos

- Aísla acceso a API en `services/` con tipos TS.
- Composables devuelven `{ data, loading, error, ... }` y aceptan dependencias inyectables (p. ej., `fetch`).

```ts
// src/services/nombreModulo/servicios/usuario.service.ts
export interface Usuario { id: number; nombre: string }

export async function getUsuarios(api = fetch): Promise<Usuario[]> {
  const res = await api('/api/users')
  if (!('ok' in res) || !(res as any).ok) throw new Error('Error de red')
  return res.json()
}

// src/composables/useDisenador.ts
import { ref } from 'vue'
import type { Disenador } from '@/types/disenador'
import { getDisenador } from '@/services/disenador/servicios/disenador.service'

export function Disenador(api = getDisenador) {
  const disenador = ref<Disenador[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)

  async function cargar() {
    cargando.value = true
    error.value = null
    try {
      disenador.value = await api()
    } catch (e: any) {
      error.value = e?.message ?? 'Error'
    } finally {
      cargando.value = false
    }
  }

  return { usuarios, cargando, error, cargar }
}
```

## Pruebas con Vitest

### Configuración base

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
})
```

```ts
// test/setup.ts
import { config } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import { beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

config.global.plugins = [[PrimeVue, { ripple: false }]]
config.global.components = { Button }
config.global.stubs = { transition: false, 'router-link': { template: '<a><slot /></a>' } }

beforeEach(() => {
  setActivePinia(createPinia())
})
```

### Prueba de componente con PrimeVue

```ts
// src/components/__tests__/Saludo.spec.ts
import { mount } from '@vue/test-utils'
import Saludo from '@/components/Saludo.vue'

it('emite "clicked" al pulsar el botón', async () => {
  const wrapper = mount(Saludo, { props: { mensaje: 'Hola' } })
  await wrapper.find('button').trigger('click')
  expect(wrapper.emitted('clicked')).toBeTruthy()
})
```

### Prueba de store Pinia

```ts
// src/stores/__tests__/contador.spec.ts
import { useContador } from '@/stores/contador'

it('incrementa correctamente', () => {
  const store = useContador()
  store.incrementar(2)
  expect(store.valor).toBe(2)
  expect(store.doble).toBe(4)
})
```

### Prueba de composable con mock

```ts
// src/composables/__tests__/useUsuarios.spec.ts
import { useUsuarios } from '@/composables/useUsuarios'
import { vi } from 'vitest'

it('carga usuarios desde el servicio', async () => {
  const mockApi = vi.fn().mockResolvedValue([{ id: 1, nombre: 'Ada' }])
  const { usuarios, cargando, cargar } = useUsuarios(mockApi as any)
  const prom = cargar()
  expect(cargando.value).toBe(true)
  await prom
  expect(usuarios.value).toHaveLength(1)
})
```

### Comandos útiles

- `npm run test` – ejecuta las pruebas una vez.
- `npm run test:watch` – modo observación.
- `npm run test:coverage` – genera cobertura.

## Accesibilidad (A11y)

- Usa componentes de PrimeVue con atributos ARIA (`aria-label`, `aria-describedby`).
- Gestiona el foco y navegación por teclado en diálogos y menús.
- Contraste mínimo WCAG AA.

## Rendimiento

- `defineProps`/`defineEmits` tipados, `computed` para derivaciones costosas.
- `v-memo`/`keep-alive` cuando corresponda.
- Rutas y componentes grandes con `defineAsyncComponent` y `import()`.

## Seguridad

- Evita `v-html` (si es imprescindible, sanitiza).
- Valida entradas; maneja errores y tiempos de espera de red.
- No expongas secretos en cliente.

## Checklist para agentes (Cursor/IA)

- [ ] ¿El cambio respeta la estructura de carpetas y patrones?
- [ ] ¿Tipos completos sin `any` innecesarios?
- [ ] ¿Incluye pruebas de unidad con Vitest y pasan?
- [ ] ¿UI usa PrimeVue/PrimeFlex y es accesible?
- [ ] ¿No se introducen dependencias sin justificación?
- [ ] ¿Se documenta cualquier decisión relevante?

## Política de dependencias

- Preferir estándar del ecosistema Vue/TS.
- Antes de añadir una dependencia: justificar alternativa, tamaño, mantenimiento y seguridad.

## Ejemplo de plantilla de componente + test

- Utilizar la palabra Deveria al incio de cada test.

```vue
<!-- src/components/usuarios/componentes/InputNombre.vue -->
<script setup lang="ts">
import { ref } from 'vue'
const nombre = defineModel<string>({ local: true })
const emit = defineEmits<{ (e: 'submit', value: string): void }>()
function enviar() { emit('submit', nombre.value?.trim() || '') }
</script>

<template>
  <div class="flex gap-2 align-items-center">
    <InputText v-model="nombre" placeholder="Tu nombre" class="w-12rem" />
    <Button label="Enviar" icon="pi pi-check" @click="enviar" />
  </div>
</template>
```

```ts
// src/tests/InputNombre.spec.ts
import { mount } from '@vue/test-utils'
import InputNombre from '@/components/InputNombre.vue'
import InputText from 'primevue/inputtext'
import PrimeVue from 'primevue/config'

it('Deveria emitir submit con el valor', async () => {
  const wrapper = mount(InputNombre, {
    global: { plugins: [[PrimeVue, {}]], components: { InputText } },
  })
  await wrapper.find('input').setValue('Grace')
  await wrapper.find('button').trigger('click')
  expect(wrapper.emitted('submit')?.[0][0]).toBe('Grace')
})
```

## Cómo empezar (local)

- `npm i`
- `npm run dev`
- `npm run test`

## Notas finales

- Mantén la coherencia y simplicidad.
- Escribe primero pruebas en casos críticos.
- Revisa el checklist antes de abrir un PR.
