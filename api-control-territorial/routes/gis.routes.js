import { Router } from 'express'
import { exportGisExcel, getGisDatos, getIntencionVotoDatos, getParroquiasGeojson, gisHealth } from '../controllers/gis.controller.js'
import { verificarToken } from '../middleware/auth.js'

const router = Router()

router.get('/health', gisHealth)

router.use(verificarToken)

router.get('/datos', getGisDatos)
router.get('/intencion-voto', getIntencionVotoDatos)
router.get('/export/excel', exportGisExcel)
router.get('/parroquias', getParroquiasGeojson)

export default router
