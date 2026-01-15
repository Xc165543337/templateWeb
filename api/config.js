import 'dotenv/config'

// JWT Configuration
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'fallback-access-secret-change-me'
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret-change-me'
export const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || '15m'
export const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d'

// Cookie Configuration
export const COOKIE_SECURE = process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true'
export const COOKIE_SAME_SITE = process.env.COOKIE_SAME_SITE || 'none' // 'none' for cross-site, 'strict' for same-site
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://tp07-li-haoxuan.onrender.com' // Frontend origin

export const BDD = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    bdname: process.env.DB_NAME || 'cnam'
}

export const PORT = process.env.PORT || 443
