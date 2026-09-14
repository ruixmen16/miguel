import { useEffect, useState } from 'react'
const API_URL = import.meta.env.VITE_API_URL || '';
const ROL_COLOR = {
    admin: 'bg-purple-900/40 text-purple-300',
    coordinador: 'bg-blue-900/40 text-blue-300',
    brigadista: 'bg-emerald-900/40 text-emerald-300',
    observador: 'bg-slate-700 text-slate-300',
}

export function Usuarios({ token, setMsg }) {
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [resetTarget, setResetTarget] = useState(null)
    const [nuevoPin, setNuevoPin] = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [saving, setSaving] = useState(false)
    const [newUser, setNewUser] = useState({ nombre: '', usuario: '', telefono: '', pin: '', rol: 'brigadista' })

    const cargar = () => {
        setLoading(true)
        fetch(`${API_URL}/api/usuarios`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((d) => { setUsuarios(d.usuarios || []); setLoading(false) })
            .catch(() => setLoading(false))
    }

    useEffect(() => { cargar() }, [token])

    const abrirReset = (u) => { setResetTarget(u); setNuevoPin('') }
    const cerrarReset = () => { setResetTarget(null); setNuevoPin('') }

    const abrirEdicion = (u) => {
        setEditingUser({
            id: u.id,
            nombre: u.nombre || '',
            usuario: u.usuario || '',
            telefono: u.telefono || '',
            rol: u.rol || 'brigadista',
            pin: '',
        })
    }

    const cerrarEdicion = () => setEditingUser(null)

    const confirmarReset = async () => {
        if (!/^\d{4}$/.test(nuevoPin)) { setMsg('El PIN debe ser exactamente 4 dígitos numéricos', false); return }
        setSaving(true)
        try {
            const res = await fetch(`${API_URL}/api/usuarios/${resetTarget.id}/reset-pin`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ pin: nuevoPin }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'No se pudo cambiar el PIN')
            setMsg(`PIN de ${resetTarget.nombre} actualizado`, true)
            cerrarReset()
            cargar()
        } catch (err) {
            setMsg(err.message, false)
        } finally {
            setSaving(false)
        }
    }

    const guardarUsuario = async () => {
        const payload = {
            nombre: editingUser.nombre.trim(),
            usuario: editingUser.usuario.trim(),
            telefono: editingUser.telefono.trim(),
            rol: editingUser.rol,
            pin: editingUser.pin.trim(),
        }

        if (!payload.nombre) { setMsg('Ingresa el nombre del usuario', false); return }
        if (!payload.usuario && !payload.telefono) { setMsg('Ingresa usuario o teléfono', false); return }
        if (payload.pin && !/^\d{4}$/.test(payload.pin)) { setMsg('El PIN debe ser 4 dígitos', false); return }

        setSaving(true)
        try {
            const res = await fetch(`${API_URL}/api/usuarios/${editingUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Error al actualizar usuario')
            setMsg(`Usuario ${payload.nombre} actualizado correctamente`, true)
            cerrarEdicion()
            cargar()
        } catch (err) {
            setMsg(err.message, false)
        } finally {
            setSaving(false)
        }
    }

    const crearUsuario = async () => {
        if (!newUser.nombre.trim()) { setMsg('Ingresa el nombre del usuario', false); return }
        if (!newUser.pin.trim() || !/^\d{4}$/.test(newUser.pin)) { setMsg('PIN debe ser 4 dígitos', false); return }
        if (!newUser.usuario.trim() && !newUser.telefono.trim()) { setMsg('Ingresa usuario o teléfono', false); return }

        setSaving(true)
        try {
            const res = await fetch(`${API_URL}/api/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newUser),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Error al crear usuario')
            setMsg(`Usuario ${newUser.nombre} creado correctamente`, true)
            setShowCreate(false)
            setNewUser({ nombre: '', usuario: '', telefono: '', pin: '', rol: 'brigadista' })
            cargar()
        } catch (err) {
            setMsg(err.message, false)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="px-4 pb-28 pt-4">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Usuarios</h2>
                <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white active:bg-blue-700"
                >
                    + Nuevo
                </button>
            </div>

            {loading && <p className="mt-10 text-center text-slate-400">Cargando...</p>}

            <div className="space-y-3">
                {usuarios.map((u) => (
                    <div key={u.id} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-100 truncate">{u.nombre}</p>
                                <p className="text-sm text-slate-400 truncate">
                                    {u.usuario || u.telefono}
                                </p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${ROL_COLOR[u.rol] || 'bg-slate-700 text-slate-300'}`}>
                                {u.rol}
                            </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <span className={`text-xs ${u.activo ? 'text-emerald-400' : 'text-red-400'}`}>
                                {u.activo ? '● Activo' : '● Inactivo'}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => abrirEdicion(u)}
                                    className="rounded-xl bg-blue-600 px-3 py-2 text-sm text-white active:bg-blue-700"
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => abrirReset(u)}
                                    className="rounded-xl bg-slate-700 px-3 py-2 text-sm text-slate-200 active:bg-slate-600"
                                >
                                    🔑 PIN
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal editar usuario */}
            {editingUser && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60">
                    <div className="w-full max-w-sm rounded-t-3xl bg-slate-800 p-6 shadow-2xl">
                        <h3 className="mb-4 text-lg font-semibold text-slate-100">Editar usuario</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-300">Nombre *</label>
                                <input
                                    className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                                    value={editingUser.nombre}
                                    onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-300">Usuario (alias)</label>
                                <input
                                    className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                                    value={editingUser.usuario}
                                    onChange={(e) => setEditingUser({ ...editingUser, usuario: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-300">Teléfono</label>
                                <input
                                    className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                                    inputMode="numeric"
                                    value={editingUser.telefono}
                                    onChange={(e) => setEditingUser({ ...editingUser, telefono: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-300">PIN (opcional)</label>
                                <input
                                    className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2 text-center text-2xl tracking-widest text-slate-100 focus:border-blue-500 focus:outline-none"
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder="● ● ● ●"
                                    value={editingUser.pin}
                                    onChange={(e) => setEditingUser({ ...editingUser, pin: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-300">Rol</label>
                                <select
                                    className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                                    value={editingUser.rol}
                                    onChange={(e) => setEditingUser({ ...editingUser, rol: e.target.value })}
                                >
                                    <option value="brigadista">Brigadista</option>
                                    <option value="coordinador">Coordinador</option>
                                    <option value="observador">Observador</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-5 flex gap-3">
                            <button type="button" onClick={cerrarEdicion}
                                className="flex-1 rounded-xl bg-slate-700 py-3 text-base font-semibold text-slate-200 active:bg-slate-600">
                                Cancelar
                            </button>
                            <button type="button" onClick={guardarUsuario} disabled={saving}
                                className="flex-1 rounded-xl bg-blue-600 py-3 text-base font-semibold text-white active:bg-blue-700 disabled:opacity-50">
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal reset PIN */}
            {resetTarget && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60">
                    <div className="w-full max-w-sm rounded-t-3xl bg-slate-800 p-6 shadow-2xl">
                        <p className="mb-1 text-center text-base font-semibold text-slate-100">
                            Cambiar PIN de
                        </p>
                        <p className="mb-5 text-center text-lg font-bold text-blue-400">
                            {resetTarget.nombre}
                        </p>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Nuevo PIN (4 dígitos)
                        </label>
                        <input
                            className="mb-4 w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-center text-2xl tracking-widest text-slate-100 focus:border-blue-500 focus:outline-none"
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="●  ●  ●  ●"
                            value={nuevoPin}
                            onChange={(e) => setNuevoPin(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button type="button" onClick={cerrarReset}
                                className="flex-1 rounded-xl bg-slate-700 py-3 text-base font-semibold text-slate-200 active:bg-slate-600">
                                Cancelar
                            </button>
                            <button type="button" onClick={confirmarReset} disabled={saving}
                                className="flex-1 rounded-xl bg-blue-600 py-3 text-base font-semibold text-white active:bg-blue-700 disabled:opacity-50">
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal crear usuario */}
            {showCreate && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60">
                    <div className="w-full max-w-sm rounded-t-3xl bg-slate-800 p-6 shadow-2xl">
                        <h3 className="mb-4 text-lg font-semibold text-slate-100">Crear nuevo usuario</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-300">Nombre *</label>
                                <input
                                    className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                                    placeholder="Ej: Carlos López"
                                    value={newUser.nombre}
                                    onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-300">Usuario (alias)</label>
                                <input
                                    className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                                    placeholder="Ej: carlos_lopez"
                                    value={newUser.usuario}
                                    onChange={(e) => setNewUser({ ...newUser, usuario: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-300">Teléfono</label>
                                <input
                                    className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                                    placeholder="Ej: 0991234567"
                                    inputMode="numeric"
                                    value={newUser.telefono}
                                    onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-300">PIN (4 dígitos) *</label>
                                <input
                                    className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2 text-center text-2xl tracking-widest text-slate-100 focus:border-blue-500 focus:outline-none"
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder="● ● ● ●"
                                    value={newUser.pin}
                                    onChange={(e) => setNewUser({ ...newUser, pin: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-300">Rol</label>
                                <select
                                    className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                                    value={newUser.rol}
                                    onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
                                >
                                    <option value="brigadista">Brigadista</option>
                                    <option value="coordinador">Coordinador</option>
                                    <option value="observador">Observador</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-5 flex gap-3">
                            <button type="button" onClick={() => setShowCreate(false)}
                                className="flex-1 rounded-xl bg-slate-700 py-3 text-base font-semibold text-slate-200 active:bg-slate-600">
                                Cancelar
                            </button>
                            <button type="button" onClick={crearUsuario} disabled={saving}
                                className="flex-1 rounded-xl bg-blue-600 py-3 text-base font-semibold text-white active:bg-blue-700 disabled:opacity-50">
                                {saving ? 'Creando...' : 'Crear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
