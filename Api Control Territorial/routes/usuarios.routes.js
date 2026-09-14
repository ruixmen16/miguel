import { Router } from 'express'
import { crearUsuario, listarUsuarios, resetPin, actualizarUsuario } from '../controllers/usuarios.controller.js'
import { verificarToken, soloAdmin } from '../middleware/auth.js'

const router = Router()

router.use(verificarToken, soloAdmin)

router.get('/', listarUsuarios)
router.post('/', crearUsuario)
router.patch('/:id', actualizarUsuario)
router.patch('/:id/reset-pin', resetPin)

export default router
