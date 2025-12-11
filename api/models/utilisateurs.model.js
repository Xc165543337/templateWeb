const utilisateursModel = (sequelize, Sequelize) => {
    const Utilisateurs = sequelize.define(
        'utilisateurs',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            nom: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            prenom: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true,
                validate: { isEmail: true }
            },
            motDePasse: {
                type: Sequelize.TEXT,
                allowNull: false,
                field: 'mot_de_passe'
            },
            nomUtilisateur: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true,
                field: 'nom_utilisateur'
            },
            dateCreation: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.NOW,
                field: 'date_creation'
            },
            dateModification: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.NOW,
                field: 'date_modification'
            }
        },
        {
            timestamps: false,
            tableName: 'utilisateurs'
        }
    )
    return Utilisateurs
}

export default utilisateursModel
