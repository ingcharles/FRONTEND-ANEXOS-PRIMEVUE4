// Tipos y esquema de formulario dinámico
import { z } from 'zod'

export type Breakpoint = 'sm' | 'md' | 'lg'

export interface GridCols { sm?: number; md?: number; lg?: number }

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'password'
  | 'number'
  | 'time'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'label'
  | 'panel'
  | 'table'
  | 'button'
  | 'divider'

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: unknown
  message?: string
}

export interface LogicRule {
  id: string
  whenFieldId: string
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'custom'
  value: unknown
  action: 'show' | 'hide' | 'require' | 'optional'
  expression?: string
}

export interface FieldSchema {
  id: string
  type: FieldType
  label?: string
  name?: string
  placeholder?: string
  defaultValue?: unknown
  grid?: GridCols
  minWidth?: number
  maxWidth?: number
  required?: boolean
  visible?: boolean
  disabled?: boolean
  readonly?: boolean
  validations?: ValidationRule[]
  logic?: LogicRule[]
  children?: FieldSchema[]
  meta?: Record<string, unknown>
}

export interface PageSchema {
  id: string
  title?: string
  fields: FieldSchema[]
}

export interface FormSchema {
  id: string
  name: string
  pages: PageSchema[]
  settings?: { gridSnap: boolean; columns: number }
}

// Zod schemas para validar serialización
export const zValidationRule = z.object({
  type: z.enum(['required', 'minLength', 'maxLength', 'pattern', 'custom']),
  value: z.unknown().optional(),
  message: z.string().optional(),
})

export const zLogicRule = z.object({
  id: z.string(),
  whenFieldId: z.string(),
  operator: z.enum(['equals', 'not_equals', 'contains', 'gt', 'lt', 'custom']),
  value: z.unknown(),
  action: z.enum(['show', 'hide', 'require', 'optional']),
  expression: z.string().optional(),
})

export const zFieldSchema: z.ZodType<FieldSchema> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.enum([
      'text',
      'textarea',
      'email',
      'password',
      'number',
      'time',
      'select',
      'radio',
      'checkbox',
      'label',
      'panel',
      'table',
      'button',
      'divider',
    ]),
    label: z.string().optional(),
    name: z.string().optional(),
    placeholder: z.string().optional(),
    defaultValue: z.any().optional(),
    grid: z.object({ sm: z.number().optional(), md: z.number().optional(), lg: z.number().optional() }).optional(),
    minWidth: z.number().optional(),
    maxWidth: z.number().optional(),
    required: z.boolean().optional(),
    visible: z.boolean().optional(),
  disabled: z.boolean().optional(),
  readonly: z.boolean().optional(),
    validations: z.array(zValidationRule).optional(),
    logic: z.array(zLogicRule).optional(),
    children: z.array(z.lazy(() => zFieldSchema)).optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
)

export const zPageSchema: z.ZodType<PageSchema> = z.object({
  id: z.string(),
  title: z.string().optional(),
  fields: z.array(zFieldSchema),
})

export const zFormSchema: z.ZodType<FormSchema> = z.object({
  id: z.string(),
  name: z.string(),
  pages: z.array(zPageSchema),
  settings: z
    .object({
      gridSnap: z.boolean(),
      columns: z.number(),
    })
    .optional(),
})

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }
