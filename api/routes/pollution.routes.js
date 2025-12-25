import { Router } from 'express'
import { checkJwt } from './jwtMiddleware.js'
import * as pollution from '../controllers/pollution.controllers.js'

const pollutionRoutes = app => {
    const router = Router()

    // Public routes
    router.get('/', pollution.findAll)
    router.get('/:id', pollution.findOne)

    // Protected routes (auth required)
    router.post('/', checkJwt, pollution.create)
    router.put('/:id', checkJwt, pollution.update)
    router.delete('/:id', checkJwt, pollution.deletePollution)

    app.use('/api/pollution', router)
}

export default pollutionRoutes
