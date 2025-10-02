# ✨ Mejoras de Autocompletado - DecisionRules

## Nuevas Funcionalidades Implementadas

### 1. **Autocompletado del Campo Actual**

Cuando seleccionas la acción **"Establecer Valor"**, automáticamente:
- Se crea el primer campo de asignación
- El "Campo del Formulario" se preselecciona con el campo actual
- La "Expresión del Valor" se autocompleta con `result.nombreCampo`

**Ejemplo:**
```
Campo seleccionado: "campoResultado"
Acción: Establecer Valor

Resultado automático:
- Campo del Formulario: campoResultado
- Expresión del Valor: result.campoResultado
```

### 2. **Autocompletado al Seleccionar Campo**

Cuando seleccionas un campo en "Campo del Formulario":
- La expresión se autocompleta automáticamente con `result.nombreCampo`
- Solo si la expresión está vacía

**Ejemplo:**
```
Seleccionas: Campo del Formulario → "campoTotal"

Resultado automático:
- Expresión del Valor: result.campoTotal
```

### 3. **Placeholder Dinámico**

El placeholder del campo "Expresión del Valor" muestra una sugerencia basada en el campo seleccionado:

```
Campo seleccionado: "campoDescuento"
Placeholder: result.campoDescuento
```

### 4. **Botón de Autocompletar**

Cada campo de asignación tiene un botón 🔄 que permite:
- Regenerar la expresión automáticamente
- Útil si modificaste la expresión y quieres volver al valor por defecto

### 5. **Sugerencia Visual**

Debajo del campo de expresión, se muestra una sugerencia:
```
Sugerencia: result.campoNombre
```

---

## Flujo de Uso Optimizado

### Caso 1: Asignar al Campo Actual

1. Selecciona un campo en el diseñador (ej: "campoResultado")
2. Ve a Lógica → DecisionRules
3. Configura la regla básica (ID, versión, campos de entrada)
4. Selecciona Acción: **"Establecer Valor"**
5. ✨ **Automáticamente se crea:**
   ```
   Campo del Formulario: campoResultado
   Expresión del Valor: result.campoResultado
   ```
6. Solo necesitas ajustar la expresión si es diferente

### Caso 2: Asignar a Múltiples Campos

1. Configura la regla básica
2. Selecciona Acción: "Establecer Valor"
3. El primer campo se autocompleta con el campo actual
4. Haz clic en "Añadir campo" para más asignaciones
5. Selecciona cada campo del formulario
6. ✨ **La expresión se autocompleta automáticamente**
7. Ajusta las expresiones según necesites

---

## Ejemplos de Uso

### Ejemplo 1: Resultado Simple

**Resultado de DecisionRules:**
```json
{
  "total": 150,
  "descuento": 15
}
```

**Configuración:**
1. Selecciona campo "campoTotal"
2. Acción: Establecer Valor
3. ✨ Autocompletado:
   - Campo: campoTotal
   - Expresión: `result.total` ← Ajusta manualmente
4. Añadir campo:
   - Campo: campoDescuento
   - Expresión: `result.descuento` ← Ajusta manualmente

### Ejemplo 2: Resultado con Array

**Resultado de DecisionRules:**
```json
[
  {
    "result": 20
  }
]
```

**Configuración:**
1. Selecciona campo "campoResultado"
2. Acción: Establecer Valor
3. ✨ Autocompletado:
   - Campo: campoResultado
   - Expresión: `result.campoResultado` ← Ajusta a `result[0].result`

### Ejemplo 3: Múltiples Campos

**Resultado de DecisionRules:**
```json
{
  "precio": 100,
  "impuesto": 16,
  "total": 116
}
```

**Configuración:**
1. Selecciona campo "campoPrecio"
2. Acción: Establecer Valor
3. ✨ Autocompletado:
   - Campo: campoPrecio
   - Expresión: `result.campoPrecio` ← Ajusta a `result.precio`
4. Añadir campo → campoImpuesto
   - ✨ Expresión: `result.campoImpuesto` ← Ajusta a `result.impuesto`
5. Añadir campo → campoTotal
   - ✨ Expresión: `result.campoTotal` ← Ajusta a `result.total`

---

## Tips de Uso

### 1. Nombres Coincidentes

Si tus campos del formulario tienen los mismos nombres que las propiedades del resultado, no necesitas ajustar nada:

```
Formulario: campoTotal
Resultado: { total: 150 }
Expresión autocompletada: result.campoTotal ← Ajustar a result.total

Mejor práctica: Nombra tu campo "total" en el formulario
Formulario: total
Resultado: { total: 150 }
Expresión autocompletada: result.total ← ✅ Perfecto!
```

### 2. Usar el Botón de Autocompletar

Si modificaste una expresión y quieres volver al valor por defecto:
1. Haz clic en el botón 🔄
2. La expresión se regenera como `result.nombreCampo`

### 3. Placeholder como Guía

El placeholder siempre muestra la sugerencia correcta:
```
Campo: campoDescuento
Placeholder: result.campoDescuento
```

### 4. Ajustar Expresiones Complejas

Para casos complejos, ajusta manualmente:
```
Autocompletado: result.campoTotal
Ajustado: result.precio * (1 + result.impuesto)
```

---

## Ventajas

✅ **Menos escritura**: El 80% del trabajo se hace automáticamente
✅ **Menos errores**: No hay que escribir manualmente `result.`
✅ **Más rápido**: Configuración en segundos
✅ **Intuitivo**: El placeholder y las sugerencias guían al usuario
✅ **Flexible**: Siempre puedes ajustar manualmente

---

## Resumen

### Antes:
```
1. Seleccionar acción "Establecer Valor"
2. Hacer clic en "Añadir campo"
3. Seleccionar campo del formulario
4. Escribir manualmente: result.nombreCampo
5. Repetir para cada campo
```

### Ahora:
```
1. Seleccionar acción "Establecer Valor"
   ✨ Primer campo se crea automáticamente
   ✨ Campo actual preseleccionado
   ✨ Expresión autocompletada
2. Ajustar expresión si es necesario
3. Para más campos: Añadir → Seleccionar → ✨ Autocompleta
```

¡Configuración 3x más rápida! 🚀
