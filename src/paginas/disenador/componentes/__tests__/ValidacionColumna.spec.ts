import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import VistaPrevia from '../VistaPrevia.vue'
import { useAlmacenDisenador } from '../../../../almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '../../../../interfaces/Campos'

function crearCampoTablaValidaciones() {
  return {
    id: 'field_v',
    tipo: 'tabla' as const,
    etiqueta: 'Tabla',
    nombre: 'tablaVal',
    visible: true,
    requerido: false,
    metadatos: {
      columnas: [
        {
          nombre: 'n',
          etiqueta: 'N',
          tipo: 'number',
          requerido: true,
          min: 1,
          max: 10,
          mensajeMin: '>=1',
          mensajeMax: '<=10'
        },
      ],
      filas: 1,
      agregarFilas: false,
      mostrarResumen: false,
    },
  }
}

function crearPagina() {
  return { id: 'page_v', titulo: 'V', campos: [crearCampoTablaValidaciones()] }
}

describe('Validación por columna en tabla', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Debería fallar al enviar si n fuera de rango', async () => {
    const almacen = useAlmacenDisenador()
    almacen.esquemaFormulario.paginas = [crearPagina()]
    const wrapper = mount(VistaPrevia as unknown as object)
    await wrapper.vm.$nextTick()

    const pageId = almacen.esquemaFormulario.paginas[0].id
    almacen.navegarPagina(pageId)

    const formulario = almacen.esquemaFormulario
    const valoresForm: Record<string, Record<string, unknown>> = { [formulario.paginas[0].id]: {} }

    // Buscar el campo directamente por su nombre
    const campo = formulario.paginas[0].campos.find((c: EsquemaCampo) => c.id === 'field_v')
    if (!campo?.nombre) {
      throw new Error('Campo no encontrado o sin nombre')
    }
    
    valoresForm[pageId][campo.nombre] = [{ n: 15 }]

    const resultadoSubmit = await almacen.validarYEnviarFormulario(valoresForm)

    expect(resultadoSubmit.exito).toBe(false)
    expect(resultadoSubmit.mensaje).toContain('<=10')
    
    // Esperamos que aparezca error en el wrapper
    const errorEls = wrapper.findAll('.error-message, .p-invalid')
    expect(errorEls.length).toBeGreaterThan(0)
  })
})

