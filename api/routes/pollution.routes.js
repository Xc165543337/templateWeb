module.exports = app => {
    const pollution = require('../controllers/pollution.controllers.js')

    const router = require('express').Router()

    // Create a new Pollution
    router.post('/', pollution.create)

    // Retrieve all Pollutions
    router.get('/', pollution.findAll)

    // Retrieve a single Pollution with id
    router.get('/:id', pollution.findOne)

    // Update a Pollution with id
    router.put('/:id', pollution.update)

    // Delete a Pollution with id
    router.delete('/:id', pollution.delete)

    app.use('/api/pollution', router)
}
