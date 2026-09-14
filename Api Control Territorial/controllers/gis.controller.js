import pool from '../config/database.js'
import XLSX from 'xlsx'

export async function gisHealth(_req, res) {
    try {
        await pool.query('SELECT 1 AS ok')

        res.json({
            ok: true,
            source: 'mysql',
            message: 'GIS backend conectado a base de datos',
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'No se pudo conectar al backend GIS (MySQL)',
            detail: error.message,
        })
    }
}

export async function getGisDatos(_req, res) {
    try {
        const [reportesRows] = await pool.query(
            `SELECT
                r.id,
                DATE_FORMAT(r.creado_at, '%Y-%m-%d %H:%i:%s') AS fecha,
                u.nombre AS responsable,
                r.parroquia,
                r.sector AS barrio,
                r.tipo_reporte AS tipo,
                r.tipo_reporte,
                r.descripcion,
                r.prioridad,
                r.estado,
                r.latitud AS lat,
                r.longitud AS lon,
                r.lugar_votacion,
                r.telefono,
                r.distrito,
                r.nombre_contacto,
                r.personas_votan,
                r.tipo_necesidad,
                r.cuantos_brigadistas,
                r.responsable_brigada,
                r.tipo_evento,
                r.candidato_evento,
                r.num_asistentes,
                r.aceptacion_evento,
                r.tipo_presencia_rival,
                r.nivel_amenaza,
                r.tipo_rumor,
                r.sobre_quien_rumor,
                r.necesidad_movilizacion,
                r.edad_rango,
                r.genero_indeciso,
                r.ocupacion_indeciso,
                r.factor_duda,
                r.perfil_votante,
                r.accion_sugerida,
                r.fuente,
                r.procesado,
                r.tipo_registro,
                r.nombre_persona,
                r.contacto,
                r.foto_nombre,
                r.foto_mime,
                r.tamano,
                r.whatsapp,
                r.correo,
                CASE
                    WHEN r.foto_base64 LIKE '/uploads/%' THEN r.foto_base64
                    WHEN r.foto_base64 LIKE 'data:image/%' THEN r.foto_base64
                    ELSE NULL
                END AS foto_url
            FROM reportes r
            LEFT JOIN usuarios u ON u.id = r.usuario_id
            ORDER BY r.creado_at DESC
            LIMIT 5000`
        )

        const [dashRows] = await pool.query(
            `SELECT
                COUNT(*) AS reportes_total,
                SUM(CASE WHEN DATE(creado_at) = CURRENT_DATE() THEN 1 ELSE 0 END) AS reportes_hoy,
                SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) AS pendientes,
                SUM(CASE WHEN estado = 'Resuelto' THEN 1 ELSE 0 END) AS resueltos,
                SUM(CASE WHEN tipo_reporte = 'Brigada activa' THEN 1 ELSE 0 END) AS brigadas_activas,
                SUM(CASE WHEN tipo_reporte = 'Casa amiga' THEN 1 ELSE 0 END) AS casas_visitadas,
                SUM(CASE WHEN foto_base64 IS NOT NULL AND foto_base64 <> '' THEN 1 ELSE 0 END) AS reportes_con_foto
            FROM reportes`
        )

        const dashboard = dashRows?.[0] || {
            reportes_total: 0,
            reportes_hoy: 0,
            pendientes: 0,
            resueltos: 0,
            brigadas_activas: 0,
            casas_visitadas: 0,
            reportes_con_foto: 0,
        }

        res.json({
            ok: true,
            source: 'mysql',
            actualizado: new Date().toISOString(),
            reportes: reportesRows,
            dashboard,
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'No se pudieron cargar datos GIS desde MySQL',
            detail: error.message,
        })
    }
}

