import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip } from 'react-leaflet'
import Select from 'react-select'

const PORTOVIEJO_CENTER = [-1.0303484565096712, -80.33966163357898]
const API_URL = import.meta.env.VITE_API_URL || ''
const STORAGE_KEY = 'cepeid-session'
const ALL_TYPES_VALUE = '__all_types__'
const ALL_FILTERS_VALUE = 'todos'
const DATA_VIEW_REPORTES = 'reportes'
const DATA_VIEW_INTENCION = 'intencion_voto'
const CATEGORY_COLORS = {
    'Reporte ciudadano': '#2563eb',
    Incidencia: '#dc2626',
    'Brigada activa': '#16a34a',
    'Evento de campana': '#f59e0b',
    'Casa amiga': '#8b5cf6',
    Coordinador: '#0891b2',
    'Observacion electoral': '#64748b',
    'Presencia rival': '#be123c',
}

function toNumber(value, fallback = 0) {
    const n = Number(value)
    return Number.isFinite(n) ? n : fallback
}

function colorByPriority(prioridad) {
    if (prioridad === 'Critica') return '#9d0208'
    if (prioridad === 'Alta') return '#dc2f02'
    if (prioridad === 'Media') return '#ff9f1c'
    if (prioridad === 'Baja') return '#2a9d8f'
    return '#457b9d'
}

function markerColor(reporte) {
    return CATEGORY_COLORS[getTipoReporte(reporte)] || colorByPriority(reporte?.prioridad)
}

function getTipoReporte(reporte) {
    return compactValue(reporte?.tipo_reporte) || compactValue(reporte?.tipo) || 'Sin tipo'
}

function estadoClass(estado) {
    if (estado === 'Resuelto') return 'ok'
    if (estado === 'En proceso') return 'warn'
    return 'pend'
}

function pointKey(lat, lon) {
    return `${lat.toFixed(6)}|${lon.toFixed(6)}`
}

function compactValue(value) {
    if (value === null || value === undefined) return ''
    const text = String(value).trim()
    if (!text) return ''
    if (text.toLowerCase() === 'null') return ''
    return text
}

function getParroquiaName(feature) {
    const props = feature?.properties || {}
    return (
        props.parroquia ||
        props.PARROQUIA ||
        props.nombre ||
        props.NOMBRE ||
        props.name ||
        props.NAME ||
        'Parroquia sin nombre'
    )
}

function formatReportTime(fecha) {
    if (!fecha) return '--:--'
    const normalized = typeof fecha === 'string' ? fecha.replace(' ', 'T') : fecha
    const date = new Date(normalized)
    if (Number.isNaN(date.getTime())) return '--:--'
    return date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
}

