import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import db from '../models/index.js'
import {
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRATION,
    REFRESH_TOKEN_EXPIRATION,
    COOKIE_SECURE,
    COOKIE_SAME_SITE
} from '../config.js'

const Utilisateurs = db.utilisateurs
const Op = db.Sequelize.Op

// Helper to omit sensitive fields
const sanitizeUser = u => {
    if (!u) return null
    const { motDePasse, ...rest } = u.toJSON ? u.toJSON() : u
    return rest
}

// Generate Access Token (short-lived)
const generateAccessToken = user => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            nomUtilisateur: user.nomUtilisateur,
            role: user.role,
            type: 'access'
        },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRATION,
            algorithm: 'HS256'
        }
    )
}

// Generate Refresh Token (long-lived)
const generateRefreshToken = user => {
    return jwt.sign(
        {
            id: user.id,
            type: 'refresh'
        },
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRATION,
            algorithm: 'HS256'
        }
    )
}

// Generate both tokens
const generateTokens = user => {
    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user),
        accessTokenExpiresIn: ACCESS_TOKEN_EXPIRATION,
        refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRATION
    }
}

// Cookie options for refresh token (HttpOnly for XSS protection)
const getRefreshTokenCookieOptions = () => ({
    httpOnly: true, // JavaScript can't access it (XSS protection)
    secure: COOKIE_SECURE, // Required for sameSite: 'none' and HTTPS
    sameSite: COOKIE_SAME_SITE, // 'none' for cross-site (different domains), 'strict' for same-site
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/api/users' // Only sent to user-related endpoints
})

// Register new user
export const register = async (req, res) => {
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

        // First user becomes admin
        const userCount = await Utilisateurs.count()
        const role = userCount === 0 ? 'admin' : 'user'

        const hash = await bcrypt.hash(motDePasse, 10)
        const created = await Utilisateurs.create({
            nom,
            prenom,
            email,
            motDePasse: hash,
            nomUtilisateur,
            role
        })
        res.status(201).json(sanitizeUser(created))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Login by username or email + password
export const login = async (req, res) => {
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

        // Generate access and refresh tokens
        const tokens = generateTokens(user)

        // Set refresh token as HttpOnly cookie (NOT in response body)
        res.cookie('refreshToken', tokens.refreshToken, getRefreshTokenCookieOptions())

        // Only send access token in response body (no refresh token!)
        res.json({
            user: sanitizeUser(user),
            accessToken: tokens.accessToken,
            accessTokenExpiresIn: tokens.accessTokenExpiresIn
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Logout - clear the refresh token cookie
export const logout = (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: COOKIE_SAME_SITE,
        path: '/api/users'
    })
    res.json({ message: 'Déconnexion réussie.' })
}

// Refresh access token using refresh token from HttpOnly cookie
export const refreshToken = async (req, res) => {
    try {
        // Read refresh token from HttpOnly cookie (not request body)
        const refreshToken = req.cookies.refreshToken

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token requis. Veuillez vous reconnecter.' })
        }

        // Verify the refresh token
        let decoded
        try {
            decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, {
                algorithms: ['HS256']
            })
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Refresh token expiré. Veuillez vous reconnecter.' })
            }
            return res.status(401).json({ message: 'Refresh token invalide.' })
        }

        // Check token type
        if (decoded.type !== 'refresh') {
            return res.status(401).json({ message: 'Type de token invalide.' })
        }

        // Get user from database
        const user = await Utilisateurs.findByPk(decoded.id)
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable.' })
        }

        // Generate new tokens
        const tokens = generateTokens(user)

        // Set new refresh token as HttpOnly cookie
        res.cookie('refreshToken', tokens.refreshToken, getRefreshTokenCookieOptions())

        // Only send access token in response body
        res.json({
            user: sanitizeUser(user),
            accessToken: tokens.accessToken,
            accessTokenExpiresIn: tokens.accessTokenExpiresIn
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Get current authenticated user from token
export const me = async (req, res) => {
    try {
        const user = await Utilisateurs.findByPk(req.user.id)
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' })
        res.json(sanitizeUser(user))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// List users (with optional search by nomUtilisateur or email)
export const findAll = async (req, res) => {
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
export const findOne = async (req, res) => {
    try {
        const user = await Utilisateurs.findByPk(req.params.id)
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' })
        res.json(sanitizeUser(user))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Update user (cannot directly set motDePasse without hashing)
export const update = async (req, res) => {
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

// Delete user (self OR admin, with cascade deletion of pollutions)
export const deleteUser = async (req, res) => {
    try {
        const targetId = Number.parseInt(req.params.id)
        const requesterId = req.user.id
        const requesterRole = req.user.role

        const isOwner = targetId === requesterId
        const isAdmin = requesterRole === 'admin'

        // Check permission: must be owner or admin
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Vous ne pouvez pas supprimer un autre utilisateur.' })
        }

        // Find target user
        const targetUser = await Utilisateurs.findByPk(targetId)
        if (!targetUser) {
            return res.status(404).json({ message: 'Utilisateur introuvable.' })
        }

        // Prevent deleting the last admin
        if (targetUser.role === 'admin') {
            const adminCount = await Utilisateurs.count({ where: { role: 'admin' } })
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Impossible de supprimer le dernier administrateur.' })
            }
        }

        // Cascade delete: remove user's pollution reports
        const Pollution = db.pollution
        await Pollution.destroy({ where: { utilisateurId: targetId } })

        // Delete the user
        await Utilisateurs.destroy({ where: { id: targetId } })

        res.json({ message: 'Utilisateur et ses signalements supprimés.' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Update user role (admin only)
export const updateRole = async (req, res) => {
    try {
        const targetId = Number.parseInt(req.params.id)
        const { role } = req.body

        // Validate role
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Rôle invalide. Utilisez 'user' ou 'admin'." })
        }

        // Find target user
        const targetUser = await Utilisateurs.findByPk(targetId)
        if (!targetUser) {
            return res.status(404).json({ message: 'Utilisateur introuvable.' })
        }

        // Prevent admin from demoting themselves
        if (targetId === req.user.id && role !== 'admin') {
            return res.status(400).json({ message: 'Vous ne pouvez pas rétrograder votre propre compte.' })
        }

        // If demoting an admin, ensure it's not the last one
        if (targetUser.role === 'admin' && role === 'user') {
            const adminCount = await Utilisateurs.count({ where: { role: 'admin' } })
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Impossible de rétrograder le dernier administrateur.' })
            }
        }

        // Update role
        await Utilisateurs.update({ role, dateModification: new Date() }, { where: { id: targetId } })

        const updatedUser = await Utilisateurs.findByPk(targetId)
        res.json({ message: 'Rôle mis à jour.', user: sanitizeUser(updatedUser) })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
