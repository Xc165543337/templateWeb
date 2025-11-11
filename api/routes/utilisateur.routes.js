module.exports = app => {
    const utilisateur = require('../controllers/utilisateur.controllers.js')
    const router = require('express').Router()

    // Register
    router.post('/register', utilisateur.register)
    // Login (identifiant can be email or nomUtilisateur)
    router.post('/login', utilisateur.login)
    // List users (optional ?q= search)
    router.get('/', utilisateur.findAll)
    // Get one
    router.get('/:id', utilisateur.findOne)
    // Update
    router.put('/:id', utilisateur.update)
    // Delete
    router.delete('/:id', utilisateur.delete)

    app.use('/api/users', router)
}