export async function getIntencionVotoDatos(_req, res) {
    try {
        const generoFiltroRaw = String(_req.query?.genero || 'todos').trim()
        const edadRangoFiltroRaw = String(_req.query?.rango_edad || 'todos').trim()
        const parroquiaFiltroRaw = String(_req.query?.parroquia || 'todos').trim()
        const generoFiltro = generoFiltroRaw.toLowerCase()

        const edadRangoCase = `
            CASE
                WHEN e.edad IS NULL THEN 'Sin edad'
                WHEN e.edad < 18 THEN 'Menor de 18'
                WHEN e.edad BETWEEN 18 AND 24 THEN '18-24'
                WHEN e.edad BETWEEN 25 AND 34 THEN '25-34'
                WHEN e.edad BETWEEN 35 AND 44 THEN '35-44'
                WHEN e.edad BETWEEN 45 AND 59 THEN '45-59'
                ELSE '60+'
            END
        `

        const whereClauses = []
        const whereParams = []

        if (generoFiltro && generoFiltro !== 'todos') {
            whereClauses.push('LOWER(TRIM(e.genero)) = ?')
            whereParams.push(generoFiltro)
        }

        if (edadRangoFiltroRaw && edadRangoFiltroRaw !== 'todos') {
            whereClauses.push(`${edadRangoCase} = ?`)
            whereParams.push(edadRangoFiltroRaw)
        }

        if (parroquiaFiltroRaw && parroquiaFiltroRaw !== 'todos') {
            whereClauses.push("TRIM(COALESCE(e.parroquia, '')) = ?")
            whereParams.push(parroquiaFiltroRaw)
        }

        const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''
        const candidatosJoinFilters = []

        if (generoFiltro && generoFiltro !== 'todos') {
            candidatosJoinFilters.push('LOWER(TRIM(e.genero)) = ?')
        }

        if (edadRangoFiltroRaw && edadRangoFiltroRaw !== 'todos') {
            candidatosJoinFilters.push(`${edadRangoCase} = ?`)
        }

        if (parroquiaFiltroRaw && parroquiaFiltroRaw !== 'todos') {
            candidatosJoinFilters.push("TRIM(COALESCE(e.parroquia, '')) = ?")
        }

        const joinFilterSql = candidatosJoinFilters.length ? ` AND ${candidatosJoinFilters.join(' AND ')}` : ''

        const [resumenRows] = await pool.query(
            `SELECT
                c.id AS candidato_id,
                c.nombre,
                c.partido,
                COUNT(e.id) AS votos
            FROM candidatos c
            LEFT JOIN encuestas_candidato e ON e.candidato_id = c.id${joinFilterSql}
            WHERE c.activo = 1
            GROUP BY c.id, c.nombre, c.partido
            ORDER BY votos DESC, c.id ASC`
            , whereParams
        )

        const [dashRows] = await pool.query(
            `SELECT
                COUNT(*) AS encuestas_total,
                SUM(CASE WHEN DATE(creado_at) = CURRENT_DATE() THEN 1 ELSE 0 END) AS encuestas_hoy
            FROM encuestas_candidato`
        )

        const [dashFiltradoRows] = await pool.query(
            `SELECT
                COUNT(*) AS encuestas_filtradas,
                SUM(CASE WHEN DATE(e.creado_at) = CURRENT_DATE() THEN 1 ELSE 0 END) AS encuestas_hoy_filtradas
            FROM encuestas_candidato e
            ${whereSql}`,
            whereParams
        )

        const [generosRows] = await pool.query(
            `SELECT DISTINCT TRIM(genero) AS genero
            FROM encuestas_candidato
            WHERE genero IS NOT NULL AND TRIM(genero) <> ''
            ORDER BY genero ASC`
        )

        const [parroquiasRows] = await pool.query(
            `SELECT DISTINCT TRIM(parroquia) AS parroquia
            FROM encuestas_candidato
            WHERE parroquia IS NOT NULL AND TRIM(parroquia) <> ''
            ORDER BY parroquia ASC`
        )

        const [rangosRows] = await pool.query(
            `SELECT
                ${edadRangoCase} AS rango_edad,
                COUNT(*) AS total
            FROM encuestas_candidato e
            GROUP BY ${edadRangoCase}
            ORDER BY
                CASE ${edadRangoCase}
                    WHEN 'Menor de 18' THEN 1
                    WHEN '18-24' THEN 2
                    WHEN '25-34' THEN 3
                    WHEN '35-44' THEN 4
                    WHEN '45-59' THEN 5
                    WHEN '60+' THEN 6
                    ELSE 7
                END ASC`
        )

        const [resumenGeneroRows] = await pool.query(
            `SELECT
                TRIM(COALESCE(e.genero, 'Sin genero')) AS genero,
                COUNT(*) AS total
            FROM encuestas_candidato e
            ${whereSql}
            GROUP BY TRIM(COALESCE(e.genero, 'Sin genero'))
            ORDER BY total DESC, genero ASC`,
            whereParams
        )

        const [resumenEdadRows] = await pool.query(
            `SELECT
                ${edadRangoCase} AS rango_edad,
                COUNT(*) AS total
            FROM encuestas_candidato e
            ${whereSql}
            GROUP BY ${edadRangoCase}
            ORDER BY
                CASE ${edadRangoCase}
                    WHEN 'Menor de 18' THEN 1
                    WHEN '18-24' THEN 2
                    WHEN '25-34' THEN 3
                    WHEN '35-44' THEN 4
                    WHEN '45-59' THEN 5
                    WHEN '60+' THEN 6
                    ELSE 7
                END ASC`,
            whereParams
        )

        const [votosPorParroquiaRows] = await pool.query(
            `SELECT
                e.candidato_id,
                TRIM(COALESCE(e.parroquia, 'Sin parroquia')) AS parroquia,
                COUNT(*) AS votos
            FROM encuestas_candidato e
            ${whereSql}
            GROUP BY e.candidato_id, TRIM(COALESCE(e.parroquia, 'Sin parroquia'))
            ORDER BY e.candidato_id ASC, votos DESC, parroquia ASC`,
            whereParams
        )

        const [ultimasRows] = await pool.query(
            `SELECT
                e.id,
                DATE_FORMAT(e.creado_at, '%Y-%m-%d %H:%i:%s') AS fecha,
                e.parroquia,
                e.edad,
                e.genero,
                e.observacion,
                e.candidato_id,
                c.nombre AS candidato_nombre,
                c.partido AS candidato_partido,
                u.nombre AS encuestador
            FROM encuestas_candidato e
            LEFT JOIN candidatos c ON c.id = e.candidato_id
            LEFT JOIN usuarios u ON u.id = e.usuario_id
            ${whereSql}
            ORDER BY e.creado_at DESC
            LIMIT 50`,
            whereParams
        )

        const totalVotos = Number(dashRows?.[0]?.encuestas_total || 0)
        const totalVotosFiltrados = Number(dashFiltradoRows?.[0]?.encuestas_filtradas || 0)
        const votosParroquiaPorCandidato = new Map()

        for (const row of votosPorParroquiaRows) {
            const key = Number(row.candidato_id || 0)
            const votos = Number(row.votos || 0)
            const current = votosParroquiaPorCandidato.get(key) || []
            current.push({
                parroquia: row.parroquia,
                votos,
            })
            votosParroquiaPorCandidato.set(key, current)
        }

        const resumen = resumenRows.map((row) => {
            const candidatoId = Number(row.candidato_id || 0)
            const votos = Number(row.votos || 0)
            const porcentaje = totalVotosFiltrados > 0 ? Number(((votos * 100) / totalVotosFiltrados).toFixed(2)) : 0
            const votosPorParroquia = (votosParroquiaPorCandidato.get(candidatoId) || []).map((entry) => ({
                ...entry,
                porcentaje: votos > 0 ? Number(((entry.votos * 100) / votos).toFixed(2)) : 0,
            }))
            return {
                ...row,
                votos,
                porcentaje,
                votos_por_parroquia: votosPorParroquia,
            }
        })

        const resumenPorGenero = resumenGeneroRows.map((row) => {
            const total = Number(row.total || 0)
            return {
                genero: row.genero,
                total,
                porcentaje: totalVotosFiltrados > 0 ? Number(((total * 100) / totalVotosFiltrados).toFixed(2)) : 0,
            }
        })

        const resumenPorEdad = resumenEdadRows.map((row) => {
            const total = Number(row.total || 0)
            return {
                rango_edad: row.rango_edad,
                total,
                porcentaje: totalVotosFiltrados > 0 ? Number(((total * 100) / totalVotosFiltrados).toFixed(2)) : 0,
            }
        })

        res.json({
            ok: true,
            source: 'mysql',
            actualizado: new Date().toISOString(),
            dashboard: {
                encuestas_total: totalVotos,
                encuestas_hoy: Number(dashRows?.[0]?.encuestas_hoy || 0),
                total_votos: totalVotos,
                total_votos_filtrados: totalVotosFiltrados,
                encuestas_hoy_filtradas: Number(dashFiltradoRows?.[0]?.encuestas_hoy_filtradas || 0),
            },
            filtros: {
                genero: generoFiltroRaw || 'todos',
                rango_edad: edadRangoFiltroRaw || 'todos',
                parroquia: parroquiaFiltroRaw || 'todos',
                generos_disponibles: generosRows.map((row) => row.genero),
                rangos_edad_disponibles: rangosRows.map((row) => row.rango_edad),
                parroquias_disponibles: parroquiasRows.map((row) => row.parroquia),
            },
            resumen_candidatos: resumen,
            resumen_genero: resumenPorGenero,
            resumen_edad: resumenPorEdad,
            ultimas_encuestas: ultimasRows,
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'No se pudieron cargar datos de intencion de voto',
            detail: error.message,
        })
    }
}

