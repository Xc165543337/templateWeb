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
            // Location: either address OR GPS coordinates (at least one required)
            // adresse TEXT (nullable) - text address
            adresse: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            // latitude DOUBLE PRECISION (nullable) - GPS coordinate
            latitude: {
                type: Sequelize.DOUBLE,
                allowNull: true
            },
            // longitude DOUBLE PRECISION (nullable) - GPS coordinate
            longitude: {
                type: Sequelize.DOUBLE,
                allowNull: true
            },
            // niveau VARCHAR(20) + CHECK
            niveau: {
                type: Sequelize.STRING(20),
                allowNull: false,
                validate: {
                    isIn: [['Faible', 'Moyen', 'Élevé']]
                }
            },
            // photo_url TEXT (nullable) - URL to photo or path to uploaded file
            photoUrl: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'photo_url'
            },
            // Foreign key to the user who created this pollution report
            utilisateurId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                field: 'utilisateur_id',
                references: {
                    model: 'utilisateurs',
                    key: 'id'
                }
            }
        },
        {
            timestamps: false,
            tableName: 'pollution',
            validate: {
                // Custom validation: must have either address OR GPS coordinates
                hasLocation() {
                    if (!this.adresse && (this.latitude === null || this.longitude === null)) {
                        throw new Error(
                            'Une localisation est requise: adresse OU coordonnées GPS (latitude et longitude).'
                        )
                    }
                    if (this.latitude !== null && this.longitude === null) {
                        throw new Error('La longitude est requise si la latitude est fournie.')
                    }
                    if (this.longitude !== null && this.latitude === null) {
                        throw new Error('La latitude est requise si la longitude est fournie.')
                    }
                }
            }
        }
    )
    return Pollution
}

export default pollution
