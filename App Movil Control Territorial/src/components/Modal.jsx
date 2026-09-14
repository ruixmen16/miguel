export function Modal({ msg, onClose }) {
    if (!msg.text) return null
    const isOk = msg.ok === true
    const isErr = msg.ok === false
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-6">
            <div className="w-full max-w-sm rounded-2xl bg-slate-800 p-6 shadow-2xl">
                <p className="mb-3 text-center text-4xl">
                    {isOk ? '✅' : isErr ? '❌' : 'ℹ️'}
                </p>
                <p className={`text-center text-base font-medium ${isOk ? 'text-emerald-300' : isErr ? 'text-red-300' : 'text-slate-200'}`}>
                    {msg.text}
                </p>
                <button
                    onClick={onClose}
                    className={`mt-5 w-full rounded-xl py-3 text-base font-semibold text-white ${isOk ? 'bg-emerald-600 active:bg-emerald-700' : isErr ? 'bg-red-600 active:bg-red-700' : 'bg-slate-600 active:bg-slate-700'}`}
                >
                    Aceptar
                </button>
            </div>
        </div>
    )
}
