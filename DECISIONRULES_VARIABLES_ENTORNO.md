# 🔐 DecisionRules: Configuración con Variables de Entorno

## 📋 Resumen

La forma **recomendada** de configurar DecisionRules en producción es usando **variables de entorno**. Esto mantiene las credenciales seguras y fuera del código.

## 🎯 Ventajas de Variables de Entorno

### ✅ Seguridad
- API Key no está en el código fuente
- No se sube al repositorio Git
- Diferente por entorno (dev, staging, prod)

### ✅ Flexibilidad
- Fácil cambiar entre entornos
- No requiere recompilar para cambiar credenciales
- Soporta múltiples entornos

### ✅ Mejores Prácticas
- Estándar de la industria
- Compatible con CI/CD
- Fácil de gestionar en servidores

## 🚀 Configuración Rápida

### 1. Crear archivo .env

En la raíz del proyecto, crea un archivo `.env`:

```bash
# .env
VITE_DECISIONRULES_API_KEY=tu-api-key-aqui
VITE_DECISIONRULES_URL=https://api.decisionrules.io
```

### 2. Obtener tu API Key

1. Ve a [DecisionRules.io](https://app.decisionrules.io)
2. Inicia sesión en tu cuenta
3. Ve a Settings → API Keys
4. Copia tu API Key
5. Pégala en el archivo `.env`

### 3. Reiniciar el servidor de desarrollo

```bash
npm run dev
```

### 4. Verificar

Abre el diseñador de formularios y ve a la pestaña "Lógica" → "DecisionRules". Deberías ver:

```
✅ Configurado (Variables de Entorno)
```

## 📁 Estructura de Archivos

```
proyecto/
├── .env                    # ❌ NO subir a Git (ignorado)
├── .env.example           # ✅ Plantilla para el equipo
├── .gitignore             # Incluye .env
├── src/
│   └── composables/
│       └── usarDecisionRules.ts
└── vite.config.ts
```

## 🔧 Configuración Detallada

### Archivo .env

```bash
# DecisionRules Configuration
# Obtén tu API Key desde https://app.decisionrules.io

# API Key (REQUERIDO)
VITE_DECISIONRULES_API_KEY=your-api-key-here

# URL Base (OPCIONAL - por defecto: https://api.decisionrules.io)
VITE_DECISIONRULES_URL=https://api.decisionrules.io
```

### Archivo .env.example

Este archivo SÍ se sube a Git como plantilla:

```bash
# DecisionRules Configuration
# Obtén tu API Key desde https://app.decisionrules.io
VITE_DECISIONRULES_API_KEY=your-api-key-here
VITE_DECISIONRULES_URL=https://api.decisionrules.io
```

### .gitignore

Asegúrate de que `.env` está ignorado:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

## 🌍 Múltiples Entornos

### Desarrollo Local (.env)
```bash
VITE_DECISIONRULES_API_KEY=dev-api-key-123
VITE_DECISIONRULES_URL=https://api.decisionrules.io
```

### Staging (.env.staging)
```bash
VITE_DECISIONRULES_API_KEY=staging-api-key-456
VITE_DECISIONRULES_URL=https://api.decisionrules.io
```

### Producción (.env.production)
```bash
VITE_DECISIONRULES_API_KEY=prod-api-key-789
VITE_DECISIONRULES_URL=https://api.decisionrules.io
```

### Usar diferentes archivos

```bash
# Desarrollo
npm run dev

# Staging
npm run build -- --mode staging

# Producción
npm run build -- --mode production
```

## 🔄 Orden de Prioridad

El sistema carga la configuración en este orden:

1. **Variables de Entorno** (`.env`) - ⭐ Recomendado
2. **localStorage** (configuración manual en la UI) - Para desarrollo
3. **Sin configuración** - Muestra advertencia

```typescript
// Prioridad 1: Variables de entorno
const envApiKey = import.meta.env.VITE_DECISIONRULES_API_KEY
if (envApiKey) {
  console.log('✅ Configuración desde variables de entorno')
  return
}

// Prioridad 2: localStorage
const localKey = localStorage.getItem('decisionrules_apikey')
if (localKey) {
  console.log('⚠️ Configuración desde localStorage')
  return
}

// Sin configuración
console.warn('❌ No se encontró configuración')
```

## 🎨 Interfaz de Usuario

### Con Variables de Entorno

Cuando la configuración viene de `.env`, la UI muestra:

```
┌─────────────────────────────────────────────────────┐
│ Configuración DecisionRules                    [▼]  │
├─────────────────────────────────────────────────────┤
│ ✅ Configurado (Variables de Entorno)               │
│                                                      │
│ ℹ️ Configuración desde Variables de Entorno        │
│    La API Key está configurada en el archivo .env   │
│    del proyecto. Esta es la forma recomendada       │
│    para producción.                                  │
└─────────────────────────────────────────────────────┘
```

### Sin Variables de Entorno

Si no hay `.env`, la UI permite configuración manual:

```
┌─────────────────────────────────────────────────────┐
│ Configuración DecisionRules                    [▼]  │
├─────────────────────────────────────────────────────┤
│ ❌ No configurado                                    │
│                                                      │
│ API Key: [___________________________]              │
│ Obtén tu API Key desde DecisionRules.io            │
│                                                      │
│ URL Base: [https://api.decisionrules.io]           │
│                                                      │
│ [Guardar Configuración]                             │
│                                                      │
│ 💡 Recomendación: Para producción, configura       │
│    VITE_DECISIONRULES_API_KEY en tu archivo .env   │
└─────────────────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Problema: No se carga la configuración

**Síntoma**: Muestra "No configurado" aunque el `.env` existe

**Solución**:
1. Verifica que el archivo se llama exactamente `.env` (no `.env.txt`)
2. Verifica que las variables empiezan con `VITE_`
3. Reinicia el servidor de desarrollo (`npm run dev`)
4. Verifica que no hay espacios extra:
   ```bash
   # ❌ Incorrecto
   VITE_DECISIONRULES_API_KEY = tu-api-key
   
   # ✅ Correcto
   VITE_DECISIONRULES_API_KEY=tu-api-key
   ```

### Problema: Variables no se actualizan

**Síntoma**: Cambié el `.env` pero sigue usando el valor antiguo

**Solución**:
1. Detén el servidor (`Ctrl+C`)
2. Reinicia el servidor (`npm run dev`)
3. Vite solo lee `.env` al iniciar

### Problema: Funciona en desarrollo pero no en producción

**Síntoma**: En local funciona, en producción no

**Solución**:
1. Verifica que las variables están configuradas en tu servidor/hosting
2. Para Vercel: Settings → Environment Variables
3. Para Netlify: Site settings → Build & deploy → Environment
4. Para otros: Consulta la documentación de tu hosting

## 📚 Ejemplos de Hosting

### Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - Name: `VITE_DECISIONRULES_API_KEY`
   - Value: `tu-api-key`
4. Redeploy

### Netlify

1. Ve a tu sitio en Netlify
2. Site settings → Build & deploy → Environment
3. Agrega:
   - Key: `VITE_DECISIONRULES_API_KEY`
   - Value: `tu-api-key`
4. Redeploy

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Variables de entorno en tiempo de build
ARG VITE_DECISIONRULES_API_KEY
ARG VITE_DECISIONRULES_URL

ENV VITE_DECISIONRULES_API_KEY=$VITE_DECISIONRULES_API_KEY
ENV VITE_DECISIONRULES_URL=$VITE_DECISIONRULES_URL

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

```bash
# Build con variables
docker build \
  --build-arg VITE_DECISIONRULES_API_KEY=tu-api-key \
  --build-arg VITE_DECISIONRULES_URL=https://api.decisionrules.io \
  -t mi-app .
```

## ✅ Checklist de Configuración

- [ ] Crear archivo `.env` en la raíz del proyecto
- [ ] Agregar `VITE_DECISIONRULES_API_KEY` con tu API Key
- [ ] Agregar `VITE_DECISIONRULES_URL` (opcional)
- [ ] Verificar que `.env` está en `.gitignore`
- [ ] Crear `.env.example` como plantilla
- [ ] Reiniciar servidor de desarrollo
- [ ] Verificar en la UI que muestra "Variables de Entorno"
- [ ] Probar una regla DecisionRules
- [ ] Configurar variables en producción (Vercel/Netlify/etc)
- [ ] Documentar para el equipo

## 🎯 Mejores Prácticas

### ✅ Hacer

1. Usar variables de entorno en producción
2. Mantener `.env.example` actualizado
3. Documentar las variables necesarias
4. Usar diferentes API Keys por entorno
5. Rotar API Keys periódicamente

### ❌ Evitar

1. Subir `.env` a Git
2. Hardcodear API Keys en el código
3. Compartir API Keys por email/chat
4. Usar la misma API Key en todos los entornos
5. Exponer API Keys en logs

## 📖 Recursos

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [DecisionRules API Documentation](https://docs.decisionrules.io)
- [12 Factor App - Config](https://12factor.net/config)

## 🆘 Soporte

Si tienes problemas:

1. Verifica los logs de consola
2. Revisa este documento
3. Consulta la documentación de Vite
4. Contacta al equipo de desarrollo
