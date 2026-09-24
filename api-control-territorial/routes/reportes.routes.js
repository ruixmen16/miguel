import { Router } from 'express'
import { crearReporte, listarReportes, registrarRegistroTerritorial } from '../controllers/reportes.controller.js'
import { verificarToken } from '../middleware/auth.js'
import { uploadPropaganda } from '../middleware/upload.js'

const router = Router()

router.use(verificarToken)

router.get('/', listarReportes)
router.post('/', crearReporte)
router.post('/registro', uploadPropaganda.single('foto'), registrarRegistroTerritorial)

export default router
