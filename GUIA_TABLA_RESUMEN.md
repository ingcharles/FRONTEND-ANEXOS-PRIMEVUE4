# 📊 Guía de Tabla Resumen

## ¿Qué es la Tabla Resumen?

La **Tabla Resumen** es un componente que permite calcular y mostrar valores automáticamente desde otras tablas del formulario. Es ideal para crear resúmenes de cotizaciones, facturas, reportes, etc.

## 🎯 Características

- ✅ **Cálculos automáticos**: Los valores se actualizan en tiempo real
- ✅ **Fórmulas flexibles**: Usa referencias a otras tablas y operaciones matemáticas
- ✅ **Operaciones de agregación**: sum, avg, count, min, max
- ✅ **Formato personalizado**: Prefijos, sufijos y decimales
- ✅ **Fácil configuración**: Interfaz visual intuitiva

## 🚀 Cómo Usar

### 1. Crear Tablas de Origen

Primero, crea las tablas normales que contendrán los datos:

```
Ejemplo: Tabla de Productos
- nombre: tabla_productos
- columnas:
  * producto (texto)
  * cantidad (numero)
  * precio_unitario (numero)
  * total (numero)
```

### 2. Agregar Tabla Resumen

Desde la paleta de componentes:
1. Ve a la categoría **"Datos"**
2. Arrastra **"Tabla Resumen"** al diseñador
3. Configura sus propiedades

### 3. Configurar Columnas

Define las columnas que mostrará la tabla resumen:

**Tipos de columna:**
- **Texto**: Para etiquetas fijas (ej: "Subtotal", "IVA")
- **Número**: Para valores numéricos estáticos
- **Calculado**: Para valores con fórmulas

### 4. Agregar Filas con Fórmulas

Cada fila representa un cálculo. Ejemplo:

```
Fila 1:
  concepto: "Subtotal"
  valor: "{tabla_productos.total.sum}"

Fila 2:
  concepto: "IVA (19%)"
  valor: "{tabla_productos.total.sum} * 0.19"

Fila 3:
  concepto: "Total"
  valor: "{tabla_productos.total.sum} * 1.19"
```

## 📝 Sintaxis de Fórmulas

### Formato Básico
```
{nombreTabla.nombreColumna.operacion}
```

### Operaciones Disponibles

| Operación | Descripción | Ejemplo |
|-----------|-------------|---------|
| `sum` | Suma todos los valores | `{tabla.precio.sum}` |
| `avg` | Promedio de valores | `{tabla.cantidad.avg}` |
| `count` | Cuenta elementos | `{tabla.producto.count}` |
| `min` | Valor mínimo | `{tabla.precio.min}` |
| `max` | Valor máximo | `{tabla.precio.max}` |

### Operaciones Matemáticas

Puedes combinar referencias con operaciones matemáticas:

```javascript
// Sumar dos tablas
{tabla1.total.sum} + {tabla2.total.sum}

// Calcular IVA
{tabla.subtotal.sum} * 0.19

// Calcular total con IVA
{tabla.subtotal.sum} * 1.19

// Operaciones complejas
({tabla1.total.sum} + {tabla2.total.sum}) * 1.19
```

## 💡 Ejemplos Completos

### Ejemplo 1: Cotización Simple

```json
{
  "columnas": [
    { "nombre": "concepto", "etiqueta": "Concepto", "tipo": "texto" },
    {
      "nombre": "valor",
      "etiqueta": "Valor",
      "tipo": "calculado",
      "formatoNumero": { "decimales": 2, "prefijo": "$ " }
    }
  ],
  "filas": [
    {
      "id": "subtotal",
      "valores": {
        "concepto": "Subtotal",
        "valor": "{tabla_productos.total.sum}"
      }
    },
    {
      "id": "iva",
      "valores": {
        "concepto": "IVA (19%)",
        "valor": "{tabla_productos.total.sum} * 0.19"
      }
    },
    {
      "id": "total",
      "valores": {
        "concepto": "Total",
        "valor": "{tabla_productos.total.sum} * 1.19"
      }
    }
  ]
}
```

### Ejemplo 2: Resumen Múltiples Tablas

