# 🎯 Resumen: Configuración de Eventos en DecisionRules

## ✅ Cambios Implementados

### 1. **Interfaz de Validación** (`src/interfaces/Validacion.ts`)
```typescript
export interface ReglaLogica {
  // ... campos existentes ...
  
  // ✨ NUEVO: Configuración de eventos
  eventoEjecucion?: 'change' | 'blur' | 'input'
}
```

### 2. **Componente TabDecisionRules** (`TabDecisionRules.vue`)

#### Opciones de Eventos Agregadas:
```typescript
const opcionesEventos = [
  { 
    etiqueta: 'Al cambiar valor (change)', 
    valor: 'change', 
    descripcion: 'Se ejecuta cuando el usuario termina de editar y sale del campo' 
  },
  { 
    etiqueta: 'Al perder foco (blur)', 
    valor: 'blur', 
    descripcion: 'Se ejecuta cuando el campo pierde el foco' 
  },
  { 
    etiqueta: 'Mientras escribe (input)', 
    valor: 'input', 
    descripcion: 'Se ejecuta en tiempo real mientras el usuario escribe' 
  }
]
```

#### Nuevo Selector en la UI:
```vue
<div class="col-12">
  <label class="tamanio-fuente-miga">
    <i class="pi pi-bolt mr-2"></i>¿Cuándo ejecutar la regla?
  </label>
  <PrimeSelect
    v-model="regla.eventoEjecucion"
    :options="opcionesEventos"
    option-label="etiqueta"
    option-value="valor"
    class="ancho-100 tamanio-fuente-miga"
  >
    <template #option="slotProps">
      <div>
        <div class="negrilla">{{ slotProps.option.etiqueta }}</div>
        <small class="text-600">{{ slotProps.option.descripcion }}</small>
      </div>
    </template>
  </PrimeSelect>
</div>
```

### 3. **Componente RenderizadorCampo** (`RenderizadorCampo.vue`)

#### Nuevos Eventos Emitidos:
```typescript
const emit = defineEmits<{
  (e: 'valor-cambiado', nombre: string, valor: unknown): void
  (e: 'evento-campo', nombre: string, evento: 'change' | 'blur' | 'input'): void // ✨ NUEVO
}>()
```

#### Funciones Helper:
```typescript
function manejarCambioValor(nombreCampo: string, valor: unknown): void {
  emit('valor-cambiado', nombreCampo, valor)
  emit('evento-campo', nombreCampo, 'change')
}

function manejarBlur(nombreCampo: string): void {
  emit('evento-campo', nombreCampo, 'blur')
}

function manejarInput(nombreCampo: string, valor: unknown): void {
  emit('valor-cambiado', nombreCampo, valor)
  emit('evento-campo', nombreCampo, 'input')
}
```

#### Campos Actualizados:
- ✅ Campo de texto (texto, email, contraseña)
- ✅ Área de texto
- ✅ Campo numérico
- ✅ Select/Dropdown

### 4. **Componente VistaPrevia** (`VistaPrevia.vue`)

#### Nueva Función de Manejo de Eventos:
```typescript
async function manejarEventoCampo(
  nombreCampo: string, 
  tipoEvento: 'change' | 'blur' | 'input'
): Promise<void> {
  console.log(`🎯 [VistaPrevia] Evento ${tipoEvento} en campo: ${nombreCampo}`)
  
  // Buscar reglas DecisionRules que dependen de este campo
  const todosCampos = servicioEsquemas.aplanarCampos(campos.value, [])
  
  for (const campo of todosCampos) {
    if (!campo.logica) continue
    
    // Filtrar reglas que coinciden con el evento
    const reglasAEjecutar = campo.logica.filter(regla => {
      if (regla.tipo !== 'decisionrules') return false
      if (!regla.camposEntrada) return false
      
      const tieneElCampo = regla.camposEntrada.some(
        ce => ce.nombreCampo === nombreCampo
      )
      if (!tieneElCampo) return false
      
      const eventoRegla = regla.eventoEjecucion || 'change'
      return eventoRegla === tipoEvento
    })
    
    if (reglasAEjecutar.length > 0) {
      await evaluarYActualizarCampos()
    }
  }
}
```

