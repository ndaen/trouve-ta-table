import router from '@adonisjs/core/services/router'
import AuthController from "#controllers/auth_controller";
import {middleware} from "#start/kernel";

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
