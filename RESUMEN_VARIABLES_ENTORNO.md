# 📋 Resumen: Implementación de Variables de Entorno para DecisionRules

## ✅ Cambios Realizados

### 1. Archivos Creados

#### `.env` (No se sube a Git)
```bash
VITE_DECISIONRULES_API_KEY=
VITE_DECISIONRULES_URL=https://api.decisionrules.io
```

#### `.env.example` (Plantilla para el equipo)
```bash
VITE_DECISIONRULES_API_KEY=your-api-key-here
VITE_DECISIONRULES_URL=https://api.decisionrules.io
```

### 2. Archivos Modificados

#### `.gitignore`
Agregado:
```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

#### `src/composables/usarDecisionRules.ts`

**Antes**:
```typescript
const cargarConfiguracion = () => {
  // Solo leía de localStorage
  const key = localStorage.getItem('decisionrules_apikey')
  if (key) {
    configurar(key)
  }
}
```

**Ahora**:
```typescript
const cargarConfiguracion = () => {
  // 1. Prioridad: Variables de entorno
  const envApiKey = import.meta.env.VITE_DECISIONRULES_API_KEY
  if (envApiKey && envApiKey.trim() !== '') {
    console.log('✅ Configuración desde variables de entorno')
    configurar(envApiKey, envUrl, 'env')
    return
  }

  // 2. Fallback: localStorage
  const localKey = localStorage.getItem('decisionrules_apikey')
  if (localKey) {
    console.log('⚠️ Configuración desde localStorage')
    configurar(localKey, localUrl, 'localStorage')
    return
  }

  console.warn('❌ No se encontró configuración')
}
```

**Nuevas propiedades**:
```typescript
const origenConfiguracion = ref<'env' | 'localStorage' | 'manual'>('env')

return {
  // ... propiedades existentes
  origenConfiguracion: computed(() => origenConfiguracion.value)
}
```

#### `src/paginas/disenador/componentes/propiedades/TabDecisionRules.vue`

**Agregado**:
- Computed `origenTexto` para mostrar el origen de la configuración
- Mensaje informativo cuando viene de variables de entorno
- Deshabilita edición manual si viene de `.env`
- Muestra recomendación de usar variables de entorno

**UI Antes**:
```
┌─────────────────────────────────┐
│ ✅ Configurado                  │
│ API Key: [___________]          │
│ [Guardar]                       │
└─────────────────────────────────┘
```

**UI Ahora (con .env)**:
```
┌─────────────────────────────────────────────────┐
│ ✅ Configurado (Variables de Entorno)           │
│                                                  │
│ ℹ️ Configuración desde Variables de Entorno    │
│    La API Key está configurada en .env          │
│    Esta es la forma recomendada para producción │
└─────────────────────────────────────────────────┘
```

**UI Ahora (sin .env)**:
```
┌─────────────────────────────────────────────────┐
│ ❌ No configurado                                │
│ API Key: [___________]                          │
│ [Guardar]                                       │
│ 💡 Recomendación: Configura en .env            │
└─────────────────────────────────────────────────┘
```

### 3. Documentación Creada

- ✅ `DECISIONRULES_VARIABLES_ENTORNO.md` - Guía completa
- ✅ `CONFIGURACION_RAPIDA_DECISIONRULES.md` - Setup rápido
- ✅ `RESUMEN_VARIABLES_ENTORNO.md` - Este archivo

## 🔄 Flujo de Configuración

### Antes
```
Usuario → UI Manual → localStorage → Aplicación
```

### Ahora
```
Opción 1 (Recomendado):
.env → Variables de Entorno → Aplicación

