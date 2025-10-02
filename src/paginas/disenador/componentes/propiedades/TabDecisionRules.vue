<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { ReglaLogica } from '@/interfaces/Validacion'
import { generarId } from '@/utilidades/GeneraId'
import { ServicioEsquemasFormulario } from '@/servicios/disenador/ServicioEsquemas'
import { usarDecisionRules } from '@/composables/usarDecisionRules'

// Servicios
const servicioEsquemas = new ServicioEsquemasFormulario()

// Almacén de estado
const almacen = useAlmacenDisenador()

// Composable de DecisionRules
const decisionRules = usarDecisionRules()

onMounted(() => {
  decisionRules.cargarConfiguracion()
  apiKey.value = decisionRules.apiKey.value
  urlBase.value = decisionRules.urlBase.value
})

// Estado computado
const campoSeleccionado = computed(() => almacen.campoSeleccionado)

const reglasDecisionRules = computed<ReglaLogica[]>({
  get: () => (campoSeleccionado.value?.logica ?? []).filter(r => r.tipo === 'decisionrules'),
  set: (nuevasReglas) => {
    if (campoSeleccionado.value) {
      const reglasSimples = (campoSeleccionado.value.logica ?? []).filter(r => r.tipo !== 'decisionrules')
      almacen.actualizarCampo(campoSeleccionado.value.id, {
        logica: [...reglasSimples, ...nuevasReglas]
      })
    }
  },
})

// Computed para obtener todos los campos disponibles
const camposDisponibles = computed(() => {
  const todosCampos: Array<{ etiqueta: string; valor: string }> = []

  for (const pagina of almacen.esquemaFormulario.paginas) {
    const camposAplanados = servicioEsquemas.aplanarCampos(pagina.campos, [])

    for (const campo of camposAplanados) {
      if (campo.nombre && campo.id !== campoSeleccionado.value?.id) {
        todosCampos.push({
          etiqueta: `${campo.etiqueta || campo.nombre} (${campo.nombre})`,
          valor: campo.nombre
        })
      }
    }
  }

  return todosCampos.sort((a, b) => a.etiqueta.localeCompare(b.etiqueta))
})

// Estado para configuración de API Key
const mostrarConfiguracion = ref(false)
const apiKey = ref('')
const urlBase = ref('')

// Función para guardar configuración
function guardarConfiguracion(): void {
  if (apiKey.value) {
    decisionRules.configurar(apiKey.value, urlBase.value || undefined)
  }
}

// Funciones de gestión
function crearNuevaReglaDecisionRules(): ReglaLogica {
  return {
    id: generarId('dr-logic'),
    tipo: 'decisionrules',
    campoCondicionId: '',
    operador: 'personalizado',
    valor: '',
    accion: 'mostrar',
    decisionRulesId: '',
    decisionRulesVersion: 1,
    camposEntrada: [],
    condicionResultado: ''
  }
}

function agregarReglaDecisionRules(): void {
  const nuevaRegla = crearNuevaReglaDecisionRules()
  reglasDecisionRules.value = [...reglasDecisionRules.value, nuevaRegla]
}

function eliminarReglaDecisionRules(idRegla: string): void {
  reglasDecisionRules.value = reglasDecisionRules.value.filter(regla => regla.id !== idRegla)
}

function agregarCampoEntrada(regla: ReglaLogica): void {
  if (!regla.camposEntrada) {
    regla.camposEntrada = []
  }
  // Dejar claveDecisionRules vacía por defecto para que use el nombreCampo
  regla.camposEntrada.push({ nombreCampo: '', claveDecisionRules: '' })
}

function eliminarCampoEntrada(regla: ReglaLogica, indice: number): void {
  if (regla.camposEntrada) {
    regla.camposEntrada.splice(indice, 1)
  }
}

function obtenerTextoAccion(accion: ReglaLogica['accion']): string {
  switch (accion) {
    case 'mostrar': return 'mostrar'
    case 'ocultar': return 'ocultar'
    case 'requerir': return 'hacer requerido'
    case 'opcional': return 'hacer opcional'
    default: return accion
  }
}
</script>

