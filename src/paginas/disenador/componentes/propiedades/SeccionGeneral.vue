<template>
  <div class="mb-4">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Propiedades Generales</h3>

    <!-- Información del componente -->
    <PrimePanel header="Información del Componente" class="mb-3" :toggleable="false">
      <div class="flex flex-col gap-2 text-xs text-gray-600">
        <div>
          <span class="font-medium text-gray-700">ID:</span>
          <span class="ml-1">{{ campo.id }}</span>
        </div>
        <div>
          <span class="font-medium text-gray-700">Tipo:</span>
          <span class="ml-1">{{ campo.tipo }}</span>
        </div>
      </div>
    </PrimePanel>

    <!-- Tipo de campo -->
    <div class="grid grid-cols-12 gap-3">
      <div class="field" v-if="campo.tipo !== 'panel'">
        <label class="text-sm font-medium text-gray-700">Tipo</label>
        <Select
          :model-value="campo.tipo"
          @update:model-value="cambiarTipoCampo"
          :options="[...OPCIONES_TIPO_CORTO]"
          option-label="etiqueta"
          option-value="valor"
          class="w-full"
        />
      </div>

      <!-- Etiqueta -->
      <div class="field">
        <label class="text-sm font-medium text-gray-700">Etiqueta</label>
        <InputText
          :model-value="campo.etiqueta || ''"
          @update:model-value="(v: string | undefined) => actualizarTexto('etiqueta', v || '')"
          placeholder="Etiqueta del campo"
          class="w-full"
        />
      </div>

      <!-- Nombre -->
      <div class="field">
        <label class="text-sm font-medium text-gray-700">Nombre</label>
        <InputText
          :model-value="campo.nombre || ''"
          @update:model-value="(v: string | undefined) => actualizarTexto('nombre', v || '')"
          placeholder="Nombre del campo"
          class="w-full"
        />
      </div>

      <!-- Placeholder -->
      <div class="field" v-if="soportaPlaceholder(campo.tipo)">
        <label class="text-sm font-medium text-gray-700">Placeholder</label>
        <InputText
          :model-value="campo.marcadorPosicion || ''"
          @update:model-value="(v: string | undefined) => actualizarTexto('marcadorPosicion', v || '')"
          placeholder="Texto de placeholder"
          class="w-full"
        />
      </div>

      <!-- Valor por defecto para texto -->
      <div class="field" v-if="['texto', 'correo', 'contrasena', 'area-texto'].includes(campo.tipo)">
        <label class="text-sm font-medium text-gray-700">Valor por defecto</label>
        <InputText
          v-if="campo.tipo !== 'area-texto'"
          :model-value="metadatos.valorPorDefecto as string || ''"
          @update:model-value="actualizarValorPorDefecto"
          placeholder="Valor inicial"
          class="w-full"
        />
        <Textarea
          v-else
          :model-value="metadatos.valorPorDefecto as string || ''"
          @update:model-value="actualizarValorPorDefecto"
          rows="3"
          placeholder="Valor inicial"
          class="w-full"
        />
      </div>

      <!-- Valor por defecto para número -->
      <div class="field" v-if="campo.tipo === 'numero'">
        <label class="text-sm font-medium text-gray-700">Valor por defecto</label>
        <InputNumber
          :model-value="metadatos.valorPorDefecto as number || 0"
          @update:model-value="actualizarValorPorDefecto"
          placeholder="Valor inicial"
          class="w-full"
        />
      </div>

      <!-- Configuración de número - Min/Max -->
      <div class="field grid grid-cols-12 gap-3" v-if="campo.tipo === 'numero'">
        <div class="col-span-6">
          <label class="text-sm font-medium text-gray-700">Mínimo</label>
          <InputNumber
            :model-value="metadatos.minimo"
            @update:model-value="(v: number) => actualizarMetaNumero({ min: v })"
            placeholder="Valor mínimo"
            class="w-full"
          />
        </div>
        <div class="col-span-6">
          <label class="text-sm font-medium text-gray-700">Máximo</label>
          <InputNumber
            :model-value="metadatos.maximo"
            @update:model-value="(v: number) => actualizarMetaNumero({ max: v })"
            placeholder="Valor máximo"
            class="w-full"
          />
        </div>
      </div>

      <!-- Step y mensajes de validación -->
      <div class="field grid grid-cols-12 gap-3" v-if="campo.tipo === 'numero'">
        <div class="col-span-4">
          <label class="text-sm font-medium text-gray-700">Paso</label>
          <InputNumber
            :model-value="(metadatos.paso) ?? 1"
            @update:model-value="(v: number) => actualizarMetaNumero({ step: v })"
            :min="0.01"
            class="w-full"
          />
        </div>
        <div class="col-span-4">
          <label class="text-sm font-medium text-gray-700">Mensaje Min</label>
          <InputText
            :model-value="(metadatos.mensajeMinimo as string) || ''"
            @update:model-value="(v: string | undefined) => actualizarMetaNumero({ minMessage: v || '' })"
            placeholder="Mensaje error mínimo"
            class="w-full"
          />
        </div>
        <div class="col-span-4">
          <label class="text-sm font-medium text-gray-700">Mensaje Max</label>
          <InputText
            :model-value="(metadatos.mensajeMaximo as string) || ''"
            @update:model-value="(v: string | undefined) => actualizarMetaNumero({ maxMessage: v || '' })"
            placeholder="Mensaje error máximo"
            class="w-full"
          />
        </div>
      </div>

      <!-- Valor por defecto para checkbox individual -->
      <div class="field" v-if="campo.tipo === 'casilla' && !tieneOpciones">
        <label class="text-sm font-medium text-gray-700 flex items-center">
          <Checkbox
            :model-value="metadatos.valorPorDefecto as boolean || false"
            @update:model-value="actualizarValorPorDefecto"
            class="mr-2"
          />
          Marcado por defecto
        </label>
      </div>

      <!-- Configuración de fecha -->
      <div class="field" v-if="campo.tipo === 'fecha'">
        <label class="text-sm font-medium text-gray-700">Valor por defecto</label>
        <DatePicker
          :model-value="metadatos.valorPorDefecto as Date || null"
          @update:model-value="actualizarValorPorDefecto"
          placeholder="Fecha inicial"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo, MetadatosCampo } from '@/interfaces/Campos'
