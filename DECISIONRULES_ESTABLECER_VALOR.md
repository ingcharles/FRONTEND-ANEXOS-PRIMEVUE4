# 🎯 DecisionRules: Establecer Valor

## Nueva Funcionalidad

Ahora puedes usar la acción **"Establecer Valor"** para asignar valores del resultado de DecisionRules a campos de tu formulario.

## Cómo Funciona

1. DecisionRules retorna un resultado JSON
2. Evalúas una condición sobre ese resultado
3. Si la condición es verdadera, asignas valores a campos del formulario

## Ejemplo 1: Resultado Simple

### Resultado de DecisionRules:
```json
{
  "total": 150,
  "descuento": 15,
  "mensaje": "Cliente VIP"
}
```

### Configuración:

**Condición del Resultado:**
```javascript
result.total > 100
```

**Acción:** Establecer Valor

**Campos a Asignar:**
| Campo del Formulario | Expresión del Valor |
|---------------------|---------------------|
| `campoTotal` | `result.total` |
| `campoDescuento` | `result.descuento` |
| `campoMensaje` | `result.mensaje` |

### Resultado:
Cuando la condición se cumpla, los campos se actualizarán:
- `campoTotal` = 150
- `campoDescuento` = 15
- `campoMensaje` = "Cliente VIP"

---

## Ejemplo 2: Resultado como Array

### Resultado de DecisionRules:
```json
[
  {
    "result": 20
  }
]
```

### Configuración:

**Condición del Resultado:**
```javascript
result[0].result === 20
```

**Acción:** Establecer Valor

**Campos a Asignar:**
| Campo del Formulario | Expresión del Valor |
|---------------------|---------------------|
| `campoResultado` | `result[0].result` |

### Resultado:
- `campoResultado` = 20

---

## Ejemplo 3: Cálculos con el Resultado

### Resultado de DecisionRules:
```json
{
  "precio": 100,
  "impuesto": 0.16
}
```

### Configuración:

**Condición del Resultado:**
```javascript
result.precio > 0
```

**Acción:** Establecer Valor

**Campos a Asignar:**
| Campo del Formulario | Expresión del Valor |
|---------------------|---------------------|
| `campoPrecio` | `result.precio` |
| `campoImpuesto` | `result.precio * result.impuesto` |
| `campoTotal` | `result.precio * (1 + result.impuesto)` |

### Resultado:
- `campoPrecio` = 100
- `campoImpuesto` = 16
- `campoTotal` = 116

---

## Ejemplo 4: Múltiples Valores de un Array

### Resultado de DecisionRules:
```json
{
  "items": [
    { "nombre": "Producto A", "precio": 50 },
    { "nombre": "Producto B", "precio": 75 }
  ],
  "total": 125
}
```

### Configuración:

**Condición del Resultado:**
```javascript
result.items.length > 0
```

**Acción:** Establecer Valor

**Campos a Asignar:**
| Campo del Formulario | Expresión del Valor |
|---------------------|---------------------|
| `campoProducto1` | `result.items[0].nombre` |
| `campoPrecio1` | `result.items[0].precio` |
| `campoProducto2` | `result.items[1].nombre` |
| `campoPrecio2` | `result.items[1].precio` |
| `campoTotal` | `result.total` |

---

## Ejemplo 5: Valores Condicionales

### Resultado de DecisionRules:
```json
{
  "aprobado": true,
  "monto": 5000,
  "tasa": 0.12
}
```

### Configuración:

**Condición del Resultado:**
```javascript
result.aprobado === true
```

**Acción:** Establecer Valor

**Campos a Asignar:**
| Campo del Formulario | Expresión del Valor |
|---------------------|---------------------|
| `campoEstado` | `result.aprobado ? 'Aprobado' : 'Rechazado'` |
| `campoMonto` | `result.monto` |
| `campoTasa` | `result.tasa * 100` |
| `campoCuota` | `result.monto * result.tasa / 12` |

### Resultado:
- `campoEstado` = "Aprobado"
- `campoMonto` = 5000
- `campoTasa` = 12
- `campoCuota` = 50

