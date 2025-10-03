# ⚡ Optimización: Caché de Resultados DecisionRules

## Problema Resuelto

**Antes:** La petición a DecisionRules se hacía cada vez que se evaluaba cualquier campo, incluso si los valores de entrada no habían cambiado.

**Ahora:** La petición solo se hace cuando los valores de los "Campos de Entrada" configurados cambian.

---

## Cómo Funciona

### 1. **Caché Inteligente**

El sistema genera una clave única basada en:
- ID de la regla
- Versión de la regla
- Valores de los campos de entrada configurados

```typescript
Clave de caché = "ruleId_version_valoresEntrada"

Ejemplo:
"72f54c4c-9647-695a-de3b-2c4d7c98c2e5_1_{"packageWeight":5}"
```

### 2. **Solo Campos de Entrada**

La clave solo incluye los campos configurados en "Campos de Entrada", no todos los campos del formulario.

**Ejemplo:**
```
Campos de Entrada configurados:
  - packageWeight

Otros campos en el formulario:
  - campoPrecio
  - campoMoneda
  - campoEntrega

Clave de caché solo incluye: packageWeight
```

### 3. **TTL (Time To Live)**

El caché expira después de 5 segundos para asegurar que los datos estén actualizados.

---

## Comportamiento

### Escenario 1: Primer Cambio

```
Usuario cambia: packageWeight = 5

1. Se genera clave: "rule_1_{"packageWeight":5}"
2. No hay caché
3. ✅ Se hace petición POST a DecisionRules
4. Se guarda resultado en caché
5. Se asignan valores a los campos
```

### Escenario 2: Cambio en Campo de Salida

```
Usuario cambia: campoPrecio = 100 (manualmente)

1. Se genera clave: "rule_1_{"packageWeight":5}"
2. ✅ Hay caché (packageWeight no cambió)
3. ❌ NO se hace petición POST
4. Se usa resultado cacheado
```

### Escenario 3: Cambio en Campo de Entrada

```
Usuario cambia: packageWeight = 10

1. Se genera clave: "rule_1_{"packageWeight":10}"
2. No hay caché (valor cambió)
3. ✅ Se hace petición POST a DecisionRules
4. Se guarda nuevo resultado en caché
5. Se asignan valores actualizados
```

### Escenario 4: Múltiples Campos de Entrada

```
Campos de Entrada:
  - campo1
  - campo2

Usuario cambia: campo1 = 5
  → Petición POST ✅

Usuario cambia: campo3 (no es de entrada)
  → NO petición (usa caché) ❌

Usuario cambia: campo2 = 10
  → Petición POST ✅ (clave cambió)
```

---

## Logs

### Con Caché:
```
🔵 [DecisionRules] Evaluando regla: dr-logic-001
💾 [DecisionRules] Usando resultado en caché (edad: 234ms)
```

### Sin Caché (Primera vez o valores cambiaron):
```
🔵 [DecisionRules] Evaluando regla: dr-logic-001
📋 [DecisionRules] Valores disponibles: {...}
📤 [DecisionRules] Request Body final: {...}
🚀 [ServicioDecisionRules] Llamando a DecisionRules API
✅ [ServicioDecisionRules] Respuesta recibida: {...}
📥 [DecisionRules] Response: {...}
💾 [DecisionRules] Resultado guardado en caché
```

---

## Ventajas

### 1. **Menos Peticiones**
- Solo se hace petición cuando los valores de entrada cambian
- Reduce carga en el servidor de DecisionRules
- Reduce costos de API

### 2. **Más Rápido**
- Respuesta instantánea desde caché
- Mejor experiencia de usuario
- No hay delay al cambiar campos de salida

### 3. **Más Eficiente**
- No se hacen peticiones duplicadas
- Caché se limpia automáticamente
- TTL configurable

---

## Configuración

### TTL (Time To Live)

Por defecto: 5 segundos

Para cambiar, modifica en `Logica.ts`:

```typescript
const CACHE_TTL = 5000 // 5 segundos
```

Opciones:
- `1000` = 1 segundo (más actualizado, más peticiones)
- `5000` = 5 segundos (balanceado)
- `10000` = 10 segundos (menos peticiones, menos actualizado)
- `30000` = 30 segundos (para datos que cambian poco)

---

## Ejemplo Completo

### Configuración:

```
Campos de Entrada:
  - packageWeight → weight

Campos a Asignar:
  - campoPrecio → result[0].price
  - campoMoneda → result[0].currency
  - campoEntrega → result[0].deliveryInHours
```

### Flujo:

```
1. Usuario ingresa: packageWeight = 5
   → Petición POST ✅
   → Respuesta: [{"price": 99, "currency": "USD", ...}]
   → Caché guardado
   → Campos actualizados

2. Usuario cambia: campoPrecio = 100 (manualmente)
   → NO petición ❌
   → Usa caché
   → packageWeight sigue siendo 5

3. Usuario cambia: campoMoneda = "EUR" (manualmente)
   → NO petición ❌
   → Usa caché
   → packageWeight sigue siendo 5

4. Usuario cambia: packageWeight = 10
   → Petición POST ✅ (valor de entrada cambió)
   → Nueva respuesta: [{"price": 150, ...}]
   → Caché actualizado
   → Campos actualizados con nuevos valores
```

---

## Limpieza de Caché

### Automática:
- Se limpia cada vez que se evalúa una regla
- Elimina entradas expiradas (> 5 segundos)

### Manual:
Si necesitas limpiar el caché manualmente:

```typescript
// En la consola del navegador
// (Esto requeriría exponer una función pública)
```

---

## Casos Especiales

### 1. Múltiples Reglas

Cada regla tiene su propio caché independiente:

```
Regla 1: packageWeight → price
Regla 2: packageWeight → delivery

Ambas tienen caché separado
```

### 2. Mismos Valores, Diferente Orden

El caché usa JSON.stringify, por lo que el orden importa:

```
{"a": 1, "b": 2} ≠ {"b": 2, "a": 1}
```

Pero esto no es problema porque siempre se procesan en el mismo orden.

### 3. Valores Undefined vs Null

Se tratan como diferentes:

```
{"campo": undefined} ≠ {"campo": null}
```

---

## Debugging

### Ver Caché en Logs:

```
💾 [DecisionRules] Usando resultado en caché (edad: 234ms)
```

### Ver Petición Nueva:

```
🚀 [ServicioDecisionRules] Llamando a DecisionRules API
💾 [DecisionRules] Resultado guardado en caché
```

### Verificar Clave de Caché:

Agrega este log temporal en `generarClaveCacheDecisionRules`:

```typescript
const clave = `${regla.decisionRulesId}_${regla.decisionRulesVersion}_${JSON.stringify(valoresEntrada)}`
console.log('🔑 Clave de caché:', clave)
return clave
```

---

## Resumen

### Antes:
```
Cambio en cualquier campo → Petición POST
Cambio en cualquier campo → Petición POST
Cambio en cualquier campo → Petición POST
```

### Ahora:
```
Cambio en campo de entrada → Petición POST ✅
Cambio en campo de salida → Usa caché 💾
Cambio en otro campo → Usa caché 💾
Cambio en campo de entrada → Petición POST ✅
```

### Beneficios:
- ⚡ Más rápido
- 💰 Menos costos
- 🎯 Solo peticiones necesarias
- 💾 Caché inteligente
- ⏱️ TTL configurable

¡Optimización implementada! 🚀
