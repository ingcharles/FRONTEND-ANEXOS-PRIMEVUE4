# 🔧 Solución: Eventos DecisionRules No Se Respetaban

## 🐛 Problema Identificado

Las reglas DecisionRules se ejecutaban en cada cambio reactivo de valores, ignorando la configuración de eventos (change/blur/input).

### Causa Raíz:
```typescript
// ❌ ANTES: watchEffect ejecutaba TODAS las reglas
watchEffect(() => {
  const _ = campos.value
  const __ = valores.value
  evaluarYActualizarCampos() // Ejecutaba DecisionRules también
})
```

## ✅ Solución Implementada

### 1. Separación de Lógica de Evaluación

#### Archivo: `src/utilidades/Logica.ts`

**Función Modificada: `evaluarReglasCampo`**
```typescript
// ✅ AHORA: Acepta opciones para controlar DecisionRules
export async function evaluarReglasCampo(
  campo: EsquemaCampo,
  valoresPorNombre: RegistroDatos,
  mapaIdNombre: Record<string, string>,
  opciones?: { incluirDecisionRules?: boolean } // ⭐ NUEVO
): Promise<EstadoEfectivoCampo>
```

**Nueva Función: `evaluarReglasDecisionRulesCampo`**
```typescript
// ✅ Evalúa solo reglas DecisionRules que coinciden con el evento
export async function evaluarReglasDecisionRulesCampo(
  campo: EsquemaCampo,
  valoresPorNombre: RegistroDatos,
  mapaIdNombre: Record<string, string>,
  nombreCampoEvento: string,
  tipoEvento: 'change' | 'blur' | 'input'
): Promise<EstadoEfectivoCampo>
```

### 2. Actualización de VistaPrevia

#### Archivo: `src/paginas/disenador/componentes/VistaPrevia.vue`

**Cambio 1: watchEffect solo evalúa reglas simples**
```typescript
// ✅ ANTES: evaluarYActualizarCampos()
// ✅ AHORA: evaluarYActualizarCamposSinDecisionRules()

async function evaluarYActualizarCamposSinDecisionRules() {
  const camposEvaluados = await Promise.all(
    camposOriginales.map(async (campo) => {
      // ⭐ Solo reglas simples, NO DecisionRules
      const estado = await evaluarReglasCampo(
        campo, 
        valoresActuales, 
        mapa, 
        { incluirDecisionRules: false } // ⭐ CLAVE
      )
      return { ...campo, visible: estado.visible, requerido: estado.requerido }
    })
  )
  camposConLogica.value = camposEvaluados
}

watchEffect(() => {
  const _ = campos.value
  const __ = valores.value
  evaluarYActualizarCamposSinDecisionRules() // ⭐ Solo reglas simples
})
```

**Cambio 2: manejarEventoCampo ejecuta DecisionRules específicas**
```typescript
async function manejarEventoCampo(
  nombreCampo: string, 
  tipoEvento: 'change' | 'blur' | 'input'
): Promise<void> {
  console.log(`🎯 [VistaPrevia] Evento ${tipoEvento} en campo: ${nombreCampo}`)

  const todosCampos = servicioEsquemas.aplanarCampos(campos.value, [])

  for (const campo of todosCampos) {
    // ⭐ Verificar si hay reglas que coinciden con este evento
    const tieneReglasParaEsteEvento = campo.logica.some(regla => {
      if (regla.tipo !== 'decisionrules') return false
      if (!regla.camposEntrada) return false

      const tieneElCampo = regla.camposEntrada.some(
        ce => ce.nombreCampo === nombreCampo
      )
      if (!tieneElCampo) return false

      const eventoRegla = regla.eventoEjecucion || 'change'
      return eventoRegla === tipoEvento // ⭐ Filtrar por evento
    })

    if (tieneReglasParaEsteEvento) {
      // ⭐ Evaluar solo las reglas que coinciden
      const estado = await evaluarReglasDecisionRulesCampo(
        campo, 
        valoresActuales, 
        mapa, 
        nombreCampo, 
        tipoEvento
      )

      // Actualizar el campo específico
      const indice = camposConLogica.value.findIndex(c => c.id === campo.id)
      if (indice !== -1) {
        camposConLogica.value[indice] = {
          ...camposConLogica.value[indice],
          visible: estado.visible,
          requerido: estado.requerido
        }
      }
    }
  }
}
```

## 🔄 Flujo Completo

### Antes (❌ Incorrecto)
```
1. Usuario escribe en campo
   ↓
2. watchEffect detecta cambio
   ↓
3. evaluarYActualizarCampos()
   ↓
4. ❌ Ejecuta TODAS las reglas (simples + DecisionRules)
   ↓
5. ❌ Ignora configuración de eventos
```