<template>
  <div class="flex flex-column gap-3">
    <!-- Configuración de API -->
    <PrimeCard>
      <template #title>
        <div class="flex align-items-center justify-content-between">
          <span class="tamanio-fuente-miga">Configuración DecisionRules</span>
          <PrimeButton
            :icon="mostrarConfiguracion ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
            text
            size="small"
            @click="mostrarConfiguracion = !mostrarConfiguracion"
          />
        </div>
      </template>
      <template #content v-if="mostrarConfiguracion">
        <div class="grid">
          <div class="col-12">
            <div class="flex align-items-center gap-2 mb-2">
              <i class="pi pi-check-circle" v-if="decisionRules.estaConfigurado.value" style="color: green"></i>
              <i class="pi pi-times-circle" v-else style="color: red"></i>
              <span class="tamanio-fuente-miga">
                {{ decisionRules.estaConfigurado.value ? 'Configurado' : 'No configurado' }}
              </span>
            </div>
          </div>
          <div class="col-12">
            <label class="tamanio-fuente-miga">API Key</label>
            <PrimeInputText
              v-model="apiKey"
              class="ancho-100 tamanio-fuente-miga"
              placeholder="Tu API Key de DecisionRules.io"
              type="password"
              @blur="guardarConfiguracion"
            />
            <small class="mt-1 block">
              Obtén tu API Key desde <a href="https://app.decisionrules.io" target="_blank">DecisionRules.io</a>
            </small>
          </div>
          <div class="col-12">
            <label class="tamanio-fuente-miga">URL Base (opcional)</label>
            <PrimeInputText
              v-model="urlBase"
              class="ancho-100 tamanio-fuente-miga"
              placeholder="https://api.decisionrules.io"
              @blur="guardarConfiguracion"
            />
          </div>
          <div class="col-12">
            <PrimeButton
              label="Guardar Configuración"
              icon="pi pi-save"
              size="small"
              @click="guardarConfiguracion"
            />
          </div>
        </div>
      </template>
    </PrimeCard>

    <!-- Botón para agregar nueva regla -->
    <div class="flex justify-content-end">
      <PrimeButton
        label="Añadir regla DecisionRules"
        icon="pi pi-plus"
        size="small"
        @click="agregarReglaDecisionRules"
        severity="success"
      />
    </div>

    <!-- Estado vacío -->
    <div v-if="reglasDecisionRules.length === 0" class="centrar-texto p-3-lg border-1">
      <i class="pi pi-cloud tamanio-fuente-24 mb-3"></i>
      <p class="contenido m-0 negrilla">No hay reglas de DecisionRules configuradas</p>
      <small class="mt-2 block">
        Las reglas de DecisionRules permiten ejecutar lógica compleja de negocio desde la nube
      </small>
      <PrimeButton
        label="Crear Primera Regla"
        icon="pi pi-plus"
        size="small"
        class="mt-3"
        @click="agregarReglaDecisionRules"
      />
    </div>

    <!-- Lista de reglas existentes -->
    <PrimeCard v-for="(regla, indice) in reglasDecisionRules" :key="regla.id" class="mb-3">
      <!-- Header -->
      <template #title>
        <div class="flex align-items-center justify-content-between">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-cloud"></i>
            <span class="negrilla">Regla DecisionRules {{ indice + 1 }}</span>
          </div>
          <PrimeButton
            icon="pi pi-trash"
            severity="danger"
            size="small"
            text
            rounded
            @click="eliminarReglaDecisionRules(regla.id)"
            v-tooltip.top="'Eliminar regla'"
          />
        </div>
      </template>

      <!-- Contenido principal -->
      <template #content>
        <div class="grid">
          <!-- ID de la regla en DecisionRules -->
          <div class="col-12">
            <label class="tamanio-fuente-miga">ID de Regla en DecisionRules</label>
            <PrimeInputText
              v-model="regla.decisionRulesId"
              class="ancho-100 tamanio-fuente-miga"
              placeholder="c67df234-c939-6b6b-16fc-dcb9543c8c1b"
            />
            <small class="mt-1 block">
              Copia el ID de tu regla desde DecisionRules.io
            </small>
          </div>

          <!-- Versión -->
          <div class="col-12 md:col-6">
            <label class="tamanio-fuente-miga">Versión</label>
            <PrimeInputNumber
              v-model="regla.decisionRulesVersion"
              class="ancho-100 tamanio-fuente-miga"
              :min="1"
              :use-grouping="false"
            />
          </div>

          <!-- Acción -->
          <div class="col-12 md:col-6">
            <label class="tamanio-fuente-miga">Acción</label>
            <PrimeSelect
              v-model="regla.accion"
              :options="[
                { etiqueta: 'Mostrar', valor: 'mostrar' },
                { etiqueta: 'Ocultar', valor: 'ocultar' },
                { etiqueta: 'Requerir', valor: 'requerir' },
                { etiqueta: 'Opcional', valor: 'opcional' }
              ]"
              option-label="etiqueta"
              option-value="valor"
              class="ancho-100 tamanio-fuente-miga"
              placeholder="Seleccionar acción..."
            />
          </div>

          <!-- Campos de entrada -->
          <div class="col-12">
            <div class="flex justify-content-between align-items-center mb-2">
              <label class="tamanio-fuente-miga negrilla">Campos de Entrada</label>
              <PrimeButton
                label="Añadir campo"
                icon="pi pi-plus"
                size="small"
                text
                @click="agregarCampoEntrada(regla)"
              />
            </div>

            <div v-if="!regla.camposEntrada || regla.camposEntrada.length === 0" class="p-3 border-1 centrar-texto">
              <small>No hay campos de entrada configurados</small>
            </div>

            <div v-else class="flex flex-column gap-2">
              <div
                v-for="(campoEntrada, idx) in regla.camposEntrada"
                :key="idx"
                class="p-3 border-1 grid"
              >
                <div class="col-12 md:col-5">
                  <label class="tamanio-fuente-miga">Campo del Formulario</label>
                  <PrimeSelect
                    v-model="campoEntrada.nombreCampo"
                    :options="camposDisponibles"
                    option-label="etiqueta"
                    option-value="valor"
                    class="ancho-100 tamanio-fuente-miga"
                    placeholder="Seleccionar campo..."
                    :filter="true"
                  />
                </div>
                <div class="col-12 md:col-5">
                  <label class="tamanio-fuente-miga">Clave en DecisionRules (opcional)</label>
                  <div class="flex gap-2">
                    <PrimeInputText
                      v-model="campoEntrada.claveDecisionRules"
                      class="flex-1 tamanio-fuente-miga"
                      :placeholder="campoEntrada.nombreCampo || 'Deja vacío para usar el nombre del campo'"
                    />
                    <PrimeButton
                      icon="pi pi-times"
                      size="small"
                      text
                      severity="secondary"
                      v-tooltip.top="'Limpiar (usará el nombre del campo)'"
                      @click="campoEntrada.claveDecisionRules = ''"
                      v-if="campoEntrada.claveDecisionRules"
                    />
                  </div>
                  <small class="mt-1 block text-xs">
                    Si está vacío, usará "{{ campoEntrada.nombreCampo || 'nombreCampo' }}" como clave en el JSON
                  </small>
                </div>
                <div class="col-12 md:col-2 flex align-items-end">
                  <PrimeButton
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    text
                    @click="eliminarCampoEntrada(regla, idx)"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Condición del resultado -->
          <div class="col-12">
            <label class="tamanio-fuente-miga">
              <i class="pi pi-code mr-2"></i>Condición del Resultado
            </label>
            <PrimeTextarea
              v-model="regla.condicionResultado"
              rows="3"
              class="ancho-100 tamanio-fuente-miga"
              placeholder="result.action === 'show' || result.value > 10"
            />
            <small class="mt-1 block">
              Expresión JavaScript para evaluar el resultado de DecisionRules.
              La variable <code>result</code> contiene la respuesta de la API.
            </small>
          </div>
        </div>

        <!-- Resumen -->
        <div class="mt-3 p-3 text-sm">
          <i class="pi pi-info-circle mr-2"></i>
          <span class="text-600">
            <strong>Cuando</strong> la regla
            <span class="text-primary negrilla">{{ regla.decisionRulesId || '[ID no configurado]' }}</span>
            <strong> retorne un resultado que cumpla</strong>
            <span class="text-primary negrilla">"{{ regla.condicionResultado || '[condición no configurada]' }}"</span>
            <strong> entonces {{ obtenerTextoAccion(regla.accion) }}</strong> este campo.
          </span>
        </div>
      </template>
    </PrimeCard>
  </div>
</template>
