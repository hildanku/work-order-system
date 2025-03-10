import { Hono } from "hono";
import { authenticationController } from "./modules/auth/auth.controller";
import { logger } from 'hono/logger'
import { healthController } from "./modules/health/health.controller";
import { userController } from './modules/user/user.controller'
import { productController } from "./modules/product/product.controller";
import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server'
import { workOrderController } from "./modules/work-order/work-order.controller";
import { progressController } from './modules/progress/progress.controller';

const route = new Hono()
    .route('/auth', authenticationController)
    .route('/health', healthController)
    .route('/user', userController)
    .route('/product', productController)
    .route('/work-order', workOrderController)
    .route('/progress', progressController)

const app = new Hono()
    .use('*', logger())
    .use('*', serveStatic({ root: './src/static/' }))
    .use(
        '/public/*',
        serveStatic({
            root: './src/public',
            rewriteRequestPath: (path) =>
                path.replace('/public', ''),
        })
    )
    .route('/api', route)

const port = 1337

export default {
    port: port,
    fetch: app.fetch,
}

export { app }
export type AppType = typeof app
