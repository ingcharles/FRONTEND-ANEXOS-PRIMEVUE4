# 🎯 Asignación de Valor Simplificada

## Dos Formas de Asignar Valores

### Opción 1: Asignación Automática al Campo Seleccionado (SIMPLE) ⭐

**Usa la expresión de la condición para asignar directamente al campo seleccionado.**

#### Cómo Funciona:

1. Selecciona un campo en el diseñador (ej: "campoResultado")
2. Ve a Lógica → DecisionRules
3. Configura:
   - ID de Regla
   - Versión
   - Campos de Entrada
   - **Condición del Resultado**: `result[0].result` (la expresión que retorna el valor)
   - **Acción**: Establecer Valor
   - **NO configures "Campos a Asignar"** (déjalo vacío)
4. ¡Listo!

#### Ejemplo:

**Resultado de DecisionRules:**
```json
[{"result": 20}]
```

**Configuración:**
```
Campo seleccionado: campoResultado

Condición del Resultado: result[0].result
Acción: Establecer Valor
Campos a Asignar: [vacío]
```

**Resultado:**
- El valor `20` se asigna automáticamente a `campoResultado`

#### Ventajas:
- ✅ Más simple
- ✅ Menos configuración
- ✅ Ideal para asignar un solo valor
- ✅ La expresión hace doble función: evalúa Y asigna

---

### Opción 2: Asignación Manual a Múltiples Campos (AVANZADA)

**Configura explícitamente qué campos reciben qué valores.**

#### Cómo Funciona:

1. Selecciona un campo
2. Configura la regla básica
3. **Condición del Resultado**: `result !== undefined` (solo verifica que hay resultado)
4. **Acción**: Establecer Valor
5. **Campos a Asignar**: Configura cada campo manualmente

#### Ejemplo:

**Resultado de DecisionRules:**
```json
{
  "total": 150,
  "descuento": 15,
  "mensaje": "Cliente VIP"
}
```

**Configuración:**
```
Condición del Resultado: result.total > 0
Acción: Establecer Valor

Campos a Asignar:
  - campoTotal → result.total
  - campoDescuento → result.descuento
  - campoMensaje → result.mensaje
```

**Resultado:**
- `campoTotal` = 150
- `campoDescuento` = 15
- `campoMensaje` = "Cliente VIP"

#### Ventajas:
- ✅ Asignar a múltiples campos
- ✅ Transformar valores (ej: `result.precio * 1.16`)
- ✅ Más control

---

## Comparación

### Caso: Asignar `[{"result": 20}]` a un campo

#### Opción 1 (Simple):
```
Campo: campoResultado
Condición: result[0].result
Acción: Establecer Valor
Campos a Asignar: [vacío]

✅ 3 pasos
```

#### Opción 2 (Manual):
```
Campo: cualquiera
Condición: result[0] !== undefined
Acción: Establecer Valor
Campos a Asignar:
  - campoResultado → result[0].result

❌ 4 pasos + configuración extra
```

---

## Ejemplos Prácticos

### Ejemplo 1: Resultado Simple

**Resultado:** `{"value": 14}`

**Opción 1 (Simple):**
```
Campo seleccionado: campoValor
Condición: result.value
Acción: Establecer Valor
```
→ `campoValor` = 14

**Opción 2 (Manual):**
```
Condición: result.value > 0
Acción: Establecer Valor
Campos a Asignar:
  - campoValor → result.value
```
→ `campoValor` = 14

---

### Ejemplo 2: Array

**Resultado:** `[{"result": 20}]`

**Opción 1 (Simple):**
```
Campo seleccionado: campoResultado
Condición: result[0].result
Acción: Establecer Valor
```
→ `campoResultado` = 20

**Opción 2 (Manual):**
```
Condición: result[0] !== undefined
Acción: Establecer Valor
Campos a Asignar:
  - campoResultado → result[0].result
```
→ `campoResultado` = 20

---

### Ejemplo 3: Múltiples Valores

**Resultado:** `{"precio": 100, "impuesto": 16}`

**Opción 1 (Simple):**
```
NO RECOMENDADO - Solo asigna a un campo
```

**Opción 2 (Manual):** ⭐
```
Condición: result.precio > 0
Acción: Establecer Valor
Campos a Asignar:
  - campoPrecio → result.precio
  - campoImpuesto → result.impuesto
  - campoTotal → result.precio + result.impuesto
```
→ Asigna a 3 campos diferentes

---

### Ejemplo 4: Transformación

**Resultado:** `{"tasa": 0.12}`

**Opción 1 (Simple):**
```
Campo seleccionado: campoTasa
Condición: result.tasa * 100
Acción: Establecer Valor
```
→ `campoTasa` = 12 (convertido a porcentaje)

**Opción 2 (Manual):**
```
Condición: result.tasa > 0
Acción: Establecer Valor
Campos a Asignar:
  - campoTasa → result.tasa * 100
```
→ `campoTasa` = 12

---

## Cuándo Usar Cada Opción

### Usa Opción 1 (Simple) cuando:
- ✅ Solo necesitas asignar a UN campo
- ✅ El campo seleccionado es el que recibirá el valor
- ✅ Quieres la configuración más rápida
- ✅ La expresión de la condición ya retorna el valor correcto

### Usa Opción 2 (Manual) cuando:
- ✅ Necesitas asignar a MÚLTIPLES campos
- ✅ Necesitas transformar valores diferentes
- ✅ El campo seleccionado no es el que recibe el valor
- ✅ Necesitas más control sobre las asignaciones

---

## Tu Caso Específico

**Resultado:** `[{"result": 20}]`
**Objetivo:** Asignar `20` al campo seleccionado

### Solución Recomendada (Opción 1):

```
1. Selecciona el campo que recibirá el valor
2. Ve a Lógica → DecisionRules
3. Configura:
   - ID de Regla: c67df234-c939-6b6b-16fc-dcb9543c8c1b
   - Versión: 1
   - Campos de Entrada: (tus campos)
   - Condición del Resultado: result[0].result
   - Acción: Establecer Valor
   - Campos a Asignar: [dejar vacío]
4. Guarda
```

**Resultado:**
- Cuando DecisionRules retorne `[{"result": 20}]`
- El campo seleccionado se actualizará automáticamente con `20`

---

## Logs

### Opción 1 (Simple):
```
📝 [DecisionRules] Asignación automática al campo actual: campoResultado
   📝 Asignando: campoResultado = 20
```

### Opción 2 (Manual):
```
📝 [DecisionRules] Aplicando asignaciones configuradas...
   📝 Asignando: campoResultado = 20
```

---

## Resumen

| Característica | Opción 1 (Simple) | Opción 2 (Manual) |
|----------------|-------------------|-------------------|
| Configuración | Mínima | Completa |
| Campos | 1 campo | Múltiples campos |
| Velocidad | ⚡ Rápida | 🐢 Más lenta |
| Control | Básico | Avanzado |
| Ideal para | Casos simples | Casos complejos |

**Recomendación:** Usa Opción 1 para tu caso `[{"result": 20}]` 🎯