---

## Expresiones Comunes

### Acceder a Propiedades
```javascript
result.propiedad
result.objeto.propiedad
result.array[0]
result.array[0].propiedad
```

### Operaciones Matemáticas
```javascript
result.valor * 2
result.precio * (1 + result.impuesto)
result.total / result.cantidad
Math.round(result.valor * 100) / 100
```

### Operaciones de Texto
```javascript
result.texto.toUpperCase()
result.texto.toLowerCase()
result.nombre + ' ' + result.apellido
`${result.nombre} ${result.apellido}`
```

### Operaciones Condicionales
```javascript
result.valor > 100 ? 'Alto' : 'Bajo'
result.aprobado ? 'Sí' : 'No'
result.estado === 'activo' ? 1 : 0
```

### Operaciones con Arrays
```javascript
result.items.length
result.items[0]
result.items.map(i => i.precio).reduce((a, b) => a + b, 0)
result.items.filter(i => i.activo).length
```

---

## Caso de Uso Completo: Calculadora de Crédito

### Formulario:
- `campoMonto` (entrada): Monto solicitado
- `campoPlazo` (entrada): Plazo en meses
- `campoTasa` (salida): Tasa de interés
- `campoCuota` (salida): Cuota mensual
- `campoTotal` (salida): Total a pagar
- `campoEstado` (salida): Estado de la solicitud

### Regla en DecisionRules:
```
Inputs: monto, plazo
Outputs: tasa, cuota, total, estado
```

### Configuración:

**Campos de Entrada:**
- `campoMonto` → `monto`
- `campoPlazo` → `plazo`

**Condición del Resultado:**
```javascript
result.estado === 'aprobado'
```

**Acción:** Establecer Valor

**Campos a Asignar:**
| Campo | Expresión |
|-------|-----------|
| `campoTasa` | `result.tasa * 100` |
| `campoCuota` | `result.cuota` |
| `campoTotal` | `result.total` |
| `campoEstado` | `result.estado` |

### Flujo:
1. Usuario ingresa monto: 10000
2. Usuario ingresa plazo: 12
3. DecisionRules calcula y retorna:
   ```json
   {
     "tasa": 0.12,
     "cuota": 888.49,
     "total": 10661.88,
     "estado": "aprobado"
   }
   ```
4. Los campos se actualizan automáticamente:
   - `campoTasa` = 12
   - `campoCuota` = 888.49
   - `campoTotal` = 10661.88
   - `campoEstado` = "aprobado"

---

## Tips y Trucos

### 1. Valores por Defecto
```javascript
result.valor || 0
result.texto || 'N/A'
result.array?.[0] || null
```

### 2. Formateo de Números
```javascript
Math.round(result.valor * 100) / 100  // 2 decimales
result.valor.toFixed(2)  // String con 2 decimales
parseFloat(result.valor.toFixed(2))  // Número con 2 decimales
```

### 3. Formateo de Fechas
```javascript
new Date(result.fecha).toLocaleDateString()
new Date(result.fecha).toISOString()
```

### 4. Validación
```javascript
result.valor !== undefined ? result.valor : 0
typeof result.valor === 'number' ? result.valor : 0
```

---

## Debugging

Los logs mostrarán las asignaciones:

```
📝 [DecisionRules] Aplicando asignaciones de valores...
   📝 Asignando: campoTotal = 150
   📝 Asignando: campoDescuento = 15
   📝 Asignando: campoMensaje = "Cliente VIP"
```

Si hay un error:
```
❌ Error al asignar valor a campoTotal: ReferenceError: result is not defined
```

---

## Resumen

1. **Configura la regla** en DecisionRules.io
2. **Agrega campos de entrada** para enviar datos
3. **Escribe la condición** para evaluar el resultado
4. **Selecciona acción** "Establecer Valor"
5. **Agrega campos a asignar** con sus expresiones
6. **Prueba** en Vista Previa

¡Ahora puedes usar DecisionRules para calcular y asignar valores automáticamente! 🎉
