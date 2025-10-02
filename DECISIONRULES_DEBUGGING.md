# 🐛 Debugging DecisionRules

## Cambios Realizados para Habilitar Evaluación

### 1. Logs Agregados

Se agregaron logs detallados en toda la cadena de evaluación:

#### En `src/utilidades/Logica.ts`:
```
🔵 [DecisionRules] Evaluando regla: [id]
📤 [DecisionRules] Request Body: {...}
📋 [DecisionRules] Rule ID: [id]
📋 [DecisionRules] Version: [version]
📥 [DecisionRules] Response: {...}
🔍 [DecisionRules] Evaluando condición: [condición]
✅ [DecisionRules] Resultado de condición: [true/false]
```

#### En `src/servicios/ServicioDecisionRules.ts`:
```
🚀 [ServicioDecisionRules] Llamando a DecisionRules API
✅ [ServicioDecisionRules] Respuesta recibida: {...}
❌ [ServicioDecisionRules] Error al evaluar regla: [error]
```

#### En `src/paginas/disenador/componentes/VistaPrevia.vue`:
```
🔧 [VistaPrevia] Cargando configuración de DecisionRules...
✅ [VistaPrevia] DecisionRules configurado correctamente
⚠️ [VistaPrevia] DecisionRules no está configurado
```

### 2. Evaluación Asíncrona en Vista Previa

**Antes**: Vista Previa usaba `evaluarReglasCampoSync()` que NO evalúa reglas de DecisionRules

**Ahora**: Vista Previa usa `evaluarReglasCampo()` (asíncrona) que SÍ evalúa reglas de DecisionRules

```typescript
// Antes (síncrono - solo reglas simples)
const camposConLogica = computed(() => {
  return camposOriginales.map(campo => {
    const estado = evaluarReglasCampoSync(campo, valores, mapa)
    return { ...campo, visible: estado.visible, requerido: estado.requerido }
  })
})

// Ahora (asíncrono - incluye DecisionRules)
const camposConLogica = ref<EsquemaCampo[]>([])

async function evaluarYActualizarCampos() {
  const camposEvaluados = await Promise.all(
    camposOriginales.map(async (campo) => {
      const estado = await evaluarReglasCampo(campo, valores, mapa)
      return { ...campo, visible: estado.visible, requerido: estado.requerido }
    })
  )
  camposConLogica.value = camposEvaluados
}

watchEffect(() => {
  evaluarYActualizarCampos()
})
```

### 3. Carga Automática de Configuración

Se agregó `onMounted()` en VistaPrevia para cargar la configuración de DecisionRules desde localStorage:

```typescript
onMounted(() => {
  decisionRules.cargarConfiguracion()
})
```

## 🧪 Cómo Probar

### Paso 1: Verificar Configuración

1. Abre la consola del navegador (F12)
2. Ve al diseñador
3. Deberías ver:
   ```
   🔧 [VistaPrevia] Cargando configuración de DecisionRules...
   ```

4. Si está configurado:
   ```
   ✅ [VistaPrevia] DecisionRules configurado correctamente
   ```

5. Si NO está configurado:
   ```
   ⚠️ [VistaPrevia] DecisionRules no está configurado
   ```

### Paso 2: Configurar API Key (si no está configurado)

1. Selecciona un campo
2. Ve a **Lógica → DecisionRules**
3. Expande **Configuración DecisionRules**
4. Pega tu API Key
5. Haz clic en **Guardar Configuración**
6. Recarga la página
7. Verifica que ahora aparezca el mensaje de "configurado correctamente"

### Paso 3: Crear Regla de Prueba

1. En el diseñador, crea dos campos:
   - Campo 1: "Valor" (tipo: Número, nombre: `valor`)
   - Campo 2: "Resultado" (tipo: Texto, nombre: `resultado`)

2. Selecciona el Campo 2 ("Resultado")

3. Ve a **Lógica → DecisionRules → Añadir regla**

4. Configura:
   ```
   ID de Regla: c67df234-c939-6b6b-16fc-dcb9543c8c1b
   Versión: 1
   Acción: Mostrar
   
   Campos de Entrada:
   - Campo del Formulario: valor
   - Clave en DecisionRules: value1
   
   Condición del Resultado: result.value < 6
   ```

5. Guarda

### Paso 4: Probar en Vista Previa

1. Ve a la pestaña **Vista Previa**
2. Abre la consola del navegador (F12)
3. En el campo "Valor", ingresa: `3`
4. Deberías ver en la consola:

```
🔵 [DecisionRules] Evaluando regla: dr-logic-001
📤 [DecisionRules] Request Body: { value1: 3 }
📋 [DecisionRules] Rule ID: c67df234-c939-6b6b-16fc-dcb9543c8c1b
📋 [DecisionRules] Version: 1
🚀 [ServicioDecisionRules] Llamando a DecisionRules API
   Rule ID: c67df234-c939-6b6b-16fc-dcb9543c8c1b
   Version: 1
   Request Body: { value1: 3 }
✅ [ServicioDecisionRules] Respuesta recibida: { value: 14 }
📥 [DecisionRules] Response: { value: 14 }
🔍 [DecisionRules] Evaluando condición: result.value < 6
✅ [DecisionRules] Resultado de condición: false
```

5. Cambia el valor a `11`:

```
🔵 [DecisionRules] Evaluando regla: dr-logic-001
📤 [DecisionRules] Request Body: { value1: 11 }
...
✅ [ServicioDecisionRules] Respuesta recibida: { value: 22 }
📥 [DecisionRules] Response: { value: 22 }
🔍 [DecisionRules] Evaluando condición: result.value < 6
✅ [DecisionRules] Resultado de condición: false
```

## 🔍 Diagnóstico de Problemas

### Problema: No veo ningún log

**Causa**: La regla no se está evaluando

**Solución**:
1. Verifica que el campo tenga una regla de DecisionRules configurada
2. Verifica que la regla tenga `tipo: 'decisionrules'`
3. Verifica que estés en la Vista Previa (no en el diseñador)

### Problema: Veo "ServicioDecisionRules no está configurado"

**Causa**: No se ha configurado la API Key

**Solución**:
1. Ve a Lógica → DecisionRules → Configuración
2. Ingresa tu API Key
3. Haz clic en "Guardar Configuración"
4. Recarga la página

### Problema: Veo "Regla DecisionRules sin ID configurado"

**Causa**: La regla no tiene `decisionRulesId`

**Solución**:
1. Edita la regla
2. Verifica que el campo "ID de Regla en DecisionRules" tenga un valor
3. Guarda

### Problema: Error 401 o 403 de la API

**Causa**: API Key inválida o sin permisos

**Solución**:
1. Verifica que tu API Key sea correcta
2. Verifica que sea el **Solver API Key** (no Management API Key)
3. Verifica que la regla exista en tu espacio de DecisionRules.io

### Problema: Error 404 de la API

**Causa**: Rule ID no existe

**Solución**:
1. Verifica que el Rule ID sea correcto
2. Verifica que la regla esté publicada en DecisionRules.io
3. Verifica que la versión exista

### Problema: La condición siempre retorna false

**Causa**: La condición no coincide con la respuesta

**Solución**:
1. Revisa el log de "Response" en la consola
2. Verifica que la condición coincida con la estructura de la respuesta
3. Ejemplo: Si la respuesta es `{ value: 14 }`, usa `result.value < 6`

## 📊 Flujo de Evaluación

```
Usuario cambia valor en Vista Previa
  ↓
watchEffect detecta cambio
  ↓
evaluarYActualizarCampos()
  ↓
Para cada campo:
  evaluarReglasCampo() (asíncrono)
    ↓
  Para cada regla del campo:
    ¿Es tipo 'decisionrules'?
      ↓ SÍ
    evaluarReglaDecisionRules()
      ↓
    ServicioDecisionRules.evaluarRegla()
      ↓
    DecisionRules API (solve)
      ↓
    Respuesta de la API
      ↓
    Evaluar condición con Function()
      ↓
    Retornar true/false
      ↓
  Aplicar acción (mostrar/ocultar/requerir/opcional)
    ↓
Campo actualizado en camposConLogica
  ↓
RenderizadorCampo renderiza con nuevo estado
```

## 🎯 Checklist de Verificación

- [ ] API Key configurada
- [ ] Configuración guardada en localStorage
- [ ] Vista Previa carga configuración al montar
- [ ] Campo tiene regla de DecisionRules
- [ ] Regla tiene `tipo: 'decisionrules'`
- [ ] Regla tiene `decisionRulesId`
- [ ] Regla tiene campos de entrada mapeados
- [ ] Regla tiene condición del resultado
- [ ] Consola muestra logs de evaluación
- [ ] API retorna respuesta exitosa
- [ ] Condición se evalúa correctamente
- [ ] Campo se muestra/oculta según resultado

## 💡 Tips

1. **Usa la consola**: Los logs te dirán exactamente qué está pasando
2. **Verifica la respuesta**: El log muestra la respuesta completa de la API
3. **Prueba la condición**: Usa la consola del navegador para probar tu condición:
   ```javascript
   const result = { value: 14 }
   console.log(result.value < 6) // false
   ```
4. **Recarga la página**: Si cambias la configuración, recarga para que se aplique
5. **Revisa el Rule ID**: Copia y pega desde DecisionRules.io para evitar errores

## 📞 Soporte

Si sigues teniendo problemas:

1. Copia todos los logs de la consola
2. Verifica tu configuración en DecisionRules.io
3. Prueba con el componente de ejemplo: `src/ejemplos/EjemploDecisionRules.vue`
4. Revisa la documentación: `DECISIONRULES_INTEGRATION.md`
