// Servicios para el manejo de páginas - Principio de Responsabilidad Única
import type { EsquemaPagina } from '@/interfaces/Pagina'
import type { EsquemaFormulario } from '@/interfaces/Formulario'
import type { EsquemaCampo } from '@/interfaces/Campos'
import { clonarProfundo, duplicarConNuevosIds } from '@/utilidades/Clonar'
import { generarId } from '@/utilidades/GeneraId'

/**
 * Servicio para operaciones CRUD de páginas
 */
export class ServicioPaginas {
  /**
   * Crear una página vacía
   */
  static crearPaginaVacia(numeroPagina: number = 1): EsquemaPagina {
    return {
      id: generarId('pagina'),
      titulo: `Página ${numeroPagina}`,
      campos: []
    }
  }

  /**
   * Agregar una nueva página al formulario
   */
  static agregarPagina(formulario: EsquemaFormulario): EsquemaPagina {
    const nuevaPagina = this.crearPaginaVacia(formulario.paginas.length + 1)
    formulario.paginas.push(nuevaPagina)
    return nuevaPagina
  }

  /**
   * Duplicar una página existente
   */
  static duplicarPagina(formulario: EsquemaFormulario, indicePagina: number): EsquemaPagina | null {
    const paginaOriginal = formulario.paginas[indicePagina]
    if (!paginaOriginal) return null

    const paginaDuplicada: EsquemaPagina = clonarProfundo(paginaOriginal)
    paginaDuplicada.id = generarId('pagina')
    paginaDuplicada.titulo = `${paginaOriginal.titulo ?? 'Página'} (copia)`

    // Asignar nuevos IDs a todos los campos
    paginaDuplicada.campos = paginaDuplicada.campos.map((campo) =>
      duplicarConNuevosIds(campo, () => generarId('campo'))
    )

    formulario.paginas.splice(indicePagina + 1, 0, paginaDuplicada)
    return paginaDuplicada
  }

  /**
   * Eliminar una página del formulario
   */
  static eliminarPagina(formulario: EsquemaFormulario, indicePagina: number): boolean {
    if (formulario.paginas.length <= 1) {
      console.warn('No se puede eliminar la única página del formulario')
      return false
    }

    if (indicePagina < 0 || indicePagina >= formulario.paginas.length) {
      console.warn('Índice de página inválido')
      return false
    }

    formulario.paginas.splice(indicePagina, 1)
    return true
  }

  /**
   * Mover una página a una nueva posición
   */
  static moverPagina(formulario: EsquemaFormulario, indiceOrigen: number, indiceDestino: number): boolean {
    if (indiceOrigen < 0 || indiceOrigen >= formulario.paginas.length ||
        indiceDestino < 0 || indiceDestino >= formulario.paginas.length) {
      return false
    }

    const [paginaMovida] = formulario.paginas.splice(indiceOrigen, 1)
    formulario.paginas.splice(indiceDestino, 0, paginaMovida)
    return true
  }

  /**
   * Actualizar el título de una página
   */
  static actualizarTituloPagina(formulario: EsquemaFormulario, indicePagina: number, nuevoTitulo: string): boolean {
    const pagina = formulario.paginas[indicePagina]
    if (!pagina) return false

    pagina.titulo = nuevoTitulo
    return true
  }

  /**
   * Validar índice de página
   */
  static esIndiceValido(formulario: EsquemaFormulario, indice: number): boolean {
    return indice >= 0 && indice < formulario.paginas.length
  }

  /**
   * Obtener la página activa de forma segura
   */
  static obtenerPaginaSegura(formulario: EsquemaFormulario, indice: number): EsquemaPagina | null {
    return this.esIndiceValido(formulario, indice) ? formulario.paginas[indice] : null
  }

  /**
   * Limpiar todos los campos de una página
   */
  static limpiarCamposPagina(formulario: EsquemaFormulario, indicePagina: number): boolean {
    const pagina = this.obtenerPaginaSegura(formulario, indicePagina)
    if (!pagina) return false

    pagina.campos = []
    return true
  }

  /**
   * Contar total de campos en una página (incluyendo anidados)
   */
  static contarCamposPagina(pagina: EsquemaPagina): number {
    let totalCampos = 0

    const contarRecursivo = (campos: EsquemaCampo[]): void => {
      for (const campo of campos) {
        totalCampos++
        if (campo.hijos && Array.isArray(campo.hijos)) {
          contarRecursivo(campo.hijos)
        }
      }
    }

    contarRecursivo(pagina.campos)
    return totalCampos
  }
}