Opción 2 (Desarrollo):
Usuario → UI Manual → localStorage → Aplicación
```

## 🎯 Orden de Prioridad

1. **Variables de Entorno** (`.env`) - ⭐ Recomendado
   - Seguro
   - No se sube a Git
   - Estándar de la industria

2. **localStorage** (UI Manual) - Para desarrollo
   - Rápido para testing
   - No recomendado para producción
   - Se pierde al limpiar navegador

3. **Sin configuración** - Muestra advertencia
   - No funcional
   - Requiere configuración

## 📊 Comparación

| Aspecto | localStorage | Variables de Entorno |
|---------|--------------|---------------------|
| **Seguridad** | ⚠️ Media | ✅ Alta |
| **Portabilidad** | ❌ No | ✅ Sí |
| **Producción** | ❌ No recomendado | ✅ Recomendado |
| **Desarrollo** | ✅ Rápido | ✅ Mejor práctica |
| **CI/CD** | ❌ No compatible | ✅ Compatible |
| **Múltiples entornos** | ❌ Difícil | ✅ Fácil |
| **Se sube a Git** | ❌ No aplica | ❌ No (.gitignore) |

## 🚀 Cómo Usar

### Para Desarrollo Local

1. Copia `.env.example` a `.env`
2. Agrega tu API Key
3. Reinicia el servidor

```bash
cp .env.example .env
# Edita .env con tu API Key
npm run dev
```

### Para Producción

#### Vercel
```bash
vercel env add VITE_DECISIONRULES_API_KEY
```

#### Netlify
```bash
netlify env:set VITE_DECISIONRULES_API_KEY tu-api-key
```

#### Docker
```dockerfile
ENV VITE_DECISIONRULES_API_KEY=tu-api-key
```

## ✅ Beneficios

### Seguridad
- ✅ API Key no está en el código
- ✅ No se sube a Git
- ✅ Diferente por entorno

### Mantenibilidad
- ✅ Fácil cambiar credenciales
- ✅ No requiere recompilar
- ✅ Centralizado

### Escalabilidad
- ✅ Múltiples entornos (dev, staging, prod)
- ✅ Compatible con CI/CD
- ✅ Estándar de la industria

## 🔍 Verificación

### En Desarrollo

```bash
# 1. Verificar que .env existe
ls -la .env

# 2. Ver contenido (sin mostrar API Key)
cat .env | grep VITE_DECISIONRULES

# 3. Iniciar servidor
npm run dev

# 4. Abrir navegador y verificar consola
# Debería mostrar: ✅ Configuración desde variables de entorno
```

### En la UI

1. Abrir diseñador de formularios
2. Ir a pestaña "Lógica"
3. Cambiar a "DecisionRules"
4. Expandir "Configuración DecisionRules"
5. Verificar: `✅ Configurado (Variables de Entorno)`

## 🐛 Troubleshooting

### Problema: No carga la configuración

**Solución**:
```bash
# 1. Verificar que el archivo existe
ls .env

# 2. Verificar contenido
cat .env

# 3. Verificar que empieza con VITE_
grep VITE_ .env

# 4. Reiniciar servidor
npm run dev
```

### Problema: Funciona en local pero no en producción

**Solución**:
- Verifica que las variables están configuradas en tu hosting
- Vercel: Settings → Environment Variables
- Netlify: Site settings → Environment
- Redeploy después de agregar variables

## 📚 Archivos de Referencia

```
proyecto/
├── .env                                    # ❌ Git ignore
├── .env.example                           # ✅ Plantilla
├── .gitignore                             # Incluye .env
├── CONFIGURACION_RAPIDA_DECISIONRULES.md  # Setup rápido
├── DECISIONRULES_VARIABLES_ENTORNO.md     # Guía completa
├── RESUMEN_VARIABLES_ENTORNO.md           # Este archivo
└── src/
    ├── composables/
    │   └── usarDecisionRules.ts           # Lógica de carga
    └── paginas/disenador/componentes/propiedades/
        └── TabDecisionRules.vue           # UI
```

## 🎯 Próximos Pasos

1. ✅ Crear `.env` con tu API Key
2. ✅ Reiniciar servidor
3. ✅ Verificar en la UI
4. ✅ Probar una regla DecisionRules
5. ✅ Configurar en producción
6. ✅ Documentar para el equipo

## 💡 Recomendaciones

### Para el Equipo

1. Compartir `.env.example` en el repositorio
2. Cada desarrollador crea su propio `.env`
3. Documentar las variables necesarias
4. Usar diferentes API Keys por entorno

### Para Producción

1. Configurar variables en el hosting
2. No usar localStorage
3. Rotar API Keys periódicamente
4. Monitorear uso de la API

## ✨ Conclusión

La implementación de variables de entorno para DecisionRules:

- ✅ Mejora la seguridad
- ✅ Sigue mejores prácticas
- ✅ Es compatible con CI/CD
- ✅ Facilita múltiples entornos
- ✅ Mantiene compatibilidad con localStorage para desarrollo

**Todo está listo para usar!** 🚀
