import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import db from './models/index.js'
import routes from './routes/index.js'
import { PORT, CORS_ORIGIN } from './config.js'

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
