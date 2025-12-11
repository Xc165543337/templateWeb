import { v4 as uuidv4 } from 'uuid'
import db from '../models/index.js'

const Pollution = db.pollution
const Op = db.Sequelize.Op

// Create and Save a new Pollution
export const create = (req, res) => {
    if (!req.body.titre) {
        res.status(400).send({ message: "Le champ 'titre' est requis." })
        return
    }

    const pollution = {
        titre: req.body.titre,
        lieu: req.body.lieu,
        dateObservation: req.body.dateObservation ? new Date(req.body.dateObservation) : null,
        type: req.body.type,
        description: req.body.description,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        niveau: req.body.niveau,
        photoUrl: req.body.photoUrl
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
// Optional query param: type to filter by type
export const findAll = (req, res) => {
    const type = req.query.type
    const condition = type ? { type } : null

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
export const findOne = (req, res) => {
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
export const update = (req, res) => {
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
export const deletePollution = (req, res) => {
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
