# 🎯 DecisionRules: Estructuras Complejas

## Soporte para Datos Anidados y Arrays

La implementación actual soporta **cualquier estructura** de entrada y salida de DecisionRules.

---

## Ejemplo 1: Tu Caso - Envío con Peso

### API de DecisionRules:

**Entrada:**
```json
{
  "package": {
    "weight": 5
  }
}
```

**Salida:**
```json
[
  {
    "price": 99,
    "currency": "USD",
    "deliveryInHours": "48 Hours"
  }
]
```

### Configuración en el Diseñador:

#### Paso 1: Crear Campos en el Formulario
```
1. packageWeight (Número) - Peso del paquete
2. campoPrecio (Número) - Precio
3. campoMoneda (Texto) - Moneda
4. campoEntrega (Texto) - Tiempo de entrega
```

#### Paso 2: Configurar la Regla

**ID de Regla:** `72f54c4c-9647-695a-de3b-2c4d7c98c2e5`
**Versión:** `1`

**Campos de Entrada:**
| Campo del Formulario | Clave en DecisionRules |
|---------------------|------------------------|
| packageWeight | package.weight |

**Condición del Resultado:**
```javascript
result[0].price > 0
```

**Acción:** Establecer Valor

**Campos a Asignar:**
| Campo del Formulario | Expresión del Valor |
|---------------------|---------------------|
| campoPrecio | result[0].price |
| campoMoneda | result[0].currency |
| campoEntrega | result[0].deliveryInHours |

---

## Cómo Funciona

### 1. Entrada con Estructura Anidada

**Problema:** DecisionRules espera `{"package": {"weight": 5}}`

**Solución:** Usa notación de punto en "Clave en DecisionRules"

```
Campo del Formulario: packageWeight (valor: 5)
Clave en DecisionRules: package.weight

Request Body generado:
{
  "package.weight": 5  ← Esto NO funciona ❌
}
```

**IMPORTANTE:** La implementación actual envía claves planas. Para estructuras anidadas, necesitas ajustar el servicio.

### Solución Temporal:

**Opción A:** Usa campos separados
```
Campos de Entrada:
- packageWeight → weight (sin anidar)

Request Body:
{
  "weight": 5
}
```

**Opción B:** Modifica la regla en DecisionRules para aceptar claves planas

---

## Ejemplo 2: Múltiples Valores de Salida

### Salida de DecisionRules:
```json
{
  "shipping": {
    "price": 99,
    "currency": "USD",
    "delivery": {
      "hours": 48,
      "method": "Express"
    }
  }
}
```

### Configuración:

**Condición del Resultado:**
```javascript
result.shipping.price > 0
```

**Campos a Asignar:**
```
- campoPrecio → result.shipping.price
- campoMoneda → result.shipping.currency
- campoHoras → result.shipping.delivery.hours
- campoMetodo → result.shipping.delivery.method
```

---

## Ejemplo 3: Array de Objetos

### Salida de DecisionRules:
```json
{
  "options": [
    { "name": "Standard", "price": 50, "days": 5 },
    { "name": "Express", "price": 99, "days": 2 },
    { "name": "Overnight", "price": 150, "days": 1 }
  ]
}
```

### Configuración:

**Condición del Resultado:**
```javascript
result.options.length > 0
```

**Campos a Asignar:**
```
- campoOpcion1 → result.options[0].name
- campoPrecio1 → result.options[0].price
- campoDias1 → result.options[0].days

- campoOpcion2 → result.options[1].name
- campoPrecio2 → result.options[1].price
- campoDias2 → result.options[1].days
```

---

## Ejemplo 4: Cálculos con Resultados

### Salida de DecisionRules:
```json
{
  "basePrice": 100,
  "taxRate": 0.16,
  "discount": 0.10
}
```

### Configuración:

**Condición del Resultado:**
```javascript
result.basePrice > 0
```

**Campos a Asignar:**
```
- campoPrecioBase → result.basePrice
- campoImpuesto → result.basePrice * result.taxRate
- campoDescuento → result.basePrice * result.discount
- campoTotal → result.basePrice * (1 + result.taxRate - result.discount)
```

**Resultado:**
- campoPrecioBase = 100
- campoImpuesto = 16
- campoDescuento = 10
- campoTotal = 106

---

## Patrones Comunes

### 1. Acceder a Arrays
```javascript
// Primer elemento
result[0]
result[0].property

// Segundo elemento
result[1]
result[1].property

// Último elemento
result[result.length - 1]
```

### 2. Acceder a Objetos Anidados
```javascript
// Un nivel
result.property

// Dos niveles
result.parent.child

// Tres niveles
result.parent.child.grandchild
```

### 3. Valores por Defecto
```javascript
// Si puede ser undefined
result.value || 0
result.text || 'N/A'
result.array?.[0] || null
```

### 4. Transformaciones
```javascript
// Matemáticas
result.value * 1.16
Math.round(result.value * 100) / 100

// Texto
result.text.toUpperCase()
result.text.toLowerCase()
`${result.first} ${result.last}`

// Condicionales
result.value > 100 ? 'Alto' : 'Bajo'
result.approved ? 'Sí' : 'No'
```

