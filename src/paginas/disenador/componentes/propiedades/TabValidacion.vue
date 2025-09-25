<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { ReglaValidacion } from '@/interfaces/Validacion'
import AyudaValidacion from './AyudaValidacion.vue'
import DialogoAyuda from '@/componentes/DialogoAyuda.vue'

// Tipos específicos para este componente
interface PropiedadesTabValidacion {
  idCampo: string
}

interface TipoValidacionConfig {
  tipo: ReglaValidacion['tipo']
  titulo: string
  descripcion: string
  icono: string
  color: string
  placeholder: string
  ayuda?: string
  inputType?: 'text' | 'number'
  ejemplos?: string[]
}

// Props del componente
defineProps<PropiedadesTabValidacion>()

// Estado local
const mostrarMenuAgregar = ref(false)

// Almacén de estado
const almacen = useAlmacenDisenador()

// Estado computado
const campoSeleccionado = computed(() => almacen.campoSeleccionado)

const reglasValidacion = computed<ReglaValidacion[]>({
  get: () => campoSeleccionado.value?.validaciones ?? [],
  set: (nuevasReglas) => {
    if (campoSeleccionado.value) {
      almacen.actualizarCampo(campoSeleccionado.value.id, { validaciones: nuevasReglas })
    }
  },
})

// Configuración de tipos de validación más intuitiva
const tiposValidacionConfig: TipoValidacionConfig[] = [
  {
    tipo: 'requerido',
    titulo: 'Campo Obligatorio',
    descripcion: 'El usuario debe completar este campo',
    icono: 'pi-exclamation-triangle',
    color: 'red',
    placeholder: 'Este campo es obligatorio',
    ayuda: 'Mensaje que verá el usuario si deja el campo vacío'
  },
  {
    tipo: 'longitud-minima',
    titulo: 'Longitud Mínima',
    descripcion: 'Número mínimo de caracteres requeridos',
    icono: 'pi-arrow-down',
    color: 'blue',
    placeholder: '3',
    inputType: 'number',
    ayuda: 'Cantidad mínima de caracteres que debe tener el texto',
    ejemplos: ['3 caracteres', '5 caracteres', '10 caracteres']
  },
  {
    tipo: 'longitud-maxima',
    titulo: 'Longitud Máxima',
    descripcion: 'Número máximo de caracteres permitidos',
    icono: 'pi-arrow-up',
    color: 'orange',
    placeholder: '100',
    inputType: 'number',
    ayuda: 'Cantidad máxima de caracteres permitidos en el texto',
    ejemplos: ['50 caracteres', '100 caracteres', '255 caracteres']
  },
  {
    tipo: 'patron',
    titulo: 'Formato Específico',
    descripcion: 'El texto debe seguir un patrón específico',
    icono: 'pi-search',
    color: 'purple',
    placeholder: '^[a-zA-Z]+$',
    ayuda: 'Expresión regular que define el formato válido',
    ejemplos: ['^[a-zA-Z]+$ (solo letras)', '^\\d{4}$ (4 dígitos)', '^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$ (email)']
  },
  {
    tipo: 'personalizada',
    titulo: 'Validación Personalizada',
    descripcion: 'Lógica de validación personalizada con JavaScript',
    icono: 'pi-code',
    color: 'teal',
    placeholder: 'function(valor) { return valor > 0; }',
    ayuda: 'Función JavaScript que debe retornar true si el valor es válido'
  }
]

// Computed para tipos disponibles (excluyendo los ya agregados)
const tiposDisponibles = computed(() => {
  const tiposExistentes = reglasValidacion.value.map(r => r.tipo)
  return tiposValidacionConfig.filter(config => {
    // Permitir múltiples validaciones del mismo tipo excepto 'requerido'
    if (config.tipo === 'requerido') {
      return !tiposExistentes.includes('requerido')
    }
    return true
  })
})

// Sincronizar la propiedad requerido cuando cambia el campo seleccionado
watch(campoSeleccionado, (nuevoCampo) => {
  if (nuevoCampo) {
    const tieneValidacionRequerido = nuevoCampo.validaciones?.some(v => v.tipo === 'requerido') ?? false
    if (tieneValidacionRequerido !== nuevoCampo.requerido) {
      almacen.actualizarCampo(nuevoCampo.id, { requerido: tieneValidacionRequerido })
    }
  }
}, { immediate: true })

// Funciones de gestión
function obtenerConfigTipo(tipo: ReglaValidacion['tipo']): TipoValidacionConfig {
  return tiposValidacionConfig.find(config => config.tipo === tipo) || tiposValidacionConfig[0]
}

function agregarValidacion(tipo: ReglaValidacion['tipo']): void {
  const nuevaValidacion: ReglaValidacion = { tipo }
  reglasValidacion.value = [...reglasValidacion.value, nuevaValidacion]
  mostrarMenuAgregar.value = false

  // Si es validación requerido, actualizar la propiedad requerido del campo
  if (tipo === 'requerido' && campoSeleccionado.value) {
    almacen.actualizarCampo(campoSeleccionado.value.id, { requerido: true })
  }
}

function eliminarValidacion(indice: number): void {
  const validacionEliminada = reglasValidacion.value[indice]
  reglasValidacion.value = reglasValidacion.value.filter((_, i) => i !== indice)

  // Si se elimina la validación requerido, actualizar la propiedad requerido del campo
  if (validacionEliminada?.tipo === 'requerido' && campoSeleccionado.value) {
    const tieneOtroRequerido = reglasValidacion.value.some(v => v.tipo === 'requerido')
    if (!tieneOtroRequerido) {
      almacen.actualizarCampo(campoSeleccionado.value.id, { requerido: false })
    }
  }
}

