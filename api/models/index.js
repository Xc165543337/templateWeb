import { Sequelize } from 'sequelize'
import { BDD } from '../config.js'
import utilisateursModel from './utilisateurs.model.js'
import pollutionModel from './pollution.model.js'

const sequelize = new Sequelize(`postgres://${BDD.user}:${BDD.password}@${BDD.host}/${BDD.bdname}`, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: true,
        native: true
    },
    define: {
        timestamps: false
    }
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.utilisateurs = utilisateursModel(sequelize, Sequelize)
db.pollution = pollutionModel(sequelize, Sequelize)

export default db
