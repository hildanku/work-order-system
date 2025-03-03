import { Hono } from 'hono'
import { jwtMiddleware, roleMiddleware } from '../../helpers/middleware/middleware'
import { zValidator } from '@hono/zod-validator'
import { UserEntity, UserRepository } from './user.repository'
import { queryUrlSchema, idSchema } from '../../helpers/validator/base.validator'
import { appResponse } from '../../helpers/response'
import { AuthenticationRepository } from '../auth/auth.repository'
import { userSchema } from '../../helpers/validator/user.validator'
import { hash } from '@node-rs/argon2'
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { AVATAR_UPLOAD_PATH } from '../../helpers/const'
import path = require('node:path')

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
        const { q, page, sort, order, limit } = c.req.valid('query')

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
                return appResponse(c, 404, 'user not found', null)
            }
            return appResponse(c, 200, 'Success Get Data', user[0])
        } catch (error) {
            console.log(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })
.patch(
		'/:id',
		zValidator('param', idSchema),
		zValidator(
			'form',
			userSchema.extend({
				avatar: userSchema.shape.avatar.refine(
					(r) => {
						if (r instanceof File) {
							const size = r.size
							if (size > 2 * 1024 * 1024) {
								return false
							}
						}
						return true
					},
					{ path: ['avatar'], message: 'Avatar must be less than 2MB' },
				),
			}),
		),
		async (c) => {
			const params = c.req.valid('param')
			const form = c.req.valid('form')
			const userRepo = new UserRepository()

			try {
				const body = await c.req.parseBody()

				const currentUser = await userRepo.findByToken({ token: c.req.header('Authorization') || '' })
				if (
					!currentUser ||
					!(
						currentUser[0].role === 'production_manager' ||
						currentUser[0].role === 'operator'
					)
				) {
					throw new Error('unauthorized')
				}

				const avatar = body['avatar']
				let avatarFilename: string | undefined = undefined

				if (avatar && avatar instanceof File) {
					avatarFilename = `${new Date().getTime()}-${Math.floor(Math.random() * 1000)}-${avatar.name.toLowerCase()}`

					if (!existsSync(AVATAR_UPLOAD_PATH)) {
						mkdirSync(AVATAR_UPLOAD_PATH, { recursive: true })
					}

					const avatarFilePath = path.join(AVATAR_UPLOAD_PATH, avatarFilename)
					const buffer = Buffer.from(new Uint8Array(await avatar.arrayBuffer()))

					writeFileSync(avatarFilePath, buffer)
				}

				const userBeforeUpdate = await userRepo.findById({
					id: currentUser[0].role === 'production_manager' ? params.id : currentUser[0].id,
				})

				const user = await userRepo
					.update({
						id: currentUser[0].role === 'production_manager' ? params.id : currentUser[0].id,
						item: {
							...form,
							updated_at: new Date().getTime(),
							role: currentUser[0].role === 'operator' ? 'operator' : form.role,
							avatar: avatarFilename,
						},
					})
					.then((r) => {
						if (
							userBeforeUpdate &&
							avatarFilename &&
							!(userBeforeUpdate[0].avatar === '' || userBeforeUpdate[0].avatar === null)
						) {
							const avatarFilePath = path.join(AVATAR_UPLOAD_PATH, userBeforeUpdate[0].avatar)
							if (existsSync(avatarFilePath)) {
								unlinkSync(avatarFilePath)
							}
						}
						return r
					})

				if (!user || user.length === 0) {
					if (avatarFilename) {
						const avatarFilePath = path.join(AVATAR_UPLOAD_PATH, avatarFilename)
						if (existsSync(avatarFilePath)) {
							unlinkSync(avatarFilePath)
						}
					}
					throw new Error('error updating user')
				}

				return appResponse(c,  200, 'user updated',user[0])
			} catch (error) {
				console.error(error)
				return appResponse(c,500,'something went wrong', null)
			}
		},
	)
    .delete('/:id', zValidator('param', idSchema), async (c) => {
        const params = c.req.valid('param')
        const userRepo = new UserRepository()
        const authRepo = new AuthenticationRepository()

        try {
            const findUser = await userRepo.findById({ id: params.id })
            if (!findUser) {
                return appResponse(c, 500, 'failed to delete user', null)
            }

            const auth = await authRepo.delete({
                id: findUser[0].id,
            })
            const user = await userRepo.delete({
                id: params.id,
            })

            if (!user || !auth) {
                return appResponse(c, 500, 'failed to delete user', null)
            }

            return appResponse(c, 200, 'user deleted', null)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })

    .post('/', zValidator('form', userSchema), async (c) => {
        const form = c.req.valid('form')
        const userRepo = new UserRepository()
        const authRepo = new AuthenticationRepository()

        try {
            const check = await userRepo.findByUsername({ username: form.username })
            if (check.length > 0) {
                return appResponse(c, 400, 'username already taken', null)
            }

            const [user] = await userRepo.create({
                item: {
                    username: form.username,
                    email: form.email,
                    name: form.name,
                    role: form.role,
                    avatar: null,
                },
            })
            const hashPassword = await hash(form.password)

            await authRepo.create({
                item: {
                    user: user.id,
                    refresh_token: null,
                    hash_password: hashPassword,
                },
            })

            return appResponse(c, 201, 'user created', user)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something when wrong', null)
        }
    })
