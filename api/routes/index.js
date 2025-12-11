import catalogueRoutes from './catalogue.routes.js'
import utilisateurRoutes from './utilisateur.routes.js'
import pollutionRoutes from './pollution.routes.js'

const routes = app => {
    catalogueRoutes(app)
    utilisateurRoutes(app)
    pollutionRoutes(app)
}

export default routes
