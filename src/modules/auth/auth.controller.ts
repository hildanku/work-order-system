import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { loginSchema, refreshJWTSchema, registerSchema } from "../../helpers/validator/auth.validator";
import { UserRepository } from "../user/user.repository";
import { AuthenticationRepository } from "./auth.repository";
import { appResponse } from "../../helpers/response";
import { hash, verify } from "@node-rs/argon2";
import { env } from 'hono/adapter'
import { ENV } from "../../helpers/types"
import { JWTService } from "../../helpers/middleware/jwt"
import { jwtMiddleware } from "../../helpers/middleware/middleware";

export const authenticationController = new Hono()
    .use('/current_user', jwtMiddleware)
    .use('/logout', jwtMiddleware)

    .delete('/logout', async (c) => {
        const accessToken = c.req.header('Authorization')
        const authRepo = new AuthenticationRepository()
        try {
            if (!accessToken) {
                return appResponse(c, 401, 'unauthorized', null)
            }

            const claims = JWTService.decode(accessToken)
            const sub = claims.sub

            if (!sub) {
                return appResponse(c, 401, 'unauthorized', null)
            }

            const auth = await authRepo.findByUser({ userId: Number(sub) })
            if (!auth) {
                return appResponse(c, 404, 'not found', null)
            }

            await authRepo.update({ id: auth[0].id, item: { ...auth[0], refresh_token: null } })

            return appResponse(c, 200, 'logout success', null)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })
    .post('/register', zValidator('form', registerSchema), async (c) => {

        const form = c.req.valid('form')

        const userRepo = new UserRepository()
        const authRepo = new AuthenticationRepository()

        try {
            const checkUser = await userRepo.findByUsername({ username: form.username })
            if (checkUser.length > 0) {
                return appResponse(c, 400, 'register failed, username already taken', null)
            }

            const userCount = await userRepo.getUserCount()
            if (!userCount || userCount.length === 0) {
                throw new Error('error when getting user count')
            }

            const role = userCount[0].count === 0 ? 'production_manager' : 'operator'

            const [user] = await userRepo.create({
                item: {
                    role: role,
                    username: form.username,
                    email: form.email,
                    name: form.name,
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

            return appResponse(c, 201, 'register success', user)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })
    .post('/login', zValidator('form', loginSchema), async (c) => {
        const valid = c.req.valid('form')

        const userRepo = new UserRepository()
        const authRepo = new AuthenticationRepository()
        const date = new Date().getTime()

        try {
            const user = await userRepo.findByUsername({ username: valid.username })
            if (!user || user.length === 0) {
                return appResponse(c, 400, 'username/password is wrong', null)
            }

            const auth = await authRepo.findByUser({ userId: user[0].id })

            const validPassword = await verify(auth[0].hash_password, valid.password)
            if (!validPassword) {
                return appResponse(c, 400, 'username/password is wrong', null)
            }

            console.log(user[0], "auth controllert 79")
            const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = env<ENV>(c)
            const jwt = new JWTService(JWT_ACCESS_SECRET, JWT_REFRESH_SECRET)
            const accessToken = await jwt.createAccess(user[0].id)
            const refreshToken = await jwt.createRefresh(user[0].id)

            await authRepo.update({ id: auth.id, item: { refresh_token: refreshToken, updated_at: date } })

            return appResponse(c, 200, 'login success', { access_token: accessToken, refresh_token: refreshToken })
            //await authRepo.update({ id: auth[0]!.id, item: { refresh_token: refreshToken, updated_at: date } })
            //return appResponse(c, 200, 'login success', { access_token: accessToken, refresh_token: refreshToken })
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'login failed, something went wrong', null)
        }
    })
    .post('/refresh', zValidator('form', refreshJWTSchema), async (c) => {
        const valid = c.req.valid('form')
        const authRepo = new AuthenticationRepository()
        const d = new Date().getTime()

        try {
            const { sub: userId } = JWT.decode(valid.refresh_token)
            if (!userId) return appResponse(c, 401, 'refresh jwt failed', null)
            const [auth] = await authRepo.findByUser({ userId: Number(userId) })

            if (
                (typeof auth.refresh_token === 'string' && auth.refresh_token === valid.refresh_token) ||
                auth.refresh_token === null
            ) {
                const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = env<ENV>(c)
                const jwt = new JWTService(JWT_ACCESS_SECRET, JWT_REFRESH_SECRET)
                const accessToken = await jwt.createAccess(Number(userId))
                const refreshToken = await jwt.createRefresh(Number(userId))

                await authRepo.update({ id: auth.id, item: { ...auth, refresh_token: refreshToken, updated_at: d } })

                return appResponse(c, 200, 'refresh jwt success', {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                })
            } else {
                return appResponse(c, 400, 'invalid refresh token', null)
            }
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'refresh jwt failed', null)
        }
    })
    .get('/current_user', async (c) => {
        const accessToken = c.req.header('Authorization')
        const userRepo = new UserRepository()
        try {
            if (!accessToken) {
                return appResponse(c, 401, 'unauthorized', null)
            }

            const user = await userRepo.findByToken({ token: accessToken })
            if (!user || user.length === 0) {
                return appResponse(c, 404, 'not found', null)
            }
            return appResponse(c, 200, 'success', user[0])
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })
