import { Router } from 'express'
import multer from 'multer'
import { checkJwt } from './jwtMiddleware.js'
import * as pollution from '../controllers/pollution.controllers.js'

const pollutionRoutes = app => {
    const router = Router()

    // Public routes
    router.get('/', pollution.findAll)
    router.get('/:id', pollution.findOne)

    // Protected routes (auth required)
    router.get('/user/me', checkJwt, pollution.findMyPollutions) // Get current user's pollutions
    router.post('/', checkJwt, pollution.create)
    router.put('/:id', checkJwt, pollution.update)
    router.delete('/:id', checkJwt, pollution.deletePollution)

    // Photo upload route (auth required)
    // Receives: multipart/form-data with field name 'photo'
    // Returns: { photoUrl: "/uploads/filename.jpg" }
    router.post(
        '/upload-photo',
        checkJwt,
        (req, res, next) => {
            pollution.upload.single('photo')(req, res, err => {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({ message: 'Fichier trop volumineux. Taille maximale: 5MB.' })
                    }
                    return res.status(400).json({ message: `Erreur upload: ${err.message}` })
                } else if (err) {
                    return res.status(400).json({ message: err.message })
                }
                next()
            })
        },
        pollution.uploadPhoto
    )

    app.use('/api/pollution', router)
}

export default pollutionRoutes
