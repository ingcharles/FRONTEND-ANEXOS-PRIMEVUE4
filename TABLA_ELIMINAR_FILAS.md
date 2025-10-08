# 🗑️ Funcionalidad: Eliminar Filas en Tablas

## 📋 Descripción

Nueva funcionalidad que permite a los usuarios eliminar filas de las tablas en formularios, similar a la funcionalidad existente de "Permitir añadir filas".

## ✅ Archivos Modificados

### 1. SeccionTabla.vue
**Ubicación**: `src/paginas/disenador/componentes/propiedades/SeccionTabla.vue`

**Cambio**: Agregado checkbox "Permitir eliminar filas"

```vue
<!-- Permitir eliminar filas -->
<div class="field">
  <label class="inline-flex align-items-center gap-2">
    <Checkbox binary :model-value="Boolean(metadatos.eliminarFilas)"
      @update:model-value="(v: boolean) => actualizarMetadato('eliminarFilas', v)" />
    Permitir eliminar filas
  </label>
</div>
```

### 2. RenderizadorCampo.vue
**Ubicación**: `src/paginas/disenador/componentes/RenderizadorCampo.vue`

**Cambios**:

#### A. Columna de Acciones en Header
```vue
<!-- Columna de acciones si se permite eliminar filas -->
<th v-if="permitirEliminarFilas(campo)" :class="[
  'text-center',
  claseRellenoCelda(campo),
  obtenerEstiloTabla(campo).conBordes ? 'border-inferior-1' : ''
]" style="width: 60px;">
  Acciones
</th>
```

#### B. Botón Eliminar en cada Fila
```vue
<!-- Columna de acciones para eliminar fila -->
<td v-if="permitirEliminarFilas(campo)" :class="[clasesCeldaTabla(campo), 'text-center']">
  <PrimeButton 
    icon="pi pi-trash" 
    severity="danger" 
    size="small" 
    text 
    rounded
    :disabled="campo.deshabilitado || !puedeEliminarFila(campo)"
    @click="eliminarFilaCampo(campo, indiceFila)"
    v-tooltip.top="'Eliminar fila'"
  />
</td>
```

#### C. Celda Vacía en Footer
```vue
<!-- Celda vacía para la columna de acciones -->
<td v-if="permitirEliminarFilas(campo)" :class="[claseRellenoCelda(campo)]"></td>
```

#### D. Nuevas Funciones JavaScript
```typescript
function permitirEliminarFilas(campo: EsquemaCampo): boolean {
  const metadatos = campo.metadatos as Record<string, unknown> | undefined
  return Boolean(metadatos?.eliminarFilas)
}

function puedeEliminarFila(campo: EsquemaCampo): boolean {
  const filasActuales = obtenerFilasTabla(campo)
  // Permitir eliminar si hay más de 1 fila
  return filasActuales.length > 1
}

function eliminarFilaCampo(campo: EsquemaCampo, indiceFila: number): void {
  const nombreCampo = campo.nombre || ''
  if (!nombreCampo) return

  const filasActuales = obtenerFilasTabla(campo)
  
  // No permitir eliminar si solo hay una fila
  if (filasActuales.length <= 1) {
    return
  }

  // Crear nueva lista sin la fila eliminada
  const nuevasFilas = filasActuales.filter((_, indice) => indice !== indiceFila)

  // Emitir el cambio al componente padre
  emit('valor-cambiado', nombreCampo, nuevasFilas)
}
```

## 🎨 Interfaz de Usuario

### En el Diseñador

#### Configuración de Tabla
```
┌─────────────────────────────────────────────────────┐
│ Configuración General                                │
├─────────────────────────────────────────────────────┤
│ ☑️ Permitir añadir filas                            │
│ ☑️ Permitir eliminar filas                          │ ← NUEVO
│                                                      │
│ Filas iniciales: [1]                               │
└─────────────────────────────────────────────────────┘
```

### En la Vista Previa/Formulario