function formatDateTime(fecha) {
    if (!fecha) return '--'
    const normalized = typeof fecha === 'string' ? fecha.replace(' ', 'T') : fecha
    const date = new Date(normalized)
    if (Number.isNaN(date.getTime())) return '--'
    return date.toLocaleString('es-EC', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function buildMediaUrl(value) {
    const raw = compactValue(value)
    if (!raw) return ''
    if (/^data:image\//i.test(raw)) return raw
    if (/^https?:\/\//i.test(raw)) return raw
    if (raw.startsWith('/')) return `${API_URL}${raw}`
    return `${API_URL}/${raw}`
}

export default function App() {
    const [payload, setPayload] = useState(null)
    const [geojson, setGeojson] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [isAuthReady, setIsAuthReady] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [remember, setRemember] = useState(true)
    const [telefono, setTelefono] = useState('')
    const [pin, setPin] = useState('')
    const [showPin, setShowPin] = useState(false)
    const [token, setToken] = useState('')
    const [user, setUser] = useState(null)
    const [authMessage, setAuthMessage] = useState('')
    const [isDownloading, setIsDownloading] = useState(false)
    const [dialog, setDialog] = useState({ open: false, groupKey: null, active: 0 })
    const [selectedParroquia, setSelectedParroquia] = useState('')
    const [hoveredParroquia, setHoveredParroquia] = useState('')
    const [showLegend, setShowLegend] = useState(false)
    const [selectedTipoReporte, setSelectedTipoReporte] = useState(ALL_TYPES_VALUE)
    const [selectedDataView, setSelectedDataView] = useState(DATA_VIEW_REPORTES)
    const [intencionPayload, setIntencionPayload] = useState(null)
    const [loadingIntencion, setLoadingIntencion] = useState(false)
    const [selectedParroquiaReporte, setSelectedParroquiaReporte] = useState(ALL_FILTERS_VALUE)
    const [selectedGeneroFiltro, setSelectedGeneroFiltro] = useState(ALL_FILTERS_VALUE)
    const [selectedRangoEdadFiltro, setSelectedRangoEdadFiltro] = useState(ALL_FILTERS_VALUE)
    const [selectedParroquiaFiltro, setSelectedParroquiaFiltro] = useState(ALL_FILTERS_VALUE)

    const resetSession = (message = '') => {
        setIsLoggedIn(false)
        setToken('')
        setUser(null)
        setPayload(null)
        setDialog({ open: false, groupKey: null, active: 0 })
        setSelectedParroquia('')
        setHoveredParroquia('')
        setAuthMessage(message)
        localStorage.removeItem(STORAGE_KEY)
    }

    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                if (parsed?.token && parsed?.user?.nombre) {
                    setToken(parsed.token)
                    setUser(parsed.user)
                    setIsLoggedIn(true)
                } else {
                    localStorage.removeItem(STORAGE_KEY)
                }
            } catch {
                localStorage.removeItem(STORAGE_KEY)
            }
        }
        setIsAuthReady(true)
    }, [])

    useEffect(() => {
        if (!isLoggedIn || !token) {
            setLoading(false)
            return
        }

        let timer

        const load = async () => {
            try {
                const res = await fetch(`${API_URL}/api/gis/datos`, { headers: authHeaders })

                if (res.status === 401) {
                    resetSession('Tu sesión expiró. Inicia sesión nuevamente.')
                    setError('')
                    return
                }

                const data = await res.json()
                if (!res.ok || !data.ok) {
                    throw new Error(data.message || 'No se pudo cargar el mapa GIS')
                }
                setPayload(data)
                setError('')
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        setLoading(true)
        load()
        timer = setInterval(load, 30000)

        return () => clearInterval(timer)
    }, [isLoggedIn, token])

    useEffect(() => {
        if (!isLoggedIn || !token || selectedDataView !== DATA_VIEW_INTENCION) return

        let timer

        const loadIntencion = async () => {
            try {
                setLoadingIntencion(true)
                const query = new URLSearchParams({
                    genero: selectedGeneroFiltro,
                    rango_edad: selectedRangoEdadFiltro,
                    parroquia: selectedParroquiaFiltro,
                })
                const res = await fetch(`${API_URL}/api/gis/intencion-voto?${query.toString()}`, { headers: authHeaders })

                if (res.status === 401) {
                    resetSession('Tu sesión expiró. Inicia sesión nuevamente.')
                    setError('')
                    return
                }

                const data = await res.json()
                if (!res.ok || !data.ok) {
                    throw new Error(data.message || 'No se pudo cargar intención de voto')
                }

                setIntencionPayload(data)
                setError('')
            } catch (err) {
                setError(err.message)
            } finally {
                setLoadingIntencion(false)
            }
        }

        loadIntencion()
        timer = setInterval(loadIntencion, 30000)

        return () => clearInterval(timer)
    }, [isLoggedIn, token, selectedDataView, selectedGeneroFiltro, selectedRangoEdadFiltro, selectedParroquiaFiltro])

    useEffect(() => {
        const loadGeojson = async () => {
            try {
                const res = await fetch('/parroquias.geojson')
                if (!res.ok) throw new Error('No se pudo cargar el archivo parroquias.geojson')
                const data = await res.json()
                setGeojson(data)
            } catch (err) {
                setError(err.message)
            }
        }

        loadGeojson()
    }, [])

    const dashboard = payload?.dashboard || {}
    const reportes = useMemo(() => payload?.reportes || [], [payload])
    const intencionDashboard = intencionPayload?.dashboard || {}
    const intencionFiltros = intencionPayload?.filtros || {}
    const resumenCandidatos = useMemo(() => intencionPayload?.resumen_candidatos || [], [intencionPayload])
    const resumenGenero = useMemo(() => intencionPayload?.resumen_genero || [], [intencionPayload])
    const resumenEdad = useMemo(() => intencionPayload?.resumen_edad || [], [intencionPayload])
    const ultimasEncuestas = useMemo(() => intencionPayload?.ultimas_encuestas || [], [intencionPayload])
    const dataViewOptions = useMemo(
        () => [
            { value: DATA_VIEW_REPORTES, label: 'Reportes territoriales' },
            { value: DATA_VIEW_INTENCION, label: 'Intención de voto' },
        ],
        []
    )
    const selectedDataViewOption = useMemo(
        () => dataViewOptions.find((option) => option.value === selectedDataView) || dataViewOptions[0],
        [dataViewOptions, selectedDataView]
    )
    const generoOptions = useMemo(
        () => [
            { value: ALL_FILTERS_VALUE, label: 'Todos los géneros' },
            ...(intencionFiltros.generos_disponibles || []).map((item) => ({ value: item, label: item })),
        ],
        [intencionFiltros]
    )
    const rangoEdadOptions = useMemo(
        () => [
            { value: ALL_FILTERS_VALUE, label: 'Todos los rangos' },
            ...(intencionFiltros.rangos_edad_disponibles || []).map((item) => ({ value: item, label: item })),
        ],
        [intencionFiltros]
    )
    const parroquiaOptions = useMemo(
        () => [
            { value: ALL_FILTERS_VALUE, label: 'Todas las parroquias' },
            ...(intencionFiltros.parroquias_disponibles || []).map((item) => ({ value: item, label: item })),
        ],
        [intencionFiltros]
    )
    const selectedGeneroOption = useMemo(
        () => generoOptions.find((option) => option.value === selectedGeneroFiltro) || generoOptions[0],
        [generoOptions, selectedGeneroFiltro]
    )
    const selectedRangoEdadOption = useMemo(
        () => rangoEdadOptions.find((option) => option.value === selectedRangoEdadFiltro) || rangoEdadOptions[0],
        [rangoEdadOptions, selectedRangoEdadFiltro]
    )
    const selectedParroquiaOption = useMemo(
        () => parroquiaOptions.find((option) => option.value === selectedParroquiaFiltro) || parroquiaOptions[0],
        [parroquiaOptions, selectedParroquiaFiltro]
    )
    const tipoReporteOptions = useMemo(() => {
        const uniqueTypes = Array.from(new Set(reportes.map((r) => getTipoReporte(r))))
            .filter((type) => type && type !== 'Sin tipo')
            .sort((a, b) => a.localeCompare(b, 'es'))

        return [
            { value: ALL_TYPES_VALUE, label: 'Todos los tipos' },
            ...uniqueTypes.map((type) => ({ value: type, label: type })),
        ]
    }, [reportes])

    const selectedTipoOption = useMemo(
        () => tipoReporteOptions.find((option) => option.value === selectedTipoReporte) || tipoReporteOptions[0],
        [tipoReporteOptions, selectedTipoReporte]
    )

    const parroquiaReportesOptions = useMemo(() => {
        const uniqueParroquias = Array.from(new Set(reportes.map((r) => compactValue(r.parroquia)).filter(Boolean)))
            .sort((a, b) => a.localeCompare(b, 'es'))

        return [
            { value: ALL_FILTERS_VALUE, label: 'Todas las parroquias' },
            ...uniqueParroquias.map((item) => ({ value: item, label: item })),
        ]
    }, [reportes])

    const selectedParroquiaReporteOption = useMemo(
        () => parroquiaReportesOptions.find((option) => option.value === selectedParroquiaReporte) || parroquiaReportesOptions[0],
        [parroquiaReportesOptions, selectedParroquiaReporte]
    )

    const reportesFiltrados = useMemo(() => {
        return reportes.filter((r) => {
            const matchesTipo = selectedTipoReporte === ALL_TYPES_VALUE || getTipoReporte(r) === selectedTipoReporte
            const matchesParroquia = selectedParroquiaReporte === ALL_FILTERS_VALUE || compactValue(r.parroquia) === selectedParroquiaReporte
            return matchesTipo && matchesParroquia
        })
    }, [reportes, selectedTipoReporte, selectedParroquiaReporte])

    const reportesConCoords = useMemo(
        () => reportesFiltrados.filter((r) => toNumber(r.lat) && toNumber(r.lon)),
        [reportesFiltrados]
    )

    const groupedPoints = useMemo(() => {
        const map = new Map()
        for (const r of reportesConCoords) {
            const lat = toNumber(r.lat)
            const lon = toNumber(r.lon)
            const key = pointKey(lat, lon)
            const existing = map.get(key)
            if (existing) {
                existing.reportes.push(r)
                continue
            }
            map.set(key, {
                key,
                lat,
                lon,
                reportes: [r],
            })
        }
        return Array.from(map.values())
    }, [reportesConCoords])

    const groupsByKey = useMemo(() => {
        const lookup = new Map()
        for (const g of groupedPoints) lookup.set(g.key, g)
        return lookup
    }, [groupedPoints])

    const selectedGroup = dialog.groupKey ? groupsByKey.get(dialog.groupKey) || null : null
    const activeIndex = selectedGroup ? Math.min(dialog.active, selectedGroup.reportes.length - 1) : 0
    const selectedReporte = selectedGroup ? selectedGroup.reportes[activeIndex] : null
    const selectedReporteFoto = buildMediaUrl(selectedReporte?.foto_url)

    const mapCenter = useMemo(() => {
        if (!reportesConCoords.length) return PORTOVIEJO_CENTER
        const first = reportesConCoords[0]
        return first ? [toNumber(first.lat), toNumber(first.lon)] : PORTOVIEJO_CENTER
    }, [reportesConCoords])

    const openGroupDialog = (groupKey, index = 0) => {
        setDialog({ open: true, groupKey, active: index })
    }

    const openFromList = (reporte) => {
        const lat = toNumber(reporte.lat)
        const lon = toNumber(reporte.lon)
        if (!lat || !lon) return
        const key = pointKey(lat, lon)
        const group = groupsByKey.get(key)
        if (!group) return
        const idx = group.reportes.findIndex((r) => r.id === reporte.id)
        openGroupDialog(key, idx >= 0 ? idx : 0)
    }

    const closeDialog = () => setDialog({ open: false, groupKey: null, active: 0 })

    const mapsHref = selectedReporte
        ? `https://www.google.com/maps/dir/?api=1&destination=${selectedReporte.lat},${selectedReporte.lon}`
        : '#'

    const detailTopRows = selectedReporte
        ? [
            ['Fecha', selectedReporte.fecha],
            ['Responsable', selectedReporte.responsable],
            ['Telefono', selectedReporte.telefono],
            ['Distrito', selectedReporte.distrito],
        ].filter(([, value]) => compactValue(value))
        : []

    const detailExtraRows = selectedReporte
        ? [
            ['Tipo de reporte', getTipoReporte(selectedReporte)],
            ['Tipo de registro', selectedReporte.tipo_registro],
            ['Nombre persona', selectedReporte.nombre_persona],
            ['Contacto', selectedReporte.contacto],
            ['WhatsApp', selectedReporte.whatsapp],
            ['Correo', selectedReporte.correo],
            ['Tamano', selectedReporte.tamano],
            ['Lugar de votacion', selectedReporte.lugar_votacion],
            ['Nombre contacto', selectedReporte.nombre_contacto],
            ['Personas votan', selectedReporte.personas_votan],
            ['Tipo necesidad', selectedReporte.tipo_necesidad],
            ['Cuantos brigadistas', selectedReporte.cuantos_brigadistas],
            ['Responsable brigada', selectedReporte.responsable_brigada],
            ['Tipo evento', selectedReporte.tipo_evento],
            ['Candidato evento', selectedReporte.candidato_evento],
            ['Numero asistentes', selectedReporte.num_asistentes],
            ['Aceptacion evento', selectedReporte.aceptacion_evento],
            ['Tipo presencia rival', selectedReporte.tipo_presencia_rival],
            ['Nivel amenaza', selectedReporte.nivel_amenaza],
            ['Tipo rumor', selectedReporte.tipo_rumor],
            ['Sobre quien rumor', selectedReporte.sobre_quien_rumor],
            ['Necesidad movilizacion', selectedReporte.necesidad_movilizacion],
            ['Edad rango', selectedReporte.edad_rango],
            ['Genero indeciso', selectedReporte.genero_indeciso],
            ['Ocupacion indeciso', selectedReporte.ocupacion_indeciso],
            ['Factor duda', selectedReporte.factor_duda],
            ['Perfil votante', selectedReporte.perfil_votante],
            ['Accion sugerida', selectedReporte.accion_sugerida],
            ['Fuente', selectedReporte.fuente],
            ['Procesado', selectedReporte.procesado],
        ].filter(([, value]) => compactValue(value))
        : []

    useEffect(() => {
        const parroquiaActiva = selectedDataView === DATA_VIEW_INTENCION
            ? selectedParroquiaFiltro
            : selectedParroquiaReporte

        if (!parroquiaActiva || parroquiaActiva === ALL_FILTERS_VALUE) {
            setSelectedParroquia('')
            return
        }

        setSelectedParroquia(parroquiaActiva)
    }, [selectedDataView, selectedParroquiaFiltro, selectedParroquiaReporte])

    const appClassName = selectedDataView === DATA_VIEW_INTENCION ? 'app appIntencion' : 'app'
    const panelClassName = selectedDataView === DATA_VIEW_INTENCION ? 'panel panelScrollable' : 'panel'

    const geojsonStyle = (feature) => {
        const name = getParroquiaName(feature)
        const isSelected = selectedParroquia && name === selectedParroquia
        const isHovered = hoveredParroquia && name === hoveredParroquia

        if (isSelected) {
            return {
                color: '#b45309',
                weight: 3,
                fillColor: '#f59e0b',
                fillOpacity: 0.36,
            }
        }

        if (isHovered) {
            return {
                color: '#0e7490',
                weight: 2.5,
                fillColor: '#67e8f9',
                fillOpacity: 0.28,
            }
        }

        return {
            color: '#006d77',
            weight: 1.5,
            fillColor: '#83c5be',
            fillOpacity: 0.18,
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setAuthMessage('')

        if (!telefono || !pin) {
            setAuthMessage('Ingresa tu teléfono y tu PIN')
            return
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telefono, pin, remember }),
            })
            const data = await res.json()
            if (!res.ok || !data?.token) {
                throw new Error(data.message || 'No se pudo iniciar sesión')
            }

            setToken(data.token)
            setUser(data.user || null)
            setIsLoggedIn(true)
            setAuthMessage('')
            setPin('')

            if (remember) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: data.token, user: data.user }))
            } else {
                localStorage.removeItem(STORAGE_KEY)
            }
        } catch (err) {
            setAuthMessage(err.message || 'No se pudo iniciar sesión')
        }
    }

    const handleLogout = async () => {
        try {
            if (token) {
                await fetch(`${API_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: authHeaders,
                })
            }
        } catch {
            // No bloquea cierre de sesión local
        } finally {
            resetSession('')
        }
    }

    const handleDownloadExcel = async () => {
        setError('')
        setIsDownloading(true)

        try {
            const res = await fetch(`${API_URL}/api/gis/export/excel`, { headers: authHeaders })

            if (res.status === 401) {
                resetSession('Tu sesión expiró. Inicia sesión nuevamente.')
                return
            }

            if (!res.ok) {
                let message = 'No se pudo descargar el archivo'
                try {
                    const data = await res.json()
                    if (data?.message) message = data.message
                } catch {
                    // Si no es JSON, se mantiene el mensaje por defecto
                }
                throw new Error(message)
            }

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            const disposition = res.headers.get('content-disposition') || ''
            const match = disposition.match(/filename="?([^";]+)"?/i)
            link.href = url
            link.download = match?.[1] || 'reportes-gis.xlsx'
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            setError(err.message || 'No se pudo descargar el Excel')
        } finally {
            setIsDownloading(false)
        }
    }

    if (!isAuthReady) return null

    if (!isLoggedIn) {
        return (
            <div className="authScreen">
                <div className="authCard">
                    <h1>CEPEID GIS</h1>
                    <p>Acceso restringido. Inicia sesión para entrar al mapa.</p>

                    <form className="authForm" onSubmit={handleLogin}>
                        <label>
                            Teléfono
                            <input
                                type="text"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                placeholder="Ej: 0991234567"
                                inputMode="numeric"
                            />
                        </label>

                        <label>
                            PIN de 4 números
                            <div className="pinField">
                                <input
                                    type={showPin ? 'text' : 'password'}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="••••"
                                    maxLength={4}
                                    inputMode="numeric"
                                />
                                <button
                                    type="button"
                                    className="pinToggleBtn"
                                    onClick={() => setShowPin((prev) => !prev)}
                                >
                                    {showPin ? 'Ocultar' : 'Ver'}
                                </button>
                            </div>
                        </label>

                        <label className="rememberRow">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={() => setRemember((prev) => !prev)}
                            />
                            <span>Guardar sesión en este dispositivo</span>
                        </label>

                        {authMessage && <div className="authError">{authMessage}</div>}

                        <button type="submit" className="authSubmit">Entrar</button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className={appClassName}>
            <aside className={panelClassName}>
                <div className="panelTop">
                    <div>
                        <h1 className="title">CEPEID GIS Territorial</h1>
                        <p className="subtitle">{user?.nombre || 'Usuario'} · {user?.rol || 'sin rol'}</p>
                    </div>
                    <button type="button" className="logoutBtn" onClick={handleLogout}>Salir</button>
                </div>

                <div className="dataViewFilter">
                    <span className="filterLabel">Ver información</span>
                    <Select
                        classNamePrefix="dataViewSelect"
                        value={selectedDataViewOption}
                        onChange={(option) => setSelectedDataView(option?.value || DATA_VIEW_REPORTES)}
                        options={dataViewOptions}
                        isSearchable={false}
                        menuPlacement="auto"
                    />
                </div>

                {selectedDataView === DATA_VIEW_REPORTES && (
                    <>
                        <div className="kpis">
                            <div className="kpi"><strong>{dashboard.reportes_total || 0}</strong><span>Reportes totales</span></div>
                            <div className="kpi"><strong>{dashboard.reportes_hoy || 0}</strong><span>Reportes hoy</span></div>
                            <div className="kpi"><strong>{dashboard.pendientes || 0}</strong><span>Pendientes</span></div>
                            <div className="kpi"><strong>{dashboard.resueltos || 0}</strong><span>Resueltos</span></div>
                        </div>

                        <div className="kpis kpisSecondary">
                            <div className="kpi"><strong>{dashboard.reportes_con_foto || 0}</strong><span>Con foto</span></div>
                        </div>

                        <div className="reportesHead">
                            <h3>Últimos reportes</h3>
                            <button
                                type="button"
                                className="downloadBtn"
                                onClick={handleDownloadExcel}
                                disabled={isDownloading}
                            >
                                {isDownloading ? 'Descargando...' : 'Descargar reportes'}
                            </button>
                        </div>

                        <div className="reportFilter">
                            <div className="reportFilter reportFilterGridReportes">
                                <label>
                                    <span className="filterLabel">Filtrar por tipo</span>
                                    <Select
                                        classNamePrefix="tipoSelect"
                                        value={selectedTipoOption}
                                        onChange={(option) => setSelectedTipoReporte(option?.value || ALL_TYPES_VALUE)}
                                        options={tipoReporteOptions}
                                        isSearchable={false}
                                        placeholder="Selecciona un tipo"
                                        menuPlacement="auto"
                                    />
                                </label>
                                <label>
                                    <span className="filterLabel">Parroquia</span>
                                    <Select
                                        classNamePrefix="tipoSelect"
                                        value={selectedParroquiaReporteOption}
                                        onChange={(option) => setSelectedParroquiaReporte(option?.value || ALL_FILTERS_VALUE)}
                                        options={parroquiaReportesOptions}
                                        isSearchable={false}
                                        menuPlacement="auto"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="list">
                            {reportesFiltrados.slice(0, 20).map((r, idx) => (
                                <article
                                    className="item itemButton"
                                    style={{ '--accent': markerColor(r) }}
                                    key={`${r.id || idx}-${r.fecha || idx}`}
                                    onClick={() => openFromList(r)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') openFromList(r)
                                    }}
                                >
                                    <div className="itemHead">
                                        <h4>{r.parroquia || 'Sin parroquia'}</h4>
                                    </div>
                                    <div className="itemSector">{r.barrio || 'Sin sector'}</div>
                                    <div className="meta">{getTipoReporte(r)}</div>
                                    <div className="meta">{r.descripcion || 'Sin descripcion'}</div>
                                    <div className="itemFooter">
                                        <div className="itemStatusGroup">
                                            <span className={`statePill ${estadoClass(r.estado)}`}>{r.estado || 'Pendiente'}</span>
                                            <span className="priorityPill">{r.prioridad || 'Media'}</span>
                                        </div>
                                        <span className="itemTime">{formatReportTime(r.fecha)}</span>
                                    </div>
                                </article>
                            ))}
                            {!reportesFiltrados.length && !loading && (
                                <div className="item">
                                    {reportes.length ? 'No hay reportes para ese tipo.' : 'No hay reportes aún.'}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {selectedDataView === DATA_VIEW_INTENCION && (
                    <>
                        <div className="kpis kpisIntencion">
                            <div className="kpi"><strong>{intencionDashboard.total_votos_filtrados || 0}</strong><span>Votos filtrados</span></div>
                            <div className="kpi"><strong>{intencionDashboard.encuestas_total || 0}</strong><span>Votos totales</span></div>
                            <div className="kpi"><strong>{intencionDashboard.encuestas_hoy || 0}</strong><span>Votos hoy</span></div>
                            <div className="kpi"><strong>{intencionDashboard.encuestas_hoy_filtradas || 0}</strong><span>Votos hoy filtrados</span></div>
                        </div>

                        <div className="kpis kpisSecondary kpisIntencion">
                            {resumenEdad.map((item) => (
                                <div className="kpi" key={`edad-${item.rango_edad}`}>
                                    <strong>{item.porcentaje || 0}%</strong>
                                    <span>{item.rango_edad} · {item.total || 0} votos</span>
                                </div>
                            ))}
                            {!resumenEdad.length && !loadingIntencion && <div className="emptyMini">Sin distribución por edad.</div>}
                        </div>

                        <div className="reportesHead">
                            <h3>Intención de voto</h3>
                        </div>

                        <div className="reportFilter reportFilterGrid">
                            <label>
                                <span className="filterLabel">Género</span>
                                <Select
                                    classNamePrefix="tipoSelect"
                                    value={selectedGeneroOption}
                                    onChange={(option) => setSelectedGeneroFiltro(option?.value || ALL_FILTERS_VALUE)}
                                    options={generoOptions}
                                    isSearchable={false}
                                    menuPlacement="auto"
                                />
                            </label>
                            <label>
                                <span className="filterLabel">Rango de edad</span>
                                <Select
                                    classNamePrefix="tipoSelect"
                                    value={selectedRangoEdadOption}
                                    onChange={(option) => setSelectedRangoEdadFiltro(option?.value || ALL_FILTERS_VALUE)}
                                    options={rangoEdadOptions}
                                    isSearchable={false}
                                    menuPlacement="auto"
                                />
                            </label>
                            <label>
                                <span className="filterLabel">Parroquia</span>
                                <Select
                                    classNamePrefix="tipoSelect"
                                    value={selectedParroquiaOption}
                                    onChange={(option) => setSelectedParroquiaFiltro(option?.value || ALL_FILTERS_VALUE)}
                                    options={parroquiaOptions}
                                    isSearchable={false}
                                    menuPlacement="auto"
                                />
                            </label>
                        </div>

                        <div className="voteSummaryBox">
                            <div className="voteSummaryHeader">
                                <h4 className="voteSummaryTitle">Candidatos y voto estimado</h4>
                                <div className="voteGenderInline">
                                    {resumenGenero.map((item) => (
                                        <span className="genderPill" key={`genero-${item.genero}`}>
                                            {item.genero}: {item.porcentaje || 0}%
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {resumenCandidatos.map((item) => (
                                <article className="voteRow" key={item.candidato_id}>
                                    <div className="voteCandidate">
                                        <strong>{item.nombre}</strong>
                                        <span>{item.partido || 'Sin partido'}</span>
                                        {!!item.votos_por_parroquia?.length && (
                                            <div className="voteParroquiaMeta">
                                                {item.votos_por_parroquia.slice(0, 3).map((entry) => (
                                                    <span className="parroquiaPill" key={`${item.candidato_id}-${entry.parroquia}`}>
                                                        {entry.parroquia}: {entry.votos} ({entry.porcentaje}%)
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="voteNumbers">
                                        <strong>{item.porcentaje || 0}%</strong>
                                        <span>{item.votos || 0} votos</span>
                                    </div>
                                </article>
                            ))}
                            {!resumenCandidatos.length && !loadingIntencion && <div className="emptyMini">No hay datos de intención de voto.</div>}
                        </div>

                    </>
                )}

                {error && <div className="error">{error}</div>}
            </aside>

            <section className="mapWrap">
                <MapContainer className="map" center={mapCenter} zoom={11} scrollWheelZoom>
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />

                    {geojson && (
                        <GeoJSON
                            data={geojson}
                            style={geojsonStyle}
                            onEachFeature={(feature, layer) => {
                                const name = getParroquiaName(feature)
                                layer.bindTooltip(getParroquiaName(feature), {
                                    direction: 'top',
                                    sticky: true,
                                    opacity: 0.95,
                                    className: 'parroquiaTip',
                                })

                                layer.on({
                                    mouseover: () => {
                                        setHoveredParroquia(name)
                                    },
                                    mouseout: () => {
                                        setHoveredParroquia('')
                                    },
                                    click: () => {
                                        setSelectedParroquia(name)
                                        if (selectedDataView === DATA_VIEW_INTENCION) {
                                            setSelectedParroquiaFiltro(name)
                                        } else {
                                            setSelectedParroquiaReporte(name)
                                        }
                                    },
                                })
                            }}
                        />
                    )}

                    {groupedPoints.map((point) => {
                        const latest = point.reportes[0]
                        const count = point.reportes.length
                        const radius = Math.min(20, 7 + Math.log2(count) * 3)
                        return (
                            <CircleMarker
                                key={point.key}
                                center={[point.lat, point.lon]}
                                radius={radius}
                                pathOptions={{
                                    color: '#fff',
                                    weight: 1,
                                    fillColor: markerColor(latest),
                                    fillOpacity: 0.9,
                                }}
                                eventHandlers={{
                                    click: () => openGroupDialog(point.key, 0),
                                }}
                            >
                                {count > 1 && (
                                    <Tooltip permanent direction="center" className="countTip" opacity={1}>
                                        {count}
                                    </Tooltip>
                                )}
                            </CircleMarker>
                        )
                    })}
                </MapContainer>

                <button
                    type="button"
                    className="legendToggleBtn"
                    onClick={() => setShowLegend((prev) => !prev)}
                    aria-pressed={showLegend}
                >
                    {showLegend ? 'Ocultar leyenda' : 'Mostrar leyenda'}
                </button>

                {showLegend && (
                    <div className="mapLegend">
                        <h4>Leyenda mapa de calor</h4>
                        <div className="legendGrid">
                            {Object.entries(CATEGORY_COLORS).map(([label, color]) => (
                                <div className="legendItem" key={label}>
                                    <span className="legendDot" style={{ backgroundColor: color }} />
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>
                        <p>Azul=bajo · amarillo=medio · naranja/rojo=alto.</p>
                    </div>
                )}
            </section>

            {dialog.open && selectedGroup && selectedReporte && (
                <div className="modalOverlay" onClick={closeDialog}>
                    <div className="modalCard" onClick={(e) => e.stopPropagation()}>
                        <div className="modalHeader">
                            <h3>Detalle del punto</h3>
                            <button type="button" onClick={closeDialog} className="closeBtn">Cerrar</button>
                        </div>

                        <p className="modalIntro">
                            {selectedGroup.reportes.length > 1
                                ? `Hay ${selectedGroup.reportes.length} reportes en este mismo punto.`
                                : 'Hay 1 reporte en este punto.'}
                        </p>

                        {selectedGroup.reportes.length > 1 && (
                            <div className="reportTabs">
                                {selectedGroup.reportes.map((r, i) => (
                                    <button
                                        key={`${r.id || i}-tab`}
                                        type="button"
                                        onClick={() => setDialog((prev) => ({ ...prev, active: i }))}
                                        className={`tabBtn ${i === activeIndex ? 'active' : ''}`}
                                    >
                                        #{r.id || i + 1} - {r.fecha || 'Sin fecha'}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="modalTopBlock" style={{ '--accent': markerColor(selectedReporte) }}>
                            <div className="modalTopMain">
                                <h4>{getTipoReporte(selectedReporte)}</h4>
                                <p>{selectedReporte.parroquia || 'Sin parroquia'}</p>
                                {compactValue(selectedReporte.barrio) && <p className="modalSector">{selectedReporte.barrio}</p>}
                            </div>
                            <div className="modalTopBadges">
                                <span className="priorityPill">{selectedReporte.prioridad || 'Media'}</span>
                                <span className={`statePill ${estadoClass(selectedReporte.estado)}`}>{selectedReporte.estado || 'Pendiente'}</span>
                            </div>
                        </div>

                        {compactValue(selectedReporte.descripcion) && (
                            <div className="descBox">
                                <span className="detailLabel">Descripcion</span>
                                <p>{selectedReporte.descripcion}</p>
                            </div>
                        )}

                        {selectedReporteFoto && (
                            <div className="photoBox">
                                <span className="detailLabel">Foto del reporte</span>
                                <a href={selectedReporteFoto} target="_blank" rel="noreferrer" className="photoLink">
                                    Ver foto completa
                                </a>
                                <img
                                    src={selectedReporteFoto}
                                    alt={selectedReporte.foto_nombre || 'Foto del reporte'}
                                    className="reportPhoto"
                                    loading="lazy"
                                />
                            </div>
                        )}

                        <div className="detailsGrid compact">
                            {detailTopRows.map(([label, value]) => (
                                <div className="detailRow" key={label}>
                                    <span className="detailLabel">{label}</span>
                                    <span className="detailValue">{value}</span>
                                </div>
                            ))}
                        </div>

                        {detailExtraRows.length > 0 && (
                            <>
                                <h4 className="subSectionTitle">Datos adicionales</h4>
                                <div className="detailsGrid compact">
                                    {detailExtraRows.map(([label, value]) => (
                                        <div className="detailRow" key={label}>
                                            <span className="detailLabel">{label}</span>
                                            <span className="detailValue">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="modalActions">
                            <a href={mapsHref} target="_blank" rel="noreferrer" className="routeBtn">
                                Como llegar
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
