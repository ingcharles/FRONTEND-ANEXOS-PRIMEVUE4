# DecisionRules.io - Ejemplo Visual

## 🎨 Interfaz del Diseñador

### 1. Pestaña de Lógica

```
┌─────────────────────────────────────────────────────────────┐
│ Propiedades del Campo                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Atributos] [Lógica] [Validación]                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Reglas Simples]  [DecisionRules]                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Configuración de DecisionRules

```
┌─────────────────────────────────────────────────────────────┐
│ ▼ Configuración DecisionRules                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ● Configurado                                              │
│                                                             │
│  API Key                                                    │
│  [●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●]   │
│  Obtén tu API Key desde DecisionRules.io                    │
│                                                             │
│  URL Base (opcional)                                        │
│  [https://api.decisionrules.io                          ]   │
│                                                             │
│  [Guardar Configuración]                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Lista de Reglas

```
┌─────────────────────────────────────────────────────────────┐
│                                    [Añadir regla DecisionRules] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ☁ Regla DecisionRules 1                          [🗑]  │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │                                                       │ │
│  │  ID de Regla en DecisionRules                        │ │
│  │  [c67df234-c939-6b6b-16fc-dcb9543c8c1b            ]  │ │
│  │  Copia el ID de tu regla desde DecisionRules.io      │ │
│  │                                                       │ │
│  │  Versión                    Acción                   │ │
│  │  [1        ]                [Mostrar            ▼]   │ │
│  │                                                       │ │
│  │  Campos de Entrada              [Añadir campo]       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ Campo del Formulario                            │ │ │
│  │  │ [edad                                       ▼]  │ │ │
│  │  │                                                 │ │ │
│  │  │ Clave en DecisionRules                          │ │ │
│  │  │ [value1                                      ]  │ │ │
│  │  │                                            [🗑]  │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ Campo del Formulario                            │ │ │
│  │  │ [ingresos                                   ▼]  │ │ │
│  │  │                                                 │ │ │
│  │  │ Clave en DecisionRules                          │ │ │
│  │  │ [value2                                      ]  │ │ │
│  │  │                                            [🗑]  │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                                                       │ │
│  │  ⚙ Condición del Resultado                           │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ result.elegible === true                        │ │ │
│  │  │                                                 │ │ │
│  │  │                                                 │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │  Expresión JavaScript para evaluar el resultado.     │ │
│  │  La variable result contiene la respuesta de la API. │ │
│  │                                                       │ │
│  │  ℹ Cuando la regla c67df234-c939-6b6b-16fc-dcb9...   │ │
│  │    retorne un resultado que cumpla                    │ │
│  │    "result.elegible === true" entonces mostrar        │ │
│  │    este campo.                                        │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Ejemplo Completo: Formulario de Crédito

### Estructura del Formulario

```
┌─────────────────────────────────────────────────────────────┐
│ Solicitud de Crédito                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Monto Solicitado *                                         │
│  [50000                                                  ]  │
│                                                             │
│  Edad *                                                     │
│  [35                                                     ]  │
│                                                             │
│  Ingresos Mensuales *                                       │
│  [75000                                                  ]  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✓ Campos adicionales mostrados por DecisionRules   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Garantía *                                                 │
│  [Casa propia                                            ]  │
│                                                             │
│  Aval                                                       │
│  [Juan Pérez                                             ]  │
│                                                             │
│  [Enviar Solicitud]                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Regla en DecisionRules.io

```
┌─────────────────────────────────────────────────────────────┐
│ Decision Table: Validación de Crédito                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Inputs:                                                    │
│  • montoSolicitado (Number)                                 │
│  • edad (Number)                                            │
│  • ingresosMensuales (Number)                               │
│                                                             │
│  Outputs:                                                   │
│  • elegible (Boolean)                                       │
│  • mostrarGarantia (Boolean)                                │
│  • mostrarAval (Boolean)                                    │
│  • nivelAprobacion (String)                                 │
│  • mensaje (String)                                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Reglas:                                                    │
│                                                             │
│  1. SI monto < 5000 Y edad >= 18 Y ingresos > 10000        │
│     ENTONCES:                                               │
│       elegible = true                                       │
│       mostrarGarantia = false                               │
│       mostrarAval = false                                   │
│       nivelAprobacion = "automático"                        │
│       mensaje = "Crédito pre-aprobado"                      │
│                                                             │
│  2. SI monto >= 5000 Y monto <= 20000 Y edad >= 21         │
│     Y ingresos > (monto * 0.3)                              │
│     ENTONCES:                                               │
│       elegible = true                                       │
│       mostrarGarantia = true                                │
│       mostrarAval = false                                   │
│       nivelAprobacion = "supervisor"                        │
│       mensaje = "Requiere garantía"                         │
│                                                             │
│  3. SI monto > 20000 Y edad >= 25                           │
│     Y ingresos > (monto * 0.4)                              │
│     ENTONCES:                                               │
│       elegible = true                                       │
│       mostrarGarantia = true                                │
│       mostrarAval = true                                    │
│       nivelAprobacion = "gerente"                           │
│       mensaje = "Requiere garantía y aval"                  │
│                                                             │
│  4. SINO                                                    │
│     ENTONCES:                                               │
│       elegible = false                                      │
│       mostrarGarantia = false                               │
│       mostrarAval = false                                   │
│       nivelAprobacion = "rechazado"                         │
│       mensaje = "No cumple requisitos"                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Configuración en el Diseñador

#### Campo "Garantía"

```
┌─────────────────────────────────────────────────────────────┐
│ Propiedades: Garantía                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Atributos] [Lógica] [Validación]                         │
│                                                             │
│  [Reglas Simples] [DecisionRules] ← Seleccionado           │
│                                                             │
│  ☁ Regla DecisionRules 1                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ID: validacion-credito-v1                           │   │
│  │ Versión: 1                                          │   │
│  │ Acción: Mostrar                                     │   │
│  │                                                     │   │
│  │ Campos de Entrada:                                  │   │
│  │   • montoSolicitado → montoSolicitado               │   │
│  │   • edad → edad                                     │   │
│  │   • ingresosMensuales → ingresosMensuales           │   │
│  │                                                     │   │
│  │ Condición:                                          │   │
│  │   result.mostrarGarantia === true                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Campo "Aval"

```
┌─────────────────────────────────────────────────────────────┐
│ Propiedades: Aval                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Atributos] [Lógica] [Validación]                         │
│                                                             │
│  [Reglas Simples] [DecisionRules] ← Seleccionado           │
│                                                             │
│  ☁ Regla DecisionRules 1                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ID: validacion-credito-v1                           │   │
│  │ Versión: 1                                          │   │
│  │ Acción: Mostrar                                     │   │
│  │                                                     │   │
│  │ Campos de Entrada:                                  │   │
│  │   • montoSolicitado → montoSolicitado               │   │
│  │   • edad → edad                                     │   │
│  │   • ingresosMensuales → ingresosMensuales           │   │
│  │                                                     │   │
│  │ Condición:                                          │   │
│  │   result.mostrarAval === true                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Interacción

### Escenario 1: Crédito Pequeño

```
Usuario ingresa:
  Monto: $3,000
  Edad: 25
  Ingresos: $15,000

     ↓

DecisionRules evalúa:
  monto < 5000 ✓
  edad >= 18 ✓
  ingresos > 10000 ✓

     ↓

Resultado:
  {
    elegible: true,
    mostrarGarantia: false,
    mostrarAval: false,
    nivelAprobacion: "automático",
    mensaje: "Crédito pre-aprobado"
  }

     ↓

Formulario muestra:
  ✓ Monto Solicitado
  ✓ Edad
  ✓ Ingresos Mensuales
  ✗ Garantía (oculto)
  ✗ Aval (oculto)
```

### Escenario 2: Crédito Mediano

```
Usuario ingresa:
  Monto: $15,000
  Edad: 30
  Ingresos: $50,000

     ↓