#### Tabla sin Eliminar Filas
```
┌─────────────────────────────────────────────────────┐
│ Nombre    │ Email              │ Edad               │
├─────────────────────────────────────────────────────┤
│ [Juan   ] │ [juan@email.com  ] │ [25]              │
│ [María  ] │ [maria@email.com ] │ [30]              │
└─────────────────────────────────────────────────────┘
[+ Añadir fila]
```

#### Tabla con Eliminar Filas Habilitado
```
┌─────────────────────────────────────────────────────┐
│ Nombre    │ Email              │ Edad    │ Acciones │ ← NUEVO
├─────────────────────────────────────────────────────┤
│ [Juan   ] │ [juan@email.com  ] │ [25]   │ [🗑️]    │ ← NUEVO
│ [María  ] │ [maria@email.com ] │ [30]   │ [🗑️]    │ ← NUEVO
└─────────────────────────────────────────────────────┘
[+ Añadir fila]
```

## 🔧 Comportamiento

### Reglas de Negocio

1. **Mínimo de Filas**: Siempre debe haber al menos 1 fila
   - El botón eliminar se deshabilita cuando solo hay 1 fila
   - `puedeEliminarFila()` retorna `false` si `filasActuales.length <= 1`

2. **Estado del Campo**: El botón se deshabilita si el campo está deshabilitado
   - `:disabled="campo.deshabilitado || !puedeEliminarFila(campo)"`

3. **Columna de Acciones**: Solo aparece si `eliminarFilas` está habilitado
   - Header, celdas y footer se ajustan automáticamente

### Flujo de Eliminación

```
1. Usuario hace clic en botón 🗑️
   ↓
2. Se ejecuta eliminarFilaCampo(campo, indiceFila)
   ↓
3. Se verifica que hay más de 1 fila
   ↓
4. Se filtra la fila del array: 
   nuevasFilas = filasActuales.filter((_, indice) => indice !== indiceFila)
   ↓
5. Se emite el cambio:
   emit('valor-cambiado', nombreCampo, nuevasFilas)
   ↓
6. El componente padre actualiza los valores
   ↓
7. La tabla se re-renderiza sin la fila eliminada
```

## 🎯 Casos de Uso

### Caso 1: Lista de Contactos
```
Configuración:
- Permitir añadir filas: ✅
- Permitir eliminar filas: ✅
- Filas iniciales: 1

Comportamiento:
- Usuario puede agregar contactos
- Usuario puede eliminar contactos
- Siempre queda al menos 1 fila
```

### Caso 2: Tabla de Solo Lectura
```
Configuración:
- Permitir añadir filas: ❌
- Permitir eliminar filas: ❌
- Filas iniciales: 3

Comportamiento:
- Tabla fija con 3 filas
- No se pueden agregar ni eliminar filas
- Solo editar contenido
```

### Caso 3: Solo Agregar (Histórico)
```
Configuración:
- Permitir añadir filas: ✅
- Permitir eliminar filas: ❌
- Filas iniciales: 1

Comportamiento:
- Se pueden agregar filas
- No se pueden eliminar (para mantener histórico)
- Útil para logs o registros
```

### Caso 4: Solo Eliminar (Lista Predefinida)
```
Configuración:
- Permitir añadir filas: ❌
- Permitir eliminar filas: ✅
- Filas iniciales: 5

Comportamiento:
- Lista predefinida de 5 elementos
- Se pueden eliminar elementos no deseados
- No se pueden agregar nuevos
```

## 🧪 Testing

### Test 1: Configuración en Diseñador
1. Crear campo tabla
2. Ir a propiedades → Configuración General
3. ✅ Verificar que aparece checkbox "Permitir eliminar filas"
4. Activar checkbox
5. ✅ Verificar que se guarda en metadatos

### Test 2: Renderizado con Eliminar Habilitado
1. Configurar tabla con eliminar filas habilitado
2. Ir a vista previa
3. ✅ Verificar que aparece columna "Acciones"
4. ✅ Verificar que cada fila tiene botón 🗑️

### Test 3: Eliminar Fila
1. Tabla con 2+ filas
2. Hacer clic en botón 🗑️ de una fila
3. ✅ Verificar que la fila se elimina
4. ✅ Verificar que los datos se actualizan

