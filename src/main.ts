import { Hono } from "hono";
import { authenticationController } from "./modules/auth/auth.controller";
import { logger } from 'hono/logger'
import { healthController } from "./modules/health/health.controller";
import { userController } from './modules/user/user.controller'

const route = new Hono()
    .route('/auth', authenticationController)
    .route('/health', healthController)
    .route('/user', userController)

const app = new Hono()
    .use('*', logger())
    .route('/api', route)

const port = 1337

export default {
    port: port,
    fetch: app.fetch,
}

export { app }
export type AppType = typeof app
