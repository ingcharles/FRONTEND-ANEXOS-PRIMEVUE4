# ⚡ Configuración Rápida de DecisionRules

## 🚀 Setup en 3 Pasos

### 1️⃣ Crear archivo .env

En la raíz del proyecto:

```bash
# .env
VITE_DECISIONRULES_API_KEY=tu-api-key-aqui
VITE_DECISIONRULES_URL=https://api.decisionrules.io
```

### 2️⃣ Obtener API Key

1. Ve a [app.decisionrules.io](https://app.decisionrules.io)
2. Inicia sesión
3. Settings → API Keys
4. Copia tu API Key
5. Pégala en `.env`

### 3️⃣ Reiniciar servidor

```bash
npm run dev
```

## ✅ Verificar

Abre el diseñador → Pestaña "Lógica" → "DecisionRules"

Deberías ver:
```
✅ Configurado (Variables de Entorno)
```

## 📝 Notas

- ✅ `.env` está en `.gitignore` (no se sube a Git)
- ✅ `.env.example` es la plantilla para el equipo
- ✅ Reinicia el servidor después de cambiar `.env`

## 🌍 Producción

Configura las variables en tu hosting:

**Vercel**: Settings → Environment Variables  
**Netlify**: Site settings → Environment  
**Docker**: `--build-arg VITE_DECISIONRULES_API_KEY=...`

## 📚 Documentación Completa

Ver [DECISIONRULES_VARIABLES_ENTORNO.md](DECISIONRULES_VARIABLES_ENTORNO.md)

## 🆘 Problemas?

1. Verifica que el archivo se llama `.env` (no `.env.txt`)
2. Verifica que las variables empiezan con `VITE_`
3. Reinicia el servidor
4. Revisa la consola del navegador

---

**Alternativa (solo desarrollo)**: Si no quieres usar `.env`, puedes configurar manualmente en la UI del diseñador, pero **no es recomendado para producción**.
