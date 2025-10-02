# 🐛 Debug: Request Body con Índices en lugar de Nombres

## Problema

El POST se está enviando como:
```json
{
  "data": {
    "1": null,
    "2": null
  }
}
```

Pero debería ser:
```json
{
  "data": {
    "nombreCampo1": valor1,
    "nombreCampo2": valor2
  }
}
```

## Diagnóstico

### Paso 1: Verificar Configuración de Campos de Entrada

1. Abre la consola del navegador (F12)
2. Selecciona el campo con la regla de DecisionRules
3. Ve a Lógica → DecisionRules
4. Verifica que en "Campos de Entrada" veas:
   - **Campo del Formulario**: Debe mostrar el nombre del campo (ej: "Edad (edad)")
   - **Clave en DecisionRules**: Debe mostrar la clave (ej: "value1")

### Paso 2: Verificar Logs

Con los nuevos logs agregados, deberías ver:

```
📋 [DecisionRules] Valores disponibles: { edad: 25, nombre: "Juan", ... }
📋 [DecisionRules] Campos de entrada configurados: [
  { nombreCampo: "edad", claveDecisionRules: "value1" },
  { nombreCampo: "nombre", claveDecisionRules: "value2" }
]
   📌 Mapeando: edad → value1 = 25
   📌 Mapeando: nombre → value2 = Juan
📤 [DecisionRules] Request Body: { value1: 25, value2: "Juan" }
```

### Paso 3: Identificar el Problema

Si ves algo como:
```
📋 [DecisionRules] Valores disponibles: { "1": null, "2": null }
```

Entonces el problema está en cómo se están guardando los valores en el almacén.

Si ves:
```
📋 [DecisionRules] Campos de entrada configurados: [
  { nombreCampo: "1", claveDecisionRules: "value1" }
]
```

Entonces el problema está en cómo se está guardando la configuración de la regla.

## Soluciones

### Solución 1: Verificar que el campo tenga nombre

1. En el diseñador, selecciona el campo
2. Ve a la pestaña "Atributos"
3. Verifica que el campo "Nombre" tenga un valor (ej: "edad")
4. Si está vacío, ponle un nombre
5. Guarda

### Solución 2: Recrear la regla

1. Elimina la regla de DecisionRules existente
2. Crea una nueva regla
3. Al configurar "Campos de Entrada":
   - Asegúrate de seleccionar el campo del dropdown (no escribir manualmente)
   - Verifica que se muestre el nombre correcto
4. Guarda

### Solución 3: Verificar el almacén

Si los logs muestran que `valoresPorNombre` tiene índices en lugar de nombres:

1. El problema está en cómo se guardan los valores
2. Verifica que en `VistaPrevia.vue` se esté usando:
   ```typescript
   const valores = computed(() => almacen.obtenerValoresPagina(paginaActual.value?.id || ''))
   ```
3. Verifica que `obtenerValoresPagina` retorne un objeto con nombres de campos como claves

## Verificación Rápida

Ejecuta esto en la consola del navegador:

```javascript
// Ver el almacén
console.log('Almacén:', window.__VUE_DEVTOOLS_GLOBAL_HOOK__)

// Ver los valores actuales
const almacen = useAlmacenDisenador()
console.log('Valores:', almacen.obtenerValoresPagina(almacen.esquemaFormulario.paginas[0].id))

// Ver los campos
console.log('Campos:', almacen.esquemaFormulario.paginas[0].campos)
```

## Ejemplo Correcto

### Configuración del Campo

```
Campo: "Edad"
Nombre: edad  ← IMPORTANTE: Debe tener nombre
Tipo: Número
```

### Configuración de la Regla

```
Campos de Entrada:
  - Campo del Formulario: edad  ← Debe ser el nombre, no el índice
  - Clave en DecisionRules: value1
```

### Valores en el Almacén

```javascript
{
  "edad": 25,  ← Clave es el nombre del campo
  "nombre": "Juan",
  "ciudad": "Madrid"
}
```

### Request Body Resultante

```javascript
{
  "value1": 25  ← Mapeo correcto: edad → value1
}
```

## Logs Esperados

```
🔵 [DecisionRules] Evaluando regla: dr-logic-001
📋 [DecisionRules] Valores disponibles: { edad: 25, nombre: "Juan" }
📋 [DecisionRules] Campos de entrada configurados: [
  { nombreCampo: "edad", claveDecisionRules: "value1" }
]
   📌 Mapeando: edad → value1 = 25
📤 [DecisionRules] Request Body: { value1: 25 }
🚀 [ServicioDecisionRules] Llamando a DecisionRules API
   Rule ID: c67df234-c939-6b6b-16fc-dcb9543c8c1b
   Version: 1
   Request Body: { value1: 25 }
✅ [ServicioDecisionRules] Respuesta recibida: { value: 14 }
```

## Acción Inmediata

1. **Abre la consola** (F12)
2. **Ve a Vista Previa**
3. **Cambia un valor** en el formulario
4. **Copia todos los logs** que aparezcan
5. **Busca la línea** que dice "📋 [DecisionRules] Valores disponibles:"
6. **Verifica** si los valores tienen nombres o índices

Si ves índices, el problema está en el almacén.
Si ves nombres pero el request body tiene índices, el problema está en el mapeo.
