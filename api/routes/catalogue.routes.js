import { Router } from 'express'
import { checkJwt } from './jwtMiddleware.js'
import * as catalogue from '../controllers/catalogue.controllers.js'

const catalogueRoutes = app => {
    const router = Router()

    router.get('/', checkJwt, catalogue.get)

    app.use('/api/catalogue', router)
}

export default catalogueRoutes
