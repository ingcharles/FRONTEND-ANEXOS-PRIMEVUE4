# 🔐 DecisionRules: Configuración vs JSON del Formulario

## 📋 Resumen

La configuración de DecisionRules (API Key y URL Base) **NO** se guarda en el JSON del formulario. Se guarda en `localStorage` del navegador como configuración global de la aplicación.

## 🎯 ¿Qué se guarda dónde?

### 🌐 localStorage (Configuración Global)
**Ubicación**: Navegador del usuario
**Alcance**: Todos los formularios
**Persiste**: Entre sesiones del navegador

```javascript
localStorage.setItem('decisionrules_apikey', 'tu-api-key')
localStorage.setItem('decisionrules_url', 'https://api.decisionrules.io')
```

**Contiene**:
- ✅ API Key de DecisionRules
- ✅ URL Base de la API (opcional)

**NO contiene**:
- ❌ Reglas específicas del formulario
- ❌ Configuración de campos
- ❌ Mapeos de datos

### 📄 JSON del Formulario (Esquema)
**Ubicación**: Base de datos / Almacén del diseñador
**Alcance**: Formulario específico
**Persiste**: En el esquema del formulario

```json
{
  "paginas": [
    {
      "campos": [
        {
          "id": "campo-123",
          "nombre": "codigoPostal",
          "logica": [
            {
              "id": "dr-logic-456",
              "tipo": "decisionrules",
              "decisionRulesId": "c67df234-c939-6b6b-16fc-dcb9543c8c1b",
              "decisionRulesVersion": 1,
              "eventoEjecucion": "change",
              "camposEntrada": [
                {
                  "nombreCampo": "codigoPostal",
                  "claveDecisionRules": "zipCode"
                }
              ],
              "camposAsignar": [
                {
                  "nombreCampo": "ciudad",
                  "expresionValor": "result.city"
                }
              ],
              "accion": "establecer-valor"
            }
          ]
        }
      ]
    }
  ]
}
```

**Contiene**:
- ✅ ID de la regla en DecisionRules
- ✅ Versión de la regla
- ✅ Evento de ejecución (change/blur/input)
- ✅ Campos de entrada y sus mapeos
- ✅ Campos de salida y expresiones
- ✅ Acción a realizar

**NO contiene**:
- ❌ API Key
- ❌ URL Base de la API

## 🔄 Flujo de Carga

### En el Diseñador (TabDecisionRules.vue)

```typescript
// 1. Al montar el componente
onMounted(() => {
  decisionRules.cargarConfiguracion() // Lee de localStorage
  apiKey.value = decisionRules.apiKey.value
  urlBase.value = decisionRules.urlBase.value
})

// 2. Al guardar configuración
function guardarConfiguracion(): void {
  if (apiKey.value) {
    decisionRules.configurar(apiKey.value, urlBase.value || undefined)
    // Esto guarda en localStorage
  }
}
```

### En la Vista Previa (VistaPrevia.vue)

```typescript
// 1. Al montar el componente
onMounted(() => {
  console.log('🔧 [VistaPrevia] Cargando configuración de DecisionRules...')
  decisionRules.cargarConfiguracion() // Lee de localStorage
  
  if (decisionRules.estaConfigurado.value) {
    console.log('✅ [VistaPrevia] DecisionRules configurado correctamente')
  } else {
    console.warn('⚠️ [VistaPrevia] DecisionRules no está configurado')
  }
})

// 2. Al evaluar reglas
// La configuración ya está cargada globalmente
// Las reglas específicas vienen del JSON del campo
```

### En la Lógica (Logica.ts)

```typescript
// Servicio global configurado con la API Key de localStorage
let servicioDecisionRules: ServicioDecisionRules | null = null

export function configurarServicioDecisionRules(apiKey: string, urlBase?: string): void {
  servicioDecisionRules = new ServicioDecisionRules({ apiKey, urlBase })
}

// Al evaluar una regla, usa el servicio ya configurado
async function evaluarReglaDecisionRules(
  regla: ReglaLogica, // Viene del JSON del formulario
  valoresPorNombre: RegistroDatos,
  nombreCampoActual?: string
): Promise<boolean> {
  // Usa servicioDecisionRules (configurado con API Key de localStorage)
  // Y regla (configuración específica del JSON)
  const response = await servicioDecisionRules.evaluarRegla(...)
}
```