### Test 4: Protección Mínimo de Filas
1. Tabla con 1 sola fila
2. ✅ Verificar que botón 🗑️ está deshabilitado
3. Agregar segunda fila
4. ✅ Verificar que ambos botones se habilitan
5. Eliminar una fila
6. ✅ Verificar que el botón restante se deshabilita

### Test 5: Campo Deshabilitado
1. Configurar tabla con eliminar habilitado
2. Deshabilitar el campo completo
3. ✅ Verificar que botones 🗑️ están deshabilitados

### Test 6: Compatibilidad con Agregaciones
1. Configurar tabla con:
   - Eliminar filas habilitado
   - Columnas con agregaciones (sum, avg, etc.)
2. Eliminar filas
3. ✅ Verificar que agregaciones se recalculan
4. ✅ Verificar que footer mantiene formato

## 🔄 Compatibilidad

### ✅ Compatible con:
- Todas las funcionalidades existentes de tabla
- Agregaciones (sum, avg, count, min, max)
- Estilos de tabla (bordes, zebra, hover, padding)
- Validaciones de columna
- Diferentes tipos de columna (texto, número, fecha)
- Reglas de lógica
- DecisionRules
- Dependencias entre campos

### ✅ Funciona en:
- Vista Previa del Diseñador
- Página de Usuario Final (/formulario)
- Formularios importados desde JSON

## 📊 Estructura de Datos

### Metadatos del Campo
```typescript
interface MetadatosCampo {
  // ... propiedades existentes
  agregarFilas?: boolean    // Existente
  eliminarFilas?: boolean   // ✨ NUEVO
  filas?: number           // Existente
}
```

### JSON del Formulario
```json
{
  "campos": [
    {
      "tipo": "tabla",
      "nombre": "contactos",
      "metadatos": {
        "agregarFilas": true,
        "eliminarFilas": true,    // ✨ NUEVO
        "filas": 1,
        "columnas": [...]
      }
    }
  ]
}
```

## 🎨 Estilos

### Botón Eliminar
- **Icono**: `pi pi-trash`
- **Severidad**: `danger` (rojo)
- **Tamaño**: `small`
- **Estilo**: `text` (sin fondo) + `rounded`
- **Tooltip**: "Eliminar fila"

### Columna de Acciones
- **Ancho**: `60px` (fijo)
- **Alineación**: `text-center`
- **Header**: "Acciones"

## 🚀 Próximas Mejoras

### Sugerencias para el Futuro

1. **Confirmación de Eliminación**
   ```typescript
   // Agregar modal de confirmación
   function eliminarFilaCampo(campo, indiceFila) {
     if (confirm('¿Estás seguro de eliminar esta fila?')) {
       // ... lógica actual
     }
   }
   ```

2. **Eliminación Múltiple**
   ```vue
   <!-- Checkbox para seleccionar filas -->
   <td><Checkbox v-model="filasSeleccionadas[indiceFila]" /></td>
   
   <!-- Botón eliminar seleccionadas -->
   <PrimeButton label="Eliminar Seleccionadas" @click="eliminarFilasSeleccionadas" />
   ```

3. **Reordenar Filas**
   ```vue
   <!-- Drag handle para reordenar -->
   <td><i class="pi pi-bars drag-handle"></i></td>
   ```

4. **Configuración de Mínimo de Filas**
   ```vue
   <!-- En SeccionTabla.vue -->
   <label>Mínimo de filas</label>
   <PrimeInputNumber v-model="metadatos.minimoFilas" :min="1" />
   ```

## ✅ Conclusión

La funcionalidad "Eliminar filas" está **completamente implementada** y lista para usar:

- ✅ Configuración en el diseñador
- ✅ Renderizado en vista previa
- ✅ Funcionalidad en formularios de usuario final
- ✅ Protecciones de seguridad (mínimo 1 fila)
- ✅ Compatibilidad con todas las funcionalidades existentes
- ✅ Estilos consistentes con el diseño

**¡Listo para producción!** 🚀