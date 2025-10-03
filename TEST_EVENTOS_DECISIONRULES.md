# 🧪 Pruebas: Configuración de Eventos DecisionRules

## ✅ Checklist de Pruebas

### 1. Configuración Básica

- [ ] El selector "¿Cuándo ejecutar la regla?" aparece en TabDecisionRules
- [ ] Muestra 3 opciones: change, blur, input
- [ ] Cada opción muestra su descripción
- [ ] El valor por defecto es "change"

### 2. Evento "change" (Al cambiar valor)

#### Configuración de Prueba:
```
Campo de entrada: codigoPostal (tipo: texto)
Regla DecisionRules: validar-codigo-postal
Evento: change
Campos a Asignar: ciudad
```

#### Pasos:
1. Abrir vista previa
2. Escribir "28001" en codigoPostal
3. **NO** hacer clic fuera todavía
4. Verificar que ciudad NO se actualiza mientras escribes
5. Presionar Tab o hacer clic fuera
6. ✅ Verificar que ciudad se actualiza AHORA

#### Logs Esperados:
```
🎯 [VistaPrevia] Evento change en campo: codigoPostal
   📋 Evaluando reglas DecisionRules para campo: ciudad
✅ [VistaPrevia] Reglas DecisionRules ejecutadas para evento change
```

### 3. Evento "blur" (Al perder foco)

#### Configuración de Prueba:
```
Campo de entrada: email (tipo: email)
Regla DecisionRules: validar-email
Evento: blur
Campos a Asignar: emailValido
```

#### Pasos:
1. Abrir vista previa
2. Escribir "test@example.com" en email
3. Hacer clic en otro campo
4. ✅ Verificar que emailValido se actualiza

#### Logs Esperados:
```
🎯 [VistaPrevia] Evento blur en campo: email
   📋 Evaluando reglas DecisionRules para campo: emailValido
✅ [VistaPrevia] Reglas DecisionRules ejecutadas para evento blur
```

### 4. Evento "input" (Mientras escribe)

#### Configuración de Prueba:
```
Campo de entrada: busqueda (tipo: texto)
Regla DecisionRules: buscar-productos
Evento: input
Campos a Asignar: resultados
```

#### Pasos:
1. Abrir vista previa
2. Escribir "a" en busqueda
3. ✅ Verificar que se ejecuta la regla inmediatamente
4. Escribir "b" (ahora es "ab")
5. ✅ Verificar que se ejecuta la regla nuevamente
6. Escribir "c" (ahora es "abc")
7. ✅ Verificar que se ejecuta la regla nuevamente

#### Logs Esperados (3 veces):
```
🎯 [VistaPrevia] Evento input en campo: busqueda
   📋 Evaluando reglas DecisionRules para campo: resultados
✅ [VistaPrevia] Reglas DecisionRules ejecutadas para evento input
```

### 5. Múltiples Reglas con Diferentes Eventos

#### Configuración de Prueba:
```
Campo: cantidad
Regla 1: calcular-precio (evento: change)
Regla 2: validar-stock (evento: blur)
```

#### Pasos:
1. Escribir "5" en cantidad
2. ✅ Verificar que NO se ejecuta ninguna regla mientras escribes
3. Presionar Tab
4. ✅ Verificar que se ejecuta "calcular-precio" (change)
5. Hacer clic en cantidad nuevamente
6. Hacer clic fuera
7. ✅ Verificar que se ejecuta "validar-stock" (blur)

### 6. Limpieza de Campos Vacíos

#### Configuración de Prueba:
```
Campo de entrada: codigoPostal
Regla DecisionRules: validar-codigo-postal
Evento: change
Campos a Asignar: ciudad, estado
```

#### Pasos:
1. Escribir "28001" en codigoPostal
2. Presionar Tab
3. ✅ Verificar que ciudad y estado se llenan
4. Borrar todo el contenido de codigoPostal
5. Presionar Tab
6. ✅ Verificar que ciudad y estado se limpian automáticamente

#### Logs Esperados:
```
🧹 [DecisionRules] Campo(s) de entrada vacío(s) - Limpiando campos de salida
   🧹 Limpiando: ciudad
   🧹 Limpiando: estado
```

### 7. Reglas Simples + DecisionRules

