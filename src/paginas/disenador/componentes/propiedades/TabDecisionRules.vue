<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { ReglaLogica } from '@/interfaces/Validacion'
import { generarId } from '@/utilidades/GeneraId'
import { ServicioEsquemasFormulario } from '@/servicios/disenador/ServicioEsquemas'
import { usarDecisionRules } from '@/composables/usarDecisionRules'
import IconoAyuda from '@/componentes/IconoAyuda.vue'

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
// Campos disponibles para "Campos de Entrada" (excluye el campo actual)
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

// Campos disponibles para "Campos a Asignar" (incluye el campo actual)
const camposDisponiblesParaAsignar = computed(() => {
  const todosCampos: Array<{ etiqueta: string; valor: string }> = []

  for (const pagina of almacen.esquemaFormulario.paginas) {
    const camposAplanados = servicioEsquemas.aplanarCampos(pagina.campos, [])

    for (const campo of camposAplanados) {
      if (campo.nombre) {
        // Marcar el campo actual con un indicador
        const esCampoActual = campo.id === campoSeleccionado.value?.id
        const etiqueta = esCampoActual
          ? `⭐ ${campo.etiqueta || campo.nombre} (${campo.nombre}) - Campo actual`
          : `${campo.etiqueta || campo.nombre} (${campo.nombre})`

        todosCampos.push({
          etiqueta,
          valor: campo.nombre
        })
      }
    }
  }

  return todosCampos.sort((a, b) => {
    // Poner el campo actual primero
    if (a.etiqueta.startsWith('⭐')) return -1
    if (b.etiqueta.startsWith('⭐')) return 1
    return a.etiqueta.localeCompare(b.etiqueta)
  })
})

// Estado para configuración de API Key
const mostrarConfiguracion = ref(false)
const apiKey = ref('')
const urlBase = ref('')

// Computed para mostrar el origen de la configuración
const origenTexto = computed(() => {
  switch (decisionRules.origenConfiguracion.value) {
    case 'env':
      return 'Variables de Entorno'
    case 'localStorage':
      return 'localStorage'
    case 'manual':
      return 'Configuración Manual'
    default:
      return ''
  }
})

// Función para guardar configuración
function guardarConfiguracion(): void {
  if (apiKey.value) {
    decisionRules.configurar(apiKey.value, urlBase.value || undefined)
  }
}

// Opciones de eventos
const opcionesEventos = [
  { etiqueta: 'Al cambiar valor (change)', valor: 'change', descripcion: 'Se ejecuta cuando el usuario termina de editar y sale del campo' },
  { etiqueta: 'Al perder foco (blur)', valor: 'blur', descripcion: 'Se ejecuta cuando el campo pierde el foco' },
  { etiqueta: 'Mientras escribe (input)', valor: 'input', descripcion: 'Se ejecuta en tiempo real mientras el usuario escribe' }
]

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
    condicionResultado: '',
    camposAsignar: [],
    eventoEjecucion: 'change' // Valor por defecto
  }
}

