<script setup lang="ts">
import { computed } from 'vue'
import type { EsquemaCampo } from '@/interfaces/Campos'
import { evaluarReglasCampo } from '@/utilidades/logica'
import type { RegistroDatos } from '@/tipos/Comunes'
import type { OpcionSeleccion } from '@/interfaces/Comunes'

const propiedades = defineProps<{
  campo: EsquemaCampo
  valoresCampos: RegistroDatos
  mapaIdNombre: Record<string, string>
  erroresCampos?: Record<string, string>
}>()

// Alias seguro para usar en el template
const campo = computed(() => propiedades.campo)

// Opciones normalizadas (siempre en español { etiqueta, valor })
const opcionesCampo = computed<OpcionSeleccion[]>(() => {
  const meta = (campo.value?.metadatos as Record<string, unknown> | undefined) || {}
  const opsEs = meta.opciones as OpcionSeleccion[] | undefined
  if (Array.isArray(opsEs)) return opsEs
  const opsEn = meta.options as Array<Record<string, unknown>> | undefined
  if (Array.isArray(opsEn)) {
    return opsEn.map((o) => ({ etiqueta: String(o.label ?? ''), valor: (o.value as string | number) ?? '' }))
  }
  return []
})

function clasesColumnaCampo(campo: EsquemaCampo): string[] {
  const pequeno = campo.grid?.sm ?? 12
  const mediano = campo.grid?.md ?? 6
  const grande = campo.grid?.lg ?? 6
  return [
    `col-${Math.min(12, Math.max(1, pequeno))}`,
    `md:col-${Math.min(12, Math.max(1, mediano))}`,
    `lg:col-${Math.min(12, Math.max(1, grande))}`,
    'p-2',
  ]
}

interface ColumnaTablaBasica {
  name: string
  label?: string
  type?: 'text' | 'number' | 'date'
}

interface ColumnaTablaExtendida extends ColumnaTablaBasica {
  formatMode?: 'decimal' | 'currency' | 'percent'
  currency?: string
  locale?: string
  prefix?: string
  suffix?: string
  minFractionDigits?: number
  maxFractionDigits?: number
  percentScale?: 'whole' | 'fraction'
  agg?: 'none' | 'sum' | 'avg' | 'count' | 'min' | 'max'
  aggPrefix?: string
  aggSuffix?: string
  decimals?: number
  required?: boolean
  min?: number | null
  max?: number | null
  minMessage?: string
  maxMessage?: string
}

function obtenerColumnasTabla(campo: EsquemaCampo): ColumnaTablaExtendida[] {
  const metadatos = campo.metadatos as Record<string, unknown> | undefined
  const columnasRaw = metadatos?.columns as unknown
  return Array.isArray(columnasRaw)
    ? (columnasRaw as ColumnaTablaExtendida[]).filter(c => c && typeof c.name === 'string')
    : []
}

function obtenerEstiloTabla(campo: EsquemaCampo) {
  const metadatos = campo.metadatos as Record<string, unknown> | undefined
  const estiloTabla = (metadatos?.estiloTabla ?? {}) as Partial<{
    bordered?: boolean
    striped?: boolean
    hover?: boolean
    padding?: 'sm' | 'md' | 'lg'
  }>

  let tipoRelleno: 'sm' | 'md' | 'lg' = 'md'
  if (estiloTabla.padding === 'sm' || estiloTabla.padding === 'md' || estiloTabla.padding === 'lg') {
    tipoRelleno = estiloTabla.padding
  }

  return {
    conBordes: !!estiloTabla.bordered,
    conRayas: !!estiloTabla.striped,
    conHover: !!estiloTabla.hover,
    relleno: tipoRelleno
  }
}

function claseRellenoCelda(campo: EsquemaCampo): string {
  const tipoRelleno = obtenerEstiloTabla(campo).relleno
  return tipoRelleno === 'sm' ? 'p-1' : tipoRelleno === 'lg' ? 'p-3' : 'p-2'
}

function clasesTablaCompleta(campo: EsquemaCampo): string[] {
  const estilo = obtenerEstiloTabla(campo)
  return [
    'w-full',
    'text-sm',
    estilo.conBordes ? 'border-1 surface-border' : ''
  ]
}

function clasesCeldaTabla(campo: EsquemaCampo): string[] {
  const estilo = obtenerEstiloTabla(campo)
  const clasesRelleno = claseRellenoCelda(campo)
  return [
    clasesRelleno,
    estilo.conBordes ? 'border-bottom-1 surface-border' : ''
  ]
}

function clasesFilaTabla(campo: EsquemaCampo): string[] {
  const estilo = obtenerEstiloTabla(campo)
  return [
    estilo.conRayas ? 'odd:bg-surface-100' : '',
    estilo.conHover ? 'hover:bg-surface-100' : ''
  ]
}

