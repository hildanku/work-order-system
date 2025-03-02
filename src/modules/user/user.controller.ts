import { Hono } from 'hono'
import { jwtMiddleware, roleMiddleware } from '../../helpers/middleware/middleware'
import { zValidator } from '@hono/zod-validator'
import { UserEntity, UserRepository } from './user.repository'
import { queryUrlSchema, idSchema } from '../../helpers/validator/base.validator'
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
    .get('/:id', zValidator('param', idSchema), async (c) => {
		const params = c.req.valid('param')
		const userRepo = new UserRepository()
		const user = await userRepo.findById({ id: Number(params.id) })

		try {
			if (!user || user.length === 0) {
				return appResponse(c, 'user not found', 404, null)
			}
			return appResponse(c, 'Success Get Data', 200, user[0])
		} catch (error) {
			console.log(error)
			return appResponse(c, 'something went wrong', 500, null)
		}
	})
    .delete('/:id', zValidator('param', idSchema), async (c) => {
		const params = c.req.valid('param')
		const userRepo = new UserRepository()
		const authRepo = new AuthenticationRepository()

		try {
			const findUser = await userRepo.findById({ id: params.id })
			if (!findUser) {
				return appResponse(c, 'failed to delete user', 500, null)
			}

			const auth = await authRepo.delete({
				id: findUser[0].id,
			})
			const user = await userRepo.delete({
				id: params.id,
			})

			if (!user || !auth) {
				return appResponse(c, 'failed to delete user', 500, null)
			}

			return appResponse(c, 'user deleted', 200, null)
		} catch (error) {
			console.error(error)
			return appResponse(c, 'something went wrong', 500, null)
		}
	})
