import bcrypt from 'bcryptjs'
import { crearSesion, buscarUsuario, eliminarSesion } from '../models/db.js'
import { normalizarCredenciales } from '../utils/validaciones.js'

export async function login(req, res) {
    const { usuario, telefono, pin, remember } = req.body || {}
    const credenciales = normalizarCredenciales({ usuario, telefono, pin, remember })

    if (!credenciales.ok) {
        return res.status(400).json({ message: credenciales.message })
    }

    const user = await buscarUsuario({ usuario, telefono: credenciales.telefono })
    if (!user) return res.status(401).json({ message: 'Usuario no registrado' })
    if (!user.activo) return res.status(403).json({ message: 'Usuario inactivo' })

    if (!bcrypt.compareSync(credenciales.pin, user.pin_hash)) {
        return res.status(401).json({ message: 'PIN incorrecto' })
    }

    const token = await crearSesion(user.id, !!credenciales.remember)
    return res.json({ ok: true, token, user: { id: user.id, nombre: user.nombre, rol: user.rol } })
}

export async function logout(req, res) {
    await eliminarSesion(req.sesion.token)
    res.json({ ok: true, message: 'Sesión cerrada' })
}
