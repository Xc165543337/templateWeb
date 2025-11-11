const bcrypt = require('bcrypt')
const db = require('../models')
const Utilisateurs = db.utilisateurs
const Op = db.Sequelize.Op

// Helper to omit sensitive fields
const sanitizeUser = u => {
    if (!u) return null
    const { motDePasse, ...rest } = u.toJSON ? u.toJSON() : u
    return rest
}

// Register new user
exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, motDePasse, nomUtilisateur } = req.body
        if (!nom || !prenom || !email || !motDePasse || !nomUtilisateur) {
            return res.status(400).json({ message: 'Champs requis manquants.' })
        }
        // Basic format validations
        if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]{1,100}$/.test(nom) || !/^[A-Za-zÀ-ÖØ-öø-ÿ' -]{1,100}$/.test(prenom)) {
            return res.status(400).json({ message: 'Nom ou prénom invalide.' })
        }
        if (!/^[A-Za-z0-9_-]{3,50}$/.test(nomUtilisateur)) {
            return res.status(400).json({ message: 'Nom utilisateur invalide.' })
        }
        const existing = await Utilisateurs.findOne({
            where: { [Op.or]: [{ email }, { nomUtilisateur }] }
        })
        if (existing) {
            return res.status(409).json({ message: 'Email ou nom utilisateur déjà utilisé.' })
        }
        const hash = await bcrypt.hash(motDePasse, 10)
        const created = await Utilisateurs.create({
            nom,
            prenom,
            email,
            motDePasse: hash,
            nomUtilisateur
        })
        res.status(201).json(sanitizeUser(created))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Login by username or email + password
exports.login = async (req, res) => {
    try {
        const { identifiant, motDePasse } = req.body // identifiant can be email or nomUtilisateur
        if (!identifiant || !motDePasse) {
            return res.status(400).json({ message: 'Identifiant et motDePasse requis.' })
        }
        const user = await Utilisateurs.findOne({
            where: { [Op.or]: [{ email: identifiant }, { nomUtilisateur: identifiant }] }
        })
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' })
        const ok = await bcrypt.compare(motDePasse, user.motDePasse)
        if (!ok) return res.status(401).json({ message: 'Mot de passe incorrect.' })
        res.json(sanitizeUser(user))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// List users (with optional search by nomUtilisateur or email)
exports.findAll = async (req, res) => {
    try {
        const { q } = req.query
        const where = q
            ? {
                  [Op.or]: [{ nomUtilisateur: { [Op.iLike]: `%${q}%` } }, { email: { [Op.iLike]: `%${q}%` } }]
              }
            : undefined
        const users = await Utilisateurs.findAll({ where })
        res.json(users.map(sanitizeUser))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Get user by id
exports.findOne = async (req, res) => {
    try {
        const user = await Utilisateurs.findByPk(req.params.id)
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' })
        res.json(sanitizeUser(user))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Update user (cannot directly set motDePasse without hashing)
exports.update = async (req, res) => {
    try {
        const id = req.params.id
        const fields = ['nom', 'prenom', 'email', 'nomUtilisateur']
        const updates = {}
        for (const f of fields) if (req.body[f] !== undefined) updates[f] = req.body[f]
        if (req.body.motDePasse) {
            updates.motDePasse = await bcrypt.hash(req.body.motDePasse, 10)
        }
        updates.dateModification = new Date()
        const [affected] = await Utilisateurs.update(updates, { where: { id } })
        if (!affected) return res.status(404).json({ message: 'Utilisateur introuvable.' })
        const user = await Utilisateurs.findByPk(id)
        res.json(sanitizeUser(user))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Delete user
exports.delete = async (req, res) => {
    try {
        const id = req.params.id
        const removed = await Utilisateurs.destroy({ where: { id } })
        if (!removed) return res.status(404).json({ message: 'Utilisateur introuvable.' })
        res.json({ message: 'Utilisateur supprimé.' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
