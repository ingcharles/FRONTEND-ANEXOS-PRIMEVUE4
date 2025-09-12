import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FormularioSerializacionService } from '../formulario-serializacion.service'
import type { FormSchema, FieldSchema } from '../../../../types/disenador'

describe('FormularioSerializacionService', () => {
  let formularioEjemplo: FormSchema

  beforeEach(() => {
    formularioEjemplo = {
      id: 'formulario-test',
      title: 'Formulario de Prueba',
      description: 'Un formulario para testing',
      version: '1.0.0',
      pages: [
        {
          id: 'pagina-1',
          title: 'Página 1',
          order: 1,
          fields: [
            {
              id: 'campo-texto-1',
              type: 'text',
              label: 'Nombre',
              placeholder: 'Ingrese su nombre',
              required: true,
              visible: true,
              disabled: false,
              readonly: false,
              position: { x: 0, y: 0 },
              size: { width: 300, height: 40 },
              responsive: { sm: 12, md: 6, lg: 4 },
              validations: [
                {
                  id: 'min-length',
                  type: 'minLength',
                  value: 3,
                  message: 'Mínimo 3 caracteres'
                }
              ],
              logic: []
            },
            {
              id: 'campo-email-1',
              type: 'email',
              label: 'Email',
              placeholder: 'usuario@ejemplo.com',
              required: true,
              visible: true,
              disabled: false,
              readonly: false,
              position: { x: 0, y: 50 },
              size: { width: 300, height: 40 },
              responsive: { sm: 12, md: 6, lg: 4 },
              validations: [
                {
                  id: 'email-pattern',
                  type: 'pattern',
                  value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                  message: 'Email inválido'
                }
              ],
              logic: []
            }
          ]
        }
      ],
      settings: {
        showGrid: true,
        gridSize: 20,
        snapToGrid: true,
        responsive: true
      },
      metadata: {
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    }
  })

  describe('serializar', () => {
    it('Debería serializar correctamente un formulario a JSON', () => {
      const jsonSerializado = FormularioSerializacionService.serializar(formularioEjemplo)

      expect(jsonSerializado).toBeDefined()
      expect(typeof jsonSerializado).toBe('string')

      // Verificar que es un JSON válido
      const objetoParsed = JSON.parse(jsonSerializado)
      expect(objetoParsed.id).toBe('formulario-test')
      expect(objetoParsed.title).toBe('Formulario de Prueba')
      expect(objetoParsed.pages).toHaveLength(1)
      expect(objetoParsed.pages[0].fields).toHaveLength(2)
    })

    it('Debería manejar formularios vacíos', () => {
      const formularioVacio: FormSchema = {
        ...formularioEjemplo,
        pages: [{
          id: 'pagina-vacia',
          title: 'Página Vacía',
          order: 1,
          fields: []
        }]
      }

      const jsonSerializado = FormularioSerializacionService.serializar(formularioVacio)
      const objetoParsed = JSON.parse(jsonSerializado)

      expect(objetoParsed.pages[0].fields).toHaveLength(0)
    })

    it('Debería lanzar error si el formulario es inválido', () => {
      const formularioInvalido = null as unknown as FormSchema

      expect(() => {
        FormularioSerializacionService.serializar(formularioInvalido)
      }).toThrow('No se pudo serializar el formulario')
    })
  })

  describe('deserializar', () => {
    it('Debería deserializar correctamente un JSON a formulario', () => {
      const jsonSerializado = FormularioSerializacionService.serializar(formularioEjemplo)
      const formularioDeserializado = FormularioSerializacionService.deserializar(jsonSerializado)

      expect(formularioDeserializado.id).toBe(formularioEjemplo.id)
      expect(formularioDeserializado.title).toBe(formularioEjemplo.title)
      expect(formularioDeserializado.pages).toHaveLength(formularioEjemplo.pages.length)
      expect(formularioDeserializado.pages[0].fields).toHaveLength(2)

      // Verificar que los campos mantienen sus propiedades
      const campoTexto = formularioDeserializado.pages[0].fields[0]
      expect(campoTexto.type).toBe('text')
      expect(campoTexto.label).toBe('Nombre')
      expect(campoTexto.required).toBe(true)
      expect(campoTexto.validations).toHaveLength(1)
    })

    it('Debería lanzar error si el JSON es inválido', () => {
      const jsonInvalido = '{ "invalid": json }'

      expect(() => {
        FormularioSerializacionService.deserializar(jsonInvalido)
      }).toThrow('El JSON del formulario no es válido')
    })

    it('Debería lanzar error si el JSON no tiene la estructura correcta', () => {
      const jsonSinEstructura = JSON.stringify({ some: 'data' })

      expect(() => {
        FormularioSerializacionService.deserializar(jsonSinEstructura)
      }).toThrow('El JSON del formulario no es válido')
    })
  })

  describe('clonarElemento', () => {
    let elementoOriginal: FieldSchema

    beforeEach(() => {
      elementoOriginal = formularioEjemplo.pages[0].fields[0]
    })

    it('Debería clonar correctamente un elemento', () => {
      const elementoClonado = FormularioSerializacionService.clonarElemento(elementoOriginal)

      // Verificar que es una copia profunda
      expect(elementoClonado).not.toBe(elementoOriginal)
      expect(elementoClonado.id).not.toBe(elementoOriginal.id)

      // Verificar que mantiene las propiedades básicas
      expect(elementoClonado.type).toBe(elementoOriginal.type)
      expect(elementoClonado.label).toBe(elementoOriginal.label)
      expect(elementoClonado.required).toBe(elementoOriginal.required)

      // Verificar que la posición se ajusta para evitar superposición
      expect(elementoClonado.position.x).toBe(elementoOriginal.position.x + 20)
      expect(elementoClonado.position.y).toBe(elementoOriginal.position.y + 20)

      // Verificar que las validaciones se mantienen
      expect(elementoClonado.validations).toHaveLength(elementoOriginal.validations.length)
      expect(elementoClonado.validations[0].type).toBe('minLength')
    })

    it('Debería generar un ID único para el elemento clonado', () => {
      const elemento1 = FormularioSerializacionService.clonarElemento(elementoOriginal)
      const elemento2 = FormularioSerializacionService.clonarElemento(elementoOriginal)

      expect(elemento1.id).not.toBe(elemento2.id)
      expect(elemento1.id).not.toBe(elementoOriginal.id)
      expect(elemento2.id).not.toBe(elementoOriginal.id)
    })

    it('Debería clonar elementos con hijos (paneles)', () => {
      const panelConHijos: FieldSchema = {
        id: 'panel-padre',
        type: 'panel',
        label: 'Panel Contenedor',
        required: false,
        visible: true,
        disabled: false,
        readonly: false,
        position: { x: 0, y: 0 },
        size: { width: 600, height: 400 },
        responsive: { sm: 12, md: 12, lg: 12 },
        validations: [],
        logic: [],
        children: [
          {
            id: 'campo-hijo-1',
            type: 'text',
            label: 'Campo Hijo',
            required: false,
            visible: true,
            disabled: false,
            readonly: false,
            position: { x: 10, y: 10 },
            size: { width: 200, height: 30 },
            responsive: { sm: 12, md: 6, lg: 4 },
            validations: [],
            logic: []
          }
        ]
      }

      const panelClonado = FormularioSerializacionService.clonarElemento(panelConHijos)

      expect(panelClonado.children).toHaveLength(1)
      expect(panelClonado.children![0].id).not.toBe(panelConHijos.children![0].id)
      expect(panelClonado.children![0].label).toBe('Campo Hijo')
    })
  })

  describe('exportarArchivo', () => {
    it('Debería crear un enlace de descarga', () => {
      // Mock de DOM elements
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        remove: vi.fn()
      }

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as HTMLElement)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as HTMLElement)

      // Mock URL.createObjectURL
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      FormularioSerializacionService.exportarArchivo(formularioEjemplo, 'test-form.json')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink)
      expect(mockLink.click).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink)
      expect(createObjectURLSpy).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalled()
      expect(mockLink.download).toBe('test-form.json')

      // Limpiar mocks
      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
      createObjectURLSpy.mockRestore()
      revokeObjectURLSpy.mockRestore()
    })
  })
})