// Función para manejar el cambio de acción
function onAccionChange(regla: ReglaLogica): void {
  // Si se selecciona "establecer-valor" y no hay campos de asignación, agregar uno automáticamente
  if (regla.accion === 'establecer-valor' && (!regla.camposAsignar || regla.camposAsignar.length === 0)) {
    agregarCampoAsignar(regla)
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

function agregarCampoAsignar(regla: ReglaLogica): void {
  if (!regla.camposAsignar) {
    regla.camposAsignar = []
  }
  // Si el campo seleccionado tiene nombre, usarlo por defecto
  const nombreCampoActual = campoSeleccionado.value?.nombre || ''
  regla.camposAsignar.push({
    nombreCampo: nombreCampoActual,
    expresionValor: nombreCampoActual ? `result.${nombreCampoActual}` : ''
  })
}

// Función para autocompletar la expresión cuando se selecciona un campo
function autocompletarExpresion(campoAsignar: { nombreCampo: string; expresionValor: string }): void {
  if (campoAsignar.nombreCampo && !campoAsignar.expresionValor) {
    // Autocompletar con result.nombreCampo
    campoAsignar.expresionValor = `result.${campoAsignar.nombreCampo}`
  }
}

function eliminarCampoEntrada(regla: ReglaLogica, indice: number): void {
  if (regla.camposEntrada) {
    regla.camposEntrada.splice(indice, 1)
  }
}

function eliminarCampoAsignar(regla: ReglaLogica, indice: number): void {
  if (regla.camposAsignar) {
    regla.camposAsignar.splice(indice, 1)
  }
}

function obtenerTextoAccion(accion: ReglaLogica['accion']): string {
  switch (accion) {
    case 'mostrar': return 'mostrar'
    case 'ocultar': return 'ocultar'
    case 'requerir': return 'hacer requerido'
    case 'opcional': return 'hacer opcional'
    case 'establecer-valor': return 'establecer valores en los campos'
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
          <PrimeButton :icon="mostrarConfiguracion ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" text size="small"
            @click="mostrarConfiguracion = !mostrarConfiguracion" />
        </div>
      </template>
      <template #content v-if="mostrarConfiguracion">
        <div class="grid">
          <!-- Estado de configuración -->
          <div class="col-12">
            <div class="flex align-items-center gap-2 mb-2">
              <i class="pi pi-check-circle" v-if="decisionRules.estaConfigurado.value" style="color: green"></i>
              <i class="pi pi-times-circle" v-else style="color: red"></i>
              <span class="tamanio-fuente-miga">
                {{ decisionRules.estaConfigurado.value ? 'Configurado' : 'No configurado' }}
              </span>
              <span v-if="decisionRules.estaConfigurado.value" class="tamanio-fuente-miga text-600">
                ({{ origenTexto }})
              </span>
            </div>
          </div>

          <!-- Mensaje si viene de variables de entorno -->
          <div class="col-12" v-if="decisionRules.origenConfiguracion.value === 'env'">
            <div class="p-3 border-1 border-round" style="background-color: #e3f2fd; border-color: #2196f3;">
              <div class="flex align-items-start gap-2">
                <i class="pi pi-info-circle" style="color: #2196f3; margin-top: 2px;"></i>
                <div>
                  <p class="m-0 mb-2 negrilla" style="color: #1976d2;">Configuración desde Variables de Entorno</p>
                  <small class="text-600">
                    La API Key está configurada en el archivo <code>.env</code> del proyecto.
                    Esta es la forma recomendada para producción.
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Formulario de configuración manual -->
          <template v-else>
            <div class="col-12">
              <label class="tamanio-fuente-miga">API Key</label>
              <PrimeInputText v-model="apiKey" class="ancho-100 tamanio-fuente-miga"
                placeholder="Tu API Key de DecisionRules.io" type="password" @blur="guardarConfiguracion" />
              <small class="mt-1 block">
                Obtén tu API Key desde <a href="https://app.decisionrules.io" target="_blank">DecisionRules.io</a>
              </small>
            </div>
            <div class="col-12">
              <label class="tamanio-fuente-miga">URL Base (opcional)</label>
              <PrimeInputText v-model="urlBase" class="ancho-100 tamanio-fuente-miga"
                placeholder="https://api.decisionrules.io" @blur="guardarConfiguracion" />
            </div>
            <div class="col-12">
              <PrimeButton label="Guardar Configuración" icon="pi pi-save" size="small" @click="guardarConfiguracion" />
            </div>
            <div class="col-12">
              <small class="text-600">
                💡 <strong>Recomendación:</strong> Para producción, configura <code>VITE_DECISIONRULES_API_KEY</code> en
                tu archivo <code>.env</code>
              </small>
            </div>
          </template>
        </div>
      </template>
    </PrimeCard>

    <!-- Botón para agregar nueva regla -->
    <div class="flex justify-content-end">
      <PrimeButton label="Añadir regla DecisionRules" icon="pi pi-plus" size="small" @click="agregarReglaDecisionRules"
        severity="success" />
    </div>

    <!-- Estado vacío -->
    <div v-if="reglasDecisionRules.length === 0" class="centrar-texto p-3-lg border-1">
      <i class="pi pi-cloud tamanio-fuente-24 mb-3"></i>
      <p class="contenido m-0 negrilla">No hay reglas de DecisionRules configuradas</p>
      <small class="mt-2 block">
        Las reglas de DecisionRules permiten ejecutar lógica compleja de negocio desde la nube
      </small>
      <PrimeButton label="Crear Primera Regla" icon="pi pi-plus" size="small" class="mt-3"
        @click="agregarReglaDecisionRules" />
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
          <PrimeButton icon="pi pi-trash" severity="primary" class='boton-pequenio' rounded
            @click="eliminarReglaDecisionRules(regla.id)" v-tooltip.top="'Eliminar regla'" />
        </div>
      </template>

      <!-- Contenido principal -->
      <template #content>
        <div class="grid">
          <!-- ID de la regla en DecisionRules -->
          <div class="col-12">
            <label for="idReglaDecision" class="tamanio-fuente-miga">ID de regla
              <IconoAyuda mensaje="Copia el ID de tu regla desde DecisionRules.io" />
            </label>
            <PrimeInputText for="idReglaDecision" v-model="regla.decisionRulesId" class="ancho-100 tamanio-fuente-miga"
              placeholder="c67df234-c939-6b6b-16fc-dcb9543c8c1b" />
            <small class="mt-1 block">

            </small>
          </div>

          <!-- Versión -->
          <div class="col-12">
            <label for="versionReglaDecision" class="tamanio-fuente-miga">Versión
              <IconoAyuda mensaje="Copia la versión de tu regla desde DecisionRules.io" />
            </label>
            <PrimeInputNumber id="versionReglaDecision" v-model="regla.decisionRulesVersion"
              class="ancho-100 tamanio-fuente-miga" placeholder="1" :min="1" :use-grouping="false" />
          </div>

          <!-- Acción -->
          <div class="col-12">
            <label for="accionReglaDecision" class="tamanio-fuente-miga">Acción</label>
            <PrimeSelect id="accionReglaDecision" v-model="regla.accion" :options="[
              { etiqueta: 'Mostrar', valor: 'mostrar' },
              { etiqueta: 'Ocultar', valor: 'ocultar' },
              { etiqueta: 'Requerir', valor: 'requerir' },
              { etiqueta: 'Opcional', valor: 'opcional' },
              { etiqueta: 'Establecer Valor', valor: 'establecer-valor' }
            ]" option-label="etiqueta" option-value="valor" class="ancho-100 tamanio-fuente-miga"
              placeholder="Seleccionar acción..." @change="onAccionChange(regla)" />
          </div>

          <!-- Evento de ejecución -->
          <div class="col-12">
            <label class="tamanio-fuente-miga">
              <i class="pi pi-bolt mr-2"></i>¿Cuándo ejecutar la regla?
            </label>
            <PrimeSelect v-model="regla.eventoEjecucion" :options="opcionesEventos" option-label="etiqueta"
              option-value="valor" class="ancho-100 tamanio-fuente-miga" placeholder="Seleccionar evento...">
              <template #option="slotProps">
                <div>
                  <div class="negrilla">{{ slotProps.option.etiqueta }}</div>
                  <small class="text-600">{{ slotProps.option.descripcion }}</small>
                </div>
              </template>
            </PrimeSelect>
            <small class="mt-1 block">
              Define cuándo se ejecutará la regla en los campos de entrada
            </small>
          </div>

          <!-- Campos de entrada -->
          <div class="col-12">
            <div class="flex justify-content-between align-items-center mb-2">
              <label for="campoEntrada" class="tamanio-fuente-miga negrilla">Campos de Entrada</label>
              <PrimeButton id="campoEntrada" label="Añadir campo" icon="pi pi-plus" class='boton-pequenio'
                @click="agregarCampoEntrada(regla)" />
            </div>

            <div v-if="!regla.camposEntrada || regla.camposEntrada.length === 0" class="p-3 border-1 centrar-texto">
              <small>No hay campos de entrada configurados</small>
            </div>

            <div v-else class="flex flex-column gap-2">
              <div v-for="(campoEntrada, idx) in regla.camposEntrada" :key="idx" class="p-3 border-1 grid">
                <div class="col-12 md:col-5">
                  <label class="tamanio-fuente-miga">Campo del Formulario</label>
                  <PrimeSelect v-model="campoEntrada.nombreCampo" :options="camposDisponibles" option-label="etiqueta"
                    option-value="valor" class="ancho-100 tamanio-fuente-miga" placeholder="Seleccionar campo..."
                    :filter="true" />
                </div>
                <div class="col-12">
                  <label class="tamanio-fuente-miga">Clave en DecisionRules (opcional)</label>
                  <div class="flex gap-2">
                    <PrimeInputText v-model="campoEntrada.claveDecisionRules" class="flex-1 tamanio-fuente-miga"
                      :placeholder="campoEntrada.nombreCampo || 'Deja vacío para usar el nombre del campo'" />
                    <PrimeButton icon="pi pi-times" class='boton-pequenio' severity="success"
                      v-tooltip.top="'Limpiar (usará el nombre del campo)'"
                      @click="campoEntrada.claveDecisionRules = ''" v-if="campoEntrada.claveDecisionRules" />
                  </div>
                  <small class="mt-1 block text-xs">
                    Si está vacío, usará "{{ campoEntrada.nombreCampo || 'nombreCampo' }}" como clave en el JSON
                  </small>
                </div>
                <div class="col-12 md:col-2 flex align-items-end">
                  <PrimeButton icon="pi pi-trash" severity="danger" class='boton-pequenio'
                    @click="eliminarCampoEntrada(regla, idx)" />
                </div>
              </div>
            </div>
          </div>

          <!-- Condición del resultado -->
          <div class="col-12">
            <label class="tamanio-fuente-miga">
              <i class="pi pi-code mr-2"></i>Condición del Resultado
            </label>
            <PrimeTextarea v-model="regla.condicionResultado" rows="3" class="ancho-100 tamanio-fuente-miga"
              placeholder="result.action === 'show' || result.value > 10" />
            <small class="mt-1 block">
              Expresión JavaScript para evaluar el resultado de DecisionRules.
              La variable <code>result</code> contiene la respuesta de la API.
              <br>
              <strong>Ejemplos:</strong>
              <br>• Array: <code>result[0].result === 20</code> para <code>[{"result": 20}]</code>
              <br>• Objeto: <code>result.value &lt; 6</code> para <code>{"value": 14}</code>
              <br>• Múltiples: <code>result.approved === true && result.score > 75</code>
            </small>
          </div>

          <!-- Campos a asignar (solo si la acción es establecer-valor) -->
          <div class="col-12" v-if="regla.accion === 'establecer-valor'">
            <div class="flex justify-content-between align-items-center mb-2">
              <label class="tamanio-fuente-miga negrilla">
                <i class="pi pi-arrow-right mr-2"></i>Campos a Asignar
              </label>
              <PrimeButton label="Añadir campo" icon="pi pi-plus" class='boton-pequenio'
                @click="agregarCampoAsignar(regla)" />
            </div>

            <div v-if="!regla.camposAsignar || regla.camposAsignar.length === 0" class="p-3 border-1 centrar-texto">
              <small>No hay campos de asignación configurados</small>
            </div>

            <div v-else class="flex flex-column gap-2">
              <div v-for="(campoAsignar, idx) in regla.camposAsignar" :key="idx" class="p-3 border-1 grid">
                <div class="col-12 md:col-5">
                  <label class="tamanio-fuente-miga">Campo del Formulario</label>
                  <PrimeSelect v-model="campoAsignar.nombreCampo" :options="camposDisponiblesParaAsignar"
                    option-label="etiqueta" option-value="valor" class="ancho-100 tamanio-fuente-miga"
                    placeholder="Seleccionar campo..." :filter="true" @change="autocompletarExpresion(campoAsignar)" />
                </div>
                <div class="col-12 md:col-5">
                  <label class="tamanio-fuente-miga">Expresión del Valor</label>
                  <div class="flex gap-2">
                    <PrimeInputText v-model="campoAsignar.expresionValor" class="flex-1 tamanio-fuente-miga"
                      :placeholder="campoAsignar.nombreCampo ? `result.${campoAsignar.nombreCampo}` : 'result[0].result o result.value'" />
                    <PrimeButton icon="pi pi-refresh" class='boton-pequenio'
                      v-tooltip.top="'Autocompletar con result.nombreCampo'"
                      @click="campoAsignar.expresionValor = `result.${campoAsignar.nombreCampo}`"
                      v-if="campoAsignar.nombreCampo" />
                  </div>
                  <small class="mt-1 block text-xs">
                    Expresión JavaScript para extraer el valor del resultado.
                    <span v-if="campoAsignar.nombreCampo" class="text-primary">
                      Sugerencia: <code>result.{{ campoAsignar.nombreCampo }}</code>
                    </span>
                  </small>
                </div>
                <div class="col-12 md:col-2 flex align-items-end">
                  <PrimeButton icon="pi pi-trash" severity="danger" class='boton-pequenio'
                    @click="eliminarCampoAsignar(regla, idx)" />
                </div>
              </div>
            </div>
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
