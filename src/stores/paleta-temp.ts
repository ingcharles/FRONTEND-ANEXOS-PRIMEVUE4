// Paleta de componentes corregida
export const paletteItemsCorregida = [
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
]
