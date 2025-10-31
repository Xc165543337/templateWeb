const db = require('../models')
const { v4: uuidv4 } = require('uuid')
const Pollution = db.pollution
const Op = db.Sequelize.Op
// Create and Save a new Pollution
exports.create = (req, res) => {
    if (!req.body.nom) {
        res.status(400).send({ message: "Le champ 'nom' est requis." })
        return
    }

    const pollution = {
        nom: req.body.nom,
        lieu: req.body.lieu,
        dateObservation: req.body.dateObservation ? new Date(req.body.dateObservation) : null,
        typePollution: req.body.typePollution,
        description: req.body.description,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        imageUrl: req.body.imageUrl
    }

    Pollution.create(pollution)
        .then(data => {
            res.send(data)
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'Some error occurred while creating the Pollution.'
            })
        })
}

// Retrieve all Pollutions from the database.
// Optional query param: typePollution to filter by type
exports.findAll = (req, res) => {
    const type = req.query.typePollution
    const condition = type ? { typePollution: type } : null

    Pollution.findAll({ where: condition })
        .then(data => {
            res.send(data)
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'Some error occurred while retrieving pollutions.'
            })
        })
}

// Find a single Pollution with an id
exports.findOne = (req, res) => {
    const id = req.params.id

    Pollution.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data)
            } else {
                res.status(404).send({ message: `Cannot find Pollution with id=${id}.` })
            }
        })
        .catch(err => {
            res.status(500).send({ message: 'Error retrieving Pollution with id=' + id })
        })
}

// Update a Pollution by the id in the request
exports.update = (req, res) => {
    const id = req.params.id

    Pollution.update(req.body, { where: { id: id } })
        .then(num => {
            if (num[0] === 1 || num === 1) {
                res.send({ message: 'Pollution was updated successfully.' })
            } else {
                res.send({
                    message: `Cannot update Pollution with id=${id}. Maybe Pollution was not found or req.body is empty!`
                })
            }
        })
        .catch(err => {
            res.status(500).send({ message: 'Error updating Pollution with id=' + id })
        })
}

// Delete a Pollution with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id

    Pollution.destroy({ where: { id: id } })
        .then(num => {
            if (num === 1) {
                res.send({ message: 'Pollution was deleted successfully!' })
            } else {
                res.send({ message: `Cannot delete Pollution with id=${id}. Maybe Pollution was not found!` })
            }
        })
        .catch(err => {
            res.status(500).send({ message: 'Could not delete Pollution with id=' + id })
        })
}