export async function getParroquiasGeojson(_req, res) {
    return res.status(410).json({
        ok: false,
        message: 'Endpoint obsoleto: usa el archivo estatico /parroquias.geojson en FRONT_GIS',
    })
}

export async function exportGisExcel(_req, res) {
    try {
        const [rows] = await pool.query(
            `SELECT
                r.id,
                DATE_FORMAT(r.creado_at, '%Y-%m-%d %H:%i:%s') AS fecha,
                u.nombre AS responsable,
                r.parroquia,
                r.sector,
                r.tipo_reporte,
                r.descripcion,
                r.prioridad,
                r.estado,
                r.latitud,
                r.longitud,
                r.lugar_votacion,
                r.telefono,
                r.distrito,
                r.nombre_contacto,
                r.personas_votan,
                r.tipo_necesidad,
                r.cuantos_brigadistas,
                r.responsable_brigada,
                r.tipo_evento,
                r.candidato_evento,
                r.num_asistentes,
                r.aceptacion_evento,
                r.tipo_presencia_rival,
                r.nivel_amenaza,
                r.tipo_rumor,
                r.sobre_quien_rumor,
                r.necesidad_movilizacion,
                r.edad_rango,
                r.genero_indeciso,
                r.ocupacion_indeciso,
                r.factor_duda,
                r.perfil_votante,
                r.accion_sugerida,
                r.fuente,
                r.procesado
            FROM reportes r
            LEFT JOIN usuarios u ON u.id = r.usuario_id
            ORDER BY r.creado_at DESC
            LIMIT 10000`
        )

        const worksheet = XLSX.utils.json_to_sheet(rows)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reportes')
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

        const now = new Date()
        const y = now.getFullYear()
        const m = String(now.getMonth() + 1).padStart(2, '0')
        const d = String(now.getDate()).padStart(2, '0')

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename="reportes-gis-${y}${m}${d}.xlsx"`)
        return res.send(buffer)
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: 'No se pudo generar el Excel de reportes',
            detail: error.message,
        })
    }
}
