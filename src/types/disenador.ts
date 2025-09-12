// Tipos base para el diseñador de formularios
export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'date'
  | 'time'
  | 'datetime'
  | 'button'
  | 'submit'
  | 'reset'
  | 'divider'
  | 'html'
  | 'spacer'
  | 'label'
  | 'panel'
  | 'table'

export type ResponsiveSize = 'sm' | 'md' | 'lg'

export interface ResponsiveConfig {
  sm: number // 1-12 columnas
  md: number // 1-12 columnas
  lg: number // 1-12 columnas
}

export interface Position {
  x: number
  y: number
  z?: number
}

export interface Size {
  width: number
  height: number
}

export interface ValidationRule {
  id: string
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: string | number
  message: string
  expression?: string // Para validaciones custom
}

export interface LogicRule {
  id: string
  type: 'visibleSi' | 'requeridoSi' | 'custom'
  condition: {
    fieldId: string
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith'
    value: string | number | boolean
  }
  expression?: string // Para reglas custom
}

export interface ComboOption {
  label: string
  value: string | number | boolean
}

export interface ComboApiConfig {
  url: string
  labelPath: string
  valuePath: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
}

export interface TableColumn {
  id: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select'
  editable: boolean
  options?: ComboOption[] // Para columnas tipo select
  width?: number
}

export interface FieldSchema {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  visible: boolean
  disabled: boolean
  readonly: boolean

  // Posicionamiento y tamaño
  position: Position
  size: Size
  responsive: ResponsiveConfig
  minWidth?: number
  maxWidth?: number

  // Valor por defecto
  defaultValue?: string | number | boolean | string[] | number[]
  value?: string | number | boolean | string[] | number[]

  // Configuración específica por tipo
  rows?: number // Para TextArea
  options?: ComboOption[] // Para ComboBox, RadioGroup
  apiConfig?: ComboApiConfig // Para ComboBox con API

  // Para Table
  columns?: TableColumn[]
  defaultRows?: Record<string, string | number | boolean>[]
  allowAddRows?: boolean
  allowDeleteRows?: boolean

  // Para Panel (contenedor)
  children?: FieldSchema[]
  nestingLevel?: number // 1, 2, 3...

  // Validaciones y lógica
  validations: ValidationRule[]
  logic: LogicRule[]

  // Texto de ayuda
  helpText?: string

  // Propiedades específicas por tipo de campo
  properties?: {
    // Para textarea
    rows?: number

    // Para radio e inline
    inline?: boolean

    // Para archivos
    multiple?: boolean
    accept?: string
    maxFileSize?: number

    // Para separadores
    orientation?: 'horizontal' | 'vertical'

    // Para contenido HTML
    content?: string

    // Para espaciadores
    height?: number

    // Para botones
    severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger'

    // Clase CSS personalizada
    customClass?: string
  }

  // Metadatos del diseñador
  selected?: boolean
  dragging?: boolean
  resizing?: boolean

  // Configuración de estilo
  cssClasses?: string[]
  customStyles?: Record<string, string>
}

export interface FormPage {
  id: string
  title: string
  fields: FieldSchema[]
  order: number
}

export interface FormSchema {
  id: string
  title: string
  description?: string
  version: string
  pages: FormPage[]
  settings: {
    showGrid: boolean
    gridSize: number
    snapToGrid: boolean
    responsive: boolean
    theme?: string
  }
  metadata: {
    createdAt: Date
    updatedAt: Date
    createdBy?: string
  }
}

export interface DragContext {
  isDragging: boolean
  draggedElement?: FieldSchema
  draggedFromPalette: boolean
  dropPosition?: Position
  dropTarget?: string // ID del contenedor destino
}

export interface ResizeContext {
  isResizing: boolean
  resizedElement?: FieldSchema
  initialSize: Size
  initialPosition: Position
  resizeHandle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null
}

export interface SelectionContext {
  selectedElementId?: string
  selectedElement?: FieldSchema
  multiSelection: string[]
}

// Eventos del diseñador
export interface DesignerEvents {
  elementSelected: (element: FieldSchema) => void
  elementDeselected: () => void
  elementAdded: (element: FieldSchema) => void
  elementRemoved: (elementId: string) => void
  elementDuplicated: (element: FieldSchema) => void
  elementMoved: (elementId: string, newPosition: Position) => void
  elementResized: (elementId: string, newSize: Size) => void
  propertyChanged: (elementId: string, property: string, value: string | number | boolean) => void
}

// Configuración de la paleta de componentes
export interface PaletteItem {
  type: FieldType
  label: string
  icon: string
  category: 'input' | 'display' | 'layout' | 'action'
  defaultProps: Partial<FieldSchema>
}

// Estados de validación
export interface ValidationResult {
  fieldId: string
  isValid: boolean
  errors: string[]
}

export interface FormValidationResult {
  isValid: boolean
  fieldResults: ValidationResult[]
  globalErrors: string[]
}

// Contexto de la aplicación del diseñador
export interface DesignerContext {
  currentForm: FormSchema
  currentPageIndex: number
  dragContext: DragContext
  resizeContext: ResizeContext
  selectionContext: SelectionContext
  previewMode: boolean
  jsonMode: boolean
}
