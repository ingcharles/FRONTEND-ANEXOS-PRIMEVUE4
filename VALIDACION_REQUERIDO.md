# Funcionalidad de Validación Requerido

## Descripción
Se ha implementado la funcionalidad para que cuando se añade una validación "requerido" en la sección de validaciones:

1. **En el diseñador**: Se muestra un asterisco (*) de color rojo junto a la etiqueta del campo
2. **En la vista previa**: Se muestra el mensaje de error configurado cuando se hace click en "enviar" y el campo está vacío

## Características Implementadas

### 1. Sincronización Automática
- Al añadir una validación "requerido", automáticamente se marca el campo como `requerido: true`
- Al eliminar la validación "requerido", se desmarca el campo como `requerido: false`
- Si hay múltiples validaciones "requerido", solo se desmarca cuando se eliminan todas

### 2. Asterisco Rojo en el Diseñador
- Se muestra un asterisco (*) rojo en todos los tipos de campo cuando tienen validación requerido
- El asterisco aparece tanto si el campo tiene `requerido: true` como si tiene una validación de tipo "requerido"

### 3. Mensaje de Error Personalizado
- En la vista previa, se usa el mensaje configurado en la validación "requerido"
- Si no se configura mensaje, se usa el mensaje por defecto: "Este campo es obligatorio"

### 4. Texto de Ayuda
- En la configuración de validaciones, se muestra un texto de ayuda explicando que el mensaje se mostrará cuando el campo esté vacío

## Archivos Modificados

### `TabValidacion.vue`
- Añadida sincronización automática de la propiedad `requerido`
- Añadido watcher para sincronizar al cambiar de campo
- Añadido texto de ayuda para validación requerido
- Añadido data-testid para pruebas

### `EnvolvedorCampo.vue`
- Añadido computed `esCampoRequerido` que verifica tanto la propiedad como las validaciones
- Actualizado todos los templates para usar el nuevo computed

### `ServicioValidacion.ts`
- Modificado para usar el mensaje personalizado de la validación "requerido"
- Mejorado el manejo del mensaje por defecto
- Añadido preprocessing para manejar valores undefined/null correctamente

### `ServicioEsquemas.ts`
- Corregido el manejo de valores undefined/null en campos de texto
- Actualizado para usar mensajes personalizados de validación requerido
- Mejorado el preprocessing de valores para evitar errores de tipo

### `RenderizadorCampo.vue`
- Mejorado el estilo del mensaje de error (añadido text-sm)

## Pruebas
Se han añadido pruebas unitarias que verifican:
- Que se añade correctamente la validación y se sincroniza la propiedad requerido
- Que se muestra el asterisco rojo en el diseñador
- Que se elimina correctamente la validación y se actualiza la propiedad
- Que los servicios de validación manejan correctamente valores undefined/null
- Que se muestran los mensajes personalizados de error
- Que los campos opcionales permiten valores vacíos

## Uso

1. **Añadir validación requerido**:
   - Seleccionar un campo en el diseñador
   - Ir a la pestaña "Validación"
   - Hacer click en el botón "Requerido"
   - Configurar el mensaje de error personalizado (opcional)

2. **Verificar en el diseñador**:
   - El campo debe mostrar un asterisco (*) rojo junto a su etiqueta

3. **Probar en vista previa**:
   - Ir a la vista previa
   - Dejar el campo vacío
   - Hacer click en "Enviar"
   - Debe aparecer el mensaje de error configurado

## Compatibilidad
- La funcionalidad es compatible con todos los tipos de campo existentes
- Mantiene compatibilidad con campos que ya tenían `requerido: true` configurado manualmente
- No afecta el comportamiento de otras validaciones
- Corregido el manejo de valores undefined/null que causaba errores en la vista previa

## Correcciones Realizadas
- **Problema**: Al presionar "enviar" con campos vacíos aparecía "Invalid input: expected string, received undefined"
- **Solución**: Añadido preprocessing en ambos servicios de validación para convertir undefined/null a string vacío antes de aplicar validaciones
- **Resultado**: Ahora se muestra correctamente el mensaje personalizado de validación requerido