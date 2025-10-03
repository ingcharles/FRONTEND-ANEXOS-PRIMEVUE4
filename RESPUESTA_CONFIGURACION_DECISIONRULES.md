# 🔐 Respuesta: ¿Dónde se guarda la configuración de DecisionRules?

## 📍 Respuesta Directa

La configuración de DecisionRules (API Key y URL Base) **NO** está en el JSON del formulario. Se guarda en **localStorage** del navegador.

## 🎯 ¿Por qué?

### Razones de Seguridad y Arquitectura:

1. **Seguridad**: La API Key es sensible y no debe estar en el JSON
2. **Global**: Aplica a todos los formularios del usuario
3. **Privada**: Cada usuario tiene su propia API Key
4. **Portable**: El JSON del formulario se puede exportar sin exponer credenciales

## 📊 Comparación

| Dato | Ubicación | Alcance | Exportable |
|------|-----------|---------|------------|
| **API Key** | localStorage | Global | ❌ No |
| **URL Base** | localStorage | Global | ❌ No |
| **ID de Regla** | JSON del formulario | Por campo | ✅ Sí |
| **Versión** | JSON del formulario | Por campo | ✅ Sí |
| **Evento** | JSON del formulario | Por campo | ✅ Sí |
| **Campos Entrada** | JSON del formulario | Por campo | ✅ Sí |
| **Campos Asignar** | JSON del formulario | Por campo | ✅ Sí |

## 🔄 Flujo Completo

### 1. En el Diseñador (TabDecisionRules.vue)

```vue
<script setup>
const decisionRules = usarDecisionRules()

// Al montar, carga de localStorage
onMounted(() => {
  decisionRules.cargarConfiguracion() // Lee localStorage
  apiKey.value = decisionRules.apiKey.value
})

// Al guardar, guarda en localStorage
function guardarConfiguracion() {
  decisionRules.configurar(apiKey.value, urlBase.value)
  // Esto hace: localStorage.setItem('decisionrules_apikey', apiKey)
}
</script>
```

### 2. En la Vista Previa (VistaPrevia.vue)

```vue
<script setup>
const decisionRules = usarDecisionRules()

// Al montar, carga de localStorage
onMounted(() => {
  decisionRules.cargarConfiguracion() // Lee localStorage
  // Ahora el servicio está configurado con la API Key
})

// Al evaluar reglas
async function manejarEventoCampo(nombreCampo, tipoEvento) {
  // 1. Lee la regla del JSON del campo
  const regla = campo.logica.find(r => r.tipo === 'decisionrules')
  
  // 2. Usa el servicio ya configurado con API Key de localStorage
  const resultado = await evaluarReglaDecisionRules(regla, valores)
  
  // 3. Aplica el resultado
}
</script>
```

## 📄 Ejemplo de JSON del Formulario

```json
{
  "paginas": [
    {
      "campos": [
        {
          "id": "campo-123",
          "nombre": "codigoPostal",
          "tipo": "texto",
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

**Nota**: ❌ NO hay API Key en el JSON

## 🔍 localStorage del Navegador

```javascript
// Contenido de localStorage
{
  "decisionrules_apikey": "tu-api-key-secreta",
  "decisionrules_url": "https://api.decisionrules.io"
}
```

## 🎨 Diagrama Simplificado

```
┌──────────────────────────────────────────────────────────┐
│                    DISEÑADOR                              │
│                                                           │
│  [Configuración DecisionRules]                           │
│   API Key: ••••••••                                      │
│   [Guardar] ──────────────────┐                         │
│                                │                         │
│  [Regla DecisionRules]         │                         │
│   ID: c67df234...              │                         │
│   Evento: change               │                         │
│   [Guardar] ──────────┐        │                         │
│                       │        │                         │
└───────────────────────┼────────┼─────────────────────────┘
                        │        │
                        ↓        ↓
              ┌─────────────────────────┐
              │   JSON del Formulario   │
              │  ┌──────────────────┐   │
              │  │ logica: [{       │   │
              │  │   tipo: "dr",    │   │
              │  │   id: "c67...",  │   │
              │  │   evento: "..."  │   │
              │  │ }]               │   │
              │  └──────────────────┘   │
              └─────────────────────────┘
                        
                        ↓ localStorage
              ┌─────────────────────────┐
              │   Navegador             │
              │  ┌──────────────────┐   │
              │  │ apikey: "..."    │   │
              │  │ url: "..."       │   │
              │  └──────────────────┘   │
              └─────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                   VISTA PREVIA                            │
│                                                           │
│  onMounted() {                                           │
│    cargarConfiguracion() ──→ Lee localStorage            │
│  }                                                       │
│                                                           │
│  Al evaluar:                                             │
│    1. Lee regla del JSON ──→ campo.logica               │
│    2. Usa API Key de localStorage                       │
│    3. Llama a DecisionRules API                         │
│    4. Aplica resultado                                  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## ✅ Verificación

### Ver en Consola del Navegador:

```javascript
// Ver API Key guardada
console.log(localStorage.getItem('decisionrules_apikey'))

// Ver URL Base guardada
console.log(localStorage.getItem('decisionrules_url'))
```

### Ver en el JSON del Formulario:

```javascript
// En el diseñador
const almacen = useAlmacenDisenador()
console.log(JSON.stringify(almacen.esquemaFormulario, null, 2))

// Busca "logica" en el JSON
// Verás las reglas pero NO la API Key
```

## 🎯 Conclusión

**La arquitectura es correcta**:

1. ✅ **API Key**: localStorage (privada, no exportable)
2. ✅ **Reglas**: JSON del formulario (portable, exportable)
3. ✅ **Vista Previa**: Combina ambos

**La Vista Previa obtiene**:
- 🔑 API Key → De localStorage (cargada en `onMounted`)
- 📋 Reglas → Del JSON del formulario (campo.logica)

Esto garantiza **seguridad** (API Key privada) y **portabilidad** (JSON sin credenciales).
