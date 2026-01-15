import db from '../models/index.js'

const Pollution = db.pollution
const Utilisateur = db.utilisateurs
const Op = db.Sequelize.Op

// Create and Save a new Pollution
export const create = (req, res) => {
    if (!req.body.titre) {
        res.status(400).send({ message: "Le champ 'titre' est requis." })
        return
    }

    // Validate location: must have either address OR GPS coordinates
    const hasAddress = req.body.adresse && req.body.adresse.trim() !== ''
    const hasGPS = req.body.latitude !== undefined && req.body.longitude !== undefined

    if (!hasAddress && !hasGPS) {
        res.status(400).send({
            message: "Une localisation est requise: 'adresse' OU coordonnées GPS ('latitude' et 'longitude')."
        })
        return
    }

    // Get user ID from JWT token (set by checkJwt middleware)
    const utilisateurId = req.user?.id
    if (!utilisateurId) {
        res.status(401).send({ message: 'Utilisateur non authentifié.' })
        return
    }

    const pollution = {
        titre: req.body.titre,
        adresse: req.body.adresse || null,
        dateObservation: req.body.dateObservation ? new Date(req.body.dateObservation) : null,
        type: req.body.type,
        description: req.body.description,
        latitude: hasGPS ? req.body.latitude : null,
        longitude: hasGPS ? req.body.longitude : null,
        niveau: req.body.niveau,
        photoUrl: req.body.photoUrl || null, // Can be a URL or path to uploaded file
        utilisateurId: utilisateurId
    }

    Pollution.create(pollution)
        .then(data => {
            res.status(201).send(data)
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'Une erreur est survenue lors de la création du signalement.'
            })
        })
}

// Retrieve all Pollutions from the database.
// Optional query param: type to filter by type
export const findAll = (req, res) => {
    const type = req.query.type
    const condition = type ? { type } : null

    Pollution.findAll({
        where: condition,
        include: [
            {
                model: Utilisateur,
                as: 'utilisateur',
                attributes: ['id', 'nom', 'prenom', 'nomUtilisateur']
            }
        ]
    })
        .then(data => {
            res.send(data)
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'Une erreur est survenue lors de la récupération des signalements.'
            })
        })
}

// Find a single Pollution with an id
export const findOne = (req, res) => {
    const id = req.params.id

    Pollution.findByPk(id, {
        include: [
            {
                model: Utilisateur,
                as: 'utilisateur',
                attributes: ['id', 'nom', 'prenom', 'nomUtilisateur']
            }
        ]
    })
        .then(data => {
            if (data) {
                res.send(data)
            } else {
                res.status(404).send({ message: `Signalement avec id=${id} introuvable.` })
            }
        })
        .catch(err => {
            res.status(500).send({ message: 'Erreur lors de la récupération du signalement avec id=' + id })
        })
}

// Update a Pollution by the id in the request
export const update = async (req, res) => {
    const id = req.params.id
    const requesterId = req.user?.id
    const requesterRole = req.user?.role

    try {
        // Check if pollution exists
        const pollution = await Pollution.findByPk(id)
        if (!pollution) {
            return res.status(404).send({ message: `Signalement avec id=${id} introuvable.` })
        }

        // Check ownership OR admin role
        const isOwner = pollution.utilisateurId === requesterId
        const isAdmin = requesterRole === 'admin'

        if (!isOwner && !isAdmin) {
            return res.status(403).send({ message: "Vous n'êtes pas autorisé à modifier ce signalement." })
        }

        // Validate location if being updated
        if (req.body.adresse !== undefined || req.body.latitude !== undefined || req.body.longitude !== undefined) {
            const newAdresse = req.body.adresse !== undefined ? req.body.adresse : pollution.adresse
            const newLatitude = req.body.latitude !== undefined ? req.body.latitude : pollution.latitude
            const newLongitude = req.body.longitude !== undefined ? req.body.longitude : pollution.longitude

            const hasAddress = newAdresse && newAdresse.trim() !== ''
            const hasGPS = newLatitude !== null && newLongitude !== null

            if (!hasAddress && !hasGPS) {
                return res.status(400).send({
                    message: "Une localisation est requise: 'adresse' OU coordonnées GPS ('latitude' et 'longitude')."
                })
            }
        }

        // Don't allow changing the owner
        delete req.body.utilisateurId

        const [updated] = await Pollution.update(req.body, { where: { id: id } })
        if (updated) {
            res.send({ message: 'Signalement mis à jour avec succès.' })
        } else {
            res.send({ message: 'Aucune modification effectuée.' })
        }
    } catch (err) {
        console.error('Update pollution error:', err.message)
        res.status(500).send({ message: 'Erreur lors de la mise à jour du signalement avec id=' + id })
    }
}

// Delete a Pollution with the specified id in the request
export const deletePollution = async (req, res) => {
    const id = req.params.id
    const requesterId = req.user?.id
    const requesterRole = req.user?.role

    try {
        // Check if pollution exists
        const pollution = await Pollution.findByPk(id)
        if (!pollution) {
            return res.status(404).send({ message: `Signalement avec id=${id} introuvable.` })
        }

        // Check ownership OR admin role
        const isOwner = pollution.utilisateurId === requesterId
        const isAdmin = requesterRole === 'admin'

        if (!isOwner && !isAdmin) {
            return res.status(403).send({ message: "Vous n'êtes pas autorisé à supprimer ce signalement." })
        }

        await Pollution.destroy({ where: { id: id } })
        res.send({ message: 'Signalement supprimé avec succès!' })
    } catch (err) {
        console.error('Delete pollution error:', err.message)
        res.status(500).send({ message: 'Erreur lors de la suppression du signalement avec id=' + id })
    }
}

// Retrieve all Pollutions created by the authenticated user
export const findMyPollutions = (req, res) => {
    const utilisateurId = req.user?.id

    if (!utilisateurId) {
        return res.status(401).send({ message: 'Utilisateur non authentifié.' })
    }

    Pollution.findAll({
        where: { utilisateurId: utilisateurId },
        include: [
            {
                model: Utilisateur,
                as: 'utilisateur',
                attributes: ['id', 'nom', 'prenom', 'nomUtilisateur']
            }
        ]
    })
        .then(data => {
            res.send(data)
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'Une erreur est survenue lors de la récupération de vos signalements.'
            })
        })
}
