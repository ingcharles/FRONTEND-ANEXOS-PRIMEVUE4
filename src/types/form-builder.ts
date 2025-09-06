// Tipos para el constructor de formularios

export type ComponentType = 'text' | 'combobox' | 'panel' | 'table' | 'label' | 'button' | 'checkbox' | 'radio' | 'textarea' | 'number' | 'date' | 'email' | 'password' | 'page';

export interface BaseComponent {
  id: string;
  type: ComponentType;
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  visible?: boolean;
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  margin?: string;
  padding?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  parentId?: string;
  children?: FormComponent[];
}

export interface TextComponent extends BaseComponent {
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea';
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  value?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
}

export interface ComboboxComponent extends BaseComponent {
  type: 'combobox';
  options: Array<{
    label: string;
    value: string;
    disabled?: boolean;
  }>;
  multiple?: boolean;
  searchable?: boolean;
  value?: string | string[];
}

export interface PanelComponent extends BaseComponent {
  type: 'panel';
  title?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  children: FormComponent[];
}

export interface TableComponent extends BaseComponent {
  type: 'table';
  columns: Array<{
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
    width?: string;
    required?: boolean;
    options?: Array<{ label: string; value: string }>;
  }>;
  rows: Array<{
    id: string;
    data: Record<string, any>;
  }>;
  allowAddRows?: boolean;
  allowDeleteRows?: boolean;
  allowEditRows?: boolean;
  minRows?: number;
  maxRows?: number;
}

export interface LabelComponent extends BaseComponent {
  type: 'label';
  text: string;
  htmlFor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface ButtonComponent extends BaseComponent {
  type: 'button';
  buttonType: 'button' | 'submit' | 'reset';
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  size: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
}

export interface PageComponent extends BaseComponent {
  type: 'page';
  title: string;
  description?: string;
  layout: 'tabs' | 'single' | 'accordion';
  showNavigation?: boolean;
  nextButtonText?: string;
  previousButtonText?: string;
  children: FormComponent[];
}

export type FormComponent = 
  | TextComponent 
  | ComboboxComponent 
  | PanelComponent 
  | TableComponent 
  | LabelComponent 
  | ButtonComponent
  | PageComponent;

export interface FormLogic {
  id: string;
  componentId: string;
  condition: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
    value: any;
  };
  action: {
    type: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'unrequire';
    target?: string;
  };
}

export interface FormValidation {
  id: string;
  componentId: string;
  type: 'required' | 'email' | 'url' | 'min_length' | 'max_length' | 'min_value' | 'max_value' | 'pattern' | 'custom';
  message: string;
  value?: any;
  customFunction?: string;
}

export interface FormBuilderState {
  components: FormComponent[];
  selectedComponent: FormComponent | null;
  activeTab: 'designer' | 'preview' | 'json';
  rightPanelTab: 'attributes' | 'logic' | 'validations';
  formLogic: FormLogic[];
  formValidations: FormValidation[];
  isDragging: boolean;
  dragOverComponent: string | null;
}

export interface ComponentPaletteItem {
  type: ComponentType;
  label: string;
  icon: string;
  description: string;
  category: 'input' | 'layout' | 'display' | 'action';
}

export interface DragData {
  componentType: ComponentType;
  source: 'palette' | 'designer';
  componentId?: string;
}

export interface ResizeHandle {
  position: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
  cursor: string;
}
