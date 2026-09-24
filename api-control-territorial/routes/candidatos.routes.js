import { Router } from 'express'
import { listarCandidatos } from '../controllers/candidatos.controller.js'
import { verificarToken } from '../middleware/auth.js'

const router = Router()

router.use(verificarToken)
router.get('/', listarCandidatos)

export default router
