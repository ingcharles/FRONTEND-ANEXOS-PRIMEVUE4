// Servicios para el manejo de campos - Principio de Responsabilidad Única
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { EsquemaPagina } from '@/interfaces/Pagina'
import { clonarProfundo, duplicarConNuevosIds } from '@/utilidades/clonar'
import { generarId } from '@/utilidades/id'

/**
 * Servicio para operaciones CRUD de campos
 */
export class ServicioCampos {
  /**
   * Buscar un campo por ID en todas las páginas
   */
  static buscarCampoPorId(paginas: EsquemaPagina[], id: string): EsquemaCampo | null {
    for (const pagina of paginas) {
      const resultado = this.buscarCampoEnLista(pagina.campos, id)
      if (resultado) return resultado
    }
    return null
  }

  /**
   * Buscar un campo en una lista de campos (recursivo para campos anidados)
   */
  private static buscarCampoEnLista(lista: EsquemaCampo[], id: string): EsquemaCampo | null {
    for (const campo of lista) {
      if (campo.id === id) return campo
      if (campo.hijos) {
        const resultado = this.buscarCampoEnLista(campo.hijos, id)
        if (resultado) return resultado
      }
    }
    return null
  }

  /**
   * Agregar un campo a una página
   */
  static agregarCampo(pagina: EsquemaPagina, campo: EsquemaCampo, indice?: number): string {
    const copia = clonarProfundo(campo)
    if (!copia.id) copia.id = generarId('campo')

    const indiceInsercion = indice ?? pagina.campos.length
    pagina.campos.splice(indiceInsercion, 0, copia)

    return copia.id
  }

  /**
   * Mover un campo dentro de una página
   */
  static moverCampo(pagina: EsquemaPagina, indiceOrigen: number, indiceDestino: number): void {
    const [elemento] = pagina.campos.splice(indiceOrigen, 1)
    pagina.campos.splice(indiceDestino, 0, elemento)
  }

  /**
   * Actualizar un campo por ID
   */
  static actualizarCampo(paginas: EsquemaPagina[], id: string, cambios: Partial<EsquemaCampo>): boolean {
    for (const pagina of paginas) {
      if (this.actualizarCampoEnLista(pagina.campos, id, cambios)) {
        return true
      }
    }
    return false
  }

  /**
   * Actualizar un campo en una lista (recursivo)
   */
  private static actualizarCampoEnLista(lista: EsquemaCampo[], id: string, cambios: Partial<EsquemaCampo>): boolean {
    const indice = lista.findIndex((campo) => campo.id === id)
    if (indice >= 0) {
      const campoActual = lista[indice]
      const campoActualizado = { ...campoActual, ...clonarProfundo(cambios) } as EsquemaCampo

      // Solo 'panel' puede tener hijos
      if (campoActualizado.tipo !== 'panel' && 'hijos' in cambios) {
        delete (campoActualizado as Partial<EsquemaCampo>).hijos
      }

      // Asegurar que panel tenga array de hijos
      if (campoActualizado.tipo === 'panel' && !Array.isArray(campoActualizado.hijos)) {
        campoActualizado.hijos = Array.isArray(campoActual.hijos) ? campoActual.hijos : []
      }

      lista[indice] = campoActualizado
      return true
    }

    // Buscar en campos anidados
    for (const campo of lista) {
      if (campo.hijos && this.actualizarCampoEnLista(campo.hijos, id, cambios)) {
        return true
      }
    }
    return false
  }

  /**
   * Duplicar un campo
   */
  static duplicarCampo(paginas: EsquemaPagina[], id: string): EsquemaCampo | null {
    for (const pagina of paginas) {
      const resultado = this.duplicarCampoEnLista(pagina.campos, id)
      if (resultado) return resultado
    }
    return null
  }

  /**
   * Duplicar un campo en una lista
   */
  private static duplicarCampoEnLista(lista: EsquemaCampo[], id: string): EsquemaCampo | null {
    const indice = lista.findIndex((campo) => campo.id === id)
    if (indice !== -1) {
      const campoOriginal = lista[indice]
      const campoDuplicado = duplicarConNuevosIds(campoOriginal, () => generarId('campo'))

      // Solo panel puede conservar hijos
      if (campoDuplicado.tipo !== 'panel' && 'hijos' in campoDuplicado) {
        delete (campoDuplicado as Partial<EsquemaCampo>).hijos
      }

      lista.splice(indice + 1, 0, campoDuplicado)
      return campoDuplicado
    }

    // Buscar en campos anidados
    for (const campo of lista) {
      if (campo.hijos) {
        const resultado = this.duplicarCampoEnLista(campo.hijos, id)
        if (resultado) return resultado
      }
    }
    return null
  }

  /**
   * Eliminar un campo por ID
   */
  static eliminarCampo(paginas: EsquemaPagina[], id: string): boolean {
    for (const pagina of paginas) {
      if (this.eliminarCampoEnLista(pagina.campos, id)) {
        return true
      }
    }
    return false
  }

  /**
   * Eliminar un campo de una lista
   */
  private static eliminarCampoEnLista(lista: EsquemaCampo[], id: string): boolean {
    const indice = lista.findIndex((campo) => campo.id === id)
    if (indice !== -1) {
      lista.splice(indice, 1)
      return true
    }

    // Buscar en campos anidados
    for (const campo of lista) {
      if (campo.hijos && this.eliminarCampoEnLista(campo.hijos, id)) {
        return true
      }
    }
    return false
  }

  /**
   * Validar si un campo puede tener hijos
   */
  static puedeContenerHijos(tipoCampo: string): boolean {
    return tipoCampo === 'panel'
  }

  /**
   * Obtener el nombre en español del tipo de campo
   */
  static obtenerNombreTipoEspanol(tipo: string): string {
    const mapeoTipos: Record<string, string> = {
      'texto': 'Texto',
      'correo': 'Correo electrónico',
      'contrasena': 'Contraseña',
      'area-texto': 'Área de texto',
      'numero': 'Número',
      'fecha': 'Fecha',
      'hora': 'Hora',
      'seleccion': 'Selección',
      'radio': 'Opción múltiple',
      'casilla': 'Casilla de verificación',
      'etiqueta': 'Etiqueta',
      'boton': 'Botón',
      'divisor': 'Divisor',
      'panel': 'Panel',
      'tabla': 'Tabla'
    }
    return mapeoTipos[tipo] || tipo
  }
}
