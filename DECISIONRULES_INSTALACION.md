# Instalación y Configuración de DecisionRules.io

## ✅ Estado de la Implementación

La integración de DecisionRules.io está **completamente implementada y funcional**.

### Archivos Creados

1. **Interfaces**
   - `src/interfaces/DecisionRules.ts`
   - `src/interfaces/Validacion.ts` (actualizado)

2. **Servicios**
   - `src/servicios/ServicioDecisionRules.ts`

3. **Composables**
   - `src/composables/usarDecisionRules.ts`

4. **Componentes**
   - `src/paginas/disenador/componentes/propiedades/TabDecisionRules.vue`
   - `src/paginas/disenador/componentes/propiedades/TabLogica.vue` (actualizado)
   - `src/paginas/disenador/componentes/RenderizadorCampo.vue` (actualizado)
   - `src/paginas/disenador/componentes/VistaPrevia.vue` (actualizado)

5. **Utilidades**
   - `src/utilidades/Logica.ts` (actualizado)

6. **Ejemplos**
   - `src/ejemplos/EjemploDecisionRules.vue`

7. **Documentación**
   - `DECISIONRULES_INTEGRATION.md` - Documentación técnica completa
   - `DECISIONRULES_QUICKSTART.md` - Guía rápida de inicio
   - `DECISIONRULES_EJEMPLO_VISUAL.md` - Ejemplos visuales
   - `DECISIONRULES_RESUMEN.md` - Resumen de implementación
   - `DECISIONRULES_INSTALACION.md` - Este archivo

## 📦 Paquete Instalado

```json
{
  "@decisionrules/decisionrules": "^1.0.1"
}
```

## 🚀 Cómo Empezar

### 1. Obtener API Key

