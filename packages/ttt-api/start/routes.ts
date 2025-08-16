import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.get('/health', '#controllers/health_controller.check')

router
    .group(() => {
        // Auth Routes
        router.post('/auth/register', '#controllers/auth_controller.register')
        router.post('/auth/login', '#controllers/auth_controller.login')
        router.get('/auth/check', '#controllers/auth_controller.check')

        // Fuzzy Search Routes
        router.get(
            '/projects/:id/guests/search',
            '#controllers/guests_controller.fuzzySearchInProject'
        )

        router.get('/', async () => {
            return {
                hello: 'world',
                status: 'API running',
            }
        })
    })
    .prefix('/api')

router
    .group(() => {
        router
            .group(() => {
                router.post('/logout', '#controllers/auth_controller.logout')
                router.get('/me', '#controllers/auth_controller.me')
            })
            .prefix('/auth')
            .middleware(middleware.auth())
    })
    .prefix('/api')

router
    .group(() => {
        /**
         * Users Routes
         */
        router
            .group(() => {
                router.get('/', '#controllers/users_controller.index')
                router.get('/:id', '#controllers/users_controller.show')
                router.patch('/:id', '#controllers/users_controller.update')
                router.delete('/:id', '#controllers/users_controller.delete')
            })
            .prefix('/users')

        /**
         * Projects Routes
         */
        router
            .group(() => {
                router.get('/', '#controllers/projects_controller.index')
                router.get('/:id', '#controllers/projects_controller.show')
                router.post('/', '#controllers/projects_controller.create')
                router.patch('/:id', '#controllers/projects_controller.update')
                router.delete('/:id', '#controllers/projects_controller.delete')
                router
                    .group(() => {
                        router.get('/all', '#controllers/projects_controller.showByUser')
                    })
                    .prefix('/user')
                router.get(
                    '/:id/guests/unassigned',
                    '#controllers/guests_controller.getUnassignedGuests'
                )
            })
            .prefix('/projects')

        /**
         * Tables Routes
         */
        router
            .group(() => {
                router.get('/', '#controllers/tables_controller.index')
                router.get('/:id', '#controllers/tables_controller.show')
                router.post('/', '#controllers/tables_controller.create')
                router.patch('/:id', '#controllers/tables_controller.update')
                router.delete('/:id', '#controllers/tables_controller.delete')
            })
            .prefix('/tables')

        /**
         * Guests Routes
         */
        router
            .group(() => {
                router.get('/', '#controllers/guests_controller.index')
                router.get('/:id', '#controllers/guests_controller.show')
                router.post('/', '#controllers/guests_controller.create')
                router.patch('/:id', '#controllers/guests_controller.update')
                router.delete('/:id', '#controllers/guests_controller.delete')
                router.post('/:id/assign', '#controllers/guests_controller.assignToTable')
                router.post('/:id/unassign', '#controllers/guests_controller.unassignFromTable')
            })
            .prefix('/guests')
    })
    .prefix('/api')
    .middleware(middleware.auth())
