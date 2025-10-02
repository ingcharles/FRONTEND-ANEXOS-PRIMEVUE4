# 🚀 Integración DecisionRules.io - Diseñador de Formularios

## 📋 Descripción

Integración completa de [DecisionRules.io](https://decisionrules.io) en el diseñador de formularios Vue 3 + TypeScript. Permite ejecutar reglas de negocio complejas desde la nube para controlar la lógica de los formularios de forma dinámica y administrable.

## ✨ Características

- ✅ **Configuración Visual**: Configura tu API Key directamente desde la interfaz
- ✅ **Gestión de Reglas**: Crea, edita y elimina reglas sin tocar código
- ✅ **Mapeo Flexible**: Mapea campos del formulario a inputs de DecisionRules
- ✅ **Condiciones Personalizadas**: Usa JavaScript para evaluar resultados
- ✅ **Múltiples Acciones**: Mostrar, ocultar, requerir u hacer opcional campos
- ✅ **Versionado**: Soporte para versiones de reglas
- ✅ **Persistencia**: Configuración guardada en localStorage
- ✅ **TypeScript**: Completamente tipado
- ✅ **Documentación Completa**: Guías, ejemplos y referencias

## 🎯 Casos de Uso

### 1. Validación de Edad
Mostrar campo "Tutor Legal" solo si el usuario es menor de 18 años.

### 2. Aprobaciones Multinivel
Requerir aprobación de gerente para montos superiores a $10,000.

### 3. Descuentos Dinámicos
Aplicar descuentos basados en tipo de cliente, monto de compra e historial.

### 4. Documentación Requerida
Solicitar documentos adicionales según país, tipo de transacción y monto.

## 📦 Instalación

El paquete ya está instalado:

```bash
npm install @decisionrules/decisionrules
```

## 🚀 Inicio Rápido (5 minutos)

### 1. Obtener API Key
1. Ve a [DecisionRules.io](https://app.decisionrules.io)
2. Crea una cuenta
3. Copia tu **Solver API Key**

### 2. Configurar
1. Abre el diseñador
2. Selecciona un campo
3. Ve a **Lógica → DecisionRules**
4. Pega tu API Key
5. Haz clic en **Guardar**

### 3. Crear Regla
1. Crea una regla en DecisionRules.io
2. Copia el Rule ID
3. En el diseñador, haz clic en **Añadir regla DecisionRules**
4. Configura la regla
5. ¡Listo!

## 📚 Documentación

### Guías
- **[🚀 Guía Rápida](./DECISIONRULES_QUICKSTART.md)** - Empieza aquí
- **[📖 Documentación Completa](./DECISIONRULES_INTEGRATION.md)** - Referencia técnica
- **[🎨 Ejemplos Visuales](./DECISIONRULES_EJEMPLO_VISUAL.md)** - Diagramas y flujos
- **[📝 Resumen](./DECISIONRULES_RESUMEN.md)** - Resumen de implementación
- **[⚙️ Instalación](./DECISIONRULES_INSTALACION.md)** - Guía de instalación
- **[✅ Checklist](./DECISIONRULES_CHECKLIST.md)** - Verificación y pruebas

### Ejemplo Básico

```typescript
// 1. Configurar (una vez)
import { usarDecisionRules } from '@/composables/usarDecisionRules'

const dr = usarDecisionRules()
dr.configurar('tu-solver-key')

// 2. Crear regla en el diseñador
const regla = {
  id: 'dr-logic-001',
  tipo: 'decisionrules',
  decisionRulesId: 'c67df234-c939-6b6b-16fc-dcb9543c8c1b',
  decisionRulesVersion: 1,
  accion: 'mostrar',
  camposEntrada: [
    { nombreCampo: 'edad', claveDecisionRules: 'edad' }
  ],
  condicionResultado: 'result.mostrarCampo === true'
}

// 3. La regla se evalúa automáticamente
```

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    Diseñador UI                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ TabLogica.vue                                   │   │
│  │  ├─ Reglas Simples                              │   │
│  │  └─ TabDecisionRules.vue ← Nueva pestaña        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Composable & Servicio                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ usarDecisionRules.ts                            │   │
│  │  └─ Gestión de configuración                    │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ServicioDecisionRules.ts                        │   │
│  │  └─ Cliente de API                              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 Evaluación de Lógica                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Logica.ts                                       │   │
│  │  ├─ evaluarReglasCampoSync() ← Reglas simples   │   │
│  │  └─ evaluarReglasCampo() ← Con DecisionRules    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              DecisionRules.io API                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ @decisionrules/decisionrules                    │   │
│  │  └─ solve(ruleId, data, version)                │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 📁 Estructura de Archivos

```
src/
├── interfaces/
│   ├── DecisionRules.ts          ← Nuevas interfaces
│   └── Validacion.ts              ← Actualizado
├── servicios/
│   └── ServicioDecisionRules.ts   ← Nuevo servicio
├── composables/
│   └── usarDecisionRules.ts       ← Nuevo composable
├── utilidades/
│   └── Logica.ts                  ← Actualizado
├── paginas/disenador/componentes/
│   ├── propiedades/
│   │   ├── TabDecisionRules.vue   ← Nuevo componente
│   │   └── TabLogica.vue          ← Actualizado
│   ├── RenderizadorCampo.vue      ← Actualizado
│   └── VistaPrevia.vue            ← Actualizado
└── ejemplos/
    └── EjemploDecisionRules.vue   ← Componente de prueba
```

## 🎓 Ejemplos

### Ejemplo 1: Mostrar Campo Según Edad

**DecisionRules:**
```
Input: edad (Number)
Output: mostrarTutor (Boolean)

SI edad < 18 ENTONCES mostrarTutor = true
```

**Diseñador:**
```
Campo: "Tutor Legal"
Rule ID: abc123...
Campos de Entrada: edad → edad
Condición: result.mostrarTutor === true
Acción: Mostrar
```

### Ejemplo 2: Validación de Crédito

**DecisionRules:**
```
Inputs: monto, edad, ingresos
Outputs: aprobado, requiereGarantia, requiereAval

SI monto < 5000 Y edad >= 18 Y ingresos > 10000
  ENTONCES aprobado = true, requiereGarantia = false

SI monto >= 5000 Y monto <= 20000 Y edad >= 21
  ENTONCES aprobado = true, requiereGarantia = true

SI monto > 20000 Y edad >= 25
  ENTONCES aprobado = true, requiereGarantia = true, requiereAval = true
```

**Diseñador:**
```
Campo: "Garantía"
Rule ID: credito-validation-v1
Campos de Entrada:
  - monto → monto
  - edad → edad
  - ingresos → ingresos
Condición: result.requiereGarantia === true
Acción: Mostrar

Campo: "Aval"
Rule ID: credito-validation-v1
Campos de Entrada: [mismos]
Condición: result.requiereAval === true
Acción: Mostrar
```

## 🧪 Pruebas

### Componente de Prueba

```typescript
// Agregar en router
import EjemploDecisionRules from '@/ejemplos/EjemploDecisionRules.vue'

{
  path: '/test-decisionrules',
  component: EjemploDecisionRules
}
```

Visita: `http://localhost:5173/test-decisionrules`

### Prueba Manual

1. Crea un formulario simple
2. Configura una regla
3. Ve a Vista Previa
4. Cambia valores y observa el comportamiento

## 🔐 Seguridad

### Desarrollo
- API Key se guarda en localStorage
- Configuración persiste entre sesiones

### Producción (Recomendado)
```typescript
// Backend Proxy
app.post('/api/evaluate-rule', authenticate, async (req, res) => {
  const { ruleId, data, version } = req.body
  const apiKey = process.env.DECISIONRULES_SOLVER_KEY
  
  const dr = new DecisionRules({ solverKey: apiKey })
  const result = await dr.solve(ruleId, data, version)
  
  res.json(result)
})
```

## 🐛 Solución de Problemas

| Problema | Solución |
|----------|----------|
| "ServicioDecisionRules no está configurado" | Configura tu API Key en Lógica → DecisionRules |
| "Regla DecisionRules sin ID configurado" | Pega el Rule ID en el campo correspondiente |
| La regla no se ejecuta | Verifica que la regla esté publicada en DecisionRules.io |
| Error de autenticación | Verifica que uses el **Solver API Key** |

## 📊 Rendimiento

- **Reglas Simples**: Evaluación instantánea (síncrona)
- **Reglas DecisionRules**: < 1 segundo (asíncrona)
- **Caché**: Implementar para optimizar llamadas repetidas
- **Debounce**: Recomendado para campos con cambios frecuentes

## 🚀 Próximos Pasos

### Mejoras Sugeridas
1. ✨ Caché de resultados
2. ✨ Retry logic
3. ✨ Indicador de carga
4. ✨ Modo offline
5. ✨ Testing desde el diseñador

### Funcionalidades Avanzadas
1. 🎯 Decision Flows
2. 🎯 Evaluación en batch
3. 🎯 Versionado automático
4. 🎯 Logs y auditoría

## 📞 Recursos

- [DecisionRules Docs](https://docs.decisionrules.io)
- [API Reference](https://docs.decisionrules.io/api-reference)
- [Tutoriales](https://docs.decisionrules.io/tutorials)
- [GitHub](https://github.com/decisionrules/decisionrules)

## 🤝 Contribuir

Para agregar nuevas funcionalidades:

1. Actualiza interfaces en `src/interfaces/DecisionRules.ts`
2. Extiende el servicio en `src/servicios/ServicioDecisionRules.ts`
3. Actualiza componentes según sea necesario
4. Actualiza documentación
5. Agrega tests

## 📄 Licencia

Este proyecto usa `@decisionrules/decisionrules` bajo licencia Apache-2.0.

## 🎉 ¡Listo para Usar!

La integración está completa y funcional. Comienza con la [Guía Rápida](./DECISIONRULES_QUICKSTART.md) y crea tu primera regla en 5 minutos.

---

**Versión**: 1.0.0  
**Fecha**: 2025-10-02  
**Autor**: Kiro AI Assistant  
**Estado**: ✅ Producción Ready