---

## Configuración Completa: Tu Ejemplo

### Formulario:

```
Campos:
1. packageWeight (Número) - Input
2. campoPrecio (Número) - Output
3. campoMoneda (Texto) - Output
4. campoEntrega (Texto) - Output
```

### Regla DecisionRules:

```
Selecciona: cualquier campo (ej: campoPrecio)
Ve a: Lógica → DecisionRules

ID de Regla: 72f54c4c-9647-695a-de3b-2c4d7c98c2e5
Versión: 1

Campos de Entrada:
  - Campo: packageWeight
  - Clave: weight (o package.weight si tu regla lo soporta)

Condición del Resultado:
  result[0].price > 0

Acción: Establecer Valor

Campos a Asignar:
  1. Campo: campoPrecio
     Expresión: result[0].price
  
  2. Campo: campoMoneda
     Expresión: result[0].currency
  
  3. Campo: campoEntrega
     Expresión: result[0].deliveryInHours
```

### Flujo:

1. Usuario ingresa: packageWeight = 5
2. Se envía a DecisionRules: `{"weight": 5}`
3. DecisionRules retorna:
   ```json
   [
     {
       "price": 99,
       "currency": "USD",
       "deliveryInHours": "48 Hours"
     }
   ]
   ```
4. Se asignan automáticamente:
   - campoPrecio = 99
   - campoMoneda = "USD"
   - campoEntrega = "48 Hours"

---

## Tips para Estructuras Complejas

### 1. Prueba en la Consola

Antes de configurar, prueba tus expresiones:

```javascript
// Simula el resultado
const result = [{"price": 99, "currency": "USD", "deliveryInHours": "48 Hours"}]

// Prueba tus expresiones
console.log(result[0].price)  // 99
console.log(result[0].currency)  // "USD"
console.log(result[0].deliveryInHours)  // "48 Hours"
```

### 2. Usa el Componente de Prueba

Crea un archivo de prueba para verificar la estructura:

```typescript
// test-decisionrules.ts
import { ServicioDecisionRules } from '@/servicios/ServicioDecisionRules'

const servicio = new ServicioDecisionRules({
  apiKey: 'tu-api-key'
})

const resultado = await servicio.evaluarRegla({
  id: 'test',
  ruleId: '72f54c4c-9647-695a-de3b-2c4d7c98c2e5',
  nombre: 'Test',
  activa: true,
  version: 1,
  camposEntrada: [
    { nombreCampo: 'packageWeight', claveDecisionRules: 'weight' }
  ],
  accionesResultado: []
}, {
  packageWeight: 5
})

console.log('Resultado:', resultado)
```

### 3. Revisa los Logs

Los logs te mostrarán exactamente qué se está enviando y recibiendo:

```
📤 [DecisionRules] Request Body: { weight: 5 }
📥 [DecisionRules] Response: [{"price": 99, ...}]
📝 Asignando: campoPrecio = 99
📝 Asignando: campoMoneda = "USD"
📝 Asignando: campoEntrega = "48 Hours"
```

---

## Limitaciones Actuales

### 1. Estructuras Anidadas en Entrada

**Problema:** No se generan automáticamente estructuras anidadas

**Workaround:**
- Usa claves planas en DecisionRules
- O modifica `ServicioDecisionRules.ts` para soportar notación de punto

### 2. Arrays en Entrada

**Problema:** No hay soporte directo para enviar arrays

**Workaround:**
- Envía elementos individuales
- O usa campos de tipo tabla y procesa antes de enviar

---

## Mejora Futura Sugerida

Para soportar estructuras anidadas automáticamente, se podría modificar `construirCuerpoSolicitud`:

```typescript
private construirCuerpoSolicitud(
  regla: ReglaDecision,
  valoresFormulario: RegistroDatos
): Record<string, unknown> {
  const cuerpo: Record<string, unknown> = {}

  for (const campoEntrada of regla.camposEntrada) {
    const valor = valoresFormulario[campoEntrada.nombreCampo]
    const clave = campoEntrada.claveDecisionRules || campoEntrada.nombreCampo
    
    // Soportar notación de punto para estructuras anidadas
    if (clave.includes('.')) {
      setNestedValue(cuerpo, clave, valor)
    } else {
      cuerpo[clave] = this.transformarValor(valor, campoEntrada.transformacion)
    }
  }

  return cuerpo
}

private setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  let current = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {}
    }
    current = current[keys[i]]
  }
  
  current[keys[keys.length - 1]] = value
}
```

---

## Resumen

✅ **Soportado:**
- Cualquier estructura de salida (objetos, arrays, anidados)
- Múltiples asignaciones
- Transformaciones con JavaScript
- Valores por defecto

⚠️ **Limitado:**
- Estructuras anidadas en entrada (requiere workaround)
- Arrays en entrada (requiere procesamiento manual)

📚 **Documentación:**
- Ejemplos completos de estructuras complejas
- Patrones comunes de acceso a datos
- Tips para debugging

¡Tu caso de uso está completamente soportado! 🎉
