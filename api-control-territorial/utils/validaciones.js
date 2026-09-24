export function normalizarCredenciales(body = {}) {
    const telefono = String(body.telefono || '').trim()
    const pin = String(body.pin || '').trim()
    const remember = Boolean(body.remember)

    if (!pin || !telefono) {
        return { ok: false, message: 'Teléfono y PIN son obligatorios' }
    }

    return { ok: true, telefono, pin, remember }
}

export function validarEncuestaCandidato(payload = {}) {
    const errors = {}

    if (!payload.parroquia || !String(payload.parroquia).trim()) {
        errors.parroquia = 'La parroquia es obligatoria'
    }

    if (!payload.edad || Number(payload.edad) < 1) {
        errors.edad = 'La edad es obligatoria y debe ser mayor a 0'
    }

    if (!payload.genero || !String(payload.genero).trim()) {
        errors.genero = 'El género es obligatorio'
    }

    if (!payload.candidato_id || Number(payload.candidato_id) < 1) {
        errors.candidato_id = 'Debe seleccionar un candidato'
    }

    if (!payload.latitud || !payload.longitud) {
        errors.gps = 'La ubicación GPS (latitud y longitud) es obligatoria'
    }

    return { ok: Object.keys(errors).length === 0, errors }
}

export function validarUsuario(payload = {}, { requirePin = true } = {}) {
    const errors = {}
    const nombre = String(payload.nombre || '').trim()
    const telefono = String(payload.telefono || '').trim()
    const usuario = String(payload.usuario || '').trim()
    const pin = String(payload.pin || '').trim()
    const rol = String(payload.rol || '').trim()

    if (!nombre) {
        errors.nombre = 'El nombre es obligatorio'
    }

    if (!telefono && !usuario) {
        errors.contacto = 'Debe ingresar un usuario o un teléfono'
    }

    if (requirePin && !pin) {
        errors.pin = 'El PIN es obligatorio'
    }

    if (pin && !/^\d{4}$/.test(pin)) {
        errors.pin = 'El PIN debe tener exactamente 4 dígitos numéricos'
    }

    if (telefono && !/^\d+$/.test(telefono)) {
        errors.telefono = 'El teléfono solo debe contener números'
    }

    if (rol && !['admin', 'coordinador', 'brigadista', 'observador'].includes(rol)) {
        errors.rol = 'El rol no es válido'
    }

    return { ok: Object.keys(errors).length === 0, errors }
}
