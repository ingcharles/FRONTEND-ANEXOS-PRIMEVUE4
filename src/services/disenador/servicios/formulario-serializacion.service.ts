import type { FormSchema, FieldSchema } from '@/types/disenador'

/**
 * Servicio para serializar y deserializar esquemas de formulario
 */
export class FormularioSerializacionService {
  
  /**
   * Serializa un esquema de formulario a JSON
   */
  static serializar(formulario: FormSchema): string {
    try {
      // Crear una copia profunda del formulario
      const formularioLimpio = this.limpiarEsquema(formulario)
      
      return JSON.stringify(formularioLimpio, null, 2)
    } catch (error) {
      console.error('Error al serializar formulario:', error)
      throw new Error('No se pudo serializar el formulario')
    }
  }

  /**
   * Deserializa un JSON a esquema de formulario
   */
  static deserializar(jsonString: string): FormSchema {
    try {
      const formulario = JSON.parse(jsonString) as FormSchema
      
      // Validar estructura básica
      this.validarEstructura(formulario)
      
      // Normalizar el esquema
      return this.normalizarEsquema(formulario)
    } catch (error) {
      console.error('Error al deserializar formulario:', error)
      throw new Error('El JSON del formulario no es válido')
    }
  }

  /**
   * Exporta el formulario como archivo JSON
   */
  static exportarArchivo(formulario: FormSchema, nombreArchivo?: string): void {
    try {
      const json = this.serializar(formulario)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = nombreArchivo || `formulario-${formulario.id}-${new Date().toISOString().split('T')[0]}.json`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al exportar archivo:', error)
      throw new Error('No se pudo exportar el archivo')
    }
  }

  /**
   * Importa un formulario desde un archivo
   */
  static async importarArchivo(archivo: File): Promise<FormSchema> {
    try {
      const texto = await this.leerArchivo(archivo)
      return this.deserializar(texto)
    } catch (error) {
      console.error('Error al importar archivo:', error)
      throw new Error('No se pudo importar el archivo')
    }
  }

  /**
   * Clona/duplica un elemento del formulario
   */
  static clonarElemento(elemento: FieldSchema): FieldSchema {
    try {
      const clon = JSON.parse(JSON.stringify(elemento)) as FieldSchema
      
      // Generar nuevo ID
      clon.id = this.generarId()
      
      // Ajustar posición para evitar superposición
      clon.position = {
        x: elemento.position.x + 20,
        y: elemento.position.y + 20
      }
      
      // Clonar elementos hijos recursivamente
      if (clon.children) {
        clon.children = clon.children.map(hijo => this.clonarElemento(hijo))
      }
      
      return clon
    } catch (error) {
      console.error('Error al clonar elemento:', error)
      throw new Error('No se pudo clonar el elemento')
    }
  }

  /**
   * Valida la estructura básica del formulario
   */
  private static validarEstructura(formulario: FormSchema): void {
    if (!formulario) {
      throw new Error('El formulario no puede estar vacío')
    }

    if (!formulario.id || typeof formulario.id !== 'string') {
      throw new Error('El formulario debe tener un ID válido')
    }

    if (!formulario.pages || !Array.isArray(formulario.pages)) {
      throw new Error('El formulario debe tener un array de páginas')
    }

    if (formulario.pages.length === 0) {
      throw new Error('El formulario debe tener al menos una página')
    }

    // Validar cada página
    formulario.pages.forEach((page, index) => {
      if (!page.id || typeof page.id !== 'string') {
        throw new Error(`La página ${index + 1} debe tener un ID válido`)
      }
      
      if (!page.fields || !Array.isArray(page.fields)) {
        throw new Error(`La página ${index + 1} debe tener un array de campos`)
      }
    })
  }

  /**
   * Normaliza el esquema después de la deserialización
   */
  private static normalizarEsquema(formulario: FormSchema): FormSchema {
    // Convertir fechas de string a Date si es necesario
    if (typeof formulario.metadata.createdAt === 'string') {
      formulario.metadata.createdAt = new Date(formulario.metadata.createdAt)
    }
    
    if (typeof formulario.metadata.updatedAt === 'string') {
      formulario.metadata.updatedAt = new Date(formulario.metadata.updatedAt)
    }

    // Normalizar campos en cada página
    formulario.pages.forEach(page => {
      page.fields = this.normalizarCampos(page.fields)
    })

    return formulario
  }

  /**
   * Normaliza campos recursivamente
   */
  private static normalizarCampos(campos: FieldSchema[]): FieldSchema[] {
    return campos.map(campo => {
      // Asegurar propiedades requeridas
      const campoNormalizado: FieldSchema = {
        ...campo,
        selected: false,
        dragging: false,
        resizing: false,
        validations: campo.validations || [],
        logic: campo.logic || []
      }

      // Normalizar responsive config si no existe
      if (!campoNormalizado.responsive) {
        campoNormalizado.responsive = { sm: 12, md: 6, lg: 4 }
      }

      // Normalizar position si no existe
      if (!campoNormalizado.position) {
        campoNormalizado.position = { x: 0, y: 0 }
      }

      // Normalizar size si no existe
      if (!campoNormalizado.size) {
        campoNormalizado.size = { width: 200, height: 40 }
      }

      // Normalizar campos hijos
      if (campoNormalizado.children) {
        campoNormalizado.children = this.normalizarCampos(campoNormalizado.children)
      }

      return campoNormalizado
    })
  }

  /**
   * Limpia el esquema antes de la serialización
   */
  private static limpiarEsquema(formulario: FormSchema): FormSchema {
    const formularioLimpio = JSON.parse(JSON.stringify(formulario)) as FormSchema

    // Limpiar campos en cada página
    formularioLimpio.pages.forEach(page => {
      page.fields = this.limpiarCampos(page.fields)
    })

    return formularioLimpio
  }