import type { TipoCampo } from '@/tipos/Campos'
import { OPCIONES_TIPO_CORTO } from '@/constantes/Campos'
import { soportaPlaceholder, soportaOpciones } from '@/utilidades/comunes'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import DatePicker from 'primevue/datepicker'
import Panel from 'primevue/panel'

const propiedades = defineProps<{ campo: EsquemaCampo }>()
const almacen = useAlmacenDisenador()

// Metadatos tipados
const metadatos = computed<MetadatosCampo>(() => propiedades.campo.metadatos ?? {})

const tieneOpciones = computed(() => {
  return soportaOpciones(propiedades.campo.tipo)
})

function actualizarTexto(clave: 'etiqueta' | 'nombre' | 'marcadorPosicion', valor: string): void {
  almacen.actualizarCampo(propiedades.campo.id, { [clave]: valor })
}

function cambiarTipoCampo(nuevo: TipoCampo): void {
  const metadatosActuales = { ...metadatos.value }
  const metadatosPorDefecto = obtenerMetaPorDefecto(nuevo)
  const metadatosFinales = metadatosPorDefecto ? { ...metadatosActuales, ...metadatosPorDefecto } : metadatosActuales

  almacen.actualizarCampo(propiedades.campo.id, { tipo: nuevo, metadatos: metadatosFinales })
}

function obtenerMetaPorDefecto(tipo: TipoCampo): Partial<MetadatosCampo> | undefined {
  if (tipo === 'seleccion' || tipo === 'radio') {
    return { options: [{ label: 'Item 1', value: 'item1' }, { label: 'Item 2', value: 'item2' }] }
  }
  if (tipo === 'casilla') {
    return { valorPorDefecto: false }
  }
  if (tipo === 'tabla') {
    return {
      columns: [
        { id: 'col1', nombre: 'col1', etiqueta: 'Columna 1', tipo: 'text' },
        { id: 'col2', nombre: 'col2', etiqueta: 'Columna 2', tipo: 'number' }
      ],
      filas: 1,
      agregarFilas: true,
      mostrarResumen  : true
    }
  }
  return undefined
}

function actualizarValorPorDefecto(valor: import('@/tipos/Comunes').ValorDato | import('@/tipos/Comunes').ValorDato[] | undefined): void {
  const metadatosActuales = { ...metadatos.value }
  metadatosActuales.valorPorDefecto = valor as unknown as string | number | boolean | Date
  almacen.actualizarCampo(propiedades.campo.id, { metadatos: metadatosActuales })
}

function actualizarMetaNumero(actualizacion: Partial<{ min: number; max: number; step: number; minMessage: string; maxMessage: string }>): void {
  const metadatosActuales = { ...metadatos.value }
  Object.assign(metadatosActuales, actualizacion)
  almacen.actualizarCampo(propiedades.campo.id, { metadatos: metadatosActuales })
}
</script>

