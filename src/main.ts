import { Hono } from "hono";
import { authenticationController } from "./modules/auth/auth.controller";
import { logger } from 'hono/logger'
import { appResponse } from "./helpers/response";
import { serve } from "bun";
const route = new Hono()
    .route('/auth', authenticationController)

const app = new Hono()
    .use('*', logger())
    .route('/api', route)
    .get('/healthcheck', async (c) => {
        return appResponse(c, 200, 'ok', null)
    })

const port = 1337

export default {
    port: port,
    fetch: app.fetch,
}

export { app }
export type AppType = typeof app
