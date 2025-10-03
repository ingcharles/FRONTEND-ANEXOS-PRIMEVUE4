# Configuración de Eventos en DecisionRules

## 📋 Descripción

Esta funcionalidad permite configurar **cuándo** se ejecutan las reglas de DecisionRules en la vista previa del formulario. Puedes elegir entre diferentes eventos del DOM para controlar el momento exacto de la evaluación.

## 🎯 Eventos Disponibles

### 1. **Al cambiar valor (change)** ⭐ *Recomendado*
- **Cuándo se ejecuta**: Cuando el usuario termina de editar y sale del campo
- **Ideal para**: La mayoría de casos de uso
- **Ventajas**: 
  - Balance perfecto entre rendimiento y experiencia de usuario
  - No hace llamadas innecesarias mientras el usuario escribe
  - Se ejecuta cuando el valor está completo
- **Ejemplo**: Usuario escribe "12345" y presiona Tab o hace clic fuera

### 2. **Al perder foco (blur)**
- **Cuándo se ejecuta**: Cuando el campo pierde el foco (usuario hace clic fuera)
- **Ideal para**: Validaciones que deben ejecutarse al salir del campo
- **Ventajas**:
  - Similar a "change" pero más específico
  - Útil para validaciones de formato
- **Ejemplo**: Usuario hace clic en otro campo

### 3. **Mientras escribe (input)**
- **Cuándo se ejecuta**: En tiempo real mientras el usuario escribe
- **Ideal para**: Búsquedas en tiempo real, autocompletado
- **⚠️ Advertencia**: 
  - Puede generar muchas llamadas a la API
  - Impacta el rendimiento
  - Solo usar cuando sea realmente necesario
- **Ejemplo**: Usuario escribe "1", "12", "123"... (3 llamadas)

## 🔧 Cómo Configurar

### En el Diseñador

1. Selecciona un campo en el diseñador
2. Ve a la pestaña **"Lógica"**
3. Cambia a **"DecisionRules"**
4. Haz clic en **"Añadir regla DecisionRules"**
5. Busca la sección **"¿Cuándo ejecutar la regla?"**
6. Selecciona el evento deseado del dropdown

### Configuración por Defecto

Si no se especifica, el evento por defecto es **"change"** (recomendado para la mayoría de casos).

## 📝 Ejemplos de Uso

### Ejemplo 1: Validación de Código Postal (change)
```
Campo: codigoPostal
Evento: change
Razón: Solo validar cuando el usuario termine de escribir
```

### Ejemplo 2: Búsqueda de Productos (input)
```
Campo: busquedaProducto
Evento: input
Razón: Mostrar resultados mientras el usuario escribe
⚠️ Considerar implementar debounce en el backend
```

### Ejemplo 3: Validación de Email (blur)
```
Campo: email
Evento: blur
Razón: Validar formato cuando el usuario salga del campo
```

### Ejemplo 4: Cálculo de Precio (change)
```
Campos: cantidad, precioUnitario
Evento: change
Acción: establecer-valor
Campos a Asignar: precioTotal
Razón: Calcular total cuando cambien los valores
```

## 🎨 Interfaz de Usuario

El selector de eventos muestra:
- **Icono**: 🔥 (bolt) para indicar que es una acción dinámica
- **Título**: "¿Cuándo ejecutar la regla?"
- **Opciones**: Dropdown con las 3 opciones
- **Descripción**: Cada opción muestra una descripción clara
- **Ayuda**: Texto explicativo debajo del selector

## 🔍 Comportamiento Técnico

### Flujo de Ejecución

1. Usuario interactúa con un campo de entrada
2. Se dispara el evento configurado (change/blur/input)
3. El sistema busca todas las reglas DecisionRules que:
   - Tienen ese campo en "Campos de Entrada"
   - Tienen el mismo tipo de evento configurado
4. Se ejecutan las reglas encontradas
5. Se actualizan los campos de salida según la configuración

### Optimizaciones

- Solo se ejecutan las reglas que coinciden con el evento
- No se ejecutan reglas si el campo no está configurado
- Los campos vacíos limpian automáticamente los campos de salida

## 💡 Mejores Prácticas

### ✅ Recomendaciones

1. **Usa "change" por defecto**: Es el balance perfecto
2. **Evita "input" a menos que sea necesario**: Puede sobrecargar la API
3. **Agrupa validaciones**: Si varios campos dependen entre sí, usa el mismo evento
4. **Documenta el comportamiento**: Agrega comentarios en reglas complejas

### ❌ Evitar

1. No uses "input" para cálculos complejos
2. No mezcles eventos sin razón clara
3. No olvides configurar el evento (usará "change" por defecto)

## 🐛 Debugging

Para ver qué eventos se están disparando, abre la consola del navegador:

```
🎯 [VistaPrevia] Evento change en campo: codigoPostal
   📋 Ejecutando 1 regla(s) DecisionRules para campo: ciudad
```

## 🔄 Compatibilidad

Esta funcionalidad es compatible con:
- ✅ Todos los tipos de campos de entrada (texto, número, select, etc.)
- ✅ Reglas simples y DecisionRules
- ✅ Múltiples campos de entrada
- ✅ Acción "establecer-valor"
- ✅ Otras acciones (mostrar/ocultar/requerir/opcional)

## 📚 Recursos Adicionales

- [Guía de DecisionRules](DECISIONRULES_README.md)
- [Ejemplos de Uso](DECISIONRULES_EJEMPLO_VISUAL.md)
- [Guía de Instalación](DECISIONRULES_INSTALACION.md)
