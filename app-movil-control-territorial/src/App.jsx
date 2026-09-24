import { useEffect, useState } from 'react'
import { Modal } from './components/Modal'
import { BottomNav } from './components/BottomNav'
import { Usuarios } from './screens/Usuarios'
import { EncuestaCandidato } from './screens/EncuestaCandidato'
import { ReportePropaganda } from './screens/reportes/ReportePropaganda'
import { ReporteLider } from './screens/reportes/ReporteLider'
const API_URL = import.meta.env.VITE_API_URL || '';
const STORAGE_KEY = 'cepeid-session'
const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500'
const labelClass = 'mb-2 block text-sm font-medium text-slate-300'

function App() {

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [remember, setRemember] = useState(true)
    const [telefono, setTelefono] = useState('')
    const [pin, setPin] = useState('')
    const [showPin, setShowPin] = useState(false)
    const [token, setToken] = useState('')
    const [user, setUser] = useState(null)
    const [status, setStatus] = useState({ text: '', ok: null })
    const [screen, setScreen] = useState('encuesta-candidato')
    const [reportSubscreen, setReportSubscreen] = useState('propaganda')
    const [pendingRequests, setPendingRequests] = useState(0)

    const isBusy = pendingRequests > 0

    const currentViewLabel =
        screen === 'reportar'
            ? (reportSubscreen === 'propaganda' ? 'Propaganda' : 'Líder')
            : (screen === 'encuesta-candidato' ? 'Encuesta alcalde' : (screen === 'usuarios' ? 'Usuarios' : 'Inicio'))

    const setMsg = (text, ok = null) => setStatus({ text, ok })
    const closeMsg = () => setStatus({ text: '', ok: null })

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) return
        try {
            const parsed = JSON.parse(saved)
            if (!parsed?.token || !parsed?.user?.nombre) {
                localStorage.removeItem(STORAGE_KEY)
                return
            }
            setToken(parsed.token)
            setUser(parsed.user)
            setIsLoggedIn(true)
        } catch {
            localStorage.removeItem(STORAGE_KEY)
        }
    }, [])

    useEffect(() => {
        const originalFetch = window.fetch.bind(window)

        window.fetch = async (...args) => {
            setPendingRequests((prev) => prev + 1)
            try {
                return await originalFetch(...args)
            } finally {
                setPendingRequests((prev) => Math.max(0, prev - 1))
            }
        }

        return () => {
            window.fetch = originalFetch
        }
    }, [])

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!telefono || !pin) {
            setMsg('Ingresa tu teléfono y tu PIN', false)
            return
        }
        setMsg('Iniciando sesión...')
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telefono, pin, remember }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Error al entrar')
            setToken(data.token)
            setUser(data.user)
            setIsLoggedIn(true)
            setMsg('')
            if (remember) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: data.token, user: data.user }))
            } else {
                localStorage.removeItem(STORAGE_KEY)
            }
        } catch (err) {
            setMsg(err.message, false)
        }
    }

    const handleLogout = () => {
        setToken('')
        setUser(null)
        setIsLoggedIn(false)
        setScreen('encuesta-candidato')
        localStorage.removeItem(STORAGE_KEY)
    }

    if (!isLoggedIn) {
        return (
            <>
                <Modal msg={status} onClose={closeMsg} />
                <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-5">
                    <div className="w-full max-w-sm">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-slate-100">CEPEID</h1>
                            <p className="mt-1 text-slate-400">Reportes territoriales</p>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className={labelClass}>Teléfono</label>
                                <input className={inputClass} placeholder="Ej: 0991234567"
                                    value={telefono} inputMode="numeric"
                                    onChange={(e) => setTelefono(e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>PIN de 4 números</label>
                                <div className="relative">
                                    <input className={inputClass} placeholder="• • • •"
                                        type={showPin ? 'text' : 'password'} inputMode="numeric" maxLength={4}
                                        value={pin} onChange={(e) => setPin(e.target.value)} />
                                    <button type="button" onClick={() => setShowPin((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                        {showPin ? 'Ocultar' : 'Ver'}
                                    </button>
                                </div>
                            </div>
                            <label className="flex items-center gap-3 py-1">
                                <input type="checkbox" className="h-5 w-5 rounded"
                                    checked={remember} onChange={() => setRemember(!remember)} />
                                <span className="text-base text-slate-300">No volver a pedir hasta cerrar sesión</span>
                            </label>
                            <button type="submit"
                                disabled={isBusy}
                                className="w-full rounded-xl bg-emerald-600 py-4 text-lg font-semibold text-white active:bg-emerald-700">
                                {isBusy ? 'Procesando...' : 'Entrar'}
                            </button>
                        </form>
                    </div>
                </div>
                {isBusy && <LoadingOverlay />}
            </>
        )
    }

    return (
        <>
            <Modal msg={status} onClose={closeMsg} />
            <div className="min-h-screen bg-slate-950 text-slate-100">
                {/* Barra superior */}
                <div className="sticky top-0 z-20 flex items-center justify-between bg-slate-900 px-4 py-3 shadow">
                    <BottomNav screen={screen} setScreen={setScreen} rol={user?.rol} user={user} onLogout={handleLogout} reportSubscreen={reportSubscreen} setReportSubscreen={setReportSubscreen} />
                    <div className="flex-1 text-center">
                        <p className="text-base font-semibold text-slate-100">CEPEID</p>
                        <p className="text-xs text-slate-400">{currentViewLabel}</p>
                    </div>
                    <div className="w-11" />
                </div>

                {/* Pantallas */}
                {screen === 'reportar' && (
                    <div className="px-4 pb-28 pt-4">
                        {reportSubscreen === 'propaganda' ? (
                            <ReportePropaganda token={token} setMsg={setMsg} />
                        ) : (
                            <ReporteLider token={token} setMsg={setMsg} />
                        )}
                    </div>
                )}
                {screen === 'encuesta-candidato' && <EncuestaCandidato token={token} setMsg={setMsg} />}
                {screen === 'usuarios' && user?.rol === 'admin' && <Usuarios token={token} setMsg={setMsg} />}

            </div>
            {isBusy && <LoadingOverlay />}
        </>
    )
}

function LoadingOverlay() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75" role="status" aria-live="polite" aria-label="Procesando solicitud">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 shadow-xl">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
                <p className="text-sm font-medium">Procesando, por favor espera...</p>
            </div>
        </div>
    )
}

export default App
