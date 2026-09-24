import { Router } from 'express'
import { crearPropaganda, listarPropagandas } from '../controllers/propagandas.controller.js'
import { verificarToken } from '../middleware/auth.js'

const router = Router()

router.use(verificarToken)
router.get('/', listarPropagandas)
router.post('/', crearPropaganda)

export default router
