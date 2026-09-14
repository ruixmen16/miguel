import { useEffect, useState } from 'react'
const API_URL = import.meta.env.VITE_API_URL || '';
const TIPOS_COLOR = {
    'Incidencia': 'bg-red-900/40 text-red-300',
    'Presencia rival': 'bg-orange-900/40 text-orange-300',
    'Brigada activa': 'bg-emerald-900/40 text-emerald-300',
    'Evento de campana': 'bg-yellow-900/40 text-yellow-300',
}
const tipoColor = (tipo) => TIPOS_COLOR[tipo] || 'bg-slate-700/60 text-slate-300'

export function MisReportes({ token }) {
    const [reportes, setReportes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API_URL}/api/reportes`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((d) => { setReportes(d.reportes || []); setLoading(false) })
            .catch(() => setLoading(false))
    }, [token])

    return (
        <div className="px-4 pb-28 pt-4">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Mis reportes</h2>
                <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white">
                    {reportes.length}
                </span>
            </div>

            {loading && <p className="mt-10 text-center text-slate-400">Cargando...</p>}

            {!loading && reportes.length === 0 && (
                <div className="mt-16 text-center">
                    <p className="text-5xl mb-3">📋</p>
                    <p className="text-slate-400">Aún no has enviado ningún reporte</p>
                </div>
            )}

            <div className="space-y-3">
                {reportes.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-100 truncate">{r.parroquia}</p>
                                {r.sector && <p className="text-sm text-slate-400 truncate">{r.sector}</p>}
                            </div>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${tipoColor(r.tipo_reporte)}`}>
                                {r.tipo_reporte}
                            </span>
                        </div>
                        {r.descripcion && (
                            <p className="mt-2 text-sm text-slate-400 line-clamp-2">{r.descripcion}</p>
                        )}
                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                            <span className={`rounded-full px-2 py-0.5 ${r.prioridad === 'Alta' || r.prioridad === 'Critica' ? 'bg-red-900/40 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                                {r.prioridad}
                            </span>
                            <span>{r.estado}</span>
                            {r.creado_at && <span className="ml-auto">{new Date(r.creado_at).toLocaleDateString('es-EC')}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
