import jwt from 'jsonwebtoken'
import { ACCESS_TOKEN_SECRET } from '../config.js'

export const checkJwt = (req, res, next) => {
    // Get the JWT from the request header
    const authHeader = req.headers['authorization']

    if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header provided' })
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Invalid authorization header format. Use: Bearer <token>' })
    }

    const token = parts[1]

    try {
        // Verify the token
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
            algorithms: ['HS256']
        })

        // Ensure this is an access token, not a refresh token
        if (decoded.type !== 'access') {
            return res.status(401).json({ message: 'Invalid token type. Use access token.' })
        }

        // Add the decoded payload to the request so controllers may access it
        req.user = decoded
        req.token = token

        next()
    } catch (error) {
        console.log('JWT verification error:', error.message)

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' })
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' })
        }

        return res.status(401).json({ message: 'Authentication failed' })
    }
}
