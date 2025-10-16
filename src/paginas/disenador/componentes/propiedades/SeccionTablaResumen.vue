<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo, MetadatosTablaResumen, ColumnaTablaResumen, FilaTablaResumen } from '@/interfaces/Campos'
import { generarId } from '@/utilidades/GeneraId'
import { validarFormula } from '@/utilidades/EvaluadorFormulas'
import DialogoAyuda from '@/componentes/DialogoAyuda.vue'

// Props
interface PropiedadesSeccionTablaResumen {
  idCampo: string
}

defineProps<PropiedadesSeccionTablaResumen>()

// Almacén
const almacen = useAlmacenDisenador()

// Estado local
const mostrarDialogoColumna = ref(false)
const mostrarDialogoFila = ref(false)
const mostrarAyudaFormula = ref(false)
const columnaEdicion = ref<ColumnaTablaResumen | null>(null)
const filaEdicion = ref<FilaTablaResumen | null>(null)
const indiceEdicion = ref<number>(-1)

// Computed
const campoSeleccionado = computed(() => almacen.campoSeleccionado)

const metadatos = computed<MetadatosTablaResumen>({
  get: () => {
    const meta = campoSeleccionado.value?.metadatos as Record<string, unknown> | undefined
    return {
      columnas: (meta?.columnas || []) as ColumnaTablaResumen[],
      filas: (meta?.filas || []) as FilaTablaResumen[],
      actualizacionAutomatica: meta?.actualizacionAutomatica as boolean | undefined,
      estiloTabla: meta?.estiloTabla as MetadatosTablaResumen['estiloTabla']
    }
  },
  set: (nuevoMetadatos) => {
    if (campoSeleccionado.value) {
      almacen.actualizarCampo(campoSeleccionado.value.id, { metadatos: nuevoMetadatos })
    }
  },
})

// Funciones de gestión de columnas
function agregarColumna(): void {
  columnaEdicion.value = {
    nombre: `columna_${generarId('col').slice(-4)}`,
    etiqueta: 'Nueva Columna',
    tipo: 'texto'
  }
  indiceEdicion.value = -1
  mostrarDialogoColumna.value = true
}

function editarColumna(columna: ColumnaTablaResumen, indice: number): void {
  columnaEdicion.value = { ...columna }
  indiceEdicion.value = indice
  mostrarDialogoColumna.value = true
}

function guardarColumna(): void {
  if (!columnaEdicion.value) return

  const columnas = [...metadatos.value.columnas]
  
  if (indiceEdicion.value >= 0) {
    // Editar columna existente
    columnas[indiceEdicion.value] = columnaEdicion.value
  } else {
    // Agregar nueva columna
    columnas.push(columnaEdicion.value)
  }

  metadatos.value = { ...metadatos.value, columnas }
  cerrarDialogoColumna()
}

function eliminarColumna(indice: number): void {
  const columnas = metadatos.value.columnas.filter((_, i) => i !== indice)
  
  // Actualizar las filas para eliminar valores de esta columna
  const nombreColumna = metadatos.value.columnas[indice].nombre
  const filas = metadatos.value.filas.map(fila => ({
    ...fila,
    valores: Object.fromEntries(
      Object.entries(fila.valores).filter(([key]) => key !== nombreColumna)
    )
  }))

  metadatos.value = { ...metadatos.value, columnas, filas }
}

function cerrarDialogoColumna(): void {
  mostrarDialogoColumna.value = false
  columnaEdicion.value = null
  indiceEdicion.value = -1
}

// Funciones de gestión de filas
function agregarFila(): void {
  const valoresVacios: Record<string, string | number> = {}
  metadatos.value.columnas.forEach(col => {
    valoresVacios[col.nombre] = col.tipo === 'numero' || col.tipo === 'calculado' ? 0 : ''
  })

  filaEdicion.value = {
    id: generarId('fila'),
    valores: valoresVacios
  }
  indiceEdicion.value = -1
  mostrarDialogoFila.value = true
}

function editarFila(fila: FilaTablaResumen, indice: number): void {
  filaEdicion.value = { ...fila, valores: { ...fila.valores } }
  indiceEdicion.value = indice
  mostrarDialogoFila.value = true
}

function guardarFila(): void {
  if (!filaEdicion.value) return

  const filas = [...metadatos.value.filas]
  
  if (indiceEdicion.value >= 0) {
    // Editar fila existente
    filas[indiceEdicion.value] = filaEdicion.value
  } else {
    // Agregar nueva fila
    filas.push(filaEdicion.value)
  }

  metadatos.value = { ...metadatos.value, filas }
  cerrarDialogoFila()
}