function crearFilaVaciaCampo(columnas: ColumnaTablaBasica[]): Record<string, import('@/tipos/Comunes').ValorDato> {
  const objetoVacio: Record<string, import('@/tipos/Comunes').ValorDato> = {}
  for (const columna of columnas) {
    // Evitar undefined: usar null como valor vacío
    objetoVacio[columna.name] = null
  }
  return objetoVacio
}

function agregarNuevaFilaCampo(campo: EsquemaCampo): void {
  const nombreCampo = campo.nombre || ''
  if (!nombreCampo) return

  const columnasTabla = obtenerColumnasTabla(campo)
  const filaNueva = crearFilaVaciaCampo(columnasTabla)
  const diccionarioValores = propiedades.valoresCampos as RegistroDatos
  const valorActual = diccionarioValores[nombreCampo]

  if (Array.isArray(valorActual)) {
    (valorActual as Array<Record<string, import('@/tipos/Comunes').ValorDato>>).push(filaNueva)
  } else {
    diccionarioValores[nombreCampo] = [filaNueva]
  }
}

function estaDeshabilitadoPorDependencia(campo: EsquemaCampo, valores: RegistroDatos): boolean {
  const meta = campo.metadatos as Record<string, unknown> | undefined
  const dep = meta?.dependencia as Record<string, unknown> | undefined
  if (!dep || dep.deshabilitarHastaValor === false) return false
  const padres = String(dep.campoPadre || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  if (padres.length === 0) return false
  return !padres.every(nombre => {
    const v = valores[nombre]
    return v !== null && v !== undefined && (typeof v !== 'string' || v.trim() !== '')
  })
}

function formatearValorAgregado(columna: ColumnaTablaExtendida, valor: number | null): string {
  if (valor == null) return ''

  const decimales = typeof columna.decimals === 'number'
    ? Math.max(0, Math.min(8, columna.decimals))
    : 2
  const cadenaNumero = (columna.agg === 'count')
    ? String(valor)
    : (Number(valor).toFixed(decimales))
  const prefijo = columna.aggPrefix ?? ''
  const sufijo = columna.aggSuffix ?? ''

  return `${prefijo}${cadenaNumero}${sufijo}`.trim()
}

function calcularValorAgregado(columna: ColumnaTablaExtendida, filasTabla: Record<string, unknown>[]): number | null {
  const valoresColumna = filasTabla.map(fila => fila[columna.name])

  if (columna.agg === 'count') {
    return valoresColumna.filter(valor =>
      valor !== undefined &&
      valor !== null &&
      String(valor).trim() !== ''
    ).length
  }

  const numerosValidos = valoresColumna
    .map(valor => typeof valor === 'string'
      ? (valor.trim() === '' ? NaN : Number(valor))
      : (typeof valor === 'number' ? valor : NaN)
    )
    .filter(numero => !Number.isNaN(numero)) as number[]

  if (numerosValidos.length === 0) {
    return columna.agg ? 0 : null
  }

  switch (columna.agg) {
    case 'sum':
      return numerosValidos.reduce((acumulador, valor) => acumulador + valor, 0)
    case 'avg':
      return numerosValidos.reduce((acumulador, valor) => acumulador + valor, 0) / numerosValidos.length
    case 'min':
      return Math.min(...numerosValidos)
    case 'max':
      return Math.max(...numerosValidos)
    default:
      return null
  }
}

const esCampoVisible = computed(() => {
  if (!propiedades.campo) return false
  return evaluarReglasCampo(propiedades.campo, propiedades.valoresCampos, propiedades.mapaIdNombre).visible
})

const esCampoRequerido = computed(() => {
  if (!propiedades.campo) return false
  return evaluarReglasCampo(propiedades.campo, propiedades.valoresCampos, propiedades.mapaIdNombre).requerido
})
</script>

<template>
  <div v-if="esCampoVisible">
    <!-- Panel contenedor -->
    <PrimePanel v-if="campo.tipo === 'panel'" :header="campo.etiqueta || 'Panel'">
      <div class="grid">
        <template v-for="campoHijo in (campo.hijos || [])" :key="campoHijo.id">
          <div :class="clasesColumnaCampo(campoHijo)">
            <RenderizadorCampo
              :campo="campoHijo"
              :valores-campos="valoresCampos"
              :mapa-id-nombre="mapaIdNombre"
              :errores-campos="erroresCampos"
            />
          </div>
        </template>
      </div>
    </PrimePanel>

    <!-- Campos simples y complejos (no panel) -->
    <template v-else>
      <label v-if="campo.etiqueta" class="block mb-1">
        {{ campo.etiqueta }}
        <span v-if="esCampoRequerido" class="text-red-500"> *</span>
      </label>

      <!-- Campo de texto -->
      <PrimeInputText
        v-if="campo.tipo === 'texto' || campo.tipo === 'correo' || campo.tipo === 'contrasena'"
        v-model="(valoresCampos as any)[campo.nombre || '']"
        :placeholder="campo.marcadorPosicion"
        class="w-full"
        :disabled="campo.deshabilitado"
        :readonly="campo.soloLectura"
      />

      <!-- Área de texto -->
      <PrimeTextarea
        v-else-if="campo.tipo === 'area-texto'"
        v-model="(valoresCampos as any)[campo.nombre || '']"
        :placeholder="campo.marcadorPosicion"
        class="w-full"
        :disabled="campo.deshabilitado"
        :readonly="campo.soloLectura"
      />

      <!-- Selector de tiempo -->
      <PrimeDatePicker
        v-else-if="campo.tipo === 'hora'"
        v-model="(valoresCampos as any)[campo.nombre || '']"
        time-only
        hour-format="24"
        class="w-full"
        :disabled="campo.deshabilitado"
      />

      <!-- Selector de fecha -->
      <PrimeDatePicker
        v-else-if="campo.tipo === 'fecha'"
        v-model="(valoresCampos as any)[campo.nombre || '']"
        class="w-full"
        :disabled="campo.deshabilitado"
      />

      <!-- Select/Dropdown -->
      <PrimeSelect
        v-else-if="campo.tipo === 'seleccion'"
        v-model="(valoresCampos as any)[campo.nombre || '']"
        :options="opcionesCampo"
        option-label="etiqueta"
        option-value="valor"
        class="w-full"
        :disabled="campo.deshabilitado || estaDeshabilitadoPorDependencia(campo, valoresCampos as any)"
      />

      <!-- Campo numérico -->
      <PrimeInputNumber
        v-else-if="campo.tipo === 'numero'"
        v-model="(valoresCampos as any)[campo.nombre || '']"
        class="w-full"
        :placeholder="campo.marcadorPosicion"
        :min="(campo.metadatos as any)?.min"
        :max="(campo.metadatos as any)?.max"
        :step="(campo.metadatos as any)?.step ?? 1"
        :disabled="campo.deshabilitado"
        :readonly="campo.soloLectura"
      />

      <!-- Checkbox -->
      <div v-else-if="campo.tipo === 'casilla'">
        <!-- Grupo de checkboxes -->
        <template v-if="Array.isArray(opcionesCampo) && (opcionesCampo.length || 0) > 0">
          <div :class="[
            'flex',
            ((campo.metadatos as any)?.layout === 'horizontal' ? 'flex-row flex-wrap gap-3' : 'flex-column gap-2')
          ]">
            <label
            v-for="opcionCheckbox in opcionesCampo"
            :key="String(opcionCheckbox.valor)"
              class="inline-flex align-items-center gap-2 flex-shrink-0"
            >
              <PrimeCheckbox
              :input-id="String(opcionCheckbox.valor)"
              :value="opcionCheckbox.valor"
                v-model="(valoresCampos as any)[campo.nombre || '']"
                :disabled="campo.deshabilitado"
              />
            <span>{{ opcionCheckbox.etiqueta }}</span>
            </label>
          </div>
        </template>

        <!-- Checkbox simple -->
        <template v-else>
          <div class="inline-flex align-items-center gap-2">
            <PrimeCheckbox
              v-model="(valoresCampos as any)[campo.nombre || '']"
              :binary="true"
              :disabled="campo.deshabilitado"
            />
          </div>
        </template>
      </div>

      <!-- Radio buttons -->
      <div v-else-if="campo.tipo === 'radio'">
        <div :class="[
          'flex',
          ((campo.metadatos as any)?.layout === 'horizontal' ? 'flex-row flex-wrap gap-3' : 'flex-column gap-2')
        ]">
          <label
            v-for="opcionRadio in opcionesCampo"
            :key="String(opcionRadio.valor)"
            class="inline-flex align-items-center gap-2 flex-shrink-0"
          >
            <PrimeRadioButton
              :input-id="String(opcionRadio.valor)"
              :value="opcionRadio.valor"
              v-model="(valoresCampos as any)[campo.nombre || '']"
              :disabled="campo.deshabilitado"
            />
            <span>{{ opcionRadio.etiqueta }}</span>
          </label>
        </div>
      </div>

      <!-- Divisor -->
      <PrimeDivider v-else-if="campo.tipo === 'divisor'" />

      <!-- Tabla -->
      <div v-else-if="campo.tipo === 'tabla'">
        <div class="overflow-auto">
          <table :class="clasesTablaCompleta(campo)">
            <thead>
              <tr>
                <th
                  v-for="columnaTabla in obtenerColumnasTabla(campo)"
                  :key="columnaTabla.name"
                  :class="[
                    'text-left',
                    claseRellenoCelda(campo),
                    obtenerEstiloTabla(campo).conBordes ? 'border-bottom-1 surface-border' : ''
                  ]"
                >
                  {{ columnaTabla.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(filaTabla, indiceFila) in (((valoresCampos as any)[campo.nombre || ''] as any[]) || [])"
                :key="indiceFila"
                :class="clasesFilaTabla(campo)"
              >
                <td
                  v-for="columnaTabla in obtenerColumnasTabla(campo)"
                  :key="columnaTabla.name"
                  :class="clasesCeldaTabla(campo)"
                >
                  <!-- Campo de texto en tabla -->
                  <PrimeInputText
                    v-if="(columnaTabla.type || 'texto') === 'texto'"
                    v-model="(valoresCampos as any)[campo.nombre || ''][indiceFila][columnaTabla.name]"
                    class="w-full"
                    :disabled="campo.deshabilitado"
                  />

                  <!-- Campo de fecha en tabla -->
                  <PrimeDatePicker
                    v-else-if="columnaTabla.type === 'date'"
                    v-model="(valoresCampos as any)[campo.nombre || ''][indiceFila][columnaTabla.name]"
                    class="w-full"
                    :disabled="campo.deshabilitado"
                  />

                  <!-- Campo numérico en tabla -->
                  <template v-else-if="columnaTabla.type === 'number'">
                    <PrimeInputNumber
                      :model-value="(columnaTabla as any).formatMode === 'percent' && (columnaTabla as any).percentScale === 'fraction'
                        ? (((valoresCampos as any)[campo.nombre || ''][indiceFila][columnaTabla.name] ?? null) as any) * 100
                        : ((valoresCampos as any)[campo.nombre || ''][indiceFila][columnaTabla.name])"
                      @update:model-value="(valorNuevo: any) => {
                        if ((columnaTabla as any).formatMode === 'percent' && (columnaTabla as any).percentScale === 'fraction') {
                          (valoresCampos as any)[campo.nombre || ''][indiceFila][columnaTabla.name] = (typeof valorNuevo === 'number' ? valorNuevo / 100 : valorNuevo)
                        } else {
                          (valoresCampos as any)[campo.nombre || ''][indiceFila][columnaTabla.name] = valorNuevo
                        }
                      }"
                      class="w-full"
                      :disabled="campo.deshabilitado"
                      :mode="(columnaTabla as any).formatMode === 'currency'
                        ? 'currency'
                        : ((columnaTabla as any).formatMode === 'percent' ? 'decimal' : 'decimal')"
                      :currency="(columnaTabla as any).formatMode === 'currency'
                        ? ((columnaTabla as any).currency || 'USD')
                        : undefined"
                      :locale="(columnaTabla as any).locale || 'es-ES'"
                      :prefix="(columnaTabla as any).prefix || ''"
                      :suffix="(columnaTabla as any).formatMode === 'percent'
                        ? '%'
                        : ((columnaTabla as any).suffix || '')"
                      :min-fraction-digits="(columnaTabla as any).minFractionDigits ?? 0"
                      :max-fraction-digits="(columnaTabla as any).maxFractionDigits ?? 2"
                    />
                  </template>

                  <!-- Campo no soportado -->
                  <span v-else class="text-muted-color">—</span>
                </td>
              </tr>
            </tbody>

            <!-- Pie de tabla con agregaciones -->
            <tfoot v-if="obtenerColumnasTabla(campo).some(c => c.agg && c.agg !== 'none') || (campo.metadatos as any)?.mostrarResumen">
              <tr>
                <td
                  v-for="(columnaTabla, indiceColumna) in obtenerColumnasTabla(campo)"
                  :key="columnaTabla.name"
                  :class="[claseRellenoCelda(campo), 'font-semibold']"
                >
                  <span v-if="indiceColumna === 0">
                    {{ (campo.metadatos as any)?.summaryLabel ?? 'Total' }}
                  </span>
                  <span class="ml-2" v-if="columnaTabla.agg && columnaTabla.agg !== 'none'">
                    {{ formatearValorAgregado(
                      columnaTabla as any,
                      calcularValorAgregado(
                        columnaTabla as any,
                        (((valoresCampos as any)[campo.nombre || ''] as Record<string, unknown>[]) || [])
                      )
                    ) }}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Botón para agregar filas -->
        <div class="mt-2" v-if="(campo.metadatos as any)?.agregarFilas">
          <PrimeButton
            size="small"
            icon="pi pi-plus"
            label="Añadir fila"
            @click.prevent="agregarNuevaFilaCampo(campo)"
          />
        </div>
      </div>

      <!-- Mensaje de error -->
      <div
        v-if="campo.nombre && erroresCampos && erroresCampos[campo.nombre]"
        class="text-red-500 mt-1"
      >
        {{ erroresCampos[campo.nombre] }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
export default { name: 'RenderizadorCampo' }
</script>

<style scoped>
</style>

