import { Hono } from 'hono'
import { jwtMiddleware, roleMiddleware } from '../../helpers/middleware/middleware'
import { zValidator } from '@hono/zod-validator'
import { UserEntity, UserRepository } from './user.repository'
import { queryUrlSchema } from '../../helpers/validator/base.validator'
import { appResponse } from '../../helpers/response'

export const userController = new Hono()
    .use('*', async (c, next) => {
        const method = c.req.method.toLowerCase()
        if (method === 'options') {
            await next()
            return
        }
        return jwtMiddleware(c, next)
    })
    .use(
        '*',
        roleMiddleware({
            get: ['production_manager'],
            update: ['production_manager'],
            create: ['production_manager'],
            delete: ['production_manager'],
        }),
    )
    .get('/', zValidator('query', queryUrlSchema), async (c) => {
        const { q, page, sort, order, limit } = c.req.query()

        const userRepo = new UserRepository()

        try {
            const users = await userRepo.list({ q, sort, page, limit, order })

            if (!users || users.items.length === 0) {
                return appResponse(c, 404, 'user not found', { items: [] as UserEntity[], meta: { totalItems: 0 } })
            }

            return appResponse(c, 200, 'success get data', users)
        } catch (error) {
            return appResponse(c, 500, 'something went wrong', { items: [] as UserEntity[], meta: { totalItems: 0 } })
        }
    })
