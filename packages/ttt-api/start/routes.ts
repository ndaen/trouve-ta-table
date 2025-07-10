import router from '@adonisjs/core/services/router'
import AuthController from "#controllers/auth_controller";
import {middleware} from "#start/kernel";
import UsersController from '#controllers/users_controller';
import ProjectsController from "#controllers/projects_controller";

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
  router.get('/', [UsersController, 'index'])
  router.get('/:id', [UsersController, 'show'])
  router.patch('/:id', [UsersController, 'update'])
  router.delete('/:id', [UsersController, 'delete'])
}).prefix('/api/users').middleware(middleware.auth())


router.group(() => {
  router.get('/', [ProjectsController, 'index'])
  router.get('/:id', [ProjectsController, 'show'])
  router.post('/', [ProjectsController, 'create'])
  router.patch('/:id', [ProjectsController, 'update'])
  router.delete('/:id', [ProjectsController, 'delete'])
  router.group(() => {
    router.get('/all', [ProjectsController, 'showByUser'])
  }).prefix('/user')
}).prefix('/api/projects').middleware(middleware.auth())
