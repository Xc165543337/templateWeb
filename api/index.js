import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import db from './models/index.js'
import routes from './routes/index.js'
import { PORT, CORS_ORIGIN } from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const corsOptions = {
    origin: CORS_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: true // Required for cookies to be sent cross-origin
}

app.use(cors(corsOptions))

// Parse cookies
app.use(cookieParser())

// parse requests of content-type - application/json
app.use(express.json())

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use((err, _req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message })
    }
    next(err)
})

// simple route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to CNAM application.' })
})

db.sequelize
    .sync()
    .then(() => {
        console.log('Synced db.')
    })
    .catch(err => {
        console.log('Failed to sync db: ' + err.message)
    })

routes(app)

// set port, listen for requests
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})
