<template>
  <div class="vista-previa h-full bg-gray-50 overflow-auto">
    <!-- Barra de herramientas de previsualización -->
    <div class="barra-herramientas-preview bg-white border-b border-gray-200 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h3 class="text-lg font-semibold text-gray-800">Vista Previa</h3>
          <div class="flex items-center space-x-2">
            <Button
              icon="pi pi-mobile"
              :severity="dispositivoActual === 'mobile' ? 'primary' : 'secondary'"
              size="small"
              outlined
              @click="cambiarDispositivo('mobile')"
            />
            <Button
              icon="pi pi-tablet"
              :severity="dispositivoActual === 'tablet' ? 'primary' : 'secondary'"
              size="small"
              outlined
              @click="cambiarDispositivo('tablet')"
            />
            <Button
              icon="pi pi-desktop"
              :severity="dispositivoActual === 'desktop' ? 'primary' : 'secondary'"
              size="small"
              outlined
              @click="cambiarDispositivo('desktop')"
            />
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Button
            icon="pi pi-refresh"
            label="Reiniciar"
            size="small"
            outlined
            @click="reiniciarFormulario"
          />
          <Button
            icon="pi pi-eye"
            label="Validar"
            size="small"
            @click="validarFormulario"
          />
        </div>
      </div>
    </div>

    <!-- Contenedor del formulario con viewport responsivo -->
    <div class="contenedor-viewport p-6">
      <div 
        class="viewport-formulario mx-auto bg-white rounded-lg shadow-sm border transition-all duration-300"
        :class="clasesViewport"
        :style="estilosViewport"
      >
        <!-- Información del formulario -->
        <div class="encabezado-formulario p-6 border-b border-gray-100">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            {{ store.currentForm.title }}
          </h1>
          <p v-if="store.currentForm.description" class="text-gray-600">
            {{ store.currentForm.description }}
          </p>
        </div>

        <!-- Navegación entre páginas (si hay múltiples) -->
        <div v-if="store.totalPages > 1" class="navegacion-paginas-preview p-4 bg-gray-50 border-b">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-gray-700">
                Página {{ paginaActual + 1 }} de {{ store.totalPages }}
              </span>
              <ProgressBar
                :value="((paginaActual + 1) / store.totalPages) * 100"
                class="w-32"
                :show-value="false"
              />
            </div>
            <div class="flex items-center space-x-2">
              <Button
                icon="pi pi-chevron-left"
                :disabled="paginaActual === 0"
                size="small"
                outlined
                @click="paginaAnterior"
              />
              <Button
                icon="pi pi-chevron-right"
                :disabled="paginaActual === store.totalPages - 1"
                size="small"
                outlined
                @click="paginaSiguiente"
              />
            </div>
          </div>
        </div>

        <!-- Formulario -->
        <form class="formulario-preview p-6" @submit.prevent="manejarEnvio">
          <!-- Campos de la página actual -->
          <div class="grid grid-cols-12 gap-4">
            <div
              v-for="campo in camposPaginaActual"
              :key="campo.id"
              :class="clasesColumna(campo)"
              class="campo-contenedor"
            >
              <ComponenteDinamico
                :elemento="campo"
                :modo="'preview'"
                :error-mensaje="erroresValidacion[campo.id]"
                v-model="valoresFormulario[campo.id]"
                @input="manejarCambioCampo(campo.id, $event)"
              />
            </div>
          </div>

          <!-- Botones de acción al final de cada página -->
          <div class="acciones-formulario mt-8 pt-6 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <Button
                  v-if="paginaActual > 0"
                  icon="pi pi-chevron-left"
                  label="Anterior"
                  outlined
                  @click="paginaAnterior"
                />
              </div>
              <div class="flex items-center space-x-2">
                <Button
                  v-if="paginaActual < store.totalPages - 1"
                  icon="pi pi-chevron-right"
                  icon-pos="right"
                  label="Siguiente"
                  @click="paginaSiguiente"
                />
                <Button
                  v-else
                  icon="pi pi-check"
                  label="Enviar Formulario"
                  type="submit"
                />
              </div>
            </div>
          </div>
        </form>

        <!-- Resultados de validación -->
        <div v-if="mostrarResultadosValidacion" class="resultados-validacion p-6 bg-gray-50 border-t">
          <div class="mb-4">
            <h4 class="text-lg font-semibold text-gray-800 mb-2">
              Resultados de Validación
            </h4>
          </div>
          
          <div v-if="erroresGlobales.length === 0" class="mensaje-exito">
            <div class="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <i class="pi pi-check-circle text-green-500 mr-3"></i>
              <span class="text-green-800">El formulario es válido y está listo para enviar.</span>
            </div>
          </div>

          <div v-else class="errores-validacion">
            <div class="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <i class="pi pi-exclamation-triangle text-red-500 mr-3"></i>
              <span class="text-red-800">Se encontraron {{ erroresGlobales.length }} errores de validación.</span>
            </div>
            
            <ul class="space-y-2">
              <li
                v-for="error in erroresGlobales"
                :key="error.campo"
                class="flex items-start p-3 bg-white border border-red-200 rounded"
              >
                <i class="pi pi-times-circle text-red-500 mr-2 mt-0.5"></i>
                <div>
                  <span class="font-medium text-red-800">{{ error.label }}:</span>
                  <span class="text-red-600 ml-1">{{ error.mensaje }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de datos (colapsible) -->
    <div class="panel-datos-preview fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg border">
      <div 
        class="encabezado-panel p-3 border-b cursor-pointer select-none"
        @click="panelDatosExpandido = !panelDatosExpandido"
      >
        <div class="flex items-center justify-between">
          <span class="font-medium text-gray-800">Datos del Formulario</span>
          <i 
            class="pi transition-transform duration-200"
            :class="panelDatosExpandido ? 'pi-chevron-down' : 'pi-chevron-up'"
          ></i>
        </div>
      </div>
      
      <div v-if="panelDatosExpandido" class="contenido-panel max-h-80 overflow-auto">
        <div class="p-3">
          <pre class="text-xs bg-gray-50 p-3 rounded border overflow-auto">{{ JSON.stringify(valoresFormulario, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue'
import { useDisenadorStore } from '@/stores/disenador'
import { useValidacionFormulario } from '@/composables/useValidacionFormulario'
import type { FieldSchema } from '@/types/disenador'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import ComponenteDinamico from './ComponenteDinamico.vue'

// Store
const store = inject('disenadorStore') as ReturnType<typeof useDisenadorStore> || useDisenadorStore()

// Composables
const { } = useValidacionFormulario()

// Estado local
const dispositivoActual = ref<'mobile' | 'tablet' | 'desktop'>('desktop')
const paginaActual = ref(0)
const valoresFormulario = ref<Record<string, unknown>>({})
const erroresValidacion = ref<Record<string, string>>({})
const mostrarResultadosValidacion = ref(false)
const panelDatosExpandido = ref(false)

// Computed
const camposPaginaActual = computed(() => {
  const pagina = store.currentForm.pages[paginaActual.value]
  return pagina ? pagina.fields.filter(campo => campo.visible) : []
})

const clasesViewport = computed(() => ({
  'viewport-mobile': dispositivoActual.value === 'mobile',
  'viewport-tablet': dispositivoActual.value === 'tablet',
  'viewport-desktop': dispositivoActual.value === 'desktop'
}))

const estilosViewport = computed(() => {
  switch (dispositivoActual.value) {
    case 'mobile':
      return { maxWidth: '375px', minHeight: '667px' }
    case 'tablet':
      return { maxWidth: '768px', minHeight: '1024px' }
    case 'desktop':
    default:
      return { maxWidth: '1200px', minHeight: 'auto' }
  }
})

const erroresGlobales = computed(() => {
  return Object.entries(erroresValidacion.value).map(([campoId, mensaje]) => {
    // Buscar el campo en todas las páginas
    const todosCampos = store.currentForm.pages.flatMap(pagina => pagina.fields)
    const campo = todosCampos.find(c => c.id === campoId)
    return {
      campo: campoId,
      label: campo?.label || campoId,
      mensaje
    }
  })
})

// Funciones de navegación
function cambiarDispositivo(dispositivo: 'mobile' | 'tablet' | 'desktop'): void {
  dispositivoActual.value = dispositivo
}

function paginaAnterior(): void {
  if (paginaActual.value > 0) {
    paginaActual.value--
  }
}

function paginaSiguiente(): void {
  if (paginaActual.value < store.totalPages - 1) {
    // Validar página actual antes de continuar
    const erroresPagina = validarPaginaActual()
    if (Object.keys(erroresPagina).length === 0) {
      paginaActual.value++
    } else {
      erroresValidacion.value = { ...erroresValidacion.value, ...erroresPagina }
    }
  }
}

// Funciones de formulario
function reiniciarFormulario(): void {
  valoresFormulario.value = {}
  erroresValidacion.value = {}
  mostrarResultadosValidacion.value = false
  paginaActual.value = 0
  
  // Establecer valores por defecto
  const todosCampos = store.currentForm.pages.flatMap(pagina => pagina.fields)
  todosCampos.forEach(campo => {
    if (campo.defaultValue !== undefined) {
      valoresFormulario.value[campo.id] = campo.defaultValue
    }
  })
}

function manejarCambioCampo(campoId: string, valor: unknown): void {
  valoresFormulario.value[campoId] = valor
  
  // Limpiar error del campo si existe
  if (erroresValidacion.value[campoId]) {
    delete erroresValidacion.value[campoId]
  }
  
  // Aplicar reglas de lógica condicional
  aplicarReglasLogica(campoId, valor)
}

function aplicarReglasLogica(campoId: string, valor: unknown): void {
  // Buscar campos que tengan reglas de lógica que dependan de este campo
  const todosCampos = store.currentForm.pages.flatMap(pagina => pagina.fields)
  
  todosCampos.forEach(campo => {
    if (campo.logic) {
      campo.logic.forEach(regla => {
        if (regla.condition.fieldId === campoId) {
          evaluarCondicion(regla.condition, valor)
          
          // TODO: Implementar aplicación de reglas de lógica
          // switch (regla.type) {
          //   case 'visibleSi':
          //     // Actualizar visibilidad del campo
          //     break
          //   case 'requeridoSi':
          //     // Actualizar requerimiento del campo
          //     break
          // }
        }
      })
    }
  })
}

function evaluarCondicion(condition: { fieldId: string; operator: string; value: string | number | boolean }, valor: unknown): boolean {
  const { operator, value: valorEsperado } = condition
  
  switch (operator) {
    case '==':
      return valor === valorEsperado
    case '!=':
      return valor !== valorEsperado
    case '>':
      return Number(valor) > Number(valorEsperado)
    case '<':
      return Number(valor) < Number(valorEsperado)
    case '>=':
      return Number(valor) >= Number(valorEsperado)
    case '<=':
      return Number(valor) <= Number(valorEsperado)
    case 'contains':
      return String(valor).includes(String(valorEsperado))
    case 'startsWith':
      return String(valor).startsWith(String(valorEsperado))
    case 'endsWith':
      return String(valor).endsWith(String(valorEsperado))
    default:
      return false
  }
}

function validarPaginaActual(): Record<string, string> {
  const errores: Record<string, string> = {}
  
  camposPaginaActual.value.forEach(campo => {
    const valor = valoresFormulario.value[campo.id]
    const erroresCampo = validarCampo(campo, valor)
    if (erroresCampo.length > 0) {
      errores[campo.id] = erroresCampo[0] // Tomar el primer error
    }
  })
  
  return errores
}

function validarCampo(campo: FieldSchema, valor: unknown): string[] {
  const errores: string[] = []
  
  // Validación de campo requerido
  if (campo.required && (valor === undefined || valor === null || valor === '')) {
    errores.push(`${campo.label} es requerido`)
  }
  
  // Validaciones específicas por tipo
  if (valor && typeof valor === 'string') {
    // Validaciones de longitud
    const validacionLongitud = campo.validations?.find(r => r.type === 'minLength' || r.type === 'maxLength')
    if (validacionLongitud) {
      if (validacionLongitud.type === 'minLength' && valor.length < Number(validacionLongitud.value)) {
        errores.push(validacionLongitud.message)
      }
      if (validacionLongitud.type === 'maxLength' && valor.length > Number(validacionLongitud.value)) {
        errores.push(validacionLongitud.message)
      }
    }
    
    // Validación de patrón
    const validacionPatron = campo.validations?.find(r => r.type === 'pattern')
    if (validacionPatron && validacionPatron.value) {
      const regex = new RegExp(validacionPatron.value as string)
      if (!regex.test(valor)) {
        errores.push(validacionPatron.message)
      }
    }
  }
  
  return errores
}

function validarFormulario(): void {
  // Validar todas las páginas
  const errores: Record<string, string> = {}
  
  // Obtener todos los campos de todas las páginas
  const todosCampos = store.currentForm.pages.flatMap(pagina => pagina.fields)
  
  todosCampos.forEach(campo => {
    const valor = valoresFormulario.value[campo.id]
    const erroresCampo = validarCampo(campo, valor)
    if (erroresCampo.length > 0) {
      errores[campo.id] = erroresCampo[0]
    }
  })
  
  erroresValidacion.value = errores
  mostrarResultadosValidacion.value = true
}

function manejarEnvio(): void {
  validarFormulario()
  
  if (Object.keys(erroresValidacion.value).length === 0) {
    console.log('Formulario válido, enviando...', valoresFormulario.value)
    // Aquí se podría emitir un evento o llamar a una API
  }
}

function clasesColumna(campo: FieldSchema): string {
  const responsive = campo.responsive
  if (!responsive) return 'col-span-12'
  
  // Convertir el sistema de columnas a clases de Tailwind
  const sm = responsive.sm || 12
  const md = responsive.md || responsive.sm || 12
  const lg = responsive.lg || responsive.md || responsive.sm || 12
  
  return `col-span-${sm} md:col-span-${md} lg:col-span-${lg}`
}

// Inicialización
function inicializarFormulario(): void {
  reiniciarFormulario()
}

// Watchers
watch(() => store.currentForm, () => {
  inicializarFormulario()
}, { immediate: true })

// Inicializar al montar
inicializarFormulario()
</script>

<style scoped>
.vista-previa {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.viewport-formulario {
  transition: all 0.3s ease;
}

.viewport-mobile {
  border-radius: 20px;
  box-shadow: 0 0 0 8px #333, 0 0 0 9px #666, 0 4px 20px rgba(0, 0, 0, 0.3);
}

.viewport-tablet {
  border-radius: 12px;
  box-shadow: 0 0 0 4px #333, 0 4px 20px rgba(0, 0, 0, 0.2);
}

.viewport-desktop {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.campo-contenedor {
  transition: all 0.2s ease;
}

.navegacion-paginas-preview {
  background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%);
}

.panel-datos-preview {
  max-height: calc(100vh - 200px);
  backdrop-filter: blur(10px);
}

.resultados-validacion {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

/* Estilos para el formulario */
.formulario-preview {
  min-height: 400px;
}

.acciones-formulario {
  background: linear-gradient(180deg, transparent 0%, rgba(248, 250, 252, 0.8) 100%);
}

/* Responsive */
@media (max-width: 768px) {
  .contenedor-viewport {
    padding: 1rem;
  }
  
  .panel-datos-preview {
    width: calc(100vw - 2rem);
    left: 1rem;
    right: 1rem;
  }
  
  .barra-herramientas-preview {
    padding: 1rem;
  }
  
  .barra-herramientas-preview .flex {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.campo-contenedor {
  animation: fadeIn 0.3s ease-out;
}

/* Scroll personalizado */
.contenido-panel::-webkit-scrollbar {
  width: 4px;
}

.contenido-panel::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.contenido-panel::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
</style>