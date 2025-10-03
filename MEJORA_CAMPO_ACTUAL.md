# ⭐ Mejora: Campo Actual en "Campos a Asignar"

## Nueva Funcionalidad

Ahora el campo seleccionado actual **también aparece** en el combo select de "Campos a Asignar".

## Antes vs Ahora

### Antes ❌
```
Campos a Asignar:
  Campo del Formulario:
    - campo1
    - campo2
    - campo3
    [El campo actual NO aparecía]
```

### Ahora ✅
```
Campos a Asignar:
  Campo del Formulario:
    ⭐ campoResultado (campoResultado) - Campo actual
    - campo1
    - campo2
    - campo3
```

## Características

### 1. **Campo Actual Marcado**
- Se muestra con una estrella ⭐
- Incluye el texto "- Campo actual"
- Fácil de identificar

### 2. **Aparece Primero**
- El campo actual siempre aparece al inicio de la lista
- No necesitas buscarlo entre todos los campos

### 3. **Autocompletado Mejorado**
- Cuando se crea el primer campo de asignación, se preselecciona el campo actual
- La expresión se autocompleta automáticamente

## Casos de Uso

### Caso 1: Asignar al Campo Actual

**Antes:**
1. Seleccionar campo "campoResultado"
2. Ir a Lógica → DecisionRules
3. Acción: Establecer Valor
4. Añadir campo
5. ❌ "campoResultado" NO aparecía en la lista
6. Tenías que usar la Opción 1 (asignación automática)

**Ahora:**
1. Seleccionar campo "campoResultado"
2. Ir a Lógica → DecisionRules
3. Acción: Establecer Valor
4. ✅ Automáticamente se crea con "campoResultado" preseleccionado
5. O puedes seleccionarlo manualmente de la lista (aparece primero con ⭐)

### Caso 2: Asignar a Múltiples Campos Incluyendo el Actual

**Escenario:** Resultado `{"total": 150, "descuento": 15}`

**Campo seleccionado:** campoTotal

**Configuración:**
```
Campos a Asignar:
  1. ⭐ campoTotal (campoTotal) - Campo actual → result.total
  2. campoDescuento (campoDescuento) → result.descuento
```

**Resultado:**
- `campoTotal` = 150
- `campoDescuento` = 15

## Ventajas

✅ **Más flexible**: Puedes elegir entre asignación automática o manual
✅ **Más visible**: El campo actual está claramente marcado
✅ **Más rápido**: Aparece primero en la lista
✅ **Más intuitivo**: No necesitas recordar si puedes asignar al campo actual

## Comparación de Opciones

### Opción 1: Asignación Automática (Sin configurar campos)
```
Condición: result[0].result
Acción: Establecer Valor
Campos a Asignar: [vacío]

→ Asigna automáticamente al campo seleccionado
```

### Opción 2: Asignación Manual (Ahora incluye campo actual)
```
Condición: result[0] !== undefined
Acción: Establecer Valor
Campos a Asignar:
  - ⭐ campoResultado → result[0].result

→ Asigna manualmente al campo seleccionado
```

### Opción 3: Múltiples Campos (Incluyendo el actual)
```
Condición: result.total > 0
Acción: Establecer Valor
Campos a Asignar:
  - ⭐ campoTotal → result.total
  - campoDescuento → result.descuento
  - campoImpuesto → result.impuesto

→ Asigna a múltiples campos, incluyendo el actual
```

## Ejemplo Visual

### En el Combo Select:

```
┌─────────────────────────────────────────────────┐
│ Campo del Formulario                            │
├─────────────────────────────────────────────────┤
│ ⭐ Resultado (campoResultado) - Campo actual    │ ← Aparece primero
│ Descuento (campoDescuento)                      │
│ Impuesto (campoImpuesto)                        │
│ Precio (campoPrecio)                            │
│ Total (campoTotal)                              │
└─────────────────────────────────────────────────┘
```

## Flujo Completo

### Ejemplo: Asignar `[{"result": 20}]` al campo actual

1. **Selecciona** el campo "campoResultado" en el diseñador
2. **Ve a** Lógica → DecisionRules
3. **Configura** la regla básica
4. **Selecciona** Acción: "Establecer Valor"
5. **Automáticamente** se crea el primer campo:
   - Campo: ⭐ campoResultado - Campo actual
   - Expresión: result.campoResultado
6. **Ajusta** la expresión: `result[0].result`
7. **Guarda**

**Resultado:** El valor `20` se asigna a `campoResultado`

## Resumen

### Mejoras Implementadas:
1. ✅ Campo actual incluido en "Campos a Asignar"
2. ✅ Marcado con estrella ⭐ y texto "Campo actual"
3. ✅ Aparece primero en la lista
4. ✅ Se preselecciona automáticamente al crear el primer campo
5. ✅ Expresión se autocompleta

### Beneficios:
- Más flexible
- Más visible
- Más rápido
- Más intuitivo

¡Ahora tienes total control sobre las asignaciones! 🎯
