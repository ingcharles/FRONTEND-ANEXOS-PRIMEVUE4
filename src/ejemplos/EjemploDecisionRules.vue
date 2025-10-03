<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usarDecisionRules } from '@/composables/usarDecisionRules'
import { ServicioDecisionRules } from '@/servicios/ServicioDecisionRules'

// Configuración
const decisionRules = usarDecisionRules()
const servicio = ref<ServicioDecisionRules | null>(null)

// Estado del formulario de prueba
const apiKey = ref('kq8fJHpPY0sDxDAn4XAp_tjMThiPjy4xh6RiKeViuFBDIXkW8PlFcFa-mg5B2bwM')
const ruleId = ref('c67df234-c939-6b6b-16fc-dcb9543c8c1b')
const version = ref(1)
const value1 = ref(3)
const value2 = ref(11)

// Resultado
const resultado = ref<any>(null)
const error = ref<string>('')
const cargando = ref(false)

onMounted(() => {
  // Cargar configuración guardada
  decisionRules.cargarConfiguracion()
  if (decisionRules.apiKey.value) {
    apiKey.value = decisionRules.apiKey.value
  }
})

async function probarRegla() {
  error.value = ''
  resultado.value = null
  cargando.value = true

  try {
    // Configurar el servicio
    if (!servicio.value) {
      servicio.value = new ServicioDecisionRules({
        apiKey: apiKey.value
      })
    }

    // Preparar la regla
    const regla = {
      id: 'test-rule',
      ruleId: ruleId.value,
      nombre: 'Regla de Prueba',
      activa: true,
      version: version.value,
      camposEntrada: [
        { nombreCampo: 'value1', claveDecisionRules: 'value1' },
        { nombreCampo: 'value2', claveDecisionRules: 'value2' }
      ],
      accionesResultado: []
    }

    // Valores del formulario
    const valores = {
      value1: value1.value,
      value2: value2.value
    }

    // Evaluar la regla
    const response = await servicio.value.evaluarRegla(regla, valores)
    resultado.value = response

    // Guardar configuración
    decisionRules.configurar(apiKey.value)
  } catch (err: any) {
    error.value = err.message || 'Error al evaluar la regla'
    console.error('Error:', err)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="p-4">
    <PrimeCard class="p-3">
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-cloud"></i>
          <span>Prueba de DecisionRules.io</span>
        </div>
      </template>

      <template #content>
        <div class="grid">
          <!-- Configuración -->
          <div class="col-12">
            <h3>Configuración</h3>
          </div>

          <div class="col-12">
            <label class="block mb-2">API Key</label>
            <PrimeInputText v-model="apiKey" class="w-full" placeholder="Tu API Key" type="password" />
          </div>

          <div class="col-12 md:col-6">
            <label class="block mb-2">Rule ID</label>
            <PrimeInputText v-model="ruleId" class="w-full" placeholder="c67df234-c939-6b6b-16fc-dcb9543c8c1b" />
          </div>

          <div class="col-12 md:col-6">
            <label class="block mb-2">Versión</label>
            <PrimeInputNumber v-model="version" class="w-full" :min="1" :use-grouping="false" />
          </div>

          <!-- Valores de entrada -->
          <div class="col-12">
            <h3>Valores de Entrada</h3>
          </div>

          <div class="col-12 md:col-6">
            <label class="block mb-2">Value 1</label>
            <PrimeInputNumber v-model="value1" class="w-full" />
          </div>

          <div class="col-12 md:col-6">
            <label class="block mb-2">Value 2</label>
            <PrimeInputNumber v-model="value2" class="w-full" />
          </div>

          <!-- Botón de prueba -->
          <div class="col-12">
            <PrimeButton label="Probar Regla" icon="pi pi-play" @click="probarRegla" :loading="cargando"
              :disabled="!apiKey || !ruleId" />
          </div>

          <!-- Resultado -->
          <div class="col-12" v-if="resultado">
            <h3>Resultado</h3>
            <pre class="p-3 bg-gray-100 border-round">{{ JSON.stringify(resultado, null, 2) }}</pre>
          </div>

          <!-- Error -->
          <div class="col-12" v-if="error">
            <PrimeMessage severity="error" :closable="false">
              {{ error }}
            </PrimeMessage>
          </div>

          <!-- Ejemplo de uso -->
          <div class="col-12">
            <h3>Ejemplo de Código</h3>
            <pre class="p-3 bg-gray-100 border-round text-sm">
import { Solver } from '@decisionrules/decisionrules';

const solver = new Solver("{{ apiKey }}");

const requestBody = {
  "value1": {{ value1 }},
  "value2": {{ value2 }}
};

solver.solveRule(
  "{{ ruleId }}",
  requestBody,
  {{ version }}
).then(response => console.log(response));
            </pre>
          </div>
        </div>
      </template>
    </PrimeCard>
  </div>
</template>

<style scoped>
pre {
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}
</style>
