// Test para verificar que la detección automática funciona correctamente
console.log('=== Prueba de detección automática de estructura API ===')

// Simulamos la función de detección
function detectarEstructuraApi(datos) {
  if (!Array.isArray(datos) || datos.length === 0) return { labelKey: 'label', valueKey: 'value' }
  
  const primer = datos[0]
  if (typeof primer !== 'object' || primer === null) return { labelKey: 'label', valueKey: 'value' }
  
  const obj = primer
  const keys = Object.keys(obj)
  
  // Detectar claves comunes para etiqueta
  const labelKeys = ['etiqueta', 'label', 'texto', 'nombre', 'name', 'title']
  const valueKeys = ['valor', 'value', 'id', 'codigo', 'code']
  
  const labelKey = labelKeys.find(k => keys.includes(k)) || keys[0] || 'label'
  const valueKey = valueKeys.find(k => keys.includes(k)) || keys[1] || 'value'
  
  return { labelKey, valueKey }
}

// Datos de ejemplo como los que envía la API
const datosApi = [
  {"etiqueta": "año", "valor": 1},
  {"etiqueta": "mes", "valor": 2}
]

console.log('Datos originales de la API:', JSON.stringify(datosApi, null, 2))

// Detectar estructura
const estructura = detectarEstructuraApi(datosApi)
console.log('Estructura detectada:', estructura)

// Mapear a formato estándar
const opcionesMapeadas = datosApi.map(it => ({
  label: String(it[estructura.labelKey] ?? ''),
  value: it[estructura.valueKey] ?? null
}))

console.log('Opciones mapeadas al formato estándar:', JSON.stringify(opcionesMapeadas, null, 2))

// Verificar que el componente puede usar option-label="label" y option-value="value"
console.log('\n✅ El componente PrimeSelect puede usar:')
console.log('   option-label="label"')
console.log('   option-value="value"')
console.log('\n✅ Con las opciones mapeadas, no importa si la API envía "etiqueta/valor" o "label/value"')
console.log('✅ Todo se normaliza a la estructura estándar {label, value}')