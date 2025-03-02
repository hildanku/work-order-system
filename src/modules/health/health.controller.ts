import { Hono } from "hono"
import { appResponse } from "../../helpers/response"
import { UserRepository } from "../user/user.repository"
import {jwtMiddleware, roleMiddleware} from "../../helpers/middleware/middleware";

export const healthController = new Hono()
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
    .get('/health', async (c) => {
        const userRepo = new UserRepository()
        try {
            const name = await userRepo.findByToken({ token: c.req.header('Authorization') || '' })
            if (!name || name?.length === 0) {
                console.log('notfound')
            }
            console.log(name)
            return appResponse(c, 200, 'api is ok', name![0]!.name)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })

