const pollution = (sequelize, Sequelize) => {
    const Pollution = sequelize.define(
        'pollution',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            // titre TEXT NOT NULL
            titre: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            // type VARCHAR(50) with CHECK constraint in DB
            type: {
                type: Sequelize.STRING(50),
                allowNull: false,
                validate: {
                    isIn: [['Plastique', 'Chimique', 'Dépôt sauvage', 'Eau', 'Air', 'Autre']]
                }
            },
            // description TEXT NOT NULL
            description: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            // date_observation TIMESTAMP NOT NULL (snake_case column)
            dateObservation: {
                type: Sequelize.DATE,
                allowNull: false,
                field: 'date_observation'
            },
            // lieu TEXT NOT NULL
            lieu: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            // niveau VARCHAR(20) + CHECK
            niveau: {
                type: Sequelize.STRING(20),
                allowNull: false,
                validate: {
                    isIn: [['Faible', 'Moyen', 'Élevé']]
                }
            },
            // latitude DOUBLE PRECISION NOT NULL
            latitude: {
                type: Sequelize.DOUBLE,
                allowNull: false
            },
            // longitude DOUBLE PRECISION NOT NULL
            longitude: {
                type: Sequelize.DOUBLE,
                allowNull: false
            },
            // photo_url TEXT (nullable)
            photoUrl: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'photo_url'
            }
        },
        {
            timestamps: false,
            tableName: 'pollution'
        }
    )
    return Pollution
}

export default pollution
