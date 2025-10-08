# 🔧 Fix: Filas Iniciales en Tablas

## 📋 Problema Identificado

El atributo "Filas iniciales" configurado en SeccionTabla no se aplicaba correctamente en la vista previa. La tabla siempre mostraba solo 1 fila independientemente de la configuración.

## 🎯 Causa Raíz

La función `obtenerFilasTabla()` en `RenderizadorCampo.vue` tenía una lógica incorrecta:

### ❌ Antes (Incorrecto):
```typescript
function obtenerFilasTabla(campo: EsquemaCampo): Record<string, unknown>[] {
  const valorActual = propiedades.valoresCampos[nombreCampo]

  if (Array.isArray(valorActual)) {
    return valorActual as Record<string, unknown>[]  // ❌ Incluía arrays vacíos
  }

  // Solo creaba filas iniciales si NO había valor
  const filasIniciales = Number(metadatos?.filas ?? 1)
  return Array.from({ length: filasIniciales }, () => crearFilaVaciaCampo(columnas))
}
```

**Problema**: Si el campo tenía un array vacío `[]`, no creaba las filas iniciales.

## ✅ Solución Implementada

### Función `obtenerFilasTabla()` Corregida:
```typescript
function obtenerFilasTabla(campo: EsquemaCampo): Record<string, unknown>[] {
  const nombreCampo = campo.nombre || ''
  if (!nombreCampo) return []

  const valorActual = propiedades.valoresCampos[nombreCampo]
  const metadatos = campo.metadatos as Record<string, unknown> | undefined
  const filasIniciales = Number(metadatos?.filas ?? 1)
  const columnas = obtenerColumnasTabla(campo)

  // ✅ Solo devolver array si tiene datos reales
  if (Array.isArray(valorActual) && valorActual.length > 0) {
    return valorActual as Record<string, unknown>[]
  }

  // ✅ Crear filas iniciales si no hay datos o array está vacío
  return Array.from({ length: filasIniciales }, () => crearFilaVaciaCampo(columnas))
}
```

### Función `agregarNuevaFilaCampo()` Mejorada:
```typescript
// ❌ Antes
function agregarNuevaFilaCampo(campo: EsquemaCampo): void {
  const valorActual = propiedades.valoresCampos[nombreCampo]
  
  if (Array.isArray(valorActual)) {
    nuevasFilas = [...valorActual, filaNueva]
  } else {
    nuevasFilas = [filaNueva]  // ❌ Solo 1 fila nueva
  }
}

// ✅ Ahora
function agregarNuevaFilaCampo(campo: EsquemaCampo): void {
  const filasActuales = obtenerFilasTabla(campo)  // ✅ Usa la lógica correcta
  const nuevasFilas = [...filasActuales, filaNueva]
}
```

### Nueva Función `puedeEliminarFila()`:
```typescript
function puedeEliminarFila(campo: EsquemaCampo): boolean {
  const filasActuales = obtenerFilasTabla(campo)
  const metadatos = campo.metadatos as Record<string, unknown> | undefined
  const filasMinimas = Math.max(1, Number(metadatos?.filas ?? 1))
  
  // ✅ Respeta la configuración de filas mínimas
  return filasActuales.length > filasMinimas
}
```

## 🎨 Comportamiento Corregido

### Escenario 1: Tabla Nueva
```
Configuración: Filas iniciales = 3
Estado: Campo sin valor

❌ Antes: Mostraba 1 fila
✅ Ahora: Muestra 3 filas vacías
```

### Escenario 2: Tabla con Datos
```
Configuración: Filas iniciales = 3
Estado: Campo con 2 filas de datos

❌ Antes: Mostraba 2 filas (correcto)
✅ Ahora: Muestra 2 filas (sin cambios)
```

### Escenario 3: Tabla Vacía (Array Vacío)
```
Configuración: Filas iniciales = 4
Estado: Campo con array vacío []

❌ Antes: Mostraba 0 filas
✅ Ahora: Muestra 4 filas vacías
```

### Escenario 4: Eliminar Filas
```
Configuración: Filas iniciales = 2
Estado: Tabla con 3 filas

❌ Antes: Podía eliminar hasta quedar 1 fila
✅ Ahora: Solo puede eliminar hasta quedar 2 filas (respeta mínimo)
```

