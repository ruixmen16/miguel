import pool from '../config/database.js'

export async function crearLider(req, res) {
    const payload = req.body || {}

    try {
        const [result] = await pool.query(
            `INSERT INTO lideres (usuario_id, parroquia, nombre, whatsapp, correo) VALUES (?, ?, ?, ?, ?)`,
            [req.usuario.id, payload.parroquia || null, payload.nombre || null, payload.whatsapp || null, payload.correo || null]
        )

        return res.status(201).json({ ok: true, id: result.insertId })
    } catch (error) {
        return res.status(500).json({ ok: false, message: 'No se pudo guardar el líder', detail: error.message })
    }
}

export async function listarLideres(req, res) {
    try {
        const [rows] = await pool.query('SELECT * FROM lideres WHERE usuario_id = ? ORDER BY creado_at DESC', [req.usuario.id])
        return res.json({ ok: true, lideres: rows })
    } catch (error) {
        return res.status(500).json({ ok: false, message: 'No se pudieron cargar los líderes', detail: error.message })
    }
}
