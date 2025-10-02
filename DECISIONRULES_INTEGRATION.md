# Integración con DecisionRules.io

Esta documentación explica cómo usar la integración de DecisionRules.io en el diseñador de formularios.

## Instalación

El paquete `@decisionrules/decisionrules` ya está instalado en el proyecto.

## Configuración

### 1. Configurar API Key

Hay dos formas de configurar la API Key:

#### Opción A: Desde el diseñador (Recomendado)

1. Abre el diseñador de formularios
2. Selecciona un campo
3. Ve a la pestaña "Lógica"
4. Haz clic en "DecisionRules"
5. Expande "Configuración DecisionRules"
6. Ingresa tu API Key y URL base (opcional)
7. Haz clic en "Guardar Configuración"

#### Opción B: Programáticamente

```typescript
import { usarDecisionRules } from '@/composables/usarDecisionRules'

const decisionRules = usarDecisionRules()
decisionRules.configurar('tu-api-key-aqui', 'https://api.decisionrules.io')
```

### 2. Crear una regla en DecisionRules.io

1. Ve a [DecisionRules.io](https://app.decisionrules.io)
2. Crea una nueva regla de decisión
3. Define las entradas (inputs) y salidas (outputs)
4. Copia el ID de la regla (formato: `c67df234-c939-6b6b-16fc-dcb9543c8c1b`)

## Uso en el Diseñador

### Ejemplo 1: Mostrar campo basado en edad

**Escenario**: Mostrar un campo "Tutor Legal" solo si la edad es menor a 18 años.

**Configuración en DecisionRules.io**:
- Input: `edad` (número)
- Output: `mostrarTutor` (booleano)
- Regla: Si `edad < 18` entonces `mostrarTutor = true`

**Configuración en el diseñador**:

1. Selecciona el campo "Tutor Legal"
2. Ve a Lógica → DecisionRules
3. Añade una nueva regla:
   - **ID de Regla**: `c67df234-c939-6b6b-16fc-dcb9543c8c1b`
   - **Versión**: `1`
   - **Acción**: `Mostrar`
   - **Campos de Entrada**:
     - Campo del Formulario: `edad`
     - Clave en DecisionRules: `edad`
   - **Condición del Resultado**: `result.mostrarTutor === true`

### Ejemplo 2: Validación de descuento

**Escenario**: Aplicar descuento solo si el cliente es VIP y la compra supera $100.

**Configuración en DecisionRules.io**:
- Inputs: `tipoCliente` (texto), `montoCompra` (número)
- Output: `aplicarDescuento` (booleano), `porcentajeDescuento` (número)
- Regla: Si `tipoCliente === 'VIP' && montoCompra > 100` entonces `aplicarDescuento = true, porcentajeDescuento = 15`

**Configuración en el diseñador**:

1. Selecciona el campo "Descuento"
2. Ve a Lógica → DecisionRules
3. Añade una nueva regla:
   - **ID de Regla**: `abc123...`
   - **Versión**: `1`
   - **Acción**: `Mostrar`
   - **Campos de Entrada**:
     - Campo: `tipoCliente` → Clave: `tipoCliente`
     - Campo: `montoCompra` → Clave: `montoCompra`
   - **Condición del Resultado**: `result.aplicarDescuento === true`

### Ejemplo 3: Lógica compleja de aprobación

**Escenario**: Requerir aprobación de gerente basado en múltiples factores.

**Configuración en DecisionRules.io**:
- Inputs: `monto`, `departamento`, `antiguedad`, `historialCredito`
- Output: `requiereAprobacion` (booleano), `nivelAprobacion` (texto)

**Configuración en el diseñador**:

```typescript
// Campos de Entrada:
[
  { nombreCampo: 'monto', claveDecisionRules: 'monto' },
  { nombreCampo: 'departamento', claveDecisionRules: 'departamento' },
  { nombreCampo: 'antiguedad', claveDecisionRules: 'antiguedad' },
  { nombreCampo: 'historialCredito', claveDecisionRules: 'historialCredito' }
]

// Condición del Resultado:
result.requiereAprobacion === true && result.nivelAprobacion === 'gerente'
```

## Estructura de Datos

### ReglaLogica con DecisionRules

```typescript
interface ReglaLogica {
  id: string
  tipo: 'decisionrules'
  campoCondicionId: string // No usado en DecisionRules
  operador: 'personalizado'
  valor: string | number | boolean | Date
  accion: 'mostrar' | 'ocultar' | 'requerir' | 'opcional'
  
  // Propiedades específicas de DecisionRules
  decisionRulesId: string // ID de la regla en DecisionRules.io
  decisionRulesVersion: number // Versión de la regla
  camposEntrada: Array<{
    nombreCampo: string // Nombre del campo en el formulario
    claveDecisionRules: string // Clave esperada por DecisionRules
  }>
  condicionResultado: string // Expresión JavaScript para evaluar el resultado
}
```

## API del Servicio

### ServicioDecisionRules

```typescript
import { ServicioDecisionRules } from '@/servicios/ServicioDecisionRules'

const servicio = new ServicioDecisionRules({
  apiKey: 'tu-api-key',
  urlBase: 'https://api.decisionrules.io' // Opcional
})

// Evaluar una regla
const resultado = await servicio.evaluarRegla(regla, valoresFormulario)

// Evaluar múltiples reglas
const resultados = await servicio.evaluarMultiplesReglas(reglas, valoresFormulario)
```

## Expresiones de Condición

Las expresiones de condición se evalúan con JavaScript. La variable `result` contiene la respuesta de DecisionRules.

### Ejemplos de expresiones:

```javascript
// Verificar un booleano
result.aprobado === true

// Verificar un valor numérico
result.puntuacion > 75

// Verificar un texto
result.estado === 'aprobado'

// Condiciones múltiples
result.aprobado === true && result.nivel === 'alto'

// Verificar existencia
result.descuento !== undefined && result.descuento > 0

// Operaciones complejas
result.total > 1000 || (result.cliente === 'VIP' && result.antiguedad > 5)
```

## Ejemplo Completo

```typescript
// 1. Configurar el servicio (una vez al inicio de la aplicación)
import { usarDecisionRules } from '@/composables/usarDecisionRules'

const decisionRules = usarDecisionRules()
decisionRules.configurar('kq8fJHpPY0sDxDAn4XAp_tjMThiPjy4xh6RiKeViuFBDIXkW8PlFcFa-mg5B2bwM')

// 2. Crear una regla en el diseñador
const regla: ReglaLogica = {
  id: 'dr-logic-001',
  tipo: 'decisionrules',
  campoCondicionId: '',
  operador: 'personalizado',
  valor: '',
  accion: 'mostrar',
  decisionRulesId: 'c67df234-c939-6b6b-16fc-dcb9543c8c1b',
  decisionRulesVersion: 1,
  camposEntrada: [
    { nombreCampo: 'edad', claveDecisionRules: 'value1' },
    { nombreCampo: 'ingresos', claveDecisionRules: 'value2' }
  ],
  condicionResultado: 'result.elegible === true'
}

// 3. La regla se evaluará automáticamente cuando cambien los valores del formulario
```

## Debugging

Para ver los logs de DecisionRules en la consola:

```javascript
// En la consola del navegador
localStorage.setItem('debug', 'decisionrules:*')
```

## Limitaciones

1. Las reglas de DecisionRules se evalúan de forma asíncrona
2. En el renderizador de campos, solo se evalúan reglas simples de forma síncrona
3. Para evaluación completa con DecisionRules, usa el modo de vista previa
4. La API Key se guarda en localStorage (considera usar un método más seguro en producción)

## Mejores Prácticas

1. **Nombra tus reglas claramente**: Usa nombres descriptivos para identificar fácilmente qué hace cada regla
2. **Versiona tus reglas**: Usa versiones en DecisionRules para mantener compatibilidad
3. **Documenta las condiciones**: Agrega comentarios en las expresiones complejas
4. **Prueba en vista previa**: Siempre prueba tus reglas en la vista previa antes de publicar
5. **Maneja errores**: Las reglas que fallen retornarán `false` por defecto
6. **Optimiza llamadas**: Agrupa campos relacionados en una sola regla cuando sea posible

## Soporte

Para más información sobre DecisionRules.io:
- [Documentación oficial](https://docs.decisionrules.io)
- [API Reference](https://docs.decisionrules.io/api-reference)
- [Ejemplos](https://docs.decisionrules.io/examples)
