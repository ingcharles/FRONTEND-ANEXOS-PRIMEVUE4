// Store del diseñador refactorizado - Principios SOLID aplicados
import { defineStore } from 'pinia'
import { computed, ref, reactive } from 'vue'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { EsquemaFormulario } from '@/interfaces/Formulario'
import { ServicioCampos } from '@/servicios/disenador/ServiciosCampos'
import { ServicioPaginas } from '@/servicios/disenador/ServiciosPaginas'
import { ServicioSerializacion } from '@/servicios/disenador/ServiciosSerializacion'
import { generarId } from '@/utilidades/id'
import { clonarProfundo } from '@/utilidades/clonar'
import { ServicioEsquemasFormulario } from '@/servicios/disenador/ServicioEsquemas'

/**
 * Interface para elemento del portapapeles
 */
export interface ElementoPortapapeles {
  campo: EsquemaCampo
}

/**
 * Interface para el estado de modales de confirmación
 */
// export interface EstadoModales {
//   eliminarPagina: {
//     mostrar: boolean
//     indicePagina: number | null
//   }
//   eliminarCampo: {
//     mostrar: boolean
//     idCampo: string | null
//   }
// }

/**
 * Factory para crear formulario vacío
 */
function crearFormularioVacio(): EsquemaFormulario {
  return {
    id: generarId('formulario'),
    nombre: 'Nuevo formulario',
    paginas: [ServicioPaginas.crearPaginaVacia(1)],
    configuracion: {
      ajusteGrid: true,
      columnas: 12
    },
  }
}

/**
 * Store principal del diseñador de formularios
 * Implementa el patrón Repository y Command
 */
