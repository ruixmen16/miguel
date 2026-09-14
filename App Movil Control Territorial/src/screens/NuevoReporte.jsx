import { useState } from 'react'
import Select from 'react-select'
const API_URL = import.meta.env.VITE_API_URL || '';
const selectStyles = {
    control: (base, state) => ({
        ...base, backgroundColor: '#1e293b',
        borderColor: state.isFocused ? '#3b82f6' : '#334155',
        borderRadius: '0.75rem', boxShadow: 'none', minHeight: '52px', fontSize: '16px',
        '&:hover': { borderColor: '#475569' },
    }),
    menu: (base) => ({ ...base, backgroundColor: '#1e293b', borderRadius: '0.75rem', border: '1px solid #334155', zIndex: 50 }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#334155' : 'transparent', color: '#f1f5f9', cursor: 'pointer', padding: '12px 16px', fontSize: '16px' }),
    singleValue: (base) => ({ ...base, color: '#f1f5f9' }),
    input: (base) => ({ ...base, color: '#f1f5f9' }),
    placeholder: (base) => ({ ...base, color: '#94a3b8' }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base) => ({ ...base, color: '#64748b' }),
}

const toOptions = (arr) => arr.map((v) => ({ value: v, label: v }))

// ========== CATÁLOGOS DEL BOT ==========
const PARROQUIAS_OPTS = toOptions([
    '12 de Marzo', '18 de Octubre', 'Andrés de Vera', 'Colón',
    'Francisco Pacheco', 'Picoazá', 'Portoviejo', 'San Pablo',
    'Simón Bolívar', 'Abdón Calderón', 'Alhajuela', 'Chirijo',
    'Crucita', 'Pueblo Nuevo', 'Riochico', 'San Plácido',
])
const TIPOS_OPTS = toOptions([
    'Reporte ciudadano', 'Incidencia', 'Brigada activa', 'Evento de campana',
    'Casa amiga', 'Coordinador', 'Observacion electoral', 'Presencia rival',
    'Necesidad barrial', 'Lider local', 'Rumor electoral', 'Movilizacion', 'Voto indeciso',
])
const PRIORIDADES_OPTS = toOptions(['Baja', 'Media', 'Alta', 'Critica'])
const ESTADOS_OPTS = toOptions(['Pendiente', 'En proceso', 'Resuelto'])

const NECESIDADES_OPTS = toOptions([
    'Seguridad', 'Agua potable', 'Luz / Energia electrica', 'Alcantarillado',
    'Vialidad', 'Salud', 'Educacion', 'Ambiente', 'Turismo',
    'Servicios publicos (otros)', 'Otro',
])

const TIPO_EVENTO_OPTS = toOptions(['Caminata', 'Casa abierta', 'Concentracion', 'Reunion barrial', 'Rueda de prensa', 'Otro'])
const CANDIDATO_EVENTO_OPTS = toOptions(['Nuestro candidato (Dennys Guillen)', 'Candidato rival'])
const ACEPTACION_EVENTO_OPTS = toOptions(['Muy buena', 'Buena', 'Regular', 'Mala'])

const TIPO_PRESENCIA_RIVAL_OPTS = toOptions(['Volanteo', 'Brigada puerta a puerta', 'Valla o publicidad', 'Evento o concentracion', 'Candidato presente', 'Otro'])
const NIVEL_AMENAZA_OPTS = toOptions(['Bajo', 'Medio', 'Alto', 'Critico'])

const TIPO_RUMOR_OPTS = toOptions(['Compra de votos', 'Fraude electoral', 'Ataque personal', 'Falsa renuncia', 'Vinculo con corrupcion', 'Otro'])
const SOBRE_QUIEN_RUMOR_OPTS = toOptions(['Nuestro candidato', 'Un candidato rival'])

const NECESIDAD_MOVILIZACION_OPTS = toOptions([
    'Presencia del candidato', 'Presencia de brigadas', 'Transporte de votantes',
    'Material de campana', 'Refuerzo de coordinador', 'Otro',
])

const EDAD_RANGOS_OPTS = toOptions(['18-25', '26-35', '36-45', '46-60', '60+'])
const GENERO_OPTS = toOptions(['Hombre', 'Mujer', 'Otro'])
const OCUPACION_OPTS = toOptions(['Comerciante', 'Agricultor', 'Estudiante', 'Empleado publico', 'Empleado privado', 'Ama de casa', 'Jubilado', 'Otro'])
const FACTOR_DUDA_OPTS = toOptions(['Sin definir candidato', 'Duda entre 2 candidatos', 'No piensa votar', 'Indeciso por desinformacion'])
const PERFIL_VOTANTE_OPTS = toOptions(['Jovenes', 'Mujeres', 'Adultos mayores', 'Comerciantes', 'Agricultores', 'Lideres barriales'])

// ========== FUNCIONES DE ACCIONES DINÁMICAS ==========
const generarAcciones = (tipo, data) => {
    if (tipo === 'Necesidad barrial') {
        const t = data.tipo_necesidad || ''
        if (t === 'Seguridad') return ['Gestion ante Policia / UPC', 'Reportar a coordinacion de seguridad', 'Visita del candidato', 'Otro']
        if (t.includes('Agua') || t.includes('Luz') || t.includes('Alcantarillado') || t.includes('Servicios'))
            return ['Gestion ante empresa/municipio', 'Documentar con evidencia (fotos)', 'Reunion barrial', 'Otro']
        if (t === 'Ambiente') return ['Gestion ambiental municipal', 'Campana de limpieza barrial', 'Otro']
        if (t === 'Turismo') return ['Propuesta de desarrollo turistico', 'Gestion municipal', 'Otro']
        if (t === 'Salud' || t === 'Educacion') return ['Gestion institucional', 'Visita del candidato', 'Otro']
        if (t === 'Vialidad') return ['Gestion municipal de vias', 'Documentar con evidencia (fotos)', 'Otro']
        return ['Gestion municipal', 'Reunion barrial', 'Otro']
    }
    if (tipo === 'Presencia rival') {
        const nivel = data.nivel_amenaza || ''
        if (nivel === 'Alto' || nivel === 'Critico')
            return ['Visita inmediata del candidato', 'Reforzar brigada en la zona', 'Contra-mensaje comunicacional', 'Alertar a coordinacion']
        return ['Monitorear la situacion', 'Reforzar brigada en la zona', 'Otro']
    }
    if (tipo === 'Rumor electoral') {
        const quien = data.sobre_quien_rumor || ''
        if (quien === 'Nuestro candidato')
            return ['Respuesta comunicacional inmediata', 'Desmentido oficial', 'Monitorear redes sociales']
        return ['Documentar evidencia', 'Amplificar en redes propias', 'Monitorear, sin accion inmediata']
    }
    if (tipo === 'Evento de campana') {
        const candidato = data.candidato_evento || ''
        const aceptacion = data.aceptacion_evento || ''
        if (candidato.toLowerCase().includes('rival'))
            return ['Contra-programar evento propio', 'Enviar brigada de observacion', 'Monitorear cobertura', 'Otro']
        if (aceptacion === 'Regular' || aceptacion === 'Mala')
            return ['Ajustar mensaje de campana', 'Reunion de evaluacion con equipo', 'Otro']
        return ['Documentar evento', 'Compartir en redes', 'Otro']
    }
    return ['Brigada puerta a puerta', 'Visita del candidato', 'Reunion barrial', 'Gestion municipal', 'Respuesta comunicacional']
}

const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500'
const labelClass = 'mb-2 block text-sm font-medium text-slate-300'

const FORM_DEFAULT = {
    parroquia: '12 de Marzo', sector: '', tipo_reporte: 'Reporte ciudadano',
    descripcion: '', prioridad: 'Media', estado: 'Pendiente', latitud: null, longitud: null,
    // Campos condicionados
    tipo_necesidad: '', cuantos_brigadistas: '', responsable_brigada: '',
    tipo_evento: '', candidato_evento: '', num_asistentes: '', aceptacion_evento: '',
    tipo_presencia_rival: '', nivel_amenaza: '',
    tipo_rumor: '', sobre_quien_rumor: '',
    necesidad_movilizacion: '', lugar_votacion: '', telefono: '', nombre_contacto: '',
    personas_votan: '', distrito: '',
    edad_rango: '', genero_indeciso: '', ocupacion_indeciso: '', factor_duda: '', perfil_votante: '',
    accion_sugerida: '',
}

export function NuevoReporte({ token, setMsg }) {
    const [form, setForm] = useState(FORM_DEFAULT)
    const [gpsStatus, setGpsStatus] = useState('')
    const [sending, setSending] = useState(false)

    const pedirUbicacion = () => {
        if (!navigator.geolocation) { setGpsStatus('Tu dispositivo no soporta GPS'); return }
        setGpsStatus('Obteniendo ubicación...')
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm((prev) => ({ ...prev, latitud: pos.coords.latitude, longitud: pos.coords.longitude }))
                setGpsStatus(`✓ ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`)
            },
            () => setGpsStatus('No se pudo obtener la ubicación. Verifica los permisos.')
        )
    }

    const handleSubmit = async () => {
        if (!form.sector.trim()) { setMsg('Escribe el nombre del barrio o sector', false); return }
        if (!form.latitud) { setMsg('Primero debes capturar tu ubicación GPS', false); return }
        setSending(true)
        try {
            const res = await fetch(`${API_URL}/api/reportes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'No se pudo guardar')
            setMsg('✓ Reporte guardado correctamente', true)
            setForm(FORM_DEFAULT)
            setGpsStatus('')
        } catch (err) {
            setMsg(err.message, false)
        } finally {
            setSending(false)
        }
    }

    // Generar acciones sugeridas según el tipo y datos del formulario
    const accionesDisponibles = generarAcciones(form.tipo_reporte, form)

    return (
        <div className="px-4 pt-4 pb-28">

            <div className="space-y-5">
                {/* CAMPOS BASE - SIEMPRE VISIBLES */}
                <div>
                    <label className={labelClass}>Parroquia</label>
                    <Select styles={selectStyles} options={PARROQUIAS_OPTS}
                        value={{ value: form.parroquia, label: form.parroquia }}
                        onChange={(opt) => setForm({ ...form, parroquia: opt.value })}
                        placeholder="Buscar parroquia..." />
                </div>
                <div>
                    <label className={labelClass}>Barrio o sector <span className="text-red-400">*</span></label>
                    <input className={`${inputClass} ${!form.sector.trim() ? 'border-red-500/60' : ''}`}
                        placeholder="Nombre del barrio o sector"
                        value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} />
                </div>
                <div>
                    <label className={labelClass}>Tipo de reporte</label>
                    <Select styles={selectStyles} options={TIPOS_OPTS}
                        value={{ value: form.tipo_reporte, label: form.tipo_reporte }}
                        onChange={(opt) => setForm({ ...form, tipo_reporte: opt.value })}
                        placeholder="Buscar tipo..." />
                </div>

                {/* CAMPOS CONDICIONADOS POR TIPO */}

                {/* Brigada activa */}
                {form.tipo_reporte === 'Brigada activa' && (
                    <>
                        <div>
                            <label className={labelClass}>¿Cuántos brigadistas?</label>
                            <input className={inputClass} type="number" placeholder="Cantidad de brigadistas"
                                value={form.cuantos_brigadistas} onChange={(e) => setForm({ ...form, cuantos_brigadistas: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Responsable de la brigada</label>
                            <input className={inputClass} placeholder="Nombre del responsable"
                                value={form.responsable_brigada} onChange={(e) => setForm({ ...form, responsable_brigada: e.target.value })} />
                        </div>
                    </>
                )}

                {/* Evento de campaña */}
                {form.tipo_reporte === 'Evento de campana' && (
                    <>
                        <div>
                            <label className={labelClass}>Tipo de evento</label>
                            <Select styles={selectStyles} options={TIPO_EVENTO_OPTS}
                                value={form.tipo_evento ? { value: form.tipo_evento, label: form.tipo_evento } : null}
                                onChange={(opt) => setForm({ ...form, tipo_evento: opt?.value || '' })}
                                placeholder="Selecciona tipo..." isClearable />
                        </div>
                        <div>
                            <label className={labelClass}>Quién lo realiza</label>
                            <Select styles={selectStyles} options={CANDIDATO_EVENTO_OPTS}
                                value={form.candidato_evento ? { value: form.candidato_evento, label: form.candidato_evento } : null}
                                onChange={(opt) => setForm({ ...form, candidato_evento: opt?.value || '' })}
                                placeholder="Selecciona..." isClearable />
                        </div>
                        <div>
                            <label className={labelClass}>Cantidad de asistentes</label>
                            <input className={inputClass} type="number" placeholder="Número aproximado"
                                value={form.num_asistentes} onChange={(e) => setForm({ ...form, num_asistentes: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Aceptación del evento</label>
                            <Select styles={selectStyles} options={ACEPTACION_EVENTO_OPTS}
                                value={form.aceptacion_evento ? { value: form.aceptacion_evento, label: form.aceptacion_evento } : null}
                                onChange={(opt) => setForm({ ...form, aceptacion_evento: opt?.value || '' })}
                                placeholder="Selecciona..." isClearable />
                        </div>
                    </>
                )}

                {/* Casa amiga */}
                {form.tipo_reporte === 'Casa amiga' && (
                    <>
                        <div>
                            <label className={labelClass}>Personas que votan en la casa</label>
                            <input className={inputClass} type="number" placeholder="Cantidad"
                                value={form.personas_votan} onChange={(e) => setForm({ ...form, personas_votan: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Lugar de votación</label>
                            <input className={inputClass} placeholder="Identificar la ubicación"
                                value={form.lugar_votacion} onChange={(e) => setForm({ ...form, lugar_votacion: e.target.value })} />
                        </div>
                    </>
                )}

                {/* Observación electoral */}
                {form.tipo_reporte === 'Observacion electoral' && (
                    <>
                        <div>
                            <label className={labelClass}>Distrito electoral</label>
                            <input className={inputClass} placeholder="Identificar el distrito"
                                value={form.distrito} onChange={(e) => setForm({ ...form, distrito: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Lugar de votación</label>
                            <input className={inputClass} placeholder="Ubicación o referencia"
                                value={form.lugar_votacion} onChange={(e) => setForm({ ...form, lugar_votacion: e.target.value })} />
                        </div>
                    </>
                )}

                {/* Presencia rival */}
                {form.tipo_reporte === 'Presencia rival' && (
                    <>
                        <div>
                            <label className={labelClass}>Tipo de presencia</label>
                            <Select styles={selectStyles} options={TIPO_PRESENCIA_RIVAL_OPTS}
                                value={form.tipo_presencia_rival ? { value: form.tipo_presencia_rival, label: form.tipo_presencia_rival } : null}
                                onChange={(opt) => setForm({ ...form, tipo_presencia_rival: opt?.value || '' })}
                                placeholder="Selecciona..." isClearable />
                        </div>
                        <div>
                            <label className={labelClass}>Nivel de amenaza</label>
                            <Select styles={selectStyles} options={NIVEL_AMENAZA_OPTS}
                                value={form.nivel_amenaza ? { value: form.nivel_amenaza, label: form.nivel_amenaza } : null}
                                onChange={(opt) => setForm({ ...form, nivel_amenaza: opt?.value || '' })}
                                placeholder="Selecciona..." isClearable />
                        </div>
                    </>
                )}

                {/* Necesidad barrial */}
                {form.tipo_reporte === 'Necesidad barrial' && (
                    <>
                        <div>
                            <label className={labelClass}>Tipo de necesidad</label>
                            <Select styles={selectStyles} options={NECESIDADES_OPTS}
                                value={form.tipo_necesidad ? { value: form.tipo_necesidad, label: form.tipo_necesidad } : null}
                                onChange={(opt) => setForm({ ...form, tipo_necesidad: opt?.value || '' })}
                                placeholder="Selecciona..." isClearable />
                        </div>
                    </>
                )}

                {/* Líder local */}
                {form.tipo_reporte === 'Lider local' && (
                    <>
                        <div>
                            <label className={labelClass}>Nombre del líder</label>
                            <input className={inputClass} placeholder="Nombre completo"
                                value={form.nombre_contacto} onChange={(e) => setForm({ ...form, nombre_contacto: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Teléfono del líder</label>
                            <input className={inputClass} placeholder="Número de contacto"
                                value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                        </div>
                    </>
                )}

                {/* Rumor electoral */}
                {form.tipo_reporte === 'Rumor electoral' && (
                    <>
                        <div>
                            <label className={labelClass}>Tipo de rumor</label>
                            <Select styles={selectStyles} options={TIPO_RUMOR_OPTS}
                                value={form.tipo_rumor ? { value: form.tipo_rumor, label: form.tipo_rumor } : null}
                                onChange={(opt) => setForm({ ...form, tipo_rumor: opt?.value || '' })}
                                placeholder="Selecciona..." isClearable />
                        </div>
                        <div>
                            <label className={labelClass}>¿Sobre quién es?</label>
                            <Select styles={selectStyles} options={SOBRE_QUIEN_RUMOR_OPTS}
                                value={form.sobre_quien_rumor ? { value: form.sobre_quien_rumor, label: form.sobre_quien_rumor } : null}
                                onChange={(opt) => setForm({ ...form, sobre_quien_rumor: opt?.value || '' })}
                                placeholder="Selecciona..." isClearable />
                        </div>
                    </>
                )}

                {/* Movilización */}
                {form.tipo_reporte === 'Movilizacion' && (
                    <>
                        <div>
                            <label className={labelClass}>¿Qué se necesita?</label>
                            <Select styles={selectStyles} options={NECESIDAD_MOVILIZACION_OPTS}
                                value={form.necesidad_movilizacion ? { value: form.necesidad_movilizacion, label: form.necesidad_movilizacion } : null}
                                onChange={(opt) => setForm({ ...form, necesidad_movilizacion: opt?.value || '' })}
                                placeholder="Selecciona..." isClearable />
                        </div>
                        <div>
                            <label className={labelClass}>¿Cuántos brigadistas necesarios?</label>
                            <input className={inputClass} type="number" placeholder="Cantidad"
                                value={form.cuantos_brigadistas} onChange={(e) => setForm({ ...form, cuantos_brigadistas: e.target.value })} />
                        </div>
                    </>
                )}

                {/* Voto indeciso */}
                {form.tipo_reporte === 'Voto indeciso' && (
                    <>
                        <div>
                            <label className={labelClass}>Edad</label>
                            <Select styles={selectStyles} options={EDAD_RANGOS_OPTS}
                                value={form.edad_rango ? { value: form.edad_rango, label: form.edad_rango } : null}
                                onChange={(opt) => setForm({ ...form, edad_rango: opt?.value || '' })}
                                placeholder="Selecciona..." isClearable />
                        </div>
                        <div>
                            <label className={labelClass}>Género</label>
                            <Select styles={selectStyles} options={GENERO_OPTS}
                                value={form.genero_indeciso ? { value: form.genero_indeciso, label: form.genero_indeciso } : null}
                                onChange={(opt) => setForm({ ...form, genero_indeciso: opt?.value || '' })}
                                placeholder="Selecciona..." isClearable />
                        </div>
                        <div>
                            <label className={labelClass}>Ocupación</label>
                            <Select styles={selectStyles} options={OCUPACION_OPTS}
                                value={form.ocupacion_indeciso ? { value: form.ocupacion_indeciso, label: form.ocupacion_indeciso } : null}
                                onChange={(opt) => setForm({ ...form, ocupacion_indeciso: opt?.value || '' })}
                                placeholder="Selecciona..." isClearable />
                        </div>
                        <div>
                            <label className={labelClass}>¿Qué genera la duda?</label>
                            <Select styles={selectStyles} options={FACTOR_DUDA_OPTS}
                                value={form.factor_duda ? { value: form.factor_duda, label: form.factor_duda } : null}
                                onChange={(opt) => setForm({ ...form, factor_duda: opt?.value || '' })}
                                placeholder="Selecciona..." isClearable />
                        </div>
                        <div>
                            <label className={labelClass}>Perfil del votante</label>
                            <Select styles={selectStyles} options={PERFIL_VOTANTE_OPTS}
                                value={form.perfil_votante ? { value: form.perfil_votante, label: form.perfil_votante } : null}
                                onChange={(opt) => setForm({ ...form, perfil_votante: opt?.value || '' })}
                                placeholder="Selecciona..." isClearable />
                        </div>
                    </>
                )}

                {/* DESCRIPCIÓN Y ACCIONES - SIEMPRE AL FINAL */}
                <div>
                    <label className={labelClass}>Descripción</label>
                    <textarea className={`${inputClass} resize-none`} rows="4"
                        placeholder="Describe brevemente lo que está pasando"
                        value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                </div>

                {/* Acciones sugeridas */}
                {accionesDisponibles && accionesDisponibles.length > 0 && (
                    <div className="rounded-2xl border border-emerald-700/50 bg-emerald-900/20 p-4">
                        <p className="mb-3 text-sm font-semibold text-emerald-400">💡 Acciones sugeridas</p>
                        <Select styles={selectStyles} options={toOptions(accionesDisponibles)}
                            value={form.accion_sugerida ? { value: form.accion_sugerida, label: form.accion_sugerida } : null}
                            onChange={(opt) => setForm({ ...form, accion_sugerida: opt?.value || '' })}
                            placeholder="Selecciona una acción..." isClearable />
                    </div>
                )}

                {/* UBICACIÓN GPS */}
                <div>
                    <label className={labelClass}>Ubicación GPS <span className="text-red-400">*</span></label>
                    <button type="button" onClick={pedirUbicacion}
                        className={`w-full rounded-xl border py-4 text-base font-medium active:opacity-80 ${form.latitud ? 'border-emerald-600 bg-emerald-900/30 text-emerald-400' : 'border-red-500/60 bg-slate-800 text-slate-300'}`}>
                        📍 {form.latitud ? 'Ubicación capturada — toca para actualizar' : 'Tocar aquí para capturar ubicación'}
                    </button>
                    {gpsStatus && <p className={`mt-2 text-sm ${form.latitud ? 'text-emerald-400' : 'text-amber-400'}`}>{gpsStatus}</p>}
                </div>

                {/* PRIORIDAD Y ESTADO */}
                <div>
                    <label className={labelClass}>Prioridad</label>
                    <Select styles={selectStyles} options={PRIORIDADES_OPTS}
                        value={{ value: form.prioridad, label: form.prioridad }}
                        onChange={(opt) => setForm({ ...form, prioridad: opt.value })} />
                </div>
                <div>
                    <label className={labelClass}>Estado</label>
                    <Select styles={selectStyles} options={ESTADOS_OPTS}
                        value={{ value: form.estado, label: form.estado }}
                        onChange={(opt) => setForm({ ...form, estado: opt.value })} />
                </div>
            </div>
            <div className=" left-0 right-0 bg-slate-950 px-4 py-3 shadow-2xl">
                <button type="button" onClick={handleSubmit} disabled={sending}
                    className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white active:bg-blue-700 disabled:opacity-50">
                    {sending ? 'Guardando...' : 'Guardar reporte'}
                </button>
            </div>
        </div>
    )
}
