import pool from '../config/database.js'

export async function crearPropaganda(req, res) {
    const payload = req.body || {}

    try {
        const [result] = await pool.query(
            `INSERT INTO propagandas (usuario_id, parroquia, nombre, contacto, foto_url, tamano, gps) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.usuario.id, payload.parroquia || null, payload.nombre || null, payload.contacto || null, payload.foto_url || null, payload.tamano || null, payload.gps || null]
        )

        return res.status(201).json({ ok: true, id: result.insertId })
    } catch (error) {
        return res.status(500).json({ ok: false, message: 'No se pudo guardar la propaganda', detail: error.message })
    }
}

export async function listarPropagandas(req, res) {
    try {
        const [rows] = await pool.query('SELECT * FROM propagandas WHERE usuario_id = ? ORDER BY creado_at DESC', [req.usuario.id])
        return res.json({ ok: true, propagandas: rows })
    } catch (error) {
        return res.status(500).json({ ok: false, message: 'No se pudieron cargar las propagandas', detail: error.message })
    }
}
