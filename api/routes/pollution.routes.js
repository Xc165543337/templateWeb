import { Router } from 'express'
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
    router.post('/upload-photo', checkJwt, pollution.upload.single('photo'), pollution.uploadPhoto)

    router.delete('/delete-photo/:filename', checkJwt, pollution.deletePhotoByUrl)

    // Photo get route (public)
    router.get('/photos/:filename', pollution.getPhoto)

    app.use('/api/pollution', router)
}

export default pollutionRoutes
