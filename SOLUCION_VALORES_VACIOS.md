# 🔧 Solución: Valores Vacíos en DecisionRules

## Problema Identificado

Los logs muestran:
```
⚠️ Valores disponibles: []
📌 Mapeando:
   Campo: "value1"
   Clave DR: "1"
   Valor: undefined
```

Esto significa que **los valores del formulario están vacíos**.

## Causa Raíz

Los campos en tu formulario **NO tienen la propiedad `nombre` configurada**.

Cuando un campo no tiene `nombre`, los valores no se pueden guardar correctamente en el almacén.

## Solución Paso a Paso

### 1. Verificar los Nombres de los Campos

1. Abre el **Diseñador**
2. Selecciona el primer campo (el que quieres usar como "value1")
3. Ve a la pestaña **"Atributos"**
4. Busca el campo **"Nombre"**
5. Si está vacío o tiene un valor extraño, cámbialo a: `value1`
6. Guarda

7. Repite para el segundo campo:
   - Selecciona el segundo campo
   - Ve a **Atributos**
   - Campo **"Nombre"**: `value2`
   - Guarda

### 2. Verificar en la Consola

1. Recarga la página
2. Ve a **Vista Previa**
3. Abre la consola (F12)
4. Deberías ver:
   ```
   🔍 [VistaPrevia] Evaluando campos...
      Campos: [
        { id: "...", nombre: "value1", etiqueta: "Campo 1" },
        { id: "...", nombre: "value2", etiqueta: "Campo 2" }
      ]
   ```

5. Si ves `nombre: undefined` o `nombre: null`, el campo NO tiene nombre configurado

### 3. Ingresar Valores

1. En la Vista Previa, ingresa un valor en el primer campo (ej: 3)
2. Ingresa un valor en el segundo campo (ej: 11)
3. Deberías ver en la consola:
   ```
   🔍 [VistaPrevia] Evaluando campos...
      Valores actuales: { value1: 3, value2: 11 }
   ```

### 4. Verificar la Regla de DecisionRules

1. Selecciona el campo que tiene la regla
2. Ve a **Lógica → DecisionRules**
3. Verifica la configuración:
   ```
   Campos de Entrada:
   - Campo del Formulario: value1  ← Debe coincidir con el nombre del campo
   - Clave en DecisionRules: value1 ← Lo que espera DecisionRules
   
   - Campo del Formulario: value2
   - Clave en DecisionRules: value2
   ```

### 5. Probar

1. Ve a Vista Previa
2. Cambia los valores
3. Deberías ver en la consola:
   ```
   📋 [DecisionRules] Valores disponibles: { value1: 3, value2: 11 }
   📋 [DecisionRules] Claves de valores: ["value1", "value2"]
      📌 Mapeando:
         Campo: "value1"
         Clave DR: "value1"
         Valor: 3
      📌 Mapeando:
         Campo: "value2"
         Clave DR: "value2"
         Valor: 11
   📤 [DecisionRules] Request Body final: { value1: 3, value2: 11 }
   ```

## Verificación Rápida

Ejecuta esto en la consola del navegador mientras estás en Vista Previa:

```javascript
// Ver el almacén
const almacen = window.__VUE_DEVTOOLS_GLOBAL_HOOK__?.apps[0]?.appContext?.config?.globalProperties?.$pinia?._s?.get('disenador')

// Ver los campos
console.log('Campos:', almacen?.esquemaFormulario?.paginas[0]?.campos)

// Ver los valores
console.log('Valores:', almacen?.valoresPorPagina)
```

Si ves que los campos tienen `nombre: undefined`, ese es el problema.

## Solución Alternativa: Crear Campos Nuevos

Si los campos existentes no tienen nombre y no puedes editarlos:

1. **Elimina los campos actuales**
2. **Crea nuevos campos** desde la paleta
3. **IMPORTANTE**: Al crear cada campo, inmediatamente:
   - Selecciónalo
   - Ve a Atributos
   - Pon un nombre único (ej: "value1", "value2")
   - Guarda
4. Configura la regla de DecisionRules
5. Prueba en Vista Previa

## Ejemplo Completo

### Campo 1
```
Tipo: Número
Etiqueta: "Valor 1"
Nombre: value1  ← IMPORTANTE
```

### Campo 2
```
Tipo: Número
Etiqueta: "Valor 2"
Nombre: value2  ← IMPORTANTE
```

### Regla DecisionRules
```
ID de Regla: c67df234-c939-6b6b-16fc-dcb9543c8c1b
Versión: 1

Campos de Entrada:
  1. Campo del Formulario: value1
     Clave en DecisionRules: value1
  
  2. Campo del Formulario: value2
     Clave en DecisionRules: value2

Condición: result.value < 6
Acción: Mostrar
```

### Resultado Esperado

Cuando ingreses `value1 = 3` y `value2 = 11`:

```json
POST https://api.decisionrules.io/rule/solve/...
{
  "value1": 3,
  "value2": 11
}
```

Respuesta:
```json
{
  "value": 14
}
```

Evaluación: `result.value < 6` → `14 < 6` → `false`

## Resumen

El problema es simple: **Los campos no tienen la propiedad `nombre` configurada**.

**Solución**: Asigna un nombre único a cada campo en la pestaña Atributos.

Sin el nombre, los valores no se pueden guardar ni recuperar correctamente.