```json
{
  "filas": [
    {
      "valores": {
        "concepto": "Productos",
        "valor": "{tabla_productos.precio.sum}"
      }
    },
    {
      "valores": {
        "concepto": "Servicios",
        "valor": "{tabla_servicios.precio.sum}"
      }
    },
    {
      "valores": {
        "concepto": "Total General",
        "valor": "{tabla_productos.precio.sum} + {tabla_servicios.precio.sum}"
      }
    }
  ]
}
```

### Ejemplo 3: Estadísticas

```json
{
  "filas": [
    {
      "valores": {
        "concepto": "Total de Items",
        "valor": "{tabla_productos.producto.count}"
      }
    },
    {
      "valores": {
        "concepto": "Precio Promedio",
        "valor": "{tabla_productos.precio.avg}"
      }
    },
    {
      "valores": {
        "concepto": "Precio Mínimo",
        "valor": "{tabla_productos.precio.min}"
      }
    },
    {
      "valores": {
        "concepto": "Precio Máximo",
        "valor": "{tabla_productos.precio.max}"
      }
    }
  ]
}
```

## 🎨 Personalización

### Formato de Números

Configura cómo se muestran los valores:

```json
{
  "formatoNumero": {
    "decimales": 2,
    "prefijo": "$ ",
    "sufijo": " USD"
  }
}
```

Resultado: `$ 1250.50 USD`

### Estilo de Tabla

```json
{
  "estiloTabla": {
    "bordered": true,
    "striped": true,
    "hover": true,
    "padding": "md"
  }
}
```

## 📦 Importar Ejemplo Completo

Usa el archivo `ejemplo-tabla-resumen.json` incluido:

1. Abre el diseñador
2. Haz clic en **"Importar JSON"**
3. Carga el archivo `ejemplo-tabla-resumen.json`
4. ¡Listo! Tendrás un ejemplo funcional completo

## 🔧 Panel de Configuración

### Agregar Columnas

1. Clic en **"Agregar Columna"**
2. Define:
   - Nombre técnico
   - Etiqueta visible
   - Tipo (texto, número, calculado)
   - Fórmula (si es calculado)
   - Formato de número

### Agregar Filas

1. Clic en **"Agregar Fila"**
2. Completa los valores para cada columna
3. Usa fórmulas en columnas calculadas

### Reordenar

Usa los botones ⬆️ ⬇️ para cambiar el orden de filas y columnas

## ⚠️ Consideraciones

1. **Nombres de Tabla**: Usa el nombre técnico de la tabla (el campo `nombre`)
2. **Validación**: El sistema valida la sintaxis de las fórmulas automáticamente
3. **Actualización**: Los cálculos se actualizan en tiempo real en vista previa
4. **Errores**: Si una referencia no existe, retorna 0

## 🐛 Solución de Problemas

### La fórmula no funciona

✅ Verifica que:
- El nombre de la tabla es correcto
- El nombre de la columna existe
- La operación es válida (sum, avg, count, min, max)
- Las llaves `{}` están correctamente cerradas

### Los valores no se actualizan

✅ Asegúrate de:
- Estar en **Vista Previa** (no en el diseñador)
- Haber guardado los cambios
- Las tablas de origen tienen datos

### Errores en operaciones matemáticas

✅ Revisa que:
- Usas operadores válidos: `+`, `-`, `*`, `/`, `()`
- Los paréntesis están balanceados
- No usas caracteres especiales no permitidos

## 💻 Código de Referencia

### Estructura de Metadatos

```typescript
{
  "metadatos": {
    "columnas": [
      {
        "nombre": "concepto",
        "etiqueta": "Concepto",
        "tipo": "texto" | "numero" | "calculado",
        "formula": "{tabla.columna.operacion}",
        "formatoNumero": {
          "decimales": 2,
          "prefijo": "$",
          "sufijo": ""
        }
      }
    ],
    "filas": [
      {
        "id": "fila_1",
        "valores": {
          "concepto": "Subtotal",
          "valor": "{tabla.total.sum}"
        }
      }
    ],
    "actualizacionAutomatica": true,
    "estiloTabla": {
      "bordered": true,
      "striped": false,
      "hover": false,
      "padding": "md"
    }
  }
}
```

## 📚 Recursos Adicionales

- Ver `ejemplo-tabla-resumen.json` para un ejemplo completo
- Revisar `EvaluadorFormulas.ts` para detalles técnicos
- Consultar `SeccionTablaResumen.vue` para el componente de configuración

---

¿Preguntas? Revisa los ejemplos incluidos o consulta la documentación del proyecto.