### Ahora (✅ Correcto)
```
1. Usuario escribe en campo
   ↓
2. watchEffect detecta cambio
   ↓
3. evaluarYActualizarCamposSinDecisionRules()
   ↓
4. ✅ Ejecuta SOLO reglas simples
   ↓
5. Usuario dispara evento (change/blur/input)
   ↓
6. manejarEventoCampo()
   ↓
7. ✅ Busca reglas DecisionRules que coinciden con el evento
   ↓
8. ✅ Ejecuta SOLO esas reglas específicas
```

## 📊 Comparación

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| Reglas simples | ✅ Reactivas | ✅ Reactivas |
| Reglas DecisionRules | ❌ Siempre reactivas | ✅ Solo con evento configurado |
| Respeta configuración de eventos | ❌ No | ✅ Sí |
| Llamadas innecesarias a API | ❌ Muchas | ✅ Solo las necesarias |
| Rendimiento | ❌ Bajo | ✅ Óptimo |

## 🎯 Ejemplos de Comportamiento

### Ejemplo 1: Evento "change"
```
Usuario escribe: "1" → "12" → "123"
❌ ANTES: 3 llamadas a DecisionRules
✅ AHORA: 0 llamadas mientras escribe

Usuario presiona Tab
✅ AHORA: 1 llamada a DecisionRules
```

### Ejemplo 2: Evento "blur"
```
Usuario escribe: "test@example.com"
❌ ANTES: Múltiples llamadas mientras escribe
✅ AHORA: 0 llamadas mientras escribe

Usuario hace clic fuera
✅ AHORA: 1 llamada a DecisionRules
```

### Ejemplo 3: Evento "input"
```
Usuario escribe: "a" → "ab" → "abc"
❌ ANTES: 3 llamadas (comportamiento correcto pero no configurable)
✅ AHORA: 3 llamadas (comportamiento correcto Y configurable)
```

### Ejemplo 4: Reglas Mixtas
```
Campo con:
- Regla simple: Mostrar si campo1 === "A"
- Regla DecisionRules: Calcular (evento: change)

Usuario cambia campo1 a "A"
✅ Regla simple se ejecuta inmediatamente (reactiva)
✅ Regla DecisionRules NO se ejecuta (esperando evento)

Usuario cambia campo de entrada de DecisionRules
✅ Regla simple se mantiene (reactiva)
✅ Regla DecisionRules NO se ejecuta (esperando evento "change")

Usuario presiona Tab en campo de entrada
✅ Regla DecisionRules se ejecuta AHORA
```

## 🧪 Verificación

### Logs de Consola

**Reglas Simples (siempre):**
```
🔍 [VistaPrevia] Evaluando campos (solo reglas simples)...
```

**Reglas DecisionRules (solo con evento):**
```
🎯 [VistaPrevia] Evento change en campo: codigoPostal
   📋 Evaluando reglas DecisionRules para campo: ciudad
✅ [VistaPrevia] Reglas DecisionRules ejecutadas para evento change
```

**Sin reglas para el evento:**
```
🎯 [VistaPrevia] Evento blur en campo: nombre
⏭️ [VistaPrevia] No hay reglas DecisionRules configuradas para evento blur en campo nombre
```

## ✅ Beneficios de la Solución

1. **Rendimiento Mejorado**: Solo se ejecutan las reglas necesarias
2. **Control Total**: El usuario decide cuándo ejecutar cada regla
3. **Separación de Responsabilidades**: Reglas simples vs DecisionRules
4. **Debugging Más Fácil**: Logs claros de qué se ejecuta y cuándo
5. **Experiencia de Usuario**: Comportamiento predecible y configurable

## 📚 Archivos Modificados

1. ✅ `src/utilidades/Logica.ts`
   - Agregado parámetro `opciones` a `evaluarReglasCampo`
   - Nueva función `evaluarReglasDecisionRulesCampo`

2. ✅ `src/paginas/disenador/componentes/VistaPrevia.vue`
   - Renombrado `evaluarYActualizarCampos` → `evaluarYActualizarCamposSinDecisionRules`
   - Modificado `watchEffect` para excluir DecisionRules
   - Actualizado `manejarEventoCampo` para filtrar por evento

3. ✅ `src/interfaces/Validacion.ts`
   - Agregado campo `eventoEjecucion` a `ReglaLogica`

4. ✅ `src/paginas/disenador/componentes/propiedades/TabDecisionRules.vue`
   - Agregado selector de eventos en la UI

5. ✅ `src/paginas/disenador/componentes/RenderizadorCampo.vue`
   - Agregados eventos `@change`, `@blur`, `@input` a campos

## 🚀 Próximos Pasos

1. ✅ Probar con casos reales
2. ✅ Verificar logs en consola
3. ✅ Confirmar que no hay regresiones
4. ✅ Documentar casos de uso
5. ⏭️ Considerar agregar debounce para evento "input"

## 💡 Notas Importantes

- Las reglas simples siguen siendo reactivas (comportamiento esperado)
- Las reglas DecisionRules solo se ejecutan con el evento configurado
- El valor por defecto es "change" si no se especifica
- Los campos vacíos limpian automáticamente los campos de salida
- Los logs ayudan a debuggear qué se está ejecutando