export const useAlmacenDisenador = defineStore('disenador', () => {
  // Servicio de esquemas (validación Zod)
  const servicioEsquemas = new ServicioEsquemasFormulario()
  // =================== ESTADO ===================
  const esquemaFormulario = ref<EsquemaFormulario>(crearFormularioVacio())
  const idCampoSeleccionado = ref<string | null>(null)
  const portapapeles = ref<ElementoPortapapeles | null>(null)
  const indicePaginaActiva = ref<number>(0)

  // Valores actuales por página (no se serializan)
  const valoresPorPagina = ref<Record<string, Record<string, unknown>>>({})

  // Estado para modal de confirmación de eliminación de página
  const mostrarModalEliminarPagina = ref(false)
  const indicePaginaAEliminar = ref<number | null>(null)

  // Estado para modal de confirmación de eliminación de campo
  const mostrarModalEliminarCampo = ref(false)
  const idCampoAEliminar = ref<string | null>(null)

  // =================== GETTERS COMPUTADOS ===================
  const ajusteGrid = computed({
    get: () => esquemaFormulario.value.configuracion?.ajusteGrid ?? true,
    set: (valor: boolean) => {
      if (!esquemaFormulario.value.configuracion) {
        esquemaFormulario.value.configuracion = { ajusteGrid: valor, columnas: 12 }
      } else {
        esquemaFormulario.value.configuracion.ajusteGrid = valor
      }
    },
  })

  const paginaActiva = computed(() => {
    const idx = indicePaginaActiva.value
    const paginas = esquemaFormulario.value.paginas
    return idx >= 0 && idx < paginas.length ? paginas[idx] : null
  })

  const camposPaginaActiva = computed(() => (paginaActiva.value?.campos ?? []) as EsquemaCampo[])

  const campoSeleccionado = computed(() => {
    const id = idCampoSeleccionado.value
    if (!id) return null

    const buscarEnLista = (lista: EsquemaCampo[]): EsquemaCampo | null => {
      for (const campo of lista) {
        if (campo.id === id) return campo
        if (Array.isArray(campo.hijos) && campo.hijos.length) {
          const encontrado = buscarEnLista(campo.hijos)
          if (encontrado) return encontrado
        }
      }
      return null
    }

    return buscarEnLista(camposPaginaActiva.value)
  })

  const mensajeConfirmacionCampo = computed<string>(() => {
    const idCampo = idCampoAEliminar.value
    if (!idCampo) return '¿Está seguro de eliminar este componente?'

    const buscarEnLista = (lista: EsquemaCampo[]): EsquemaCampo | null => {
      for (const campo of lista) {
        if (campo.id === idCampo) return campo
        if (Array.isArray(campo.hijos) && campo.hijos.length) {
          const encontrado = buscarEnLista(campo.hijos)
          if (encontrado) return encontrado
        }
      }
      return null
    }

    const campo = buscarEnLista(camposPaginaActiva.value)
    if (!campo) return '¿Está seguro de eliminar este componente?'

    const tipoEnEspanol = ServicioCampos.obtenerNombreTipoEspanol(campo.tipo)
    return `¿Está seguro de eliminar el componente '${tipoEnEspanol}'?`
  })

  const totalPaginas = computed<number>(() => esquemaFormulario.value.paginas.length)

  const puedeEliminarPaginas = computed<boolean>(() => totalPaginas.value > 1)

  // =================== ACCIONES DE CAMPOS ===================
  function seleccionarCampo(id: string | null): void {
    idCampoSeleccionado.value = id
  }

  function agregarCampo(campo: EsquemaCampo, indice?: number): string {
    const paginaActual = paginaActiva.value
    if (!paginaActual) {
      throw new Error('No hay página activa para agregar el campo')
    }

    const copia = clonarProfundo(campo)
    if (!copia.id) copia.id = generarId('campo')
    const posicion = indice ?? paginaActual.campos.length
    paginaActual.campos.splice(posicion, 0, copia)
    seleccionarCampo(copia.id)
    return copia.id
  }

  function moverCampo(indiceOrigen: number, indiceDestino: number): void {
    const paginaActual = paginaActiva.value
    if (!paginaActual) return

    ServicioCampos.moverCampo(paginaActual, indiceOrigen, indiceDestino)
  }

  function actualizarCampo(id: string, cambios: Partial<EsquemaCampo>): boolean {
    return ServicioCampos.actualizarCampo(esquemaFormulario.value.paginas, id, cambios)
  }

  function duplicarCampo(id: string): EsquemaCampo | null {
    const campoDuplicado = ServicioCampos.duplicarCampo(esquemaFormulario.value.paginas, id)
    if (campoDuplicado) {
      seleccionarCampo(campoDuplicado.id)
    }
    return campoDuplicado
  }

  function confirmarEliminarCampo(id: string): void {
    idCampoAEliminar.value = id
    mostrarModalEliminarCampo.value = true
  }

  function ejecutarEliminarCampo(): void {
    const idCampo = idCampoAEliminar.value
    if (idCampo) {
      const eliminado = ServicioCampos.eliminarCampo(esquemaFormulario.value.paginas, idCampo)
      if (eliminado && idCampoSeleccionado.value === idCampo) {
        idCampoSeleccionado.value = null
      }
    }
    cancelarEliminarCampo()
  }

  function cancelarEliminarCampo(): void {
    mostrarModalEliminarCampo.value = false
    idCampoAEliminar.value = null
  }

  // =================== ACCIONES DE PÁGINAS ===================
  function agregarPagina(): void {
    ServicioPaginas.agregarPagina(esquemaFormulario.value)
    indicePaginaActiva.value = esquemaFormulario.value.paginas.length - 1
  }

  function crearPaginaDespuesActual(): void {
    const indiceActual = indicePaginaActiva.value
    agregarPagina()
    // Mantener el índice actual en lugar de ir al final
    indicePaginaActiva.value = indiceActual
  }


  function duplicarPagina(indicePagina: number): void {
    const paginaDuplicada = ServicioPaginas.duplicarPagina(esquemaFormulario.value, indicePagina)
    if (paginaDuplicada) {
      indicePaginaActiva.value = indicePagina + 1
    }
  }

  function confirmarEliminarPagina(indicePagina: number): void {
    if (!puedeEliminarPaginas.value) return

    indicePaginaAEliminar.value = indicePagina
    mostrarModalEliminarPagina.value = true
  }

  function ejecutarEliminarPagina(): void {
    const indicePagina = indicePaginaAEliminar.value
    if (indicePagina !== null) {
      const paginaEliminada = esquemaFormulario.value.paginas[indicePagina]
      const eliminado = ServicioPaginas.eliminarPagina(esquemaFormulario.value, indicePagina)

      if (eliminado) {
        // Eliminar valores asociados a la página
        if (paginaEliminada?.id && paginaEliminada.id in valoresPorPagina.value) {
          delete valoresPorPagina.value[paginaEliminada.id]
        }

        // Ajustar índice de página activa
        indicePaginaActiva.value = Math.max(0, Math.min(indicePaginaActiva.value, esquemaFormulario.value.paginas.length - 1))
      }
    }
    cancelarEliminarPagina()
  }

  function cancelarEliminarPagina(): void {
    mostrarModalEliminarPagina.value = false
    indicePaginaAEliminar.value = null
  }

  function cambiarPaginaActiva(nuevoIndice: number): void {
    if (ServicioPaginas.esIndiceValido(esquemaFormulario.value, nuevoIndice)) {
      indicePaginaActiva.value = nuevoIndice
      idCampoSeleccionado.value = null // Limpiar selección al cambiar página
    }
  }

  // =================== GESTIÓN DE VALORES ===================
  function obtenerValoresPagina(idPagina: string): Record<string, unknown> {
    let mapa = valoresPorPagina.value[idPagina]
    if (!mapa) {
      mapa = reactive({}) as Record<string, unknown>
      valoresPorPagina.value[idPagina] = mapa
    }
    return mapa
  }

  function actualizarValorCampo(idPagina: string, nombreCampo: string, valor: unknown): void {
    const mapa = obtenerValoresPagina(idPagina)
    mapa[nombreCampo] = valor
  }

  function limpiarValoresPagina(idPagina: string): void {
    if (idPagina in valoresPorPagina.value) {
      delete valoresPorPagina.value[idPagina]
    }
  }

  // =================== SERIALIZACIÓN ===================
  function serializar(): string {
    return ServicioSerializacion.serializar(esquemaFormulario.value)
  }

  function deserializar(json: string): void {
    try {
      esquemaFormulario.value = ServicioSerializacion.deserializar(json)
      idCampoSeleccionado.value = null
      indicePaginaActiva.value = 0
      valoresPorPagina.value = {}
    } catch (error) {
      console.error('Error al deserializar formulario:', error)
      throw new Error('El archivo JSON no tiene un formato válido')
    }
  }

  function exportarJson(): void {
    const contenido = serializar()
    const nombreArchivo = `${esquemaFormulario.value.nombre.replace(/\s+/g, '_')}.json`
    ServicioSerializacion.descargarArchivo(nombreArchivo, contenido)
  }

  async function importarJson(archivo: File): Promise<void> {
    const texto = await archivo.text()
    deserializar(texto)
  }

  // =================== GESTIÓN DE PORTAPAPELES ===================
  // function copiarCampo(id: string): void {
  //   const campo = ServicioCampos.buscarCampoPorId(esquemaFormulario.value.paginas, id)
  //   if (campo) {
  //     portapapeles.value = { campo }
  //   }
  // }

  // function pegarCampo(indice?: number): string | null {
  //   if (!portapapeles.value || !paginaActiva.value) return null

  //   return agregarCampo(portapapeles.value.campo, indice)
  // }

  // =================== REINICIO DEL ESTADO ===================
  function reiniciarFormulario(): void {
    esquemaFormulario.value = crearFormularioVacio()
    idCampoSeleccionado.value = null
    indicePaginaActiva.value = 0
    valoresPorPagina.value = {}
    portapapeles.value = null
  }

  // Métodos de compatibilidad para tests existentes
  function cargarFormulario(formulario: EsquemaFormulario): void {
    esquemaFormulario.value = formulario
    indicePaginaActiva.value = 0
    idCampoSeleccionado.value = null
  }

  function eliminarCampo(id: string): boolean {
    const campo = ServicioCampos.buscarCampoPorId(esquemaFormulario.value.paginas, id)
    if (campo) {
      const eliminado = ServicioCampos.eliminarCampo(esquemaFormulario.value.paginas, id)
      if (eliminado && idCampoSeleccionado.value === id) {
        idCampoSeleccionado.value = null
      }
      return true
    }
    return false
  }

  function buscarCampo(id: string): EsquemaCampo | null {
    return ServicioCampos.buscarCampoPorId(esquemaFormulario.value.paginas, id)
  }

  function navegarPagina(idPagina: string): void {
    const indice = esquemaFormulario.value.paginas.findIndex(p => p.id === idPagina)
    if (indice !== -1) {
      cambiarPaginaActiva(indice)
    }
  }

  function buscarCampoPorId(id: string): EsquemaCampo | null {
    return ServicioCampos.buscarCampoPorId(esquemaFormulario.value.paginas, id)
  }

  // =================== COMPATIBILIDAD PARA TESTS ===================
  // const servicioEsquemas = new ServicioEsquemasFormulario()

  // const mapsIdToName = computed<Record<string, Record<string, string>>>(() => {
  //   const resultado: Record<string, Record<string, string>> = {}
  //   for (const pagina of esquemaFormulario.value.paginas) {
  //     const mapa: Record<string, string> = {}
  //     const camposConNombre = servicioEsquemas.recolectarCamposConNombre(pagina.campos, [])
  //     for (const campo of camposConNombre) {
  //       if (campo.id && campo.nombre) mapa[campo.id] = campo.nombre
  //     }
  //     resultado[pagina.id] = mapa
  //   }
  //   return resultado
  // })

  async function validarYEnviarFormulario(
    valores: Record<string, Record<string, unknown>>
  ): Promise<{ exito: boolean; mensaje: string; errores?: Record<string, string> }>
  {
    const erroresGlobales: string[] = []
    const mapaErrores: Record<string, string> = {}

    for (const pagina of esquemaFormulario.value.paginas) {
      const schema = servicioEsquemas.crearEsquemaValidacion(pagina.campos)
      const valoresPagina = valores[pagina.id] ?? obtenerValoresPagina(pagina.id)
      const resultado = schema.safeParse(valoresPagina)
      if (!resultado.success) {
        for (const issue of resultado.error.issues) {
          const mensaje = issue.message || 'Dato inválido'
          erroresGlobales.push(mensaje)
          const ruta = issue.path?.join('.') || ''
          if (ruta) mapaErrores[ruta] = mensaje
        }
      }
    }

    if (erroresGlobales.length) {
      return { exito: false, mensaje: erroresGlobales[0] || 'Error de validación', errores: mapaErrores }
    }

    return { exito: true, mensaje: 'Enviado correctamente' }
  }

  // =================== RETORNO PÚBLICO ===================
  return {
    // Estado
    esquemaFormulario,
    idCampoSeleccionado,
    portapapeles,
    indicePaginaActiva,
    valoresPorPagina,
    mostrarModalEliminarPagina,
    mostrarModalEliminarCampo,
    indicePaginaAEliminar,
    idCampoAEliminar,

    // Getters computados
    ajusteGrid,
    paginaActiva,
    camposPaginaActiva,
    campoSeleccionado,
    mensajeConfirmacionCampo,
    totalPaginas,
    puedeEliminarPaginas,

    // Acciones de campos
    seleccionarCampo,
    agregarCampo,
    moverCampo,
    actualizarCampo,
    duplicarCampo,
    confirmarEliminarCampo,
    ejecutarEliminarCampo,
    cancelarEliminarCampo,

    // Acciones de páginas
    agregarPagina,
    duplicarPagina,
    confirmarEliminarPagina,
    ejecutarEliminarPagina,
    cancelarEliminarPagina,
    cambiarPaginaActiva,
    crearPaginaDespuesActual,
    obtenerPaginaActual: () => esquemaFormulario.value.paginas[indicePaginaActiva.value] || null,

    // Gestión de valores
    obtenerValoresPagina,
    actualizarValorCampo,
    limpiarValoresPagina,

    // Serialización
    serializar,
    deserializar,
    exportarJson,
    importarJson,

    // Portapapeles
    // copiarCampo,
    // pegarCampo,

    // Utilidades
    reiniciarFormulario,

    // Métodos de compatibilidad para tests
    cargarFormulario,
    eliminarCampo,
    buscarCampo,
    navegarPagina,
    buscarCampoPorId,
    // Compat
    // mapsIdToName,
    validarYEnviarFormulario,
  }
})