1. Ve a [DecisionRules.io](https://app.decisionrules.io)
2. Crea una cuenta o inicia sesión
3. Ve a Settings → API Keys
4. Copia tu **Solver API Key**

### 2. Configurar en el Diseñador

1. Abre el diseñador de formularios
2. Selecciona cualquier campo
3. Ve a la pestaña **"Lógica"**
4. Haz clic en el botón **"DecisionRules"**
5. Expande **"Configuración DecisionRules"**
6. Pega tu API Key
7. (Opcional) Ingresa URL base personalizada
8. Haz clic en **"Guardar Configuración"**

### 3. Crear tu Primera Regla

#### En DecisionRules.io:

1. Crea una nueva **Decision Table**
2. Define inputs y outputs
3. Configura las reglas
4. Publica la regla
5. Copia el **Rule ID**

#### En el Diseñador:

1. Selecciona el campo que quieres controlar
2. Ve a **Lógica → DecisionRules**
3. Haz clic en **"Añadir regla DecisionRules"**
4. Configura:
   - **ID de Regla**: Pega el Rule ID
   - **Versión**: 1
   - **Acción**: Mostrar/Ocultar/Requerir/Opcional
   - **Campos de Entrada**: Mapea los campos del formulario
   - **Condición del Resultado**: Expresión JavaScript
5. Guarda

### 4. Probar

1. Ve a **Vista Previa**
2. Cambia los valores de los campos
3. Observa cómo se aplican las reglas

## 📖 Ejemplo Rápido

### Escenario: Mostrar campo "Tutor Legal" si edad < 18

**En DecisionRules.io:**

```
Input: edad (Number)
Output: mostrarTutor (Boolean)

Regla:
SI edad < 18 ENTONCES mostrarTutor = true
SI edad >= 18 ENTONCES mostrarTutor = false
```

**En el Diseñador:**

```
Campo: "Tutor Legal"
Lógica → DecisionRules:
  - Rule ID: [tu-rule-id]
  - Versión: 1
  - Acción: Mostrar
  - Campos de Entrada:
    * edad → edad
  - Condición: result.mostrarTutor === true
```

## 🔧 API del Servicio

### Uso Básico

```typescript
import { ServicioDecisionRules } from '@/servicios/ServicioDecisionRules'

const servicio = new ServicioDecisionRules({
  apiKey: 'tu-solver-key'
})

const resultado = await servicio.evaluarRegla(regla, valores)
```

### Uso con Composable

```typescript
import { usarDecisionRules } from '@/composables/usarDecisionRules'

const dr = usarDecisionRules()
dr.configurar('tu-solver-key')

// La configuración se guarda automáticamente en localStorage
```

## 🎯 Características Implementadas

- ✅ Configuración de API Key desde la UI
- ✅ Persistencia en localStorage
- ✅ Gestión completa de reglas (crear, editar, eliminar)
- ✅ Mapeo flexible de campos de entrada
- ✅ Condiciones personalizadas con JavaScript
- ✅ Soporte para versiones de reglas
- ✅ Evaluación asíncrona de reglas
- ✅ Manejo de errores robusto
- ✅ Indicador de estado de configuración
- ✅ Documentación completa
- ✅ Ejemplos de uso

## 📚 Documentación Adicional

- **[Guía Rápida](./DECISIONRULES_QUICKSTART.md)** - Inicio rápido con ejemplos
- **[Documentación Completa](./DECISIONRULES_INTEGRATION.md)** - Referencia técnica
- **[Ejemplos Visuales](./DECISIONRULES_EJEMPLO_VISUAL.md)** - Diagramas y flujos
- **[Resumen](./DECISIONRULES_RESUMEN.md)** - Resumen de implementación

## 🧪 Probar la Integración

### Opción 1: Componente de Prueba

Agrega la ruta en tu router:

```typescript
import EjemploDecisionRules from '@/ejemplos/EjemploDecisionRules.vue'

{
  path: '/test-decisionrules',
  component: EjemploDecisionRules
}
```

Luego visita: `http://localhost:5173/test-decisionrules`

### Opción 2: En el Diseñador

1. Crea un formulario simple
2. Configura una regla de DecisionRules
3. Ve a Vista Previa
4. Prueba cambiando valores

## 🔐 Seguridad

### Producción

Para producción, se recomienda:

1. **No guardar API Key en el cliente**
2. **Crear un proxy en el backend**
3. **Validar permisos del usuario**

Ejemplo de proxy backend:

```typescript
// Backend (Node.js/Express)
app.post('/api/evaluate-rule', authenticate, async (req, res) => {
  const { ruleId, data, version } = req.body
  const apiKey = process.env.DECISIONRULES_SOLVER_KEY
  
  const dr = new DecisionRules({ solverKey: apiKey })
  const result = await dr.solve(ruleId, data, version)
  
  res.json(result)
})
```

## ⚠️ Notas Importantes

1. **API Key**: Usa tu **Solver API Key**, no la Management API Key
2. **Versiones**: Las versiones en DecisionRules son strings, no números
3. **Evaluación**: Las reglas de DecisionRules se evalúan de forma asíncrona
4. **Compatibilidad**: Solo se evalúan reglas simples en modo síncrono (RenderizadorCampo)
5. **Vista Previa**: Para evaluación completa con DecisionRules, usa la Vista Previa

## 🐛 Solución de Problemas

### Error: "ServicioDecisionRules no está configurado"
**Solución**: Configura tu API Key en Lógica → DecisionRules → Configuración

### Error: "Regla DecisionRules sin ID configurado"
**Solución**: Asegúrate de pegar el Rule ID en el campo correspondiente

### La regla no se ejecuta
**Solución**:
1. Verifica que los nombres de los campos coincidan
2. Revisa la condición del resultado
3. Verifica que la regla esté publicada en DecisionRules.io
4. Revisa la consola del navegador para errores

### Error de autenticación
**Solución**:
1. Verifica que tu API Key sea correcta
2. Asegúrate de usar el **Solver API Key**
3. Verifica que la regla exista en tu espacio

## 📞 Soporte

- [DecisionRules Docs](https://docs.decisionrules.io)
- [DecisionRules API Reference](https://docs.decisionrules.io/api-reference)
- [GitHub Issues](https://github.com/decisionrules/decisionrules/issues)

## 🎉 ¡Listo!

Tu integración de DecisionRules.io está completa y lista para usar. Comienza creando tu primera regla siguiendo la [Guía Rápida](./DECISIONRULES_QUICKSTART.md).

---

**Versión**: 1.0.0  
**Fecha**: 2025-10-02  
**Paquete**: @decisionrules/decisionrules@1.0.1
