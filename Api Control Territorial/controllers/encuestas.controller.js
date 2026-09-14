import pool from '../config/database.js'
import { validarEncuestaCandidato } from '../utils/validaciones.js'

export async function crearEncuestaCandidato(req, res) {
    const payload = req.body || {}
    const validacion = validarEncuestaCandidato(payload)

    if (!validacion.ok) {
        return res.status(400).json({ ok: false, message: 'Datos incompletos', errors: validacion.errors })
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO encuestas_candidato (usuario_id, parroquia, edad, genero, candidato_id, latitud, longitud, observacion)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.usuario.id, payload.parroquia, Number(payload.edad), payload.genero, Number(payload.candidato_id), payload.latitud || null, payload.longitud || null, payload.observacion || null]
        )

        return res.status(201).json({ ok: true, id: result.insertId })
    } catch (error) {
        return res.status(500).json({ ok: false, message: 'No se pudo guardar la encuesta', detail: error.message })
    }
}

export async function listarEncuestasCandidato(req, res) {
    try {
        const [rows] = await pool.query(
            `SELECT e.*, c.nombre AS candidato_nombre
             FROM encuestas_candidato e
             LEFT JOIN candidatos c ON c.id = e.candidato_id
             WHERE e.usuario_id = ?
             ORDER BY e.creado_at DESC`,
            [req.usuario.id]
        )

        return res.json({ ok: true, encuestas: rows })
    } catch (error) {
        return res.status(500).json({ ok: false, message: 'No se pudieron cargar las encuestas', detail: error.message })
    }
}
