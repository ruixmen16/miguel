import { Router } from 'express'
import { crearLider, listarLideres } from '../controllers/lideres.controller.js'
import { verificarToken } from '../middleware/auth.js'

const router = Router()

router.use(verificarToken)
router.get('/', listarLideres)
router.post('/', crearLider)

export default router
