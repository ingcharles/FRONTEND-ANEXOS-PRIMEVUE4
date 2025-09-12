import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  FormSchema,
  FieldSchema,
  FormPage,
  DragContext,
  ResizeContext,
  SelectionContext,
  Position,
  Size,
  PaletteItem
} from '@/types/disenador'

export const useDisenadorStore = defineStore('disenador', () => {
  // Estado reactivo
  const currentForm = ref<FormSchema>({
    id: 'nuevo-formulario',
    title: 'Nuevo Formulario',
    description: '',
    version: '1.0.0',
    pages: [
      {
        id: 'pagina-1',
        title: 'Página 1',
        fields: [],
        order: 1
      }
    ],
    settings: {
      showGrid: true,
      gridSize: 20,
      snapToGrid: true,
      responsive: true
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  const currentPageIndex = ref(0)
  const previewMode = ref(false)
  const jsonMode = ref(false)

  // Contextos de interacción
  const dragContext = ref<DragContext>({
    isDragging: false,
    draggedFromPalette: false
  })

  const resizeContext = ref<ResizeContext>({
    isResizing: false,
    initialSize: { width: 0, height: 0 },
    initialPosition: { x: 0, y: 0 },
    resizeHandle: null
  })

  const selectionContext = ref<SelectionContext>({
    multiSelection: []
  })

  // Paleta de componentes
  const paletteItems = ref<PaletteItem[]>([
    {
      type: 'text',
      label: 'Campo de Texto',
      icon: 'pi pi-pencil',
      category: 'input',
      defaultProps: {
        label: 'Campo de Texto',
        placeholder: 'Ingrese texto...',
        required: false,
        visible: true,
        disabled: false,
        readonly: false,
        responsive: { sm: 12, md: 6, lg: 4 },
        validations: [],
        logic: []
      }
    },
    {
      type: 'textarea',
      label: 'Área de Texto',
      icon: 'pi pi-align-left',
      category: 'input',
      defaultProps: {
        label: 'Área de Texto',
        placeholder: 'Ingrese texto...',
        rows: 3,
        required: false,
        visible: true,
        disabled: false,
        readonly: false,
        responsive: { sm: 12, md: 8, lg: 6 },
        validations: [],
        logic: []
      }
    },
    {
      type: 'email',
      label: 'Correo Electrónico',
      icon: 'pi pi-envelope',
      category: 'input',
      defaultProps: {
        label: 'Correo Electrónico',
        placeholder: 'usuario@ejemplo.com',
        required: false,
        visible: true,
        disabled: false,
        readonly: false,
        responsive: { sm: 12, md: 6, lg: 4 },
        validations: [
          {
            id: 'email-validation',
            type: 'pattern',
            value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            message: 'Ingrese un email válido'
          }
        ],
        logic: []
      }
    },
    {
      type: 'password',
      label: 'Contraseña',
      icon: 'pi pi-lock',
      category: 'input',
      defaultProps: {
        label: 'Contraseña',
        placeholder: 'Ingrese su contraseña...',
        required: false,
        visible: true,
        disabled: false,
        readonly: false,
        responsive: { sm: 12, md: 6, lg: 4 },
        validations: [
          {
            id: 'password-length',
            type: 'minLength',
            value: 6,
            message: 'La contraseña debe tener al menos 6 caracteres'
          }
        ],
        logic: []
      }
    },
    {
      type: 'time',
      label: 'Hora',
      icon: 'pi pi-clock',
      category: 'input',
      defaultProps: {
        label: 'Hora',
        placeholder: 'Seleccione una hora...',
        required: false,
        visible: true,
        disabled: false,
        readonly: false,
        responsive: { sm: 12, md: 6, lg: 4 },
        validations: [],
        logic: []
      }
    },
    {
      type: 'select',
      label: 'Lista Desplegable',
      icon: 'pi pi-chevron-down',
      category: 'input',
      defaultProps: {
        label: 'Lista Desplegable',
        placeholder: 'Seleccione una opción...',
        required: false,
        visible: true,
        disabled: false,
        readonly: false,
        options: [
          { label: 'Opción 1', value: '1' },
          { label: 'Opción 2', value: '2' },
          { label: 'Opción 3', value: '3' }
        ],
        responsive: { sm: 12, md: 6, lg: 4 },
        validations: [],
        logic: []
      }
    },
    {
      type: 'radio',
      label: 'Botones de Radio',
      icon: 'pi pi-circle',
      category: 'input',
      defaultProps: {
        label: 'Botones de Radio',
        required: false,
        visible: true,
        disabled: false,
        readonly: false,
        options: [
          { label: 'Opción 1', value: '1' },
          { label: 'Opción 2', value: '2' },
          { label: 'Opción 3', value: '3' }
        ],
        responsive: { sm: 12, md: 6, lg: 4 },
        validations: [],
        logic: []
      }
    },
    {
      type: 'label',
      label: 'Etiqueta',
      icon: 'pi pi-tag',
      category: 'display',
      defaultProps: {
        label: 'Etiqueta de Texto',
        visible: true,
        responsive: { sm: 12, md: 6, lg: 4 },
        validations: [],
        logic: []
      }
    },
    {
      type: 'panel',
      label: 'Panel Contenedor',
      icon: 'pi pi-stop',
      category: 'layout',
      defaultProps: {
        label: 'Panel Contenedor',
        visible: true,
        children: [],
        nestingLevel: 1,
        responsive: { sm: 12, md: 12, lg: 12 },
        validations: [],
        logic: []
      }
    },
    {
      type: 'table',
      label: 'Tabla',
      icon: 'pi pi-table',
      category: 'display',
      defaultProps: {
        label: 'Tabla de Datos',
        visible: true,
        columns: [
          { id: 'col1', label: 'Columna 1', type: 'text', editable: false },
          { id: 'col2', label: 'Columna 2', type: 'text', editable: false }
        ],
        defaultRows: [
          { col1: 'Valor 1', col2: 'Valor 2' },
          { col1: 'Valor 3', col2: 'Valor 4' }
        ],
        allowAddRows: false,
        allowDeleteRows: false,
        responsive: { sm: 12, md: 12, lg: 12 },
        validations: [],
        logic: []
      }
    },
    {
      type: 'button',
      label: 'Botón',
      icon: 'pi pi-stop',
      category: 'action',
      defaultProps: {
        label: 'Botón',
        visible: true,
        disabled: false,
        responsive: { sm: 12, md: 4, lg: 3 },
        properties: {
          severity: 'primary'
        },
        validations: [],
        logic: []
      }
    },
    {
      type: 'divider',
      label: 'Separador',
      icon: 'pi pi-minus',
      category: 'layout',
      defaultProps: {
        label: 'Separador',
        visible: true,
        responsive: { sm: 12, md: 12, lg: 12 },
        properties: {
          orientation: 'horizontal'
        },
        validations: [],
        logic: []
      }
    }
  ])

  // Computed
  const currentPage = computed(() => currentForm.value.pages[currentPageIndex.value])
  const selectedElement = computed(() => {
    if (!selectionContext.value.selectedElementId) return null
    return buscarElementoPorId(selectionContext.value.selectedElementId, currentPage.value.fields)
  })

  const totalPages = computed(() => currentForm.value.pages.length)

  // Funciones de utilidad
  function generarId(): string {
    return `campo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  function buscarElementoPorId(id: string, fields: FieldSchema[]): FieldSchema | null {
    for (const field of fields) {
      if (field.id === id) return field
      if (field.children) {
        const found = buscarElementoPorId(id, field.children)
        if (found) return found
      }
    }
    return null
  }

  function eliminarElementoPorId(id: string, fields: FieldSchema[]): boolean {
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].id === id) {
        fields.splice(i, 1)
        return true
      }
      if (fields[i].children && eliminarElementoPorId(id, fields[i].children!)) {
        return true
      }
    }
    return false
  }

  // Acciones
  function agregarElemento(paletteItem: PaletteItem, position?: Position): void {
    const baseProps = {
      id: generarId(),
      type: paletteItem.type,
      position: position || { x: 50, y: 50 },
      size: { width: 300, height: 40 },
      validations: [],
      logic: [],
      label: paletteItem.defaultProps.label || 'Campo sin nombre',
      required: false,
      visible: true,
      disabled: false,
      readonly: false,
      responsive: { sm: 12, md: 6, lg: 4 }
    }

    const nuevoElemento: FieldSchema = {
      ...baseProps,
      ...paletteItem.defaultProps
    }

    currentPage.value.fields.push(nuevoElemento)
    seleccionarElemento(nuevoElemento.id)
    currentForm.value.metadata.updatedAt = new Date()
  }

  function eliminarElemento(id: string): void {
    if (eliminarElementoPorId(id, currentPage.value.fields)) {
      if (selectionContext.value.selectedElementId === id) {
        deseleccionarElemento()
      }
      currentForm.value.metadata.updatedAt = new Date()
    }
  }

  function duplicarElemento(id: string): void {
    const elemento = buscarElementoPorId(id, currentPage.value.fields)
    if (elemento) {
      const duplicado: FieldSchema = {
        ...JSON.parse(JSON.stringify(elemento)),
        id: generarId(),
        position: {
          x: elemento.position.x + 20,
          y: elemento.position.y + 20
        }
      }
      currentPage.value.fields.push(duplicado)
      seleccionarElemento(duplicado.id)
      currentForm.value.metadata.updatedAt = new Date()
    }
  }

  function seleccionarElemento(id: string): void {
    // Deseleccionar elementos anteriores
    const deseleccionar = (fields: FieldSchema[]) => {
      fields.forEach(field => {
        field.selected = false
        if (field.children) deseleccionar(field.children)
      })
    }
    deseleccionar(currentPage.value.fields)

    // Seleccionar nuevo elemento
    const elemento = buscarElementoPorId(id, currentPage.value.fields)
    if (elemento) {
      elemento.selected = true
      selectionContext.value.selectedElementId = id
      selectionContext.value.selectedElement = elemento
    }
  }

  function deseleccionarElemento(): void {
    const deseleccionar = (fields: FieldSchema[]) => {
      fields.forEach(field => {
        field.selected = false
        if (field.children) deseleccionar(field.children)
      })
    }
    deseleccionar(currentPage.value.fields)

    selectionContext.value.selectedElementId = undefined
    selectionContext.value.selectedElement = undefined
  }

  function moverElemento(id: string, newPosition: Position): void {
    const elemento = buscarElementoPorId(id, currentPage.value.fields)
    if (elemento) {
      elemento.position = newPosition
      currentForm.value.metadata.updatedAt = new Date()
    }
  }

  function redimensionarElemento(id: string, newSize: Size): void {
    const elemento = buscarElementoPorId(id, currentPage.value.fields)
    if (elemento) {
      elemento.size = newSize
      currentForm.value.metadata.updatedAt = new Date()
    }
  }

  function actualizarPropiedad(id: string, property: string, value: string | number | boolean): void {
    const elemento = buscarElementoPorId(id, currentPage.value.fields)
    if (elemento) {
      (elemento as unknown as Record<string, unknown>)[property] = value
      currentForm.value.metadata.updatedAt = new Date()
    }
  }

  function cambiarPagina(index: number): void {
    if (index >= 0 && index < currentForm.value.pages.length) {
      currentPageIndex.value = index
      deseleccionarElemento()
    }
  }

  function agregarPagina(): void {
    const nuevaPagina: FormPage = {
      id: `pagina-${currentForm.value.pages.length + 1}`,
      title: `Página ${currentForm.value.pages.length + 1}`,
      fields: [],
      order: currentForm.value.pages.length + 1
    }
    currentForm.value.pages.push(nuevaPagina)
    currentForm.value.metadata.updatedAt = new Date()
  }

  function eliminarPagina(index: number): void {
    if (currentForm.value.pages.length > 1) {
      currentForm.value.pages.splice(index, 1)
      if (currentPageIndex.value >= currentForm.value.pages.length) {
        currentPageIndex.value = currentForm.value.pages.length - 1
      }
      currentForm.value.metadata.updatedAt = new Date()
    }
  }

  function configurarFormulario(configuracion: Partial<FormSchema>): void {
    Object.assign(currentForm.value, configuracion)
    currentForm.value.metadata.updatedAt = new Date()
  }

  function limpiarFormulario(): void {
    currentForm.value = {
      id: 'nuevo-formulario',
      title: 'Nuevo Formulario',
      description: '',
      version: '1.0.0',
      pages: [
        {
          id: 'pagina-1',
          title: 'Página 1',
          fields: [],
          order: 1
        }
      ],
      settings: {
        showGrid: true,
        gridSize: 20,
        snapToGrid: true,
        responsive: true
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
    currentPageIndex.value = 0
    deseleccionarElemento()
  }

  function iniciarArrastre(elemento?: FieldSchema, fromPalette = false): void {
    dragContext.value.isDragging = true
    dragContext.value.draggedElement = elemento
    dragContext.value.draggedFromPalette = fromPalette
  }

  function finalizarArrastre(): void {
    dragContext.value.isDragging = false
    dragContext.value.draggedElement = undefined
    dragContext.value.draggedFromPalette = false
    dragContext.value.dropPosition = undefined
    dragContext.value.dropTarget = undefined
  }

  function iniciarRedimensionamiento(elemento: FieldSchema, handle: string): void {
    resizeContext.value.isResizing = true
    resizeContext.value.resizedElement = elemento
    resizeContext.value.resizeHandle = handle as 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'
    resizeContext.value.initialSize = { ...elemento.size }
    resizeContext.value.initialPosition = { ...elemento.position }
  }

  function finalizarRedimensionamiento(): void {
    resizeContext.value.isResizing = false
    resizeContext.value.resizedElement = undefined
    resizeContext.value.resizeHandle = null
  }

  return {
    // Estado
    currentForm,
    currentPageIndex,
    previewMode,
    jsonMode,
    dragContext,
    resizeContext,
    selectionContext,
    paletteItems,

    // Computed
    currentPage,
    selectedElement,
    totalPages,

    // Acciones
    agregarElemento,
    eliminarElemento,
    duplicarElemento,
    seleccionarElemento,
    deseleccionarElemento,
    moverElemento,
    redimensionarElemento,
    actualizarPropiedad,
    cambiarPagina,
    agregarPagina,
    eliminarPagina,
    configurarFormulario,
    limpiarFormulario,
    iniciarArrastre,
    finalizarArrastre,
    iniciarRedimensionamiento,
    finalizarRedimensionamiento,

    // Funciones de utilidad
    generarId,
    buscarElementoPorId
  }
})
