# Test de DecisionRules

## Pasos para Probar

### 1. Configurar API Key

1. Abre el diseñador
2. Crea un formulario simple
3. Agrega un campo (ej: "Edad" - tipo número)
4. Selecciona el campo
5. Ve a **Lógica → DecisionRules**
6. Expande **Configuración DecisionRules**
7. Pega tu API Key: `kq8fJHpPY0sDxDAn4XAp_tjMThiPjy4xh6RiKeViuFBDIXkW8PlFcFa-mg5B2bwM`
8. Haz clic en **Guardar Configuración**
9. Verifica que aparezca el ícono verde "Configurado"

### 2. Crear Regla de Prueba

1. Haz clic en **Añadir regla DecisionRules**
2. Configura:
   - **ID de Regla**: `c67df234-c939-6b6b-16fc-dcb9543c8c1b`
   - **Versión**: `1`
   - **Acción**: `Mostrar`
   - **Campos de Entrada**:
     - Haz clic en "Añadir campo"
     - Campo del Formulario: Selecciona el campo que creaste
     - Clave en DecisionRules: `value1`
   - **Condición del Resultado**: `result.value < 6`
3. Guarda

### 3. Probar en Vista Previa

1. Ve a la pestaña **Vista Previa**
2. Abre la consola del navegador (F12)
3. Cambia el valor del campo
4. Deberías ver logs como:
   ```
   🔵 [DecisionRules] Evaluando regla: dr-logic-001
   📤 [DecisionRules] Request Body: { value1: 3 }
   📋 [DecisionRules] Rule ID: c67df234-c939-6b6b-16fc-dcb9543c8c1b
   📋 [DecisionRules] Version: 1
   🚀 [ServicioDecisionRules] Llamando a DecisionRules API
   ✅ [ServicioDecisionRules] Respuesta recibida: { value: 14 }
   📥 [DecisionRules] Response: { value: 14 }
   🔍 [DecisionRules] Evaluando condición: result.value < 6
   ✅ [DecisionRules] Resultado de condición: false
   ```

### 4. Verificar Comportamiento

- Si `result.value < 6` es `true` → El campo se muestra
- Si `result.value < 6` es `false` → El campo se oculta (según la acción configurada)

## Debugging

### Si no ves logs:

1. Verifica que la API Key esté configurada
2. Verifica que el Rule ID sea correcto
3. Verifica que los campos de entrada estén mapeados correctamente
4. Abre la consola y busca errores

### Si ves error "ServicioDecisionRules no está configurado":

1. Ve a Lógica → DecisionRules → Configuración
2. Ingresa tu API Key
3. Haz clic en "Guardar Configuración"
4. Recarga la página

### Si ves error "Regla DecisionRules sin ID configurado":

1. Verifica que hayas pegado el Rule ID
2. Verifica que no haya espacios al inicio o final

### Si la API retorna error:

1. Verifica que el Rule ID exista en tu cuenta de DecisionRules.io
2. Verifica que la regla esté publicada
3. Verifica que los campos de entrada coincidan con los de la regla

## Ejemplo de Regla en DecisionRules.io

```
Decision Table: Test Rule

Input:
  - value1 (Number)

Output:
  - value (Number)

Reglas:
  SI value1 = 3 ENTONCES value = 14
  SI value1 = 11 ENTONCES value = 22
  SINO value = 0
```

## Notas

- Las reglas de DecisionRules se evalúan de forma **asíncrona**
- Puede haber un pequeño delay (< 1 segundo) al cambiar valores
- Los logs te ayudarán a entender qué está pasando
- Si no funciona, revisa la consola para ver errores específicos
