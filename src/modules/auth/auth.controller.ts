import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { loginSchema, registerSchema } from "../../helpers/validator/auth.validator";
import { UserRepository } from "../user/user.repository";
import { AuthenticationRepository } from "./auth.repository";
import { appResponse } from "../../helpers/response";
import { hash, verify } from "@node-rs/argon2";

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
        // const d = new Date().getTime()

        try {
            const user = await userRepo.findByUsername({ username: valid.username })
            if (!user || user.length === 0) {
                return appResponse(c, 400, 'username/password is wrong', null)
            }

            const [auth] = await authRepo.findByUser({ user_id: user[0].id })
            const validPassword = await verify(auth.hash_password, valid.password)
            if (!validPassword) {
                return appResponse(c, 400, 'username/password is wrong', null)
            }

            return appResponse(c, 200, 'login success', auth)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'login failed, something went wrong', null)
        }
    })
