import pool from '../config/database.js'

export async function listarCandidatos(req, res) {
    try {
        const [rows] = await pool.query(
            'SELECT id, nombre, partido FROM candidatos WHERE activo = 1 ORDER BY id ASC'
        )
        return res.json({ ok: true, candidatos: rows })
    } catch (error) {
        return res.status(500).json({ ok: false, message: 'No se pudieron cargar los candidatos', detail: error.message })
    }
}
