import express from 'express'
import cors from 'cors'
import db from './models/index.js'
import routes from './routes/index.js'
import { PORT } from './config.js'

const app = express()

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    headers: 'Content-Type, Authorization',
    exposedHeaders: 'Authorization'
}

app.use(cors(corsOptions))

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
