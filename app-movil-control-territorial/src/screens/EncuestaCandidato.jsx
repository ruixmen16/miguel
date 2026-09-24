import { useEffect, useState } from 'react'
import Select from 'react-select'
const API_URL = import.meta.env.VITE_API_URL || '';
const PARROQUIAS = [
    '12 de Marzo', '18 de Octubre', 'Andrés de Vera', 'Colón',
    'Francisco Pacheco', 'Picoazá', 'Portoviejo', 'San Pablo',
    'Simón Bolívar', 'Abdón Calderón', 'Alhajuela', 'Chirijo',
    'Crucita', 'Pueblo Nuevo', 'Riochico', 'San Plácido',
]

const PARROQUIAS_OPTS = PARROQUIAS.map((value) => ({ value, label: value }))
const GENEROS = ['Hombre', 'Mujer', 'Prefiere no decir']

const selectStyles = {
    control: (base, state) => ({
        ...base,
        backgroundColor: '#1e293b',
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

const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500'
const labelClass = 'mb-2 block text-sm font-medium text-slate-300'
const ONLY_DIGITS_REGEX = /^\d+$/

export function EncuestaCandidato({ token, setMsg }) {
    const [form, setForm] = useState({ parroquia: '', edad: '', genero: '', candidato: '', candidatoId: '', latitud: null, longitud: null, observacion: '' })
    const [candidatos, setCandidatos] = useState([])
    const [sending, setSending] = useState(false)

    useEffect(() => {
        const cargarCandidatos = async () => {
            try {
                const res = await fetch(`${API_URL}/api/candidatos`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json()
                if (res.ok) {
                    setCandidatos(data.candidatos || [])
                }
            } catch {
                setCandidatos([])
            }
        }
        if (token) cargarCandidatos()
    }, [token])

    const pedirUbicacion = () => {
        if (!navigator.geolocation) {
            setMsg('Tu dispositivo no permite obtener GPS', false)
            return
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setForm((prev) => ({ ...prev, latitud: pos.coords.latitude, longitud: pos.coords.longitude })),
            () => setMsg('No se pudo obtener la ubicación GPS', false)
        )
    }

    const handleSubmitEncuesta = async (e) => {
        e.preventDefault()
        if (!form.parroquia) {
            setMsg('Selecciona una parroquia', false)
            return
        }
        if (!form.edad || Number(form.edad) < 1 || !ONLY_DIGITS_REGEX.test(form.edad)) {
            setMsg('La edad es obligatoria', false)
            return
        }
        if (!form.genero) {
            setMsg('Selecciona un género', false)
            return
        }
        if (!form.candidatoId) {
            setMsg('Selecciona una intención de voto', false)
            return
        }
        if (!form.latitud || !form.longitud) {
            setMsg('Captura la ubicación GPS', false)
            return
        }

        setSending(true)
        try {
            const res = await fetch(`${API_URL}/api/encuestas/candidatos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    parroquia: form.parroquia,
                    edad: form.edad,
                    genero: form.genero,
                    candidato_id: Number(form.candidatoId),
                    latitud: form.latitud,
                    longitud: form.longitud,
                    observacion: form.observacion,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'No se pudo guardar la encuesta')
            setMsg('Encuesta guardada correctamente', true)
            setForm({ parroquia: '', edad: '', genero: '', candidato: '', candidatoId: '', latitud: null, longitud: null, observacion: '' })
        } catch (err) {
            setMsg(err.message, false)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="px-4 pt-4">


            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <form onSubmit={handleSubmitEncuesta} className="space-y-4">
                    <div>
                        <label className={labelClass}>Parroquia</label>
                        <Select styles={selectStyles} options={PARROQUIAS_OPTS} value={PARROQUIAS_OPTS.find((opt) => opt.value === form.parroquia) || null} onChange={(opt) => setForm({ ...form, parroquia: opt?.value || '' })} placeholder="Selecciona parroquia" />
                    </div>
                    <div>
                        <label className={labelClass}>Edad</label>
                        <input className={inputClass} type="text" inputMode="numeric" pattern="[0-9]*" value={form.edad} onChange={(e) => setForm({ ...form, edad: e.target.value.replace(/\D/g, '') })} placeholder="Ej: 32" />
                    </div>
                    <div>
                        <label className={labelClass}>Género</label>
                        <Select styles={selectStyles} options={GENEROS.map((value) => ({ value, label: value }))} value={GENEROS.map((value) => ({ value, label: value })).find((opt) => opt.value === form.genero) || null} onChange={(opt) => setForm({ ...form, genero: opt?.value || '' })} placeholder="Selecciona género" />
                    </div>
                    <div>
                        <label className={labelClass}>Intención de voto por alcalde</label>
                        <Select styles={selectStyles} options={candidatos.map((c) => ({ value: c.id, label: c.nombre, sublabel: c.partido }))} value={candidatos.map((c) => ({ value: c.id, label: c.nombre, sublabel: c.partido })).find((opt) => opt.value === Number(form.candidatoId)) || null} onChange={(opt) => setForm({ ...form, candidato: opt?.label || '', candidatoId: opt?.value ? String(opt.value) : '' })} placeholder="Selecciona candidato"
                            formatOptionLabel={(opt) => (
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-100">{opt.label}</span>
                                    {opt.sublabel && <span className="text-xs text-slate-400">{opt.sublabel}</span>}
                                </div>
                            )}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Ubicación GPS</label>
                        <button type="button" onClick={pedirUbicacion} className="w-full rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-100">Capturar ubicación</button>
                        {form.latitud && <p className="mt-2 text-sm text-emerald-400">✓ {form.latitud.toFixed(6)}, {form.longitud.toFixed(6)}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Observación</label>
                        <textarea className={`${inputClass} resize-none`} rows="3" value={form.observacion} onChange={(e) => setForm({ ...form, observacion: e.target.value })} placeholder="Opcional" />
                    </div>
                    <button type="submit" disabled={sending} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-50">
                        {sending ? 'Guardando...' : 'Guardar encuesta'}
                    </button>
                </form>
            </div>
        </div>
    )
}
