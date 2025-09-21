import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDesignerStore } from '@/stores/useDesignerStore'
import { generarId } from '@/utils/id'

describe('Checkbox - Opciones por defecto', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Debería crear checkbox con 2 opciones por defecto al arrastrarlo desde la paleta', () => {
    const store = useDesignerStore()

    // Simular el checkbox tal como se crea desde PalettePanel
    const checkboxElement = {
      id: generarId('field'),
      type: 'checkbox' as const,
      label: 'Checkbox',
      name: 'checkbox_test',
      grid: { sm: 12, md: 6, lg: 6 },
      visible: true,
      required: false,
      meta: {
        valorPorDefecto: false,
        options: [
          { label: 'Opción 1', value: 'opcion1' },
          { label: 'Opción 2', value: 'opcion2' },
        ],
      },
    }

    // Agregar campo al store
    const fieldId = store.agregarCampo(checkboxElement)

    // Seleccionar el campo para poder acceder a él
    store.seleccionarCampo(fieldId)
    const campo = store.campoSeleccionado

    // Verificar que tiene las opciones por defecto
    expect(campo).toBeTruthy()
    expect(campo?.type).toBe('checkbox')
    expect(campo?.meta?.options).toHaveLength(2)
    expect(campo?.meta?.options?.[0]).toEqual({ label: 'Opción 1', value: 'opcion1' })
    expect(campo?.meta?.options?.[1]).toEqual({ label: 'Opción 2', value: 'opcion2' })
    expect(campo?.meta?.valorPorDefecto).toBe(false)
  })

  it('Debería mantener opciones por defecto consistentes con select y radio', () => {
    const store = useDesignerStore()

    // Crear todos los tipos con opciones
    const selectElement = {
      id: generarId('field'),
      type: 'select' as const,
      label: 'Select',
      name: 'select_test',
      grid: { sm: 12, md: 6, lg: 6 },
      visible: true,
      required: false,
      meta: {
        options: [
          { label: 'Opción 1', value: 'opcion1' },
          { label: 'Opción 2', value: 'opcion2' },
        ],
      },
    }

    const radioElement = {
      id: generarId('field'),
      type: 'radio' as const,
      label: 'Radio',
      name: 'radio_test',
      grid: { sm: 12, md: 6, lg: 6 },
      visible: true,
      required: false,
      meta: {
        options: [
          { label: 'Opción 1', value: 'opcion1' },
          { label: 'Opción 2', value: 'opcion2' },
        ],
      },
    }

    const checkboxElement = {
      id: generarId('field'),
      type: 'checkbox' as const,
      label: 'Checkbox',
      name: 'checkbox_test',
      grid: { sm: 12, md: 6, lg: 6 },
      visible: true,
      required: false,
      meta: {
        valorPorDefecto: false,
        options: [
          { label: 'Opción 1', value: 'opcion1' },
          { label: 'Opción 2', value: 'opcion2' },
        ],
      },
    }

    // Agregar todos los campos
    const selectId = store.agregarCampo(selectElement)
    const radioId = store.agregarCampo(radioElement)
    const checkboxId = store.agregarCampo(checkboxElement)

    // Verificar cada campo seleccionándolo
    store.seleccionarCampo(selectId)
    const selectCampo = store.campoSeleccionado

    store.seleccionarCampo(radioId)
    const radioCampo = store.campoSeleccionado

    store.seleccionarCampo(checkboxId)
    const checkboxCampo = store.campoSeleccionado

    // Verificar que todos tienen las mismas opciones por defecto
    const expectedOptions = [
      { label: 'Opción 1', value: 'opcion1' },
      { label: 'Opción 2', value: 'opcion2' },
    ]

    expect(selectCampo?.meta?.options).toEqual(expectedOptions)
    expect(radioCampo?.meta?.options).toEqual(expectedOptions)
    expect(checkboxCampo?.meta?.options).toEqual(expectedOptions)
  })

  it('Debería permitir modificar las opciones después de crear el checkbox', () => {
    const store = useDesignerStore()

    // Crear checkbox con opciones por defecto
    const checkboxElement = {
      id: generarId('field'),
      type: 'checkbox' as const,
      label: 'Checkbox',
      name: 'checkbox_test',
      grid: { sm: 12, md: 6, lg: 6 },
      visible: true,
      required: false,
      meta: {
        valorPorDefecto: false,
        options: [
          { label: 'Opción 1', value: 'opcion1' },
          { label: 'Opción 2', value: 'opcion2' },
        ],
      },
    }

    const fieldId = store.agregarCampo(checkboxElement)

    // Modificar las opciones
    const nuevasOpciones = [
      { label: 'Sí', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Tal vez', value: 'maybe' },
    ]

    store.actualizarCampo(fieldId, {
      meta: {
        ...checkboxElement.meta,
        options: nuevasOpciones,
      },
    })

    // Seleccionar y verificar el campo actualizado
    store.seleccionarCampo(fieldId)
    const campoActualizado = store.campoSeleccionado

    expect(campoActualizado?.meta?.options).toEqual(nuevasOpciones)
    expect(campoActualizado?.meta?.options).toHaveLength(3)
  })
})
