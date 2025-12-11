import { Router } from 'express'
import * as pollution from '../controllers/pollution.controllers.js'

const pollutionRoutes = app => {
    const router = Router()

    // Create
    router.post('/', pollution.create)
    // Get all
    router.get('/', pollution.findAll)
    // Get one
    router.get('/:id', pollution.findOne)
    // Update
    router.put('/:id', pollution.update)
    // Delete
    router.delete('/:id', pollution.deletePollution)

    app.use('/api/pollution', router)
}

export default pollutionRoutes