#### Configuración de Prueba:
```
Campo: resultado
Regla Simple: Mostrar si campo1 === "A"
Regla DecisionRules: calcular (evento: change, campo entrada: campo2)
```

#### Pasos:
1. Cambiar campo1 a "A"
2. ✅ Verificar que resultado se muestra (regla simple)
3. Cambiar campo2 a "10"
4. Presionar Tab
5. ✅ Verificar que se ejecuta la regla DecisionRules
6. Cambiar campo1 a "B"
7. ✅ Verificar que resultado se oculta (regla simple)
8. ✅ Verificar que la regla DecisionRules NO se ejecutó

### 8. Sin Evento Configurado (Default)

#### Configuración de Prueba:
```
Campo de entrada: precio
Regla DecisionRules: calcular-impuesto
Evento: (no configurado, debe usar "change" por defecto)
```

#### Pasos:
1. Escribir "100" en precio
2. Presionar Tab
3. ✅ Verificar que se ejecuta con evento "change"

### 9. Evento Incorrecto No Ejecuta

#### Configuración de Prueba:
```
Campo de entrada: nombre
Regla DecisionRules: validar-nombre
Evento: blur
```

#### Pasos:
1. Escribir "Juan" en nombre
2. Presionar Tab (dispara "change")
3. ✅ Verificar que NO se ejecuta la regla
4. Hacer clic en nombre
5. Hacer clic fuera (dispara "blur")
6. ✅ Verificar que AHORA se ejecuta la regla

#### Logs Esperados (paso 2):
```
🎯 [VistaPrevia] Evento change en campo: nombre
⏭️ [VistaPrevia] No hay reglas DecisionRules configuradas para evento change en campo nombre
```

#### Logs Esperados (paso 5):
```
🎯 [VistaPrevia] Evento blur en campo: nombre
   📋 Evaluando reglas DecisionRules para campo: resultado
✅ [VistaPrevia] Reglas DecisionRules ejecutadas para evento blur
```

## 🐛 Problemas Comunes

### Problema 1: La regla se ejecuta en cada cambio
**Síntoma**: La regla DecisionRules se ejecuta mientras escribo, aunque configuré "change"

**Causa**: El watchEffect está ejecutando todas las reglas

**Solución**: Verificar que se está usando `evaluarYActualizarCamposSinDecisionRules()` en el watchEffect

### Problema 2: La regla nunca se ejecuta
**Síntoma**: No se ejecuta la regla DecisionRules al disparar el evento

**Causa**: El campo de entrada no está en "Campos de Entrada" de la regla

**Solución**: Verificar que el campo está correctamente configurado en "Campos de Entrada"

### Problema 3: Se ejecutan todas las reglas
**Síntoma**: Se ejecutan reglas con eventos diferentes

**Causa**: No se está filtrando por tipo de evento

**Solución**: Verificar que `evaluarReglasDecisionRulesCampo` está filtrando correctamente

## 📊 Métricas de Rendimiento

### Evento "change" (Recomendado)
- ✅ Llamadas a API: 1 por cambio completo
- ✅ Experiencia de usuario: Excelente
- ✅ Rendimiento: Óptimo

### Evento "blur"
- ✅ Llamadas a API: 1 por pérdida de foco
- ✅ Experiencia de usuario: Muy buena
- ✅ Rendimiento: Óptimo

### Evento "input"
- ⚠️ Llamadas a API: 1 por cada carácter
- ⚠️ Experiencia de usuario: Puede ser lenta
- ⚠️ Rendimiento: Puede sobrecargar la API

## ✅ Criterios de Éxito

1. ✅ Las reglas simples se evalúan reactivamente
2. ✅ Las reglas DecisionRules solo se ejecutan con el evento configurado
3. ✅ Los campos vacíos limpian automáticamente los campos de salida
4. ✅ Múltiples reglas con diferentes eventos funcionan correctamente
5. ✅ El valor por defecto es "change"
6. ✅ Los logs muestran claramente qué se está ejecutando

## 🎯 Próximos Pasos

Si todas las pruebas pasan:
1. Documentar casos de uso reales
2. Crear ejemplos en la documentación
3. Agregar tooltips con mejores prácticas
4. Considerar agregar debounce para evento "input"