  /**
   * Limpia campos recursivamente eliminando propiedades de estado temporal
   */
  private static limpiarCampos(campos: FieldSchema[]): FieldSchema[] {
    return campos.map(campo => {
      const campoLimpio = { ...campo }
      
      // Eliminar propiedades de estado temporal
      delete campoLimpio.selected
      delete campoLimpio.dragging
      delete campoLimpio.resizing

      // Limpiar campos hijos
      if (campoLimpio.children) {
        campoLimpio.children = this.limpiarCampos(campoLimpio.children)
      }

      return campoLimpio
    })
  }

  /**
   * Lee el contenido de un archivo
   */
  private static leerArchivo(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string)
        } else {
          reject(new Error('No se pudo leer el archivo'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'))
      }
      
      reader.readAsText(archivo)
    })
  }

  /**
   * Genera un ID único
   */
  private static generarId(): string {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Convierte el formulario a diferentes formatos de exportación
   */
  static convertirAFormato(formulario: FormSchema, formato: 'json' | 'html' | 'vue'): string {
    switch (formato) {
      case 'json':
        return this.serializar(formulario)
      
      case 'html':
        return this.convertirAHtml(formulario)
      
      case 'vue':
        return this.convertirAVue(formulario)
      
      default:
        throw new Error(`Formato no soportado: ${formato}`)
    }
  }

  /**
   * Convierte el formulario a HTML estático
   */
  private static convertirAHtml(formulario: FormSchema): string {
    let html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formulario.title}</title>
    <style>
        .form-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .field-group { margin-bottom: 1rem; }
        .field-label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
        .field-input { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
        .form-button { background: #007bff; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="form-container">
        <h1>${formulario.title}</h1>
        ${formulario.description ? `<p>${formulario.description}</p>` : ''}
        <form>`

    formulario.pages.forEach((page, pageIndex) => {
      if (formulario.pages.length > 1) {
        html += `<div class="page" data-page="${pageIndex}">
          <h2>${page.title}</h2>`
      }
      
      html += this.convertirCamposAHtml(page.fields)
      
      if (formulario.pages.length > 1) {
        html += '</div>'
      }
    })

    html += `
        </form>
    </div>
</body>
</html>`

    return html
  }

  /**
   * Convierte campos a HTML recursivamente
   */
  private static convertirCamposAHtml(campos: FieldSchema[]): string {
    return campos.map(campo => {
      if (!campo.visible) return ''

      switch (campo.type) {
        case 'TextField':
          return `<div class="field-group">
            <label class="field-label">${campo.label}${campo.required ? ' *' : ''}</label>
            <input type="text" class="field-input" placeholder="${campo.placeholder || ''}" ${campo.required ? 'required' : ''}>
          </div>`
        
        case 'TextArea':
          return `<div class="field-group">
            <label class="field-label">${campo.label}${campo.required ? ' *' : ''}</label>
            <textarea class="field-input" rows="${campo.rows || 3}" placeholder="${campo.placeholder || ''}" ${campo.required ? 'required' : ''}></textarea>
          </div>`
        
        case 'ComboBox':
          const options = campo.options?.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('') || ''
          return `<div class="field-group">
            <label class="field-label">${campo.label}${campo.required ? ' *' : ''}</label>
            <select class="field-input" ${campo.required ? 'required' : ''}>
              <option value="">${campo.placeholder || 'Seleccione una opción'}</option>
              ${options}
            </select>
          </div>`
        
        case 'Label':
          return `<div class="field-group">
            <span class="field-label">${campo.label}</span>
          </div>`
        
        case 'Button':
          return `<div class="field-group">
            <button type="button" class="form-button">${campo.label}</button>
          </div>`
        
        case 'Panel':
          const children = campo.children ? this.convertirCamposAHtml(campo.children) : ''
          return `<div class="panel">
            <h3>${campo.label}</h3>
            ${children}
          </div>`
        
        default:
          return `<!-- Tipo de campo no soportado: ${campo.type} -->`
      }
    }).join('')
  }

  /**
   * Convierte el formulario a componente Vue
   */
  private static convertirAVue(formulario: FormSchema): string {
    const template = this.generarTemplateVue(formulario)
    const script = this.generarScriptVue()
    
    return `<template>
${template}
</template>

<script setup lang="ts">
${script}
</script>

<style scoped>
.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.field-group {
  margin-bottom: 1rem;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.field-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>`
  }

  private static generarTemplateVue(formulario: FormSchema): string {
    return `  <div class="form-container">
    <h1>${formulario.title}</h1>
    ${formulario.description ? `<p>${formulario.description}</p>` : ''}
    <form @submit.prevent="submitForm">
      <!-- Campos del formulario serían generados aquí -->
      <p>Formulario generado automáticamente para: ${formulario.title}</p>
    </form>
  </div>`
  }

  private static generarScriptVue(): string {
    return `import { ref } from 'vue'

// Datos reactivos del formulario
const formData = ref({})

// Función para enviar el formulario
function submitForm() {
  console.log('Datos del formulario:', formData.value)
  // Lógica de envío aquí
}`
  }
}

// Función utilitaria para uso directo
export function serializarFormulario(formulario: FormSchema): string {
  return FormularioSerializacionService.serializar(formulario)
}

export function deserializarFormulario(json: string): FormSchema {
  return FormularioSerializacionService.deserializar(json)
}

export function clonarElemento(elemento: FieldSchema): FieldSchema {
  return FormularioSerializacionService.clonarElemento(elemento)
}