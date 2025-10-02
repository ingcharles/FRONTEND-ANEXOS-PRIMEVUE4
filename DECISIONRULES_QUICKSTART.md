# DecisionRules.io - Guía Rápida

## 🚀 Inicio Rápido

### 1. Configuración Inicial (5 minutos)

#### Paso 1: Obtener API Key
1. Ve a [DecisionRules.io](https://app.decisionrules.io)
2. Crea una cuenta o inicia sesión
3. Ve a Settings → API Keys
4. Copia tu API Key

#### Paso 2: Configurar en el Diseñador
1. Abre el diseñador de formularios
2. Selecciona cualquier campo
3. Ve a la pestaña **"Lógica"**
4. Haz clic en **"DecisionRules"**
5. Expande **"Configuración DecisionRules"**
6. Pega tu API Key
7. Haz clic en **"Guardar Configuración"**

✅ ¡Listo! Ya puedes usar DecisionRules en tu formulario.

---

## 📝 Ejemplo Básico: Mostrar campo según edad

### En DecisionRules.io:

1. Crea una nueva **Decision Table**
2. Configura:
   - **Input**: `edad` (Number)
   - **Output**: `mostrarCampo` (Boolean)
3. Agrega la regla:
   ```
   SI edad < 18 ENTONCES mostrarCampo = true
   SI edad >= 18 ENTONCES mostrarCampo = false
   ```
4. Publica la regla y copia el **Rule ID**

### En el Diseñador:

1. Crea dos campos:
   - Campo 1: "Edad" (tipo: Número, nombre: `edad`)
   - Campo 2: "Tutor Legal" (tipo: Texto, nombre: `tutorLegal`)

2. Selecciona el campo "Tutor Legal"

3. Ve a **Lógica → DecisionRules → Añadir regla**

4. Configura:
   - **ID de Regla**: `[pega el Rule ID copiado]`
   - **Versión**: `1`
   - **Acción**: `Mostrar`
   - **Campos de Entrada**:
     - Haz clic en "Añadir campo"
     - Campo del Formulario: `edad`
     - Clave en DecisionRules: `edad`
   - **Condición del Resultado**: `result.mostrarCampo === true`

5. Guarda el formulario

6. Ve a **Vista Previa** y prueba:
   - Ingresa edad < 18 → El campo "Tutor Legal" aparece
   - Ingresa edad >= 18 → El campo "Tutor Legal" desaparece

---

## 🎯 Casos de Uso Comunes

### 1. Validación de Descuentos

```javascript
// En DecisionRules:
Inputs: tipoCliente, montoCompra
Output: aplicarDescuento, porcentajeDescuento

// En el Diseñador:
Campos de Entrada:
  - tipoCliente → tipoCliente
  - montoCompra → montoCompra

Condición: result.aplicarDescuento === true
```

### 2. Aprobación Multinivel

```javascript
// En DecisionRules:
Inputs: monto, departamento, antiguedad
Output: requiereAprobacion, nivelAprobador

// En el Diseñador:
Campos de Entrada:
  - monto → monto
  - departamento → departamento
  - antiguedad → antiguedad

Condición: result.requiereAprobacion === true && result.nivelAprobador === 'gerente'
```

### 3. Cálculo de Precios Dinámicos

```javascript
// En DecisionRules:
Inputs: producto, cantidad, region, temporada
Output: precioFinal, descuentoAplicado

// En el Diseñador:
Campos de Entrada:
  - producto → producto
  - cantidad → cantidad
  - region → region
  - temporada → temporada

Condición: result.precioFinal > 0
```

---

## 🔧 Acciones Disponibles

| Acción | Descripción | Ejemplo |
|--------|-------------|---------|
| **Mostrar** | Muestra el campo si la condición es verdadera | Mostrar "Tutor Legal" si edad < 18 |
| **Ocultar** | Oculta el campo si la condición es verdadera | Ocultar "Descuento" si no es VIP |
| **Requerir** | Hace el campo obligatorio | Requerir "Justificación" si monto > 10000 |
| **Opcional** | Hace el campo opcional | Hacer opcional "Teléfono" si tiene email |

---

## 💡 Tips y Trucos

### 1. Múltiples Campos de Entrada
Puedes enviar todos los campos que necesites:
```javascript
Campos de Entrada:
  - nombre → customerName
  - edad → customerAge
  - ciudad → customerCity
  - ingresos → monthlyIncome
```

### 2. Condiciones Complejas
Usa JavaScript en la condición del resultado:
```javascript
// Verificar múltiples valores
result.aprobado === true && result.puntuacion > 75

// Verificar rangos
result.descuento >= 10 && result.descuento <= 50

// Verificar existencia
result.mensaje !== undefined && result.mensaje !== ''
```

### 3. Debugging
Para ver qué está retornando DecisionRules:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña Console
3. Verás los logs de las llamadas a DecisionRules

### 4. Versiones
Usa versiones para mantener compatibilidad:
- Versión 1: Regla inicial
- Versión 2: Regla mejorada
- Puedes cambiar entre versiones sin modificar el formulario

---

## 🐛 Solución de Problemas

### ❌ "ServicioDecisionRules no está configurado"
**Solución**: Configura tu API Key en Lógica → DecisionRules → Configuración

### ❌ "Regla DecisionRules sin ID configurado"
**Solución**: Asegúrate de pegar el Rule ID en el campo "ID de Regla"

### ❌ La regla no se ejecuta
**Solución**: 
1. Verifica que los nombres de los campos coincidan
2. Revisa la condición del resultado
3. Verifica que la regla esté publicada en DecisionRules.io

### ❌ "Error al evaluar regla"
**Solución**:
1. Verifica tu API Key
2. Verifica que el Rule ID sea correcto
3. Verifica que la versión exista

---

## 📚 Recursos

- [Documentación Completa](./DECISIONRULES_INTEGRATION.md)
- [DecisionRules Docs](https://docs.decisionrules.io)
- [Ejemplo de Prueba](./src/ejemplos/EjemploDecisionRules.vue)

---

## 🎓 Ejemplo Completo Paso a Paso

### Escenario: Formulario de Solicitud de Crédito

**Objetivo**: Mostrar campos adicionales según el monto solicitado.

#### 1. En DecisionRules.io

Crea una Decision Table:

| Monto | Mostrar Garantía | Mostrar Aval | Nivel Aprobación |
|-------|------------------|--------------|------------------|
| < 5000 | false | false | "automático" |
| 5000-20000 | true | false | "supervisor" |
| > 20000 | true | true | "gerente" |

Inputs:
- `montoSolicitado` (Number)

Outputs:
- `mostrarGarantia` (Boolean)
- `mostrarAval` (Boolean)
- `nivelAprobacion` (String)

#### 2. En el Diseñador

**Campos del formulario**:
1. Monto Solicitado (Número, nombre: `montoSolicitado`)
2. Garantía (Texto, nombre: `garantia`)
3. Aval (Texto, nombre: `aval`)

**Configurar campo "Garantía"**:
- Lógica → DecisionRules → Añadir regla
- Rule ID: `[tu-rule-id]`
- Campos de Entrada: `montoSolicitado` → `montoSolicitado`
- Condición: `result.mostrarGarantia === true`
- Acción: `Mostrar`

**Configurar campo "Aval"**:
- Lógica → DecisionRules → Añadir regla
- Rule ID: `[tu-rule-id]`
- Campos de Entrada: `montoSolicitado` → `montoSolicitado`
- Condición: `result.mostrarAval === true`
- Acción: `Mostrar`

#### 3. Probar

- Monto < 5000: Solo se muestra el campo de monto
- Monto 5000-20000: Se muestra monto + garantía
- Monto > 20000: Se muestran todos los campos

---

¿Necesitas ayuda? Revisa la [documentación completa](./DECISIONRULES_INTEGRATION.md) o abre un issue en el repositorio.
