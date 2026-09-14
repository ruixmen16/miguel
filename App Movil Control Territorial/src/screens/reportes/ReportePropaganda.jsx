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

const TAMANOS_OPTS = [
    { value: 'Grande', label: 'Grande' },
    { value: 'Mediano', label: 'Mediano' },
    { value: 'Pequeño', label: 'Pequeño' },
]

const MAX_FOTO_SIZE_KB = 500

const compressImageToMaxSize = (file, maxSizeKB = MAX_FOTO_SIZE_KB) => {
    return new Promise((resolve, reject) => {
        if (!file || file.size <= maxSizeKB * 1024) {
            resolve(file)
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')

                if (!ctx) {
                    reject(new Error('No se pudo procesar la imagen'))
                    return
                }

                let { width, height } = img
                const maxDimension = 1600

                if (width > height) {
                    if (width > maxDimension) {
                        height = (height * maxDimension) / width
                        width = maxDimension
                    }
                } else if (height > maxDimension) {
                    width = (width * maxDimension) / height
                    height = maxDimension
                }

                canvas.width = width
                canvas.height = height
                ctx.drawImage(img, 0, 0, width, height)

                const tryQuality = (quality) => {
                    canvas.toBlob((blob) => {
                        if (blob) {
                            if (blob.size <= maxSizeKB * 1024 || quality <= 0.1) {
                                const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                                    type: 'image/jpeg',
                                    lastModified: Date.now(),
                                })
                                resolve(compressedFile)
                                return
                            }
                        }
                        tryQuality(quality - 0.1)
                    }, 'image/jpeg', quality)
                }

                tryQuality(0.95)
            }
            img.onerror = () => reject(new Error('No se pudo leer la imagen'))
            img.src = event.target?.result
        }
        reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
        reader.readAsDataURL(file)
    })
}

export function ReportePropaganda({ token, setMsg }) {
    const [propaganda, setPropaganda] = useState({
        parroquia: '',
        nombre_persona: '',
        contacto: '',
        tamano: '',
        latitud: null,
        longitud: null,
        descripcion: '',
        fotoFile: null,
    })
    const [sending, setSending] = useState(false)

    const pedirUbicacion = () => {
        if (!navigator.geolocation) {
            setMsg('Tu dispositivo no permite obtener GPS', false)
            return
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setPropaganda((prev) => ({ ...prev, latitud: pos.coords.latitude, longitud: pos.coords.longitude })),
            () => setMsg('No se pudo obtener la ubicación GPS', false)
        )
    }

    const handlePhoto = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const processedFile = await compressImageToMaxSize(file)
            setPropaganda((prev) => ({ ...prev, fotoFile: processedFile }))
            setMsg(`Foto lista: ${(processedFile.size / 1024).toFixed(0)} KB`, true)
        } catch (err) {
            setMsg(err.message || 'No se pudo procesar la foto', false)
        }
    }

    const guardarRegistro = async (payload, fotoFile) => {
        setSending(true)
        try {
            const fd = new FormData()
            Object.entries(payload).forEach(([k, v]) => {
                if (v !== null && v !== undefined) fd.append(k, v)
            })
            if (fotoFile) fd.append('foto', fotoFile)

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
        if (!propaganda.parroquia) {
            setMsg('Selecciona una parroquia', false)
            return
        }
        if (!propaganda.nombre_persona?.trim()) {
            setMsg('Ingresa el nombre de la persona', false)
            return
        }
        if (!propaganda.contacto?.trim()) {
            setMsg('Ingresa un número de contacto', false)
            return
        }
        if (!ONLY_DIGITS_REGEX.test(propaganda.contacto.trim())) {
            setMsg('El número de contacto solo debe tener dígitos', false)
            return
        }
        if (!propaganda.tamano) {
            setMsg('Selecciona el tamaño de la propaganda', false)
            return
        }
        if (!propaganda.fotoFile) {
            setMsg('Adjunta una foto de la propaganda', false)
            return
        }
        if (!propaganda.latitud || !propaganda.longitud) {
            setMsg('Captura la ubicación GPS', false)
            return
        }

        await guardarRegistro({
            tipo: 'propaganda',
            parroquia: propaganda.parroquia,
            nombre_persona: propaganda.nombre_persona,
            contacto: propaganda.contacto,
            tamano: propaganda.tamano,
            latitud: propaganda.latitud,
            longitud: propaganda.longitud,
            descripcion: propaganda.descripcion,
        }, propaganda.fotoFile)

        setPropaganda({ parroquia: '', nombre_persona: '', contacto: '', tamano: '', latitud: null, longitud: null, descripcion: '', fotoFile: null })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div>
                <label className={labelClass}>Parroquia</label>
                <Select styles={selectStyles} options={PARROQUIAS_OPTS} value={PARROQUIAS_OPTS.find((opt) => opt.value === propaganda.parroquia) || null} onChange={(opt) => setPropaganda({ ...propaganda, parroquia: opt?.value || '' })} placeholder="Selecciona parroquia" />
            </div>
            <div>
                <label className={labelClass}>Nombre de la persona</label>
                <input className={inputClass} value={propaganda.nombre_persona} onChange={(e) => setPropaganda({ ...propaganda, nombre_persona: e.target.value })} placeholder="Nombre completo" />
            </div>
            <div>
                <label className={labelClass}>Número de contacto</label>
                <input type="tel" inputMode="numeric" pattern="[0-9]*" className={inputClass} value={propaganda.contacto} onChange={(e) => setPropaganda({ ...propaganda, contacto: e.target.value.replace(/\D/g, '') })} placeholder="Ej: 0991234567" />
            </div>
            <div>
                <label className={labelClass}>Foto (desde cámara o galería)</label>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="w-full rounded-xl border border-dashed border-slate-700 bg-slate-800 px-3 py-3 text-sm text-slate-300" />
                {propaganda.fotoFile && <p className="mt-2 text-sm text-emerald-400">✓ {propaganda.fotoFile.name} ({(propaganda.fotoFile.size / 1024).toFixed(0)} KB)</p>}
            </div>
            <div>
                <label className={labelClass}>Tamaño de la propaganda</label>
                <Select styles={selectStyles} options={TAMANOS_OPTS} value={TAMANOS_OPTS.find((opt) => opt.value === propaganda.tamano) || null} onChange={(opt) => setPropaganda({ ...propaganda, tamano: opt?.value || '' })} placeholder="Selecciona tamaño" />
            </div>
            <div>
                <label className={labelClass}>Ubicación GPS</label>
                <button type="button" onClick={pedirUbicacion} className="w-full rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-100">Capturar ubicación</button>
                {propaganda.latitud && <p className="mt-2 text-sm text-emerald-400">✓ {propaganda.latitud.toFixed(6)}, {propaganda.longitud.toFixed(6)}</p>}
            </div>
            <div>
                <label className={labelClass}>Descripción</label>
                <textarea className={`${inputClass} resize-none`} rows="3" value={propaganda.descripcion} onChange={(e) => setPropaganda({ ...propaganda, descripcion: e.target.value })} placeholder="Detalle breve" />
            </div>
            <button type="submit" disabled={sending} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50">
                {sending ? 'Guardando...' : 'Guardar propaganda'}
            </button>
        </form>
    )
}