function eliminarFila(indice: number): void {
  const filas = metadatos.value.filas.filter((_, i) => i !== indice)
  metadatos.value = { ...metadatos.value, filas }
}

function cerrarDialogoFila(): void {
  mostrarDialogoFila.value = false
  filaEdicion.value = null
  indiceEdicion.value = -1
}

// Funciones auxiliares
function obtenerTipoColumnaLabel(tipo: string): string {
  const tipos: Record<string, string> = {
    'texto': 'Texto',
    'numero': 'Número',
    'calculado': 'Calculado (Fórmula)'
  }
  return tipos[tipo] || tipo
}

function moverColumna(desde: number, hacia: number): void {
  const columnas = [...metadatos.value.columnas]
  const [columna] = columnas.splice(desde, 1)
  columnas.splice(hacia, 0, columna)
  metadatos.value = { ...metadatos.value, columnas }
}

function moverFila(desde: number, hacia: number): void {
  const filas = [...metadatos.value.filas]
  const [fila] = filas.splice(desde, 1)
  filas.splice(hacia, 0, fila)
  metadatos.value = { ...metadatos.value, filas }
}

// Validación de fórmulas
function validarFormulaActual(formula: string): string[] {
  const resultado = validarFormula(formula)
  return resultado.errores
}

// Lista de tablas disponibles para usar en fórmulas
const tablasDisponibles = computed(() => {
  const pagina = almacen.paginaActiva
  if (!pagina) return []
  
  return pagina.campos
    .filter((c: EsquemaCampo) => c.tipo === 'tabla' && c.nombre)
    .map((c: EsquemaCampo) => c.nombre || '')
})
</script>