function actualizarValorValidacion(indice: number, valor: string): void {
  const reglas = [...reglasValidacion.value]
  reglas[indice] = { ...reglas[indice], valor }
  reglasValidacion.value = reglas
}
</script>

<template>
  <div class="p-2">
    <!-- Header con botón para agregar -->
    <div class="flex align-items-center justify-content-between mb-4">
      <div class="flex align-items-center gap-2">
        <i class="pi pi-shield text-primary text-xl"></i>
        <h3 class="m-0 text-lg font-semibold text-700">Validaciones</h3>
        <AyudaValidacion />
      </div>

      <PrimeButton
        v-if="tiposDisponibles.length > 0"
        label="Agregar Validación"
        icon="pi pi-plus"
        size="small"
        @click="mostrarMenuAgregar = true"
        severity="success"
      />
    </div>

    <!-- Estado vacío mejorado -->
    <PrimeCard v-if="reglasValidacion.length === 0" class="text-center">
      <template #content>
        <div class="p-4">
          <i class="pi pi-shield-check text-6xl text-300 mb-4 block"></i>
          <h4 class="text-700 mb-2">Sin validaciones configuradas</h4>
          <p class="text-500 mb-4 line-height-3">
            Las validaciones ayudan a garantizar que los usuarios ingresen datos correctos y completos en este campo.
          </p>
          <PrimeButton
            v-if="tiposDisponibles.length > 0"
            label="Agregar Primera Validación"
            icon="pi pi-plus"
            @click="mostrarMenuAgregar = true"
            outlined
          />
        </div>
      </template>
    </PrimeCard>

    <!-- Lista de validaciones existentes -->
    <div v-else class="flex flex-column gap-3">
      <TransitionGroup name="validacion" tag="div" class="flex flex-column gap-3">
        <PrimeCard
          v-for="(regla, indice) in reglasValidacion"
          :key="`${regla.tipo}-${indice}`"
        >
          <template #header>
            <div class="flex align-items-center gap-3 p-3">
              <PrimeAvatar
                :icon="`pi ${obtenerConfigTipo(regla.tipo).icono}`"
                :style="{ backgroundColor: `var(--${obtenerConfigTipo(regla.tipo).color}-500)`, color: 'white' }"
                size="large"
              />
              <div class="flex-1">
                <h5 class="m-0 text-700 font-semibold">{{ obtenerConfigTipo(regla.tipo).titulo }}</h5>
                <p class="m-0 text-500 text-sm">{{ obtenerConfigTipo(regla.tipo).descripcion }}</p>
              </div>
              <PrimeButton
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                size="small"
                @click="eliminarValidacion(indice)"
                v-tooltip.top="'Eliminar validación'"
              />
            </div>
          </template>

          <template #content>
            <div class="p-3">
              <div class="field">
                <label class="font-medium text-sm text-700 mb-2 block">
                  {{ regla.tipo === 'requerido' ? 'Mensaje de error personalizado' : 'Configuración' }}
                </label>

                <PrimeInputText
                  :model-value="String(regla.valor || '')"
                  @update:model-value="actualizarValorValidacion(indice, $event)"
                  :placeholder="obtenerConfigTipo(regla.tipo).placeholder"
                  :type="obtenerConfigTipo(regla.tipo).inputType || 'text'"
                  class="w-full"
                />

                <small v-if="obtenerConfigTipo(regla.tipo).ayuda" class="text-500 block mt-1">
                  {{ obtenerConfigTipo(regla.tipo).ayuda }}
                </small>

                <!-- Ejemplos para algunos tipos -->
                <div v-if="obtenerConfigTipo(regla.tipo).ejemplos" class="mt-3">
                  <small class="text-600 font-medium block mb-2">Ejemplos comunes:</small>
                  <div class="flex flex-wrap gap-1">
                    <PrimeTag
                      v-for="ejemplo in obtenerConfigTipo(regla.tipo).ejemplos"
                      :key="ejemplo"
                      :value="ejemplo"
                      severity="info"
                      class="cursor-pointer"
                      @click="actualizarValorValidacion(indice, ejemplo.split(' ')[0])"
                      v-tooltip.top="`Clic para usar: ${ejemplo.split(' ')[0]}`"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </PrimeCard>
      </TransitionGroup>
    </div>

    <!-- Dialog para agregar validaciones -->
    <DialogoAyuda
      v-model:visible="mostrarMenuAgregar"
      titulo="Agregar Validación"
      ancho="500px"
    >
      <div class="flex flex-column gap-3">
        <PrimeMessage severity="info" :closable="false">
          Selecciona el tipo de validación que deseas agregar a este campo:
        </PrimeMessage>

        <div class="flex flex-column gap-2">
          <PrimeCard
            v-for="config in tiposDisponibles"
            :key="config.tipo"
            class="cursor-pointer transition-all transition-duration-200 hover:shadow-3"
            @click="agregarValidacion(config.tipo)"
          >
            <template #content>
              <div class="flex align-items-center gap-3 p-3">
                <PrimeAvatar
                  :icon="`pi ${config.icono}`"
                  :style="{ backgroundColor: `var(--${config.color}-500)`, color: 'white' }"
                />
                <div class="flex-1">
                  <h5 class="m-0 text-700 font-semibold">{{ config.titulo }}</h5>
                  <p class="m-0 text-500 text-sm">{{ config.descripcion }}</p>
                </div>
                <i class="pi pi-chevron-right text-400"></i>
              </div>
            </template>
          </PrimeCard>
        </div>
      </div>
    </DialogoAyuda>
  </div>
</template>

<style scoped>
/* Animaciones para las transiciones */
.validacion-enter-active,
.validacion-leave-active {
  transition: all 0.3s ease;
}

.validacion-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.validacion-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.validacion-move {
  transition: transform 0.3s ease;
}
</style>
