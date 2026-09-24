import { sesionValida } from '../models/db.js'

export async function verificarToken(req, res, next) {
    const header = req.headers['authorization'] || ''
    const token = header.replace('Bearer ', '').trim()

    if (!token) {
        return res.status(401).json({ message: 'No autorizado' })
    }

    const sesion = await sesionValida(token)
    if (!sesion) {
        return res.status(401).json({ message: 'Sesión inválida o expirada' })
    }

    req.usuario = { id: sesion.uid, nombre: sesion.nombre, rol: sesion.rol, activo: sesion.activo }
    req.sesion = { token }
    next()
}

export function soloAdmin(req, res, next) {
    if (req.usuario?.rol !== 'admin') {
        return res.status(403).json({ message: 'Solo administradores pueden realizar esta acción' })
    }
    next()
}
