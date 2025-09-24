
<script setup lang="ts">
import { computed } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo, MetadatosCampo } from '@/interfaces/Campos'
import type { TipoCampo } from '@/tipos/Campos'
import { ServicioCampos } from '@/servicios/disenador/ServiciosCampos'
import { TIPOS_OPCIONES } from '@/constantes/Campos'
import { TipoCampoValor } from '@/enumeraciones/Campos'

const propiedades = defineProps<{ campo: EsquemaCampo }>()
const almacen = useAlmacenDisenador()

// Metadatos tipados
const metadatos = computed<MetadatosCampo>(() => propiedades.campo.metadatos ?? {})

const tieneOpciones = computed(() => {
  return ServicioCampos.soportaOpciones(propiedades.campo.tipo)
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
    return { opciones: [{ etiqueta: 'Item 1', valor: 'item1' }, { etiqueta: 'Item 2', valor: 'item2' }] }
  }
  if (tipo === 'casilla') {
    return { valorPorDefecto: false }
  }
  if (tipo === 'tabla') {
    return {
      columnas: [
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
<template>
  <div class="mb-4">
    <h3 class="text-lg font-medium text-color mb-4">Propiedades Generales</h3>

    <!-- Información del componente -->
    <PrimePanel class="mb-3" :toggleable="false">
      <div class="d-flex flex-column ga1 text-xs text-secondary">
        <div>
          <span class="font-medium">ID:</span>
          <span class="ml-1">{{ campo.id }}</span>
        </div>
        <div>
          <span class="font-medium">Tipo:</span>
          <span class="ml-1">{{ campo.tipo }}</span>
        </div>
      </div>
    </PrimePanel>

    <!-- Formulario de propiedades -->
    <div class="fluid">
      <!-- Tipo de campo -->
      <div class="mb-3" v-if="campo.tipo !== TipoCampoValor.Panel">
        <label class="font-medium mb-2 d-block">Tipo</label>
        <PrimeSelect
          :model-value="campo.tipo"
          @update:model-value="cambiarTipoCampo"
          :options="[...TIPOS_OPCIONES]"
          option-label="etiqueta"
          option-value="valor"
        />
      </div>

      <!-- Nombre -->
      <div class="mb-3">
        <label class="font-medium mb-2 principal">Nombre</label>
        <PrimeInputText
          :model-value="campo.nombre || ''"
          @update:model-value="(v: string | undefined) => actualizarTexto('nombre', v || '')"
          placeholder="Nombre del campo"
          class="p-inputtext principal!"
        />
      </div>

      <!-- Etiqueta -->
      <div class="mb-3">
        <label class="font-medium mb-2 d-block">Etiqueta</label>
        <PrimeInputText
          :model-value="campo.etiqueta || ''"
          @update:model-value="(v: string | undefined) => actualizarTexto('etiqueta', v || '')"
          placeholder="Etiqueta del campo"
        />
      </div>

      <!-- Placeholder -->
      <div class="mb-3" v-if="ServicioCampos.soportaPlaceholder(campo.tipo)">
        <label class="font-medium mb-2 d-block">Placeholder</label>
        <PrimeInputText
          :model-value="campo.marcadorPosicion || ''"
          @update:model-value="(v: string | undefined) => actualizarTexto('marcadorPosicion', v || '')"
          placeholder="Texto de placeholder"
        />
      </div>

      <!-- Valor por defecto para texto -->
      <div class="mb-3" v-if="ServicioCampos.esCampoDeTexto(campo.tipo)">
        <label class="font-medium mb-2 d-block">Valor por defecto</label>
        <PrimeInputText
          v-if="campo.tipo !== TipoCampoValor.AreaTexto"
          :model-value="metadatos.valorPorDefecto as string || ''"
          @update:model-value="actualizarValorPorDefecto"
          placeholder="Valor inicial"
        />
        <PrimeTextarea
          v-else
          :model-value="metadatos.valorPorDefecto as string || ''"
          @update:model-value="actualizarValorPorDefecto"
          rows="3"
          placeholder="Valor inicial"
        />
      </div>

      <!-- Valor por defecto para número -->
      <div class="mb-3" v-if="campo.tipo === TipoCampoValor.Numero">
        <label class="font-medium mb-2 d-block">Valor por defecto</label>
        <PrimeInputNumber
          :model-value="metadatos.valorPorDefecto as number || 0"
          @update:model-value="actualizarValorPorDefecto"
          placeholder="Valor inicial"
        />
      </div>

      <!-- Configuración de número - Min/Max -->
      <div class="mb-3" v-if="campo.tipo === TipoCampoValor.Numero">
        <label class="font-medium mb-2 d-block">Mínimo</label>
        <PrimeInputNumber
          :model-value="metadatos.minimo"
          @update:model-value="(v: number) => actualizarMetaNumero({ min: v })"
          placeholder="Valor mínimo"
        />
      </div>

      <div class="mb-3" v-if="campo.tipo === TipoCampoValor.Numero">
        <label class="font-medium mb-2 d-block">Máximo</label>
        <PrimeInputNumber
          :model-value="metadatos.maximo"
          @update:model-value="(v: number) => actualizarMetaNumero({ max: v })"
          placeholder="Valor máximo"
        />
      </div>

      <!-- Paso -->
      <div class="mb-3" v-if="campo.tipo === TipoCampoValor.Numero">
        <label class="font-medium mb-2 d-block">Paso</label>
        <PrimeInputNumber
          :model-value="(metadatos.paso) ?? 1"
          @update:model-value="(v: number) => actualizarMetaNumero({ step: v })"
          :min="0.01"
        />
      </div>

      <!-- Mensaje Min -->
      <div class="mb-3" v-if="campo.tipo === TipoCampoValor.Numero">
        <label class="font-medium mb-2 d-block">Mensaje Min</label>
        <PrimeInputText
          :model-value="(metadatos.mensajeMinimo as string) || ''"
          @update:model-value="(v: string | undefined) => actualizarMetaNumero({ minMessage: v || '' })"
          placeholder="Mensaje error mínimo"
        />
      </div>

      <!-- Mensaje Max -->
      <div class="mb-3" v-if="campo.tipo === TipoCampoValor.Numero">
        <label class="font-medium mb-2 d-block">Mensaje Max</label>
        <PrimeInputText
          :model-value="(metadatos.mensajeMaximo as string) || ''"
          @update:model-value="(v: string | undefined) => actualizarMetaNumero({ maxMessage: v || '' })"
          placeholder="Mensaje error máximo"
        />
      </div>

      <!-- Valor por defecto para checkbox individual -->
      <div class="mb-3" v-if="campo.tipo === TipoCampoValor.Casilla && !tieneOpciones">
        <label class="d-flex ai-center font-medium">
          <PrimeCheckbox
            :model-value="metadatos.valorPorDefecto as boolean || false"
            @update:model-value="actualizarValorPorDefecto"
            class="mr-2"
          />
          Marcado por defecto
        </label>
      </div>

      <!-- Configuración de fecha -->
      <div class="mb-3" v-if="campo.tipo === TipoCampoValor.Fecha">
        <label class="font-medium mb-2 d-block">Valor por defecto</label>
        <PrimeDatePicker
          :model-value="metadatos.valorPorDefecto as Date || null"
          @update:model-value="actualizarValorPorDefecto"
          placeholder="Fecha inicial"
        />
      </div>
    </div>
  </div>
</template>
