import { zEsquemaFormulario } from '@/esquemas/Formulario'
import type { EsquemaFormulario } from '@/interfaces/Formulario'

/**
 * Servicio para serialización y deserialización de formularios
 * Implementa el patrón Strategy para diferentes formatos
 */
export class ServicioSerializacion {
  /**
   * Serializar esquema de formulario a JSON
   */
  static serializar(esquema: EsquemaFormulario): string {
    return JSON.stringify(esquema, null, 2)
  }

  /**
   * Deserializar JSON a esquema de formulario con validación
   */
  static deserializar(json: string): EsquemaFormulario {
    const datos = JSON.parse(json)
    const resultado = zEsquemaFormulario.safeParse(datos)
    
    if (!resultado.success) {
      const mensajesError = resultado.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('\n')
      throw new Error(`JSON inválido para EsquemaFormulario:\n${mensajesError}`)
    }
    
    return resultado.data
  }

  /**
   * Descargar contenido como archivo JSON
   */
  static descargarArchivo(nombreArchivo: string, contenido: string): void {
    const blob = new Blob([contenido], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    
    enlace.href = url
    enlace.download = nombreArchivo
    enlace.click()
    
    // Limpiar recursos después de la descarga
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  /**
   * Validar si un JSON es un esquema de formulario válido
   */
  static esEsquemaValido(json: string): boolean {
    try {
      const datos = JSON.parse(json)
      const resultado = zEsquemaFormulario.safeParse(datos)
      return resultado.success
    } catch {
      return false
    }
  }

  /**
   * Exportar solo una página específica
   */
  static serializarPagina(esquema: EsquemaFormulario, indicePagina: number): string {
    const pagina = esquema.paginas[indicePagina]
    if (!pagina) {
      throw new Error('Índice de página inválido')
    }
    
    return JSON.stringify(pagina, null, 2)
  }

  /**
   * Importar configuración desde un archivo de texto
   */
  static async importarDesdeArchivo(archivo: File): Promise<EsquemaFormulario> {
    const texto = await archivo.text()
    return this.deserializar(texto)
  }

  /**
   * Crear backup comprimido del formulario
   */
  static crearBackup(esquema: EsquemaFormulario): string {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      formulario: esquema
    }
    
    return JSON.stringify(backup, null, 2)
  }

  /**
   * Restaurar desde backup
   */
  static restaurarBackup(jsonBackup: string): EsquemaFormulario {
    const backup = JSON.parse(jsonBackup)
    
    if (!backup.formulario) {
      throw new Error('Formato de backup inválido')
    }
    
    return this.deserializar(JSON.stringify(backup.formulario))
  }
}
