import bcrypt from 'bcryptjs'
import pool from '../config/database.js'
import { ROLES_VALIDOS, buscarUsuario } from '../models/db.js'
import { validarUsuario } from '../utils/validaciones.js'

export async function crearUsuario(req, res) {
    const { nombre, telefono, usuario, pin, rol } = req.body || {}
    const validacion = validarUsuario({ nombre, telefono, usuario, pin, rol }, { requirePin: true })

    if (!validacion.ok) {
        const msg = validacion.errors.pin || validacion.errors.contacto || validacion.errors.nombre || validacion.errors.telefono || 'Datos del usuario no válidos'
        return res.status(400).json({ message: msg })
    }

    const duplicado = await buscarUsuario({ usuario, telefono })
    if (duplicado) {
        return res.status(409).json({ message: 'Ya existe un usuario con ese teléfono o alias' })
    }

    const rolFinal = ROLES_VALIDOS.includes(rol) ? rol : 'brigadista'
    const pin_hash = bcrypt.hashSync(pin, 10)

    const [result] = await pool.query(
        'INSERT INTO usuarios (nombre, telefono, usuario, pin_hash, rol) VALUES (?, ?, ?, ?, ?)',
        [nombre.trim(), telefono || '', usuario || '', pin_hash, rolFinal]
    )

    return res.status(201).json({
        ok: true,
        message: 'Usuario creado',
        user: { id: result.insertId, nombre, telefono, usuario, rol: rolFinal }
    })
}

export async function actualizarUsuario(req, res) {
    const { id } = req.params
    const { nombre, telefono, usuario, pin, rol } = req.body || {}
    const validacion = validarUsuario({ nombre, telefono, usuario, pin: pin || '', rol }, { requirePin: false })

    if (!validacion.ok) {
        const msg = validacion.errors.nombre || validacion.errors.contacto || validacion.errors.telefono || validacion.errors.rol || 'Datos del usuario no válidos'
        return res.status(400).json({ message: msg })
    }

    const [currentRows] = await pool.query('SELECT id, telefono, usuario FROM usuarios WHERE id = ?', [id])
    if (!currentRows.length) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const current = currentRows[0]
    const nuevoTelefono = (telefono || current.telefono || '').trim()
    const nuevoUsuario = (usuario || current.usuario || '').trim()

    const [dupRows] = await pool.query(
        'SELECT id FROM usuarios WHERE (telefono = ? OR usuario = ?) AND id != ? LIMIT 1',
        [nuevoTelefono || null, nuevoUsuario || null, id]
    )
    if (dupRows.length) {
        return res.status(409).json({ message: 'Ya existe otro usuario con ese teléfono o alias' })
    }

    const fields = []
    const values = []

    fields.push('nombre = ?')
    values.push(String(nombre).trim())
    fields.push('telefono = ?')
    values.push(nuevoTelefono || '')
    fields.push('usuario = ?')
    values.push(nuevoUsuario || '')

    const rolFinal = ROLES_VALIDOS.includes(rol) ? rol : current.rol || 'brigadista'
    fields.push('rol = ?')
    values.push(rolFinal)

    if (pin && /^\d{4}$/.test(pin)) {
        const pin_hash = bcrypt.hashSync(pin, 10)
        fields.push('pin_hash = ?')
        values.push(pin_hash)
    }

    values.push(id)
    await pool.query(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`, values)

    res.json({ ok: true, message: 'Usuario actualizado correctamente' })
}


export async function listarUsuarios(_req, res) {
    const [rows] = await pool.query(
        'SELECT id, nombre, telefono, usuario, rol, activo, creado_at FROM usuarios ORDER BY id'
    )
    res.json({ ok: true, usuarios: rows })
}

export async function resetPin(req, res) {
    const { id } = req.params
    const { pin } = req.body || {}

    if (!/^\d{4}$/.test(pin)) {
        return res.status(400).json({ message: 'El PIN debe ser exactamente 4 dígitos numéricos' })
    }

    const [rows] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [id])
    if (!rows.length) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const pin_hash = bcrypt.hashSync(pin, 10)
    await pool.query('UPDATE usuarios SET pin_hash = ? WHERE id = ?', [pin_hash, id])

    res.json({ ok: true, message: 'PIN actualizado correctamente' })
}
