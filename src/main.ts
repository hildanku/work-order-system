import { Hono } from "hono";
import { authenticationController } from "./modules/auth/auth.controller";
import { logger } from 'hono/logger'
import { healthController } from "./modules/health/health.controller";

const route = new Hono()
    .route('/auth', authenticationController)
    .route('/health', healthController)

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