<template>
  <div class="p-3">
    <!-- Header -->
    <div class="flex align-items-center justify-content-between mb-3">
      <div class="flex align-items-center gap-2">
        <i class="pi pi-calculator"></i>
        <h3 class="m-0 negrilla">Configuración de Tabla Resumen</h3>
      </div>
    </div>

    <PrimeMessage severity="info" :closable="false" class="mb-3">
      <p class="m-0 tamanio-fuente-miga">
        La tabla resumen calcula valores automáticamente desde otras tablas usando fórmulas.
        <br />
        Ejemplo: <code>{tabla_productos.precio.sum}</code>
      </p>
    </PrimeMessage>

    <!-- Sección de Columnas -->
    <PrimeCard class="mb-3">
      <template #header>
        <div class="flex justify-content-between align-items-center p-3">
          <h4 class="m-0">Columnas</h4>
          <PrimeButton icon="pi pi-plus" label="Agregar Columna" size="small" @click="agregarColumna" />
        </div>
      </template>
      <template #content>
        <div v-if="metadatos.columnas.length === 0" class="text-center py-4">
          <p class="text-500">No hay columnas configuradas</p>
        </div>
        <div v-else class="flex flex-column gap-2">
          <PrimeCard v-for="(columna, indice) in metadatos.columnas" :key="columna.nombre">
            <template #content>
              <div class="flex align-items-center gap-2">
                <div class="flex gap-1">
                  <PrimeButton icon="pi pi-arrow-up" size="small" text rounded :disabled="indice === 0"
                    @click="moverColumna(indice, indice - 1)" v-tooltip.top="'Subir'" />
                  <PrimeButton icon="pi pi-arrow-down" size="small" text rounded
                    :disabled="indice === metadatos.columnas.length - 1" @click="moverColumna(indice, indice + 1)"
                    v-tooltip.top="'Bajar'" />
                </div>
                <div class="flex-1">
                  <div class="negrilla">{{ columna.etiqueta }}</div>
                  <div class="tamanio-fuente-miga text-500">
                    Tipo: {{ obtenerTipoColumnaLabel(columna.tipo) }}
                    <span v-if="columna.tipo === 'calculado' && columna.formula" class="ml-2">
                      • Fórmula: <code>{{ columna.formula }}</code>
                    </span>
                  </div>
                </div>
                <div class="flex gap-1">
                  <PrimeButton icon="pi pi-pencil" size="small" text rounded @click="editarColumna(columna, indice)"
                    v-tooltip.top="'Editar'" />
                  <PrimeButton icon="pi pi-trash" severity="danger" size="small" text rounded
                    @click="eliminarColumna(indice)" v-tooltip.top="'Eliminar'" />
                </div>
              </div>
            </template>
          </PrimeCard>
        </div>
      </template>
    </PrimeCard>

    <!-- Sección de Filas -->
    <PrimeCard>
      <template #header>
        <div class="flex justify-content-between align-items-center p-3">
          <h4 class="m-0">Filas</h4>
          <PrimeButton icon="pi pi-plus" label="Agregar Fila" size="small" @click="agregarFila"
            :disabled="metadatos.columnas.length === 0" />
        </div>
      </template>
      <template #content>
        <div v-if="metadatos.filas.length === 0" class="text-center py-4">
          <p class="text-500">No hay filas configuradas</p>
        </div>
        <div v-else class="flex flex-column gap-2">
          <PrimeCard v-for="(fila, indice) in metadatos.filas" :key="fila.id">
            <template #content>
              <div class="flex align-items-center gap-2">
                <div class="flex gap-1">
                  <PrimeButton icon="pi pi-arrow-up" size="small" text rounded :disabled="indice === 0"
                    @click="moverFila(indice, indice - 1)" v-tooltip.top="'Subir'" />
                  <PrimeButton icon="pi pi-arrow-down" size="small" text rounded
                    :disabled="indice === metadatos.filas.length - 1" @click="moverFila(indice, indice + 1)"
                    v-tooltip.top="'Bajar'" />
                </div>
                <div class="flex-1">
                  <div class="negrilla">Fila {{ indice + 1 }}</div>
                  <div class="tamanio-fuente-miga text-500">
                    <span v-for="(valor, key) in fila.valores" :key="String(key)" class="mr-2">
                      {{ key }}: {{ valor }}
                    </span>
                  </div>
                </div>
                <div class="flex gap-1">
                  <PrimeButton icon="pi pi-pencil" size="small" text rounded @click="editarFila(fila, indice)"
                    v-tooltip.top="'Editar'" />
                  <PrimeButton icon="pi pi-trash" severity="danger" size="small" text rounded
                    @click="eliminarFila(indice)" v-tooltip.top="'Eliminar'" />
                </div>
              </div>
            </template>
          </PrimeCard>
        </div>
      </template>
    </PrimeCard>

    <!-- Diálogo para editar columna -->
    <DialogoAyuda v-model:visible="mostrarDialogoColumna" :titulo="indiceEdicion >= 0 ? 'Editar Columna' : 'Nueva Columna'"
      ancho="600px">
      <div v-if="columnaEdicion" class="flex flex-column gap-3">
        <div class="field">
          <label class="block mb-2 negrilla">Nombre técnico</label>
          <PrimeInputText v-model="columnaEdicion.nombre" placeholder="nombre_columna" class="ancho-100" />
        </div>

        <div class="field">
          <label class="block mb-2 negrilla">Etiqueta</label>
          <PrimeInputText v-model="columnaEdicion.etiqueta" placeholder="Etiqueta visible" class="ancho-100" />
        </div>

        <div class="field">
          <label class="block mb-2 negrilla">Tipo</label>
          <PrimeSelect v-model="columnaEdicion.tipo" :options="[
            { label: 'Texto', value: 'texto' },
            { label: 'Número', value: 'numero' },
            { label: 'Calculado (Fórmula)', value: 'calculado' }
          ]" option-label="label" option-value="value" class="ancho-100" />
        </div>

        <div v-if="columnaEdicion.tipo === 'calculado'" class="field">
          <div class="flex justify-content-between align-items-center mb-2">
            <label class="negrilla">Fórmula</label>
            <PrimeButton icon="pi pi-question-circle" size="small" text rounded @click="mostrarAyudaFormula = true"
              v-tooltip.top="'Ayuda con fórmulas'" />
          </div>
          <PrimeInputText v-model="columnaEdicion.formula" placeholder="{tabla.columna.sum}" class="ancho-100" />
          <small v-if="columnaEdicion.formula" class="mt-1 block">
            <span v-if="validarFormulaActual(columnaEdicion.formula || '').length === 0" class="color-verde">
              <i class="pi pi-check-circle"></i> Fórmula válida
            </span>
            <span v-else class="color-rojo">
              <i class="pi pi-exclamation-triangle"></i>
              {{ validarFormulaActual(columnaEdicion.formula || '').join(', ') }}
            </span>
          </small>
        </div>

        <div v-if="columnaEdicion.tipo === 'numero' || columnaEdicion.tipo === 'calculado'" class="field">
          <label class="block mb-2 negrilla">Formato</label>
          <div class="grid">
            <div class="col-4">
              <label class="block mb-1 tamanio-fuente-miga">Decimales</label>
              <PrimeInputNumber v-model="columnaEdicion.formatoNumero!.decimales" :min="0" :max="8" class="ancho-100" />
            </div>
            <div class="col-4">
              <label class="block mb-1 tamanio-fuente-miga">Prefijo</label>
              <PrimeInputText v-model="columnaEdicion.formatoNumero!.prefijo" placeholder="$" class="ancho-100" />
            </div>
            <div class="col-4">
              <label class="block mb-1 tamanio-fuente-miga">Sufijo</label>
              <PrimeInputText v-model="columnaEdicion.formatoNumero!.sufijo" placeholder="%" class="ancho-100" />
            </div>
          </div>
        </div>

        <div class="flex justify-content-end gap-2">
          <PrimeButton label="Cancelar" severity="secondary" @click="cerrarDialogoColumna" />
          <PrimeButton label="Guardar" @click="guardarColumna" />
        </div>
      </div>
    </DialogoAyuda>

    <!-- Diálogo para editar fila -->
    <DialogoAyuda v-model:visible="mostrarDialogoFila" :titulo="indiceEdicion >= 0 ? 'Editar Fila' : 'Nueva Fila'"
      ancho="600px">
      <div v-if="filaEdicion" class="flex flex-column gap-3">
        <div v-for="columna in metadatos.columnas" :key="columna.nombre" class="field">
          <label class="block mb-2 negrilla">{{ columna.etiqueta }}</label>
          <PrimeInputText v-if="columna.tipo === 'texto'" v-model="(filaEdicion.valores[columna.nombre] as string)"
            class="ancho-100" />
          <PrimeInputNumber v-else-if="columna.tipo === 'numero'"
            v-model="(filaEdicion.valores[columna.nombre] as number)" class="ancho-100" />
          <PrimeInputText v-else v-model="(filaEdicion.valores[columna.nombre] as string)"
            placeholder="{tabla.columna.sum}" class="ancho-100" />
          <small v-if="columna.tipo === 'calculado'" class="mt-1 block text-500">
            Fórmula dinámica - se actualizará automáticamente
          </small>
        </div>

        <div class="flex justify-content-end gap-2">
          <PrimeButton label="Cancelar" severity="secondary" @click="cerrarDialogoFila" />
          <PrimeButton label="Guardar" @click="guardarFila" />
        </div>
      </div>
    </DialogoAyuda>

    <!-- Diálogo de ayuda con fórmulas -->
    <DialogoAyuda v-model:visible="mostrarAyudaFormula" titulo="Ayuda con Fórmulas" ancho="700px">
      <div class="flex flex-column gap-3">
        <PrimeMessage severity="info" :closable="false">
          Las fórmulas permiten calcular valores automáticamente desde otras tablas del formulario.
        </PrimeMessage>

        <h4 class="mt-2 mb-2">Sintaxis Básica</h4>
        <code class="block p-2 bg-surface-100 border-round">{nombreTabla.nombreColumna.operacion}</code>

        <h4 class="mt-2 mb-2">Operaciones Disponibles</h4>
        <ul class="list-none p-0">
          <li class="mb-2"><code>sum</code> - Suma todos los valores</li>
          <li class="mb-2"><code>avg</code> - Promedio de los valores</li>
          <li class="mb-2"><code>count</code> - Cuenta la cantidad de valores</li>
          <li class="mb-2"><code>min</code> - Valor mínimo</li>
          <li class="mb-2"><code>max</code> - Valor máximo</li>
        </ul>

        <h4 class="mt-2 mb-2">Ejemplos</h4>
        <div class="flex flex-column gap-2">
          <div class="p-2 bg-surface-50 border-round">
            <code>{tabla_productos.precio.sum}</code>
            <p class="m-0 mt-1 tamanio-fuente-miga text-500">Suma todos los precios de la tabla_productos</p>
          </div>
          <div class="p-2 bg-surface-50 border-round">
            <code>{tabla_productos.precio.sum} * 1.19</code>
            <p class="m-0 mt-1 tamanio-fuente-miga text-500">Suma los precios y multiplica por 1.19 (agregar IVA)</p>
          </div>
          <div class="p-2 bg-surface-50 border-round">
            <code>{tabla1.total.sum} + {tabla2.total.sum}</code>
            <p class="m-0 mt-1 tamanio-fuente-miga text-500">Suma los totales de dos tablas diferentes</p>
          </div>
        </div>

        <h4 v-if="tablasDisponibles.length > 0" class="mt-2 mb-2">Tablas Disponibles</h4>
        <div v-if="tablasDisponibles.length > 0" class="flex flex-wrap gap-2">
          <PrimeTag v-for="tabla in tablasDisponibles" :key="tabla" :value="tabla" severity="info" />
        </div>
        <PrimeMessage v-else severity="warn" :closable="false">
          No hay tablas disponibles en la página actual. Agrega una tabla primero.
        </PrimeMessage>
      </div>
    </DialogoAyuda>
  </div>
</template>

<style scoped>
code {
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  padding: 2px 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
}
</style>