## 📊 Casos de Prueba

### Test 1: Configurar Filas Iniciales
1. Crear campo tabla
2. Configurar "Filas iniciales" = 5
3. Ir a vista previa
4. ✅ Verificar que muestra 5 filas vacías

### Test 2: Cambiar Filas Iniciales
1. Tabla con 3 filas iniciales configuradas
2. Cambiar a 6 filas iniciales
3. Refrescar vista previa
4. ✅ Verificar que ahora muestra 6 filas

### Test 3: Agregar Fila con Filas Iniciales
1. Configurar 3 filas iniciales
2. En vista previa, hacer clic "Añadir fila"
3. ✅ Verificar que ahora hay 4 filas (3 iniciales + 1 nueva)

### Test 4: Eliminar Filas Respetando Mínimo
1. Configurar 3 filas iniciales
2. Habilitar "Eliminar filas"
3. Agregar 2 filas más (total: 5 filas)
4. Eliminar filas una por una
5. ✅ Verificar que se detiene en 3 filas (no permite eliminar más)

### Test 5: Array Vacío
1. Configurar 4 filas iniciales
2. Programáticamente establecer valor del campo como `[]`
3. ✅ Verificar que muestra 4 filas vacías

## 🔄 Flujo de Datos Corregido

```
1. Usuario configura "Filas iniciales" = N
   ↓
2. obtenerFilasTabla() verifica:
   - ¿Hay datos reales? → Devolver datos
   - ¿No hay datos o array vacío? → Crear N filas vacías
   ↓
3. Vista previa muestra N filas
   ↓
4. Usuario interactúa:
   - Añadir fila → N + 1 filas
   - Eliminar fila → Mínimo N filas (no menos)
```

## 📝 Archivos Modificados

### `src/paginas/disenador/componentes/RenderizadorCampo.vue`

1. **Función `obtenerFilasTabla()`**: Corregida lógica para arrays vacíos
2. **Función `agregarNuevaFilaCampo()`**: Usa `obtenerFilasTabla()` para consistencia
3. **Función `puedeEliminarFila()`**: Nueva función que respeta filas mínimas

## 🎯 Beneficios

1. **Consistencia**: Las filas iniciales se respetan siempre
2. **Predictibilidad**: El comportamiento es consistente entre diseñador y vista previa
3. **Flexibilidad**: Permite configurar diferentes números de filas iniciales
4. **Protección**: No permite eliminar por debajo del mínimo configurado

## ✅ Verificación

### En el Diseñador
El EnvolvedorCampo ya mostraba correctamente las filas iniciales:
```vue
<tr v-for="(fila, indice) in Array.from({ length: Number((campo.metadatos as any)?.filas || 1) })">
```

### En la Vista Previa
Ahora también respeta la configuración:
```typescript
// ✅ Crea el número correcto de filas iniciales
return Array.from({ length: filasIniciales }, () => crearFilaVaciaCampo(columnas))
```

## 🚀 Próximas Mejoras

### Sugerencias Futuras

1. **Validación de Rango**:
   ```vue
   <PrimeInputNumber 
     v-model="metadatos.filas" 
     :min="1" 
     :max="50"
     @update:model-value="validarFilasIniciales"
   />
   ```

2. **Filas Máximas**:
   ```typescript
   // Agregar configuración de filas máximas
   interface MetadatosTabla {
     filas: number        // Filas iniciales/mínimas
     filasMaximas?: number // Límite superior
   }
   ```

3. **Persistencia Inteligente**:
   ```typescript
   // Mantener datos al cambiar filas iniciales
   function ajustarFilasIniciales(nuevasFilas: number) {
     const filasActuales = obtenerFilasTabla(campo)
     if (filasActuales.length < nuevasFilas) {
       // Agregar filas vacías
     } else if (filasActuales.length > nuevasFilas) {
       // Preguntar si eliminar datos
     }
   }
   ```

## ✅ Conclusión

El problema de "Filas iniciales" está **completamente solucionado**:

- ✅ Las filas iniciales se respetan en la vista previa
- ✅ Los arrays vacíos se manejan correctamente
- ✅ La eliminación respeta el mínimo configurado
- ✅ El comportamiento es consistente entre diseñador y vista previa

**¡Listo para usar!** 🚀