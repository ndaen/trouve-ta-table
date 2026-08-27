import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import type User from '#models/user'
import type Project from '#models/project'

export default class ProjectPolicy extends BasePolicy {
    view(user: User, project: Project): AuthorizerResponse {
        return user.id === project.userId
    }

    manage(user: User, project: Project): AuthorizerResponse {
        return user.id === project.userId
    }
}
