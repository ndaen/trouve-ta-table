import router from '@adonisjs/core/services/router'
import AuthController from "#controllers/auth_controller";
import {middleware} from "#start/kernel";
import UsersController from '#controllers/users_controller';
import ProjectsController from "#controllers/projects_controller";
import TablesController from "#controllers/tables_controller";
import GuestsController from "#controllers/guests_controller";

router.group(() => {
	router.post('/auth/register', [AuthController, 'register'])
	router.post('/auth/login', [AuthController, 'login'])
	router.get('/auth/check', [AuthController, 'check'])

	router.get('/', async () => {
		return {
			hello: 'world',
			status: 'API running'
		}
	})
}).prefix('/api')

router.group(() => {
	router.group(() => {
		router.post('/logout', [AuthController, 'logout'])
		router.get('/me', [AuthController, 'me'])
	}).prefix('/auth').middleware(middleware.auth())
}).prefix('/api')

router.group(() => {

	/**
	 * Users Routes
	 */
	router.group(() => {
		router.get('/', [UsersController, 'index'])
		router.get('/:id', [UsersController, 'show'])
		router.patch('/:id', [UsersController, 'update'])
		router.delete('/:id', [UsersController, 'delete'])
	}).prefix('/users')

	/**
	 * Projects Routes
	 */
	router.group(() => {
		router.get('/', [ProjectsController, 'index'])
		router.get('/:id', [ProjectsController, 'show'])
		router.post('/', [ProjectsController, 'create'])
		router.patch('/:id', [ProjectsController, 'update'])
		router.delete('/:id', [ProjectsController, 'delete'])
		router.group(() => {
			router.get('/all', [ProjectsController, 'showByUser'])
		}).prefix('/user')
	}).prefix('/projects')

	/**
	 * Tables Routes
	 */
	router.group(() => {
		router.get('/', [TablesController, 'index'])
		router.get('/:id', [TablesController, 'show'])
		router.post('/', [TablesController, 'create'])
		router.patch('/:id', [TablesController, 'update'])
		router.delete('/:id', [TablesController, 'delete'])
	}).prefix('/tables')

	/**
	 * Guests Routes
	 */
	router.group(() => {
		router.get('/', [GuestsController, 'index'])
		router.get('/:id', [GuestsController, 'show'])
		router.post('/', [GuestsController, 'create'])
		router.patch('/:id', [GuestsController, 'update'])
		router.delete('/:id', [GuestsController, 'delete'])
		router.post('/:id/assign', [GuestsController, 'assignToTable'])
		router.post('/:id/unassign', [GuestsController, 'unassignFromTable'])
	}).prefix('/guests')


}).prefix('/api').middleware(middleware.auth())