DecisionRules evalúa:
  monto >= 5000 Y monto <= 20000 ✓
  edad >= 21 ✓
  ingresos > (15000 * 0.3) = 4500 ✓

     ↓

Resultado:
  {
    elegible: true,
    mostrarGarantia: true,
    mostrarAval: false,
    nivelAprobacion: "supervisor",
    mensaje: "Requiere garantía"
  }

     ↓

Formulario muestra:
  ✓ Monto Solicitado
  ✓ Edad
  ✓ Ingresos Mensuales
  ✓ Garantía (visible y requerido)
  ✗ Aval (oculto)
```

### Escenario 3: Crédito Grande

```
Usuario ingresa:
  Monto: $50,000
  Edad: 35
  Ingresos: $75,000

     ↓

DecisionRules evalúa:
  monto > 20000 ✓
  edad >= 25 ✓
  ingresos > (50000 * 0.4) = 20000 ✓

     ↓

Resultado:
  {
    elegible: true,
    mostrarGarantia: true,
    mostrarAval: true,
    nivelAprobacion: "gerente",
    mensaje: "Requiere garantía y aval"
  }

     ↓

Formulario muestra:
  ✓ Monto Solicitado
  ✓ Edad
  ✓ Ingresos Mensuales
  ✓ Garantía (visible y requerido)
  ✓ Aval (visible y requerido)
```

---

## 🎯 Casos de Uso Adicionales

### 1. Descuentos Dinámicos

```
Campo: "Descuento Aplicado"

Regla DecisionRules:
  Inputs: tipoCliente, montoCompra, historialCompras
  Output: descuentoPorcentaje, mostrarDescuento

Condición: result.mostrarDescuento === true

Resultado en UI:
  Si es cliente VIP con compra > $100:
    → Muestra campo "Descuento: 15%"
  Si es cliente regular:
    → Oculta campo de descuento
```

### 2. Validación de Documentos

```
Campo: "Documento de Identidad Adicional"

Regla DecisionRules:
  Inputs: pais, tipoTransaccion, monto
  Output: requiereDocumentoAdicional, tipoDocumento

Condición: result.requiereDocumentoAdicional === true

Resultado en UI:
  Si es transacción internacional > $10,000:
    → Muestra campo "Pasaporte"
  Si es transacción local:
    → Solo muestra "DNI"
```

### 3. Aprobaciones Multinivel

```
Campo: "Aprobador Requerido"

Regla DecisionRules:
  Inputs: departamento, monto, urgencia, tipo
  Output: nivelAprobacion, aprobadores

Condición: result.nivelAprobacion !== "automático"

Resultado en UI:
  Si monto > $50,000:
    → Muestra "Requiere aprobación de Gerente"
  Si monto > $100,000:
    → Muestra "Requiere aprobación de Director"
```

---

## 📊 Ventajas Visuales

### Antes (Reglas Simples)

```
┌─────────────────────────────────────────────────────────────┐
│ Regla 1: SI edad < 18 ENTONCES mostrar tutorLegal          │
│ Regla 2: SI edad >= 18 ENTONCES ocultar tutorLegal         │
│ Regla 3: SI monto > 5000 ENTONCES mostrar garantia         │
│ Regla 4: SI monto > 20000 ENTONCES mostrar aval            │
│ Regla 5: SI ingresos < (monto * 0.3) ENTONCES ocultar todo │
│ ...                                                         │
│ (Difícil de mantener, muchas reglas)                       │
└─────────────────────────────────────────────────────────────┘
```

### Después (DecisionRules)

```
┌─────────────────────────────────────────────────────────────┐
│ ☁ Regla DecisionRules: "Validación de Crédito"             │
│                                                             │
│ • Toda la lógica compleja en DecisionRules.io              │
│ • Fácil de actualizar sin tocar el código                  │
│ • Versionado automático                                    │
│ • Testing integrado                                        │
│ • Auditoría de cambios                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

¡Listo! Ahora tienes una integración completa y visual de DecisionRules.io en tu diseñador de formularios. 🎉
