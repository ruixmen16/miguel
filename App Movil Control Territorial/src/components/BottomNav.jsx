import { useState } from 'react'

export function BottomNav({ screen, setScreen, rol, user, onLogout, reportSubscreen, setReportSubscreen }) {
    const [open, setOpen] = useState(false)
    const [reportOpen, setReportOpen] = useState(false)

    const tabs = [
        { id: 'encuesta-candidato', label: 'Encuesta', icon: IconSurvey },
        { id: 'reportar', label: 'Reportar', icon: IconPlus, hasChildren: true },
    ]

    if (rol === 'admin') {
        tabs.push({ id: 'usuarios', label: 'Usuarios', icon: IconUsers })
    }

    const handleSelect = (id) => {
        setScreen(id)
        setOpen(false)
        setReportOpen(false)
    }

    const handleReportParent = () => {
        setReportOpen((prev) => !prev)
        if (screen !== 'reportar') {
            setScreen('reportar')
        }
    }

    const handleReportChild = (subscreen) => {
        setReportSubscreen(subscreen)
        setScreen('reportar')
        setOpen(false)
        setReportOpen(false)
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-800 text-slate-100"
                aria-label="Abrir menú"
            >
                <IconMenu />
            </button>

            {open && (
                <div className="fixed inset-0 z-30">
                    <button type="button" className="absolute inset-0 bg-slate-950/70" onClick={() => setOpen(false)} aria-label="Cerrar menú" />
                    <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-slate-800 bg-slate-900 p-4 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-lg font-semibold text-slate-100">{user?.nombre || 'Usuario'}</p>
                                <p className="text-sm capitalize text-slate-400">{user?.rol || 'Sin rol'}</p>
                            </div>
                            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100" aria-label="Cerrar menú">
                                <IconClose />
                            </button>
                        </div>

                        <div className="mt-6 space-y-2">
                            {tabs.map((tab) => {
                                const active = screen === tab.id
                                return (
                                    <div key={tab.id}>
                                        <button
                                            type="button"
                                            onClick={() => tab.hasChildren ? handleReportParent() : handleSelect(tab.id)}
                                            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                                        >
                                            <span className="flex items-center gap-3">
                                                <tab.icon active={active} />
                                                <span>{tab.label}</span>
                                            </span>
                                            {tab.hasChildren && <IconChevron open={reportOpen} />}
                                        </button>

                                        {tab.hasChildren && reportOpen && (
                                            <div className="ml-6 mt-2 space-y-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleReportChild('propaganda')}
                                                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${reportSubscreen === 'propaganda' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                                >
                                                    Propaganda
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleReportChild('lider')}
                                                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${reportSubscreen === 'lider' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                                >
                                                    Líder
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-auto border-t border-slate-800 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    onLogout?.()
                                    setOpen(false)
                                }}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-400 hover:bg-slate-800"
                            >
                                <IconLogout />
                                <span>Cerrar sesión</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </>
    )
}

function IconMenu() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
    )
}

function IconClose() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
    )
}

function IconPlus({ active }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} className="h-5 w-5">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M12 8v8M8 12h8" />
        </svg>
    )
}

function IconUsers({ active }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} className="h-5 w-5">
            <path strokeLinecap="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    )
}

function IconSurvey({ active }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h6M9 8h6M5 5h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
        </svg>
    )
}

function IconLogout() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17l4-4m0 0l-4-4m4 4H8m6 8a8 8 0 100-16" />
        </svg>
    )
}

function IconChevron({ open }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 transition-transform ${open ? 'rotate-90' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
        </svg>
    )
}
