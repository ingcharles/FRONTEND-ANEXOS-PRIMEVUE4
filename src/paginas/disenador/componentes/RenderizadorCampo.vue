<script setup lang="ts">
import { computed } from 'vue'
import type { ColumnaTablaBasica, ColumnaTablaExtendida, EsquemaCampo } from '@/interfaces/Campos'
import { evaluarReglasCampo } from '@/utilidades/Logica'
import type { RegistroDatos, TamanoDiseno, ValorDato } from '@/tipos/Comunes'
import type { OpcionSeleccion } from '@/interfaces/Comunes'
import { TipoCampoValor } from '@/enumeraciones/Campos'

const propiedades = defineProps<{
  campo: EsquemaCampo
  valoresCampos: RegistroDatos
  mapaIdNombre: Record<string, string>
  erroresCampos?: Record<string, string>
}>()

const emit = defineEmits<(e: 'valor-cambiado', nombre: string, valor: unknown) => void>()

// Alias seguro para usar en el template
const campo = computed(() => propiedades.campo)

// Opciones normalizadas (siempre en español { etiqueta, valor })
const opcionesCampo = computed<OpcionSeleccion[]>(() => {
  const meta = (campo.value?.metadatos as Record<string, unknown> | undefined) || {}
  const opsEs = meta.opciones as OpcionSeleccion[] | undefined
  if (Array.isArray(opsEs)) return opsEs
  const opsEn = meta.opciones as Array<Record<string, unknown>> | undefined
  if (Array.isArray(opsEn)) {
    return opsEn.map((o) => ({ etiqueta: String(o.label ?? ''), valor: (o.value as string | number) ?? '' }))
  }
  return []
})

function clasesColumnaCampo(campo: EsquemaCampo): string[] {
  const pequeno = campo.grid?.sm ?? 12
  const mediano = campo.grid?.md ?? 12
  const grande = campo.grid?.lg ?? 12
  return [
    `col-${Math.min(12, Math.max(1, pequeno))}`,
    `md:col-${Math.min(12, Math.max(1, mediano))}`,
    `lg:col-${Math.min(12, Math.max(1, grande))}`,
    'p-2',
  ]
}



function obtenerColumnasTabla(campo: EsquemaCampo): ColumnaTablaExtendida[] {
  const metadatos = campo.metadatos as Record<string, unknown> | undefined
  const columnasRaw = metadatos?.columnas as unknown
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
    padding?: TamanoDiseno
  }>

  let tipoRelleno: TamanoDiseno = 'md'
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
    'ancho-100 texto-miga',
    'texto-miga',
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

function crearFilaVaciaCampo(columnas: ColumnaTablaBasica[]): Record<string, ValorDato> {
  const objetoVacio: Record<string, ValorDato> = {}
  for (const columna of columnas) {
    objetoVacio[columna.name] = null
  }
  return objetoVacio
}

