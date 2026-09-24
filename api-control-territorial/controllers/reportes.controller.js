import pool from '../config/database.js'

export async function crearReporte(req, res) {
    const payload = req.body || {}
    const required = ['parroquia', 'descripcion', 'tipo_reporte']
    const missing = required.filter((field) => !payload[field])

    if (missing.length) {
        return res.status(400).json({ message: `Faltan campos: ${missing.join(', ')}` })
    }

    const [result] = await pool.query(
        `INSERT INTO reportes (
            usuario_id, parroquia, sector, tipo_reporte, descripcion, prioridad, estado, latitud, longitud,
            lugar_votacion, telefono, distrito, nombre_contacto, personas_votan,
            tipo_necesidad, cuantos_brigadistas, responsable_brigada,
            tipo_evento, candidato_evento, num_asistentes, aceptacion_evento,
            tipo_presencia_rival, nivel_amenaza,
            tipo_rumor, sobre_quien_rumor,
            necesidad_movilizacion,
            edad_rango, genero_indeciso, ocupacion_indeciso, factor_duda, perfil_votante,
            accion_sugerida, fuente, procesado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            req.usuario.id,
            payload.parroquia,
            payload.sector || '',
            payload.tipo_reporte,
            payload.descripcion,
            payload.prioridad || 'Media',
            payload.estado || 'Pendiente',
            payload.latitud || null,
            payload.longitud || null,
            payload.lugar_votacion || null,
            payload.telefono || null,
            payload.distrito || null,
            payload.nombre_contacto || null,
            payload.personas_votan || null,
            payload.tipo_necesidad || null,
            payload.cuantos_brigadistas || null,
            payload.responsable_brigada || null,
            payload.tipo_evento || null,
            payload.candidato_evento || null,
            payload.num_asistentes || null,
            payload.aceptacion_evento || null,
            payload.tipo_presencia_rival || null,
            payload.nivel_amenaza || null,
            payload.tipo_rumor || null,
            payload.sobre_quien_rumor || null,
            payload.necesidad_movilizacion || null,
            payload.edad_rango || null,
            payload.genero_indeciso || null,
            payload.ocupacion_indeciso || null,
            payload.factor_duda || null,
            payload.perfil_votante || null,
            payload.accion_sugerida || null,
            'Web',
            'No'
        ]
    )

    return res.status(201).json({ ok: true, id: result.insertId })
}

export async function listarReportes(req, res) {
    const [rows] = await pool.query(
        'SELECT * FROM reportes WHERE usuario_id = ? ORDER BY creado_at DESC',
        [req.usuario.id]
    )
    res.json({ ok: true, reportes: rows })
}

export async function registrarRegistroTerritorial(req, res) {
    const payload = req.body || {}
    const tipo = payload.tipo === 'lider' ? 'lider' : 'propaganda'
    const fotoUrl = req.file ? `/uploads/referencia_imagen_propaganda/${req.file.filename}` : null

    try {
        const [result] = await pool.query(
            `INSERT INTO reportes (
                usuario_id, parroquia, tipo_reporte, descripcion, tipo_registro, nombre_persona, contacto,
                foto_base64, foto_nombre, foto_mime, tamano, latitud, longitud, whatsapp, correo, fuente, procesado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                req.usuario.id,
                payload.parroquia || '',
                tipo === 'lider' ? 'Líder' : 'Propaganda',
                payload.descripcion || (tipo === 'lider' ? 'Registro de líder' : 'Registro de propaganda'),
                tipo,
                payload.nombre_persona || null,
                payload.contacto || null,
                fotoUrl,
                req.file?.originalname || null,
                req.file?.mimetype || null,
                payload.tamano || null,
                payload.latitud ? Number(payload.latitud) : null,
                payload.longitud ? Number(payload.longitud) : null,
                payload.whatsapp || null,
                payload.correo || null,
                'Web',
                'No',
            ]
        )

        return res.status(201).json({ ok: true, id: result.insertId, foto_url: fotoUrl })
    } catch (error) {
        return res.status(500).json({ ok: false, message: 'No se pudo guardar el registro', detail: error.message })
    }
}
