import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.routes.js'
import usuariosRoutes from './routes/usuarios.routes.js'
import reportesRoutes from './routes/reportes.routes.js'
import gisRoutes from './routes/gis.routes.js'
import encuestasRoutes from './routes/encuestas.routes.js'
import propagandasRoutes from './routes/propagandas.routes.js'
import lideresRoutes from './routes/lideres.routes.js'
import candidatosRoutes from './routes/candidatos.routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Servir imágenes de propaganda como archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/reportes', reportesRoutes)
app.use('/api/gis', gisRoutes)
app.use('/api/encuestas', encuestasRoutes)
app.use('/api/propagandas', propagandasRoutes)
app.use('/api/lideres', lideresRoutes)
app.use('/api/candidatos', candidatosRoutes)

app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'miguel-back' })
})

app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`)
})

