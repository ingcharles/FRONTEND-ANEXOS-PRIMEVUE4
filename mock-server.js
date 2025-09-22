// Mock API server para test de dependencias
import express from 'express'
import cors from 'cors'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

// Endpoint para años (independiente)
app.get('/api/years', (req, res) => {
  console.log('📅 Solicitud para años independientes')
  res.json([
    { etiqueta: 'Año 2022', valor: 2022 },
    { etiqueta: 'Año 2023', valor: 2023 },
    { etiqueta: 'Año 2024', valor: 2024 }
  ])
})

// Endpoint para países (independiente)
app.get('/api/countries', (req, res) => {
  console.log('🌍 Solicitud para países independientes')
  res.json([
    { etiqueta: 'Estados Unidos', valor: 'US' },
    { etiqueta: 'España', valor: 'ES' },
    { etiqueta: 'México', valor: 'MX' }
  ])
})

// Endpoint para ciudades (dependiente del país)
app.get('/api/cities', (req, res) => {
  const country = req.query.country
  console.log(`🏙️ Solicitud para ciudades del país: ${country}`)
  
  const cities = {
    'US': [
      { etiqueta: 'Nueva York', valor: 'NY' },
      { etiqueta: 'Los Ángeles', valor: 'LA' },
      { etiqueta: 'Chicago', valor: 'CHI' }
    ],
    'ES': [
      { etiqueta: 'Madrid', valor: 'MAD' },
      { etiqueta: 'Barcelona', valor: 'BCN' },
      { etiqueta: 'Valencia', valor: 'VAL' }
    ],
    'MX': [
      { etiqueta: 'Ciudad de México', valor: 'CDMX' },
      { etiqueta: 'Guadalajara', valor: 'GDL' },
      { etiqueta: 'Monterrey', valor: 'MTY' }
    ]
  }
  
  res.json(cities[country] || [])
})

// Endpoint con estructura inglesa para comparar
app.get('/api/categories', (req, res) => {
  console.log('📂 Solicitud para categorías (estructura inglesa)')
  res.json([
    { label: 'Technology', value: 'tech' },
    { label: 'Business', value: 'business' },
    { label: 'Education', value: 'education' }
  ])
})

app.listen(port, () => {
  console.log(`🚀 Servidor mock corriendo en http://localhost:${port}`)
  console.log('Endpoints disponibles:')
  console.log('  GET /api/years - Años (estructura española)')
  console.log('  GET /api/countries - Países (estructura española)')
  console.log('  GET /api/cities?country=XX - Ciudades por país (estructura española)')
  console.log('  GET /api/categories - Categorías (estructura inglesa)')
})