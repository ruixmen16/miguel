import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const storage = multer.diskStorage({
    destination(_req, _file, cb) {
        cb(null, path.join(__dirname, '../uploads/referencia_imagen_propaganda'))
    },
    filename(_req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
        const nombre = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`
        cb(null, nombre)
    },
})

const fileFilter = (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (allowed.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Solo se permiten imágenes JPG, PNG, WEBP o HEIC'), false)
    }
}

export const uploadPropaganda = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo (la compresión se hace en el front)
})