## 🎨 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    DISEÑADOR DE FORMULARIOS                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  TabDecisionRules.vue                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Configuración DecisionRules                          │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ API Key: ••••••••••••••••                       │ │   │
│  │ │ URL Base: https://api.decisionrules.io         │ │   │
│  │ │ [Guardar Configuración]                         │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  │                    ↓ Guarda en                       │   │
│  │              localStorage                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Configuración de Regla                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ID Regla: c67df234-c939-6b6b-16fc-dcb9543c8c1b     │   │
│  │ Versión: 1                                          │   │
│  │ Evento: change                                      │   │
│  │ Campos Entrada: [codigoPostal]                     │   │
│  │ Campos Asignar: [ciudad, estado]                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                    ↓ Guarda en                               │
│              JSON del Formulario                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       VISTA PREVIA                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  VistaPrevia.vue                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ onMounted()                                          │   │
│  │   ↓                                                  │   │
│  │ decisionRules.cargarConfiguracion()                 │   │
│  │   ↓ Lee de                                           │   │
│  │ localStorage                                         │   │
│  │   ↓                                                  │   │
│  │ configurarServicioDecisionRules(apiKey, urlBase)    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Al evaluar reglas:                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Lee regla del JSON del campo                     │   │
│  │ 2. Usa servicio configurado con API Key             │   │
│  │ 3. Llama a DecisionRules API                        │   │
│  │ 4. Aplica resultado según configuración             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Ventajas de esta Arquitectura

### 1. **Seguridad**
- ✅ API Key NO está en el JSON del formulario
- ✅ API Key NO se exporta con el formulario
- ✅ API Key NO se comparte entre usuarios

### 2. **Flexibilidad**
- ✅ Cada usuario puede tener su propia API Key
- ✅ Fácil cambiar de cuenta de DecisionRules
- ✅ No afecta a los formularios existentes

### 3. **Portabilidad**
- ✅ El JSON del formulario es portable
- ✅ Se puede importar/exportar sin exponer credenciales
- ✅ Funciona en cualquier entorno con su propia API Key

### 4. **Mantenibilidad**
- ✅ Configuración centralizada
- ✅ Fácil de actualizar
- ✅ No hay duplicación de credenciales

## 🔍 Verificación

### Ver configuración en localStorage

Abre la consola del navegador y ejecuta:

```javascript
// Ver API Key
console.log(localStorage.getItem('decisionrules_apikey'))

// Ver URL Base
console.log(localStorage.getItem('decisionrules_url'))
```

### Ver configuración de reglas en JSON

```javascript
// En el diseñador
const almacen = useAlmacenDisenador()
const campo = almacen.campoSeleccionado

// Ver reglas del campo
console.log(campo.logica)
```

## 🚨 Importante

### ❌ NO hacer:
```typescript
// ❌ NO guardar API Key en el JSON
{
  "campo": {
    "logica": [{
      "apiKey": "tu-api-key", // ❌ NUNCA HACER ESTO
      "decisionRulesId": "..."
    }]
  }
}
```

### ✅ Hacer:
```typescript
// ✅ API Key en localStorage
localStorage.setItem('decisionrules_apikey', 'tu-api-key')

// ✅ Solo configuración de regla en JSON
{
  "campo": {
    "logica": [{
      "tipo": "decisionrules",
      "decisionRulesId": "c67df234-...",
      "eventoEjecucion": "change",
      "camposEntrada": [...],
      "camposAsignar": [...]
    }]
  }
}
```

## 📚 Archivos Relacionados

1. **Composable**: `src/composables/usarDecisionRules.ts`
   - Maneja localStorage
   - Configura el servicio global

2. **Servicio**: `src/servicios/ServicioDecisionRules.ts`
   - Hace llamadas a la API
   - Usa la API Key configurada

3. **Lógica**: `src/utilidades/Logica.ts`
   - Evalúa reglas
   - Usa el servicio configurado

4. **UI Diseñador**: `src/paginas/disenador/componentes/propiedades/TabDecisionRules.vue`
   - Permite configurar API Key
   - Permite configurar reglas específicas

5. **UI Vista Previa**: `src/paginas/disenador/componentes/VistaPrevia.vue`
   - Carga configuración de localStorage
   - Ejecuta reglas del JSON

## 🎯 Conclusión

La arquitectura actual es **correcta y segura**:

- ✅ **API Key**: localStorage (global, privado, no exportable)
- ✅ **Reglas**: JSON del formulario (específico, portable, exportable)
- ✅ **Vista Previa**: Combina ambos para ejecutar las reglas

Esta separación garantiza seguridad, portabilidad y flexibilidad.