### 5. **Utilidad de Lógica** (`src/utilidades/Logica.ts`)

#### Limpieza Automática de Campos Vacíos:
```typescript
// Verificar si algún campo de entrada está vacío
const algunCampoEntradaVacio = (regla.camposEntrada ?? []).some(campoEntrada => {
  const valor = valoresPorNombre[campoEntrada.nombreCampo]
  return valor === null || valor === undefined || valor === ''
})

// Si hay campos vacíos, limpiar campos de salida
if (algunCampoEntradaVacio && esAccionEstablecerValor) {
  console.log('🧹 [DecisionRules] Campo(s) de entrada vacío(s) - Limpiando campos de salida')
  
  if (regla.camposAsignar && regla.camposAsignar.length > 0) {
    for (const asignacion of regla.camposAsignar) {
      valoresPorNombre[asignacion.nombreCampo] = undefined
    }
  }
  
  return false
}
```

## 🎨 Experiencia de Usuario

### Antes:
- ❌ Las reglas DecisionRules se ejecutaban solo al cambiar valores
- ❌ No había control sobre cuándo se ejecutaban
- ❌ Comportamiento fijo para todos los casos

### Después:
- ✅ El usuario puede elegir cuándo ejecutar cada regla
- ✅ Selector visual con descripciones claras
- ✅ Tres opciones: change, blur, input
- ✅ Valor por defecto inteligente (change)
- ✅ Limpieza automática de campos cuando la entrada está vacía

## 📊 Flujo de Trabajo

```
1. Usuario configura regla DecisionRules
   ↓
2. Selecciona evento: "Al cambiar valor (change)"
   ↓
3. Configura campos de entrada y salida
   ↓
4. En la vista previa:
   - Usuario escribe en campo de entrada
   - Se dispara evento "change"
   - Sistema busca reglas con ese evento
   - Ejecuta reglas encontradas
   - Actualiza campos de salida
   ↓
5. Si el campo se vacía:
   - Detecta valor vacío
   - Limpia automáticamente campos de salida
```

## 🔍 Ejemplo Práctico

### Configuración:
```
Campo: codigoPostal
Evento: change (al cambiar valor)
Regla DecisionRules: validar-codigo-postal
Campos de Entrada: codigoPostal
Campos a Asignar: ciudad, estado
```

### Comportamiento:
1. Usuario escribe "28001" en codigoPostal
2. Usuario presiona Tab (dispara "change")
3. Se ejecuta regla "validar-codigo-postal"
4. DecisionRules retorna: `{ ciudad: "Madrid", estado: "Madrid" }`
5. Se asignan automáticamente los valores
6. Si usuario borra "28001":
   - Se limpian automáticamente ciudad y estado

## 📝 Documentación Creada

- ✅ `DECISIONRULES_EVENTOS.md` - Guía completa de eventos
- ✅ `RESUMEN_EVENTOS_DECISIONRULES.md` - Este archivo

## 🚀 Próximos Pasos

Para usar esta funcionalidad:

1. Abre el diseñador de formularios
2. Selecciona un campo
3. Ve a pestaña "Lógica" → "DecisionRules"
4. Crea o edita una regla
5. Configura el evento en "¿Cuándo ejecutar la regla?"
6. Prueba en la vista previa

## 💡 Recomendaciones

- **Usa "change"** para la mayoría de casos (es el default)
- **Usa "blur"** para validaciones de formato
- **Usa "input"** solo para búsquedas en tiempo real (cuidado con el rendimiento)
- Los campos vacíos limpian automáticamente los campos de salida

## ✨ Beneficios

1. **Flexibilidad**: Control total sobre cuándo ejecutar reglas
2. **Rendimiento**: Evita llamadas innecesarias a la API
3. **UX mejorada**: Comportamiento predecible y configurable
4. **Limpieza automática**: No quedan valores huérfanos
5. **Fácil de usar**: Interfaz intuitiva con descripciones claras
