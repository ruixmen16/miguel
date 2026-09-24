import { Router } from 'express'
import { crearEncuestaCandidato, listarEncuestasCandidato } from '../controllers/encuestas.controller.js'
import { verificarToken } from '../middleware/auth.js'

const router = Router()

router.use(verificarToken)
router.get('/candidatos', listarEncuestasCandidato)
router.post('/candidatos', crearEncuestaCandidato)

export default router
