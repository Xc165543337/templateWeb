import { Router } from 'express'
import { checkJwt } from './jwtMiddleware.js'
import * as utilisateur from '../controllers/utilisateur.controllers.js'

const utilisateurRoutes = app => {
    const router = Router()

    // Public routes (no auth required)
    router.post('/register', utilisateur.register)
    router.post('/login', utilisateur.login)
    router.post('/refresh', utilisateur.refreshToken)
    router.post('/logout', utilisateur.logout)

    // Protected routes (auth required)
    router.get('/me', checkJwt, utilisateur.me)
    router.get('/', checkJwt, utilisateur.findAll)
    router.get('/:id', checkJwt, utilisateur.findOne)
    router.put('/:id', checkJwt, utilisateur.update)
    router.delete('/:id', checkJwt, utilisateur.deleteUser)

    app.use('/api/users', router)
}

export default utilisateurRoutes
