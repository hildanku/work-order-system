import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { loginSchema, registerSchema } from "../../helpers/validator/auth.validator";
import { UserRepository } from "../user/user.repository";
import { AuthenticationRepository } from "./auth.repository";
import { appResponse } from "../../helpers/response";
import { hash, verify } from "@node-rs/argon2";
import { env } from 'hono/adapter'
import { ENV } from "../../helpers/types"
import { JWTService } from "../../helpers/middleware/jwt"

export const authenticationController = new Hono()
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