function agregarNuevaFilaCampo(campo: EsquemaCampo): void {
  const nombreCampo = campo.nombre || ''
  if (!nombreCampo) return

  const columnasTabla = obtenerColumnasTabla(campo)
  const filaNueva = crearFilaVaciaCampo(columnasTabla)
  const valorActual = propiedades.valoresCampos[nombreCampo]

  let nuevasFilas: Array<Record<string, ValorDato>>
  if (Array.isArray(valorActual)) {
    nuevasFilas = [...(valorActual as Array<Record<string, ValorDato>>), filaNueva]
  } else {
    nuevasFilas = [filaNueva]
  }

  // Emitir el cambio al componente padre
  emit('valor-cambiado', nombreCampo, nuevasFilas)
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

// Funciones auxiliares para el manejo de tablas
function obtenerFilasTabla(campo: EsquemaCampo): Record<string, unknown>[] {
  const nombreCampo = campo.nombre || ''
  if (!nombreCampo) return []

  const valorActual = propiedades.valoresCampos[nombreCampo]

  if (Array.isArray(valorActual)) {
    return valorActual as Record<string, unknown>[]
  }

  // Si no hay valor, crear filas iniciales
  const metadatos = campo.metadatos as Record<string, unknown> | undefined
  const filasIniciales = Number(metadatos?.filas ?? 1)
  const columnas = obtenerColumnasTabla(campo)

  return Array.from({ length: filasIniciales }, () => crearFilaVaciaCampo(columnas))
}

function permitirAgregarFilas(campo: EsquemaCampo): boolean {
  const metadatos = campo.metadatos as Record<string, unknown> | undefined
  return Boolean(metadatos?.agregarFilas)
}

function tieneColumnasConAgregado(campo: EsquemaCampo): boolean {
  const columnas = obtenerColumnasTabla(campo)
  return columnas.some(col => col.agregar && col.agregar !== 'none')
}

function actualizarValorCeldaTabla(
  campo: EsquemaCampo,
  indiceFila: number,
  nombreColumna: string,
  valor: unknown
): void {
  const nombreCampo = campo.nombre || ''
  if (!nombreCampo) return

  const filasActuales = obtenerFilasTabla(campo)
  const nuevasFilas = [...filasActuales]

  if (nuevasFilas[indiceFila]) {
    nuevasFilas[indiceFila] = { ...nuevasFilas[indiceFila], [nombreColumna]: valor }
  }

  // Emitir el cambio
  emit('valor-cambiado', nombreCampo, nuevasFilas)
}

function formatearValorAgregado(columna: ColumnaTablaExtendida, valor: number | null): string {
  if (valor == null) return ''

  const decimales = typeof columna.decimales === 'number'
    ? Math.max(0, Math.min(8, columna.decimales))
    : 2
  const cadenaNumero = (columna.agregar === 'count')
    ? String(valor)
    : (Number(valor).toFixed(decimales))
  const prefijo = columna.prefijoAgregado ?? ''
  const sufijo = columna.sufijoAgregado ?? ''

  return `${prefijo}${cadenaNumero}${sufijo}`.trim()
}

function calcularValorAgregado(columna: ColumnaTablaExtendida, filasTabla: Record<string, unknown>[]): number | null {
  const valoresColumna = filasTabla.map(fila => fila[columna.name])

  if (columna.agregar === 'count') {
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
    return columna.agregar ? 0 : null
  }

  switch (columna.agregar) {
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
    <PrimePanel v-if="campo.tipo === TipoCampoValor.Panel" :header="campo.etiqueta || 'Panel'">
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
        <span v-if="esCampoRequerido" class="color-rojo"> *</span>
      </label>

      <!-- Campo de texto -->
      <PrimeInputText
        v-if="campo.tipo === TipoCampoValor.Texto || campo.tipo === TipoCampoValor.Correo || campo.tipo === TipoCampoValor.Contrasena"
        v-model="(valoresCampos as any)[campo.nombre || '']"
        :placeholder="campo.marcadorPosicion"
        class="ancho-100 texto-miga"
        :disabled="campo.deshabilitado"
        :readonly="campo.soloLectura"
      />

      <!-- Área de texto -->
      <PrimeTextarea
        v-else-if="campo.tipo === TipoCampoValor.AreaTexto"
        v-model="(valoresCampos as any)[campo.nombre || '']"
        :placeholder="campo.marcadorPosicion"
        class="ancho-100 texto-miga"
        :disabled="campo.deshabilitado"
        :readonly="campo.soloLectura"
      />

      <!-- Selector de tiempo -->
      <PrimeDatePicker
        v-else-if="campo.tipo === TipoCampoValor.Hora"
        v-model="(valoresCampos as any)[campo.nombre || '']"
        time-only
        hour-format="24"
        class="ancho-100 texto-miga"
        :disabled="campo.deshabilitado"
      />

      <!-- Selector de fecha -->
      <PrimeDatePicker
        v-else-if="campo.tipo === TipoCampoValor.Fecha"
        v-model="(valoresCampos as any)[campo.nombre || '']"
        class="ancho-100 texto-miga"
        :disabled="campo.deshabilitado"
      />

      <!-- Select/Dropdown -->
      <PrimeSelect
        v-else-if="campo.tipo === TipoCampoValor.Seleccion"
        v-model="(valoresCampos as any)[campo.nombre || '']"
        :options="opcionesCampo"
        option-label="etiqueta"
        option-value="valor"
        class="ancho-100 texto-miga"
        :disabled="campo.deshabilitado || estaDeshabilitadoPorDependencia(campo, valoresCampos as any)"
      />

      <!-- Campo numérico -->
      <PrimeInputNumber
        v-else-if="campo.tipo === TipoCampoValor.Numero"
        v-model="(valoresCampos as any)[campo.nombre || '']"
        class="ancho-100 texto-miga"
        :placeholder="campo.marcadorPosicion"
        :min="(campo.metadatos as any)?.minimo"
        :max="(campo.metadatos as any)?.maximo"
        :step="(campo.metadatos as any)?.paso ?? 1"
        :disabled="campo.deshabilitado"
        :readonly="campo.soloLectura"
      />

      <!-- Checkbox -->
      <div v-else-if="campo.tipo === TipoCampoValor.Casilla">
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
      <div v-else-if="campo.tipo === TipoCampoValor.Radio && Array.isArray(opcionesCampo) && (opcionesCampo.length || 0) > 0">
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
      <PrimeDivider class="my-3" v-else-if="campo.tipo === TipoCampoValor.Divisor" />

      <!-- Tabla -->
      <div v-else-if="campo.tipo === TipoCampoValor.Tabla">
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
                v-for="(filaTabla, indiceFila) in obtenerFilasTabla(campo)"
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
                    v-if="(columnaTabla.tipo ?? columnaTabla.type) === 'texto'"
                    :model-value="String(filaTabla[columnaTabla.name] || '')"
                    class="ancho-100 texto-miga"
                    :disabled="campo.deshabilitado"
                    @update:model-value="(v: string) => actualizarValorCeldaTabla(campo, indiceFila, columnaTabla.name, v)"
                  />

                  <PrimeDatePicker
                    v-else-if="(columnaTabla.tipo ?? columnaTabla.type) === 'fecha'"
                    :model-value="filaTabla[columnaTabla.name] instanceof Date ? filaTabla[columnaTabla.name] as Date : null"
                    class="ancho-100 texto-miga"
                    :disabled="campo.deshabilitado"
                    @update:model-value="(v: Date | null) => actualizarValorCeldaTabla(campo, indiceFila, columnaTabla.name, v)"
                  />

                  <template v-else-if="(columnaTabla.tipo ?? columnaTabla.type) === 'numero'">
                    <PrimeInputNumber
                      :model-value="Number(filaTabla[columnaTabla.name] || 0)"
                      class="ancho-100 texto-miga"
                      :disabled="campo.deshabilitado"
                      :min="(columnaTabla as any).minimo"
                      :max="(columnaTabla as any).maximo"
                      :min-fraction-digits="(columnaTabla as any).decimalesMinimos ?? 0"
                      :max-fraction-digits="(columnaTabla as any).decimalesMaximos ?? 2"
                      @update:model-value="(v: number | null) => actualizarValorCeldaTabla(campo, indiceFila, columnaTabla.name, v || 0)"
                    />
                  </template>

                  <!-- Campo no soportado -->
                  <span v-else class="text-muted-color">—</span>
                </td>
              </tr>
            </tbody>

            <!-- Pie de tabla con agregaciones -->
            <tfoot v-if="tieneColumnasConAgregado(campo) || (campo.metadatos as any)?.mostrarResumen">
              <tr>
                <td
                  v-for="(columnaTabla, indiceColumna) in obtenerColumnasTabla(campo)"
                  :key="columnaTabla.name"
                  :class="[claseRellenoCelda(campo), 'negrilla']"
                >
                  <span v-if="indiceColumna === 0">
                    {{ (campo.metadatos as any)?.summaryLabel ?? 'Total' }}
                  </span>
                  <span class="ml-2" v-if="columnaTabla.agregar && columnaTabla.agregar !== 'none'">
                    {{ formatearValorAgregado(
                      columnaTabla as any,
                      calcularValorAgregado(
                        columnaTabla as any,
                        obtenerFilasTabla(campo)
                      )
                    ) }}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Botón para agregar filas -->
        <div class="mt-2" v-if="permitirAgregarFilas(campo)">
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
        class="color-rojo texto-miga mt-1"
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

