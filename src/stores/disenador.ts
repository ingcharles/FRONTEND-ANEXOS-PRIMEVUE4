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
        validations: [],
        logic: []
      }
    },
    {
      type: 'email',
      label: 'Campo de Email',
      icon: 'pi pi-envelope',
      category: 'input',
      defaultProps: {
        label: 'Campo de Email',
        placeholder: 'usuario@ejemplo.com',
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
      type: 'password',
      label: 'Campo de Contraseña',
      icon: 'pi pi-lock',
      category: 'input',
      defaultProps: {
        label: 'Contraseña',
        placeholder: 'Ingrese contraseña...',
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
      type: 'number',
      label: 'Campo Numérico',
      icon: 'pi pi-sort-numeric-up',
      category: 'input',
      defaultProps: {
        label: 'Campo Numérico',
        placeholder: '0',
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
      type: 'checkbox',
      label: 'Casilla de Verificación',
      icon: 'pi pi-check-square',
      category: 'input',
      defaultProps: {
        label: 'Casilla de Verificación',
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
      type: 'file',
      label: 'Carga de Archivo',
      icon: 'pi pi-upload',
      category: 'input',
      defaultProps: {
        label: 'Carga de Archivo',
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
      type: 'date',
      label: 'Campo de Fecha',
      icon: 'pi pi-calendar',
      category: 'input',
      defaultProps: {
        label: 'Fecha',
        placeholder: 'Seleccione fecha...',
        required: false,
        visible: true,
        disabled: false,
        readonly: false,
        responsive: { sm: 12, md: 6, lg: 4 },
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

  // Utilidades
  function generarId(): string {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  function generarIdPagina(): string {
    return `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
    const index = fields.findIndex(f => f.id === id)
    if (index !== -1) {
      fields.splice(index, 1)
      return true
    }

    for (const field of fields) {
      if (field.children && eliminarElementoPorId(id, field.children)) {
        return true
      }
    }
    return false
  }

  function clonarElemento(elemento: FieldSchema): FieldSchema {
    const clonado = JSON.parse(JSON.stringify(elemento)) as FieldSchema
    clonado.id = generarId()
    clonado.position = {
      x: elemento.position.x + 20,
      y: elemento.position.y + 20
    }

    if (clonado.children) {
      clonado.children = clonado.children.map(child => clonarElemento(child))
    }

    return clonado
  }

  // Acciones
  function crearElementoDesdeItem(item: PaletteItem, position: Position): FieldSchema {
    return {
      ...item.defaultProps,
      id: generarId(),
      type: item.type,
      position,
      size: { width: 200, height: 40 },
      selected: false,
      dragging: false,
      resizing: false
    } as FieldSchema
  }

  function agregarElemento(elemento: FieldSchema, contenedorId?: string): void {
    if (contenedorId) {
      const contenedor = buscarElementoPorId(contenedorId, currentPage.value.fields)
      if (contenedor && contenedor.children) {
        contenedor.children.push(elemento)
      }
    } else {
      currentPage.value.fields.push(elemento)
    }
    actualizarTimestamp()
  }

  function seleccionarElemento(elementoId: string): void {
    // Deseleccionar todos los elementos
    const deseleccionar = (fields: FieldSchema[]) => {
      fields.forEach(field => {
        field.selected = false
        if (field.children) deseleccionar(field.children)
      })
    }
    deseleccionar(currentPage.value.fields)

    // Seleccionar el elemento específico
    const elemento = buscarElementoPorId(elementoId, currentPage.value.fields)
    if (elemento) {
      elemento.selected = true
      selectionContext.value.selectedElementId = elementoId
      selectionContext.value.selectedElement = elemento
    }
  }

  function deseleccionarElementos(): void {
    const deseleccionar = (fields: FieldSchema[]) => {
      fields.forEach(field => {
        field.selected = false
        if (field.children) deseleccionar(field.children)
      })
    }
    deseleccionar(currentPage.value.fields)
    selectionContext.value.selectedElementId = undefined
    selectionContext.value.selectedElement = undefined
    selectionContext.value.multiSelection = []
  }

  function eliminarElemento(elementoId: string): void {
    if (eliminarElementoPorId(elementoId, currentPage.value.fields)) {
      if (selectionContext.value.selectedElementId === elementoId) {
        deseleccionarElementos()
      }
      actualizarTimestamp()
    }
  }

  function duplicarElemento(elementoId: string): void {
    const elemento = buscarElementoPorId(elementoId, currentPage.value.fields)
    if (elemento) {
      const clonado = clonarElemento(elemento)
      agregarElemento(clonado)
    }
  }

  function moverElemento(elementoId: string, nuevaPosicion: Position): void {
    const elemento = buscarElementoPorId(elementoId, currentPage.value.fields)
    if (elemento) {
      elemento.position = nuevaPosicion
      actualizarTimestamp()
    }
  }

  function redimensionarElemento(elementoId: string, nuevoTamano: Size): void {
    const elemento = buscarElementoPorId(elementoId, currentPage.value.fields)
    if (elemento) {
      elemento.size = nuevoTamano
      actualizarTimestamp()
    }
  }

  function actualizarPropiedad(elementoId: string, propiedad: string, valor: string | number | boolean): void {
    const elemento = buscarElementoPorId(elementoId, currentPage.value.fields)
    if (elemento) {
      // Usamos un enfoque más type-safe para actualizar propiedades
      if (propiedad in elemento) {
        (elemento as unknown as Record<string, string | number | boolean>)[propiedad] = valor
      }
      actualizarTimestamp()
    }
  }

  function alternarGrilla(): void {
    currentForm.value.settings.showGrid = !currentForm.value.settings.showGrid
  }

  function alternarSnapGrilla(): void {
    currentForm.value.settings.snapToGrid = !currentForm.value.settings.snapToGrid
  }

  function cambiarTamanoGrilla(nuevoTamano: number): void {
    currentForm.value.settings.gridSize = nuevoTamano
  }

  function cambiarPagina(indice: number): void {
    if (indice >= 0 && indice < currentForm.value.pages.length) {
      deseleccionarElementos()
      currentPageIndex.value = indice
    }
  }

  function agregarPagina(): void {
    const nuevaPagina: FormPage = {
      id: generarIdPagina(),
      title: `Página ${currentForm.value.pages.length + 1}`,
      fields: [],
      order: currentForm.value.pages.length + 1
    }
    currentForm.value.pages.push(nuevaPagina)
    actualizarTimestamp()
  }

  function eliminarPagina(indice: number): void {
    if (currentForm.value.pages.length > 1 && indice >= 0 && indice < currentForm.value.pages.length) {
      currentForm.value.pages.splice(indice, 1)

      // Reordenar páginas
      currentForm.value.pages.forEach((page, idx) => {
        page.order = idx + 1
      })

      // Ajustar página actual si es necesario
      if (currentPageIndex.value >= currentForm.value.pages.length) {
        currentPageIndex.value = currentForm.value.pages.length - 1
      }

      actualizarTimestamp()
    }
  }

  function cambiarModoVista(modo: 'design' | 'preview' | 'json'): void {
    deseleccionarElementos()
    previewMode.value = modo === 'preview'
    jsonMode.value = modo === 'json'
  }

  function exportarJson(): string {
    return JSON.stringify(currentForm.value, null, 2)
  }

  function importarJson(jsonString: string): boolean {
    try {
      const formulario = JSON.parse(jsonString) as FormSchema

      // Validar estructura básica
      if (!formulario.id || !formulario.pages || !Array.isArray(formulario.pages)) {
        return false
      }

      currentForm.value = formulario
      currentPageIndex.value = 0
      deseleccionarElementos()
      actualizarTimestamp()

      return true
    } catch {
      return false
    }
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
    deseleccionarElementos()
  }

  function actualizarTimestamp(): void {
    currentForm.value.metadata.updatedAt = new Date()
  }

  // Funciones de drag & drop
  function iniciarArrastre(elemento: FieldSchema | PaletteItem, desdePaleta = false): void {
    let draggedElement: FieldSchema

    if ('icon' in elemento) {
      // Es un PaletteItem
      draggedElement = crearElementoDesdeItem(elemento, { x: 0, y: 0 })
    } else {
      // Es un FieldSchema
      draggedElement = elemento
    }

    dragContext.value = {
      isDragging: true,
      draggedElement,
      draggedFromPalette: desdePaleta
    }
  }

  function actualizarPosicionArrastre(posicion: Position): void {
    dragContext.value.dropPosition = posicion
  }

  function finalizarArrastre(posicion: Position, contenedorId?: string): void {
    if (dragContext.value.draggedElement) {
      if (dragContext.value.draggedFromPalette) {
        // Crear nuevo elemento
        const nuevoElemento = { ...dragContext.value.draggedElement }
        nuevoElemento.position = posicion
        agregarElemento(nuevoElemento, contenedorId)
      } else {
        // Mover elemento existente
        moverElemento(dragContext.value.draggedElement.id, posicion)
      }
    }

    dragContext.value = {
      isDragging: false,
      draggedFromPalette: false
    }
  }

  function cancelarArrastre(): void {
    dragContext.value = {
      isDragging: false,
      draggedFromPalette: false
    }
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
    crearElementoDesdeItem,
    agregarElemento,
    seleccionarElemento,
    deseleccionarElementos,
    eliminarElemento,
    duplicarElemento,
    moverElemento,
    redimensionarElemento,
    actualizarPropiedad,
    alternarGrilla,
    alternarSnapGrilla,
    cambiarTamanoGrilla,
    cambiarPagina,
    agregarPagina,
    eliminarPagina,
    cambiarModoVista,
    exportarJson,
    importarJson,
    limpiarFormulario,

    // Drag & Drop
    iniciarArrastre,
    actualizarPosicionArrastre,
    finalizarArrastre,
    cancelarArrastre,

    // Utilidades
    buscarElementoPorId,
    generarId
  }
})
