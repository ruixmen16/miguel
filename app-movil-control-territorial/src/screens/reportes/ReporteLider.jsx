import { useState } from 'react'
import Select from 'react-select'

const API_URL = import.meta.env.VITE_API_URL || ''
const PARROQUIAS = [
    '12 de Marzo', '18 de Octubre', 'Andrés de Vera', 'Colón',
    'Francisco Pacheco', 'Picoazá', 'Portoviejo', 'San Pablo',
    'Simón Bolívar', 'Abdón Calderón', 'Alhajuela', 'Chirijo',
    'Crucita', 'Pueblo Nuevo', 'Riochico', 'San Plácido',
]

const PARROQUIAS_OPTS = PARROQUIAS.map((value) => ({ value, label: value }))
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
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ReporteLider({ token, setMsg }) {
    const [lider, setLider] = useState({
        parroquia: '',
        nombre_persona: '',
        whatsapp: '',
        correo: '',
        latitud: null,
        longitud: null,
        descripcion: '',
    })
    const [sending, setSending] = useState(false)

    const pedirUbicacion = () => {
        if (!navigator.geolocation) {
            setMsg('Tu dispositivo no permite obtener GPS', false)
            return
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setLider((prev) => ({ ...prev, latitud: pos.coords.latitude, longitud: pos.coords.longitude })),
            () => setMsg('No se pudo obtener la ubicación GPS', false)
        )
    }

    const guardarRegistro = async (payload) => {
        setSending(true)
        try {
            const fd = new FormData()
            Object.entries(payload).forEach(([k, v]) => {
                if (v !== null && v !== undefined) fd.append(k, v)
            })

            const res = await fetch(`${API_URL}/api/reportes/registro`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'No se pudo guardar')
            setMsg('Registro guardado correctamente', true)
        } catch (err) {
            setMsg(err.message, false)
        } finally {
            setSending(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!lider.parroquia) {
            setMsg('Selecciona una parroquia', false)
            return
        }
        if (!lider.nombre_persona?.trim()) {
            setMsg('Ingresa el nombre del líder', false)
            return
        }
        if (!lider.whatsapp?.trim() && !lider.correo?.trim()) {
            setMsg('Ingresa un WhatsApp o un correo', false)
            return
        }
        if (lider.whatsapp?.trim() && !ONLY_DIGITS_REGEX.test(lider.whatsapp.trim())) {
            setMsg('WhatsApp solo debe tener dígitos', false)
            return
        }
        if (lider.correo?.trim() && !EMAIL_REGEX.test(lider.correo.trim())) {
            setMsg('Ingresa un correo válido', false)
            return
        }
        if (!lider.latitud || !lider.longitud) {
            setMsg('Captura la ubicación GPS', false)
            return
        }

        await guardarRegistro({
            tipo: 'lider',
            parroquia: lider.parroquia,
            nombre_persona: lider.nombre_persona,
            whatsapp: lider.whatsapp,
            correo: lider.correo,
            latitud: lider.latitud,
            longitud: lider.longitud,
            descripcion: lider.descripcion,
        })

        setLider({ parroquia: '', nombre_persona: '', whatsapp: '', correo: '', latitud: null, longitud: null, descripcion: '' })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div>
                <label className={labelClass}>Parroquia</label>
                <Select styles={selectStyles} options={PARROQUIAS_OPTS} value={PARROQUIAS_OPTS.find((opt) => opt.value === lider.parroquia) || null} onChange={(opt) => setLider({ ...lider, parroquia: opt?.value || '' })} placeholder="Selecciona parroquia" />
            </div>
            <div>
                <label className={labelClass}>Nombre del líder</label>
                <input className={inputClass} value={lider.nombre_persona} onChange={(e) => setLider({ ...lider, nombre_persona: e.target.value })} placeholder="Nombre del líder" />
            </div>
            <div>
                <label className={labelClass}>WhatsApp</label>
                <input type="tel" inputMode="numeric" pattern="[0-9]*" className={inputClass} value={lider.whatsapp} onChange={(e) => setLider({ ...lider, whatsapp: e.target.value.replace(/\D/g, '') })} placeholder="Número de WhatsApp" />
            </div>
            <div>
                <label className={labelClass}>Correo</label>
                <input type="email" className={inputClass} value={lider.correo} onChange={(e) => setLider({ ...lider, correo: e.target.value })} placeholder="correo@dominio.com" />
            </div>
            <div>
                <label className={labelClass}>Ubicación GPS</label>
                <button type="button" onClick={pedirUbicacion} className="w-full rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-100">Capturar ubicación</button>
                {lider.latitud && <p className="mt-2 text-sm text-emerald-400">✓ {lider.latitud.toFixed(6)}, {lider.longitud.toFixed(6)}</p>}
            </div>
            <div>
                <label className={labelClass}>Descripción</label>
                <textarea className={`${inputClass} resize-none`} rows="3" value={lider.descripcion} onChange={(e) => setLider({ ...lider, descripcion: e.target.value })} placeholder="Detalle breve" />
            </div>
            <button type="submit" disabled={sending} className="w-full rounded-xl bg-amber-600 px-4 py-3 font-semibold text-white disabled:opacity-50">
                {sending ? 'Guardando...' : 'Guardar líder'}
            </button>
        </form>
    )
}
