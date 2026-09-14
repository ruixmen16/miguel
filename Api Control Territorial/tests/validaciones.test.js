import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizarCredenciales, validarEncuestaCandidato, validarUsuario } from '../utils/validaciones.js'

test('normalizarCredenciales exige teléfono y PIN', () => {
    const result = normalizarCredenciales({ pin: '1234' })
    assert.equal(result.ok, false)
    assert.match(result.message, /teléfono/i)
})

test('normalizarCredenciales acepta teléfono y PIN', () => {
    const result = normalizarCredenciales({ telefono: '0991234567', pin: '1234', remember: true })
    assert.equal(result.ok, true)
    assert.equal(result.telefono, '0991234567')
    assert.equal(result.pin, '1234')
    assert.equal(result.remember, true)
})

test('validarEncuestaCandidato requiere edad, género y candidato', () => {
    const result = validarEncuestaCandidato({ parroquia: 'Portoviejo', edad: '', genero: '', candidato_id: '' })
    assert.equal(result.ok, false)
    assert.ok(result.errors.edad)
    assert.ok(result.errors.genero)
    assert.ok(result.errors.candidato_id)
})

test('validarEncuestaCandidato exige ubicación GPS', () => {
    const result = validarEncuestaCandidato({ parroquia: 'Portoviejo', edad: 34, genero: 'Mujer', candidato_id: 3, latitud: null, longitud: null })
    assert.equal(result.ok, false)
    assert.ok(result.errors.gps)
})

test('validarEncuestaCandidato acepta una encuesta válida', () => {
    const result = validarEncuestaCandidato({ parroquia: 'Portoviejo', edad: 34, genero: 'Mujer', candidato_id: 3, latitud: -1.054321, longitud: -80.456789 })
    assert.equal(result.ok, true)
    assert.deepEqual(result.errors, {})
})

test('validarUsuario exige PIN al crear y permite editar sin PIN', () => {
    const crear = validarUsuario({ nombre: 'Ana', usuario: 'ana', telefono: '', pin: '', rol: 'brigadista' }, { requirePin: true })
    assert.equal(crear.ok, false)
    assert.match(crear.errors.pin, /PIN/i)

    const editar = validarUsuario({ nombre: 'Ana', usuario: 'ana', telefono: '0999999999', rol: 'coordinador', pin: '' }, { requirePin: false })
    assert.equal(editar.ok, true)
    assert.deepEqual(editar.errors, {})
})
