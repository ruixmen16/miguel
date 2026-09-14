import { v4 as uuidv4 } from 'uuid'
import pool from '../config/database.js'

export const ROLES_VALIDOS = ['admin', 'coordinador', 'brigadista', 'observador']

export async function buscarUsuario({ usuario, telefono }) {
    const [rows] = await pool.query(
        'SELECT * FROM usuarios WHERE telefono = ? OR usuario = ? LIMIT 1',
        [telefono || null, usuario || null]
    )
    return rows[0] || null
}

export async function crearSesion(usuarioId, remember) {
    const token = uuidv4()
    const dias = remember ? 30 : 1
    const expiracion = new Date(Date.now() + dias * 24 * 60 * 60 * 1000)
    await pool.query(
        'INSERT INTO sesiones (usuario_id, token, remember_me, expiracion) VALUES (?, ?, ?, ?)',
        [usuarioId, token, remember ? 1 : 0, expiracion]
    )
    return token
}

export async function sesionValida(token) {
    const [rows] = await pool.query(
        'SELECT s.*, u.id as uid, u.nombre, u.rol, u.activo FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id WHERE s.token = ? AND s.expiracion > NOW() LIMIT 1',
        [token]
    )
    return rows[0] || null
}

export async function eliminarSesion(token) {
    await pool.query('DELETE FROM sesiones WHERE token = ?', [token])
}
