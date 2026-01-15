import { Router } from 'express'
import { checkJwt, requireAdmin } from './jwtMiddleware.js'
import * as utilisateur from '../controllers/utilisateur.controllers.js'

const utilisateurRoutes = app => {
    const router = Router()

    // Public routes (no auth required)
    router.post('/register', utilisateur.register)
    router.post('/login', utilisateur.login)
    router.post('/refresh-token', utilisateur.refreshToken)
    router.post('/logout', utilisateur.logout)

    // Protected routes (auth required)
    router.get('/me', checkJwt, utilisateur.me)
    router.get('/:id', checkJwt, utilisateur.findOne)
    router.put('/:id', checkJwt, utilisateur.update)
    router.delete('/:id', checkJwt, utilisateur.deleteUser) // Self OR Admin

    // Admin-only routes
    router.get('/', checkJwt, requireAdmin, utilisateur.findAll) // List all users
    router.patch('/:id/role', checkJwt, requireAdmin, utilisateur.updateRole) // Change user role

    app.use('/api/users', router)
}

export default utilisateurRoutes
