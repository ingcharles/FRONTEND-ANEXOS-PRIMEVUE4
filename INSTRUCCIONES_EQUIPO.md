# 👥 Instrucciones para el Equipo: Configuración de DecisionRules

## 🎯 Para Nuevos Desarrolladores

### Setup Inicial (5 minutos)

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repo>
   cd <nombre-del-proyecto>
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Crear archivo de configuración**
   ```bash
   cp .env.example .env
   ```

4. **Obtener tu API Key**
   - Ve a [app.decisionrules.io](https://app.decisionrules.io)
   - Inicia sesión (o crea una cuenta)
   - Settings → API Keys
   - Copia tu API Key

5. **Configurar .env**
   Abre `.env` y pega tu API Key:
   ```bash
   VITE_DECISIONRULES_API_KEY=tu-api-key-aqui
   VITE_DECISIONRULES_URL=https://api.decisionrules.io
   ```

6. **Iniciar el servidor**
   ```bash
   npm run dev
   ```

7. **Verificar**
   - Abre http://localhost:5173 (o el puerto que use tu proyecto)
   - Ve al diseñador de formularios
   - Pestaña "Lógica" → "DecisionRules"
   - Deberías ver: `✅ Configurado (Variables de Entorno)`

## 🔐 Seguridad

### ❌ NUNCA hacer:

- ❌ Subir `.env` a Git
- ❌ Compartir tu API Key por email/Slack
- ❌ Hardcodear API Keys en el código
- ❌ Hacer commit de credenciales

### ✅ SIEMPRE hacer:

- ✅ Usar tu propia API Key
- ✅ Mantener `.env` en tu máquina local
- ✅ Usar variables de entorno en producción
- ✅ Rotar API Keys si se comprometen

## 🌍 Entornos

### Desarrollo Local
```bash
# .env
VITE_DECISIONRULES_API_KEY=dev-api-key-123
```

### Staging
```bash
# .env.staging
VITE_DECISIONRULES_API_KEY=staging-api-key-456
```

### Producción
```bash
# Configurado en el hosting (Vercel/Netlify/etc)
VITE_DECISIONRULES_API_KEY=prod-api-key-789
```

## 🚀 Despliegue

### Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - **Name**: `VITE_DECISIONRULES_API_KEY`
   - **Value**: `tu-api-key-de-produccion`
   - **Environment**: Production
4. Redeploy

### Netlify

1. Ve a tu sitio en Netlify
2. Site settings → Build & deploy → Environment
3. Agrega:
   - **Key**: `VITE_DECISIONRULES_API_KEY`
   - **Value**: `tu-api-key-de-produccion`
4. Redeploy

## 🐛 Problemas Comunes

### "No configurado" en la UI

**Causa**: No se encontró la API Key

**Solución**:
1. Verifica que `.env` existe en la raíz del proyecto
2. Verifica que la variable se llama `VITE_DECISIONRULES_API_KEY`
3. Reinicia el servidor (`Ctrl+C` y luego `npm run dev`)

### Cambié .env pero no se actualiza

**Causa**: Vite solo lee `.env` al iniciar

**Solución**:
1. Detén el servidor (`Ctrl+C`)
2. Reinicia (`npm run dev`)

### Funciona en local pero no en producción

**Causa**: Variables no configuradas en el hosting

**Solución**:
1. Configura las variables en tu hosting (ver sección Despliegue)
2. Redeploy la aplicación

## 📝 Checklist de Onboarding

- [ ] Clonar repositorio
- [ ] Instalar dependencias (`npm install`)
- [ ] Copiar `.env.example` a `.env`
- [ ] Obtener API Key de DecisionRules
- [ ] Configurar `.env` con tu API Key
- [ ] Iniciar servidor (`npm run dev`)
- [ ] Verificar configuración en la UI
- [ ] Probar crear una regla DecisionRules
- [ ] Leer documentación del proyecto

## 📚 Documentación

- **Setup Rápido**: [CONFIGURACION_RAPIDA_DECISIONRULES.md](CONFIGURACION_RAPIDA_DECISIONRULES.md)
- **Guía Completa**: [DECISIONRULES_VARIABLES_ENTORNO.md](DECISIONRULES_VARIABLES_ENTORNO.md)
- **Resumen Técnico**: [RESUMEN_VARIABLES_ENTORNO.md](RESUMEN_VARIABLES_ENTORNO.md)

## 🆘 Soporte

Si tienes problemas:

1. Revisa esta documentación
2. Verifica los logs de consola del navegador
3. Pregunta en el canal de Slack del equipo
4. Contacta al tech lead

## 💡 Tips

- Usa diferentes API Keys para desarrollo y producción
- No compartas tu API Key personal
- Si trabajas en múltiples proyectos, cada uno debe tener su propio `.env`
- Reinicia el servidor después de cambiar `.env`

---

**¡Bienvenido al equipo!** 🎉
