import { Hono } from 'hono'
import { jwtMiddleware, roleMiddleware } from '../../helpers/middleware/middleware'
import { zValidator } from '@hono/zod-validator'
import { WorkOrderProgressRepository as ProgressRepository, WorkOrderProgressEntity } from './progress.repository'
import { idSchema, orderCodeSchema, queryUrlSchema } from "../../helpers/validator/base.validator";
import { appResponse } from '../../helpers/response'
import { progressSchema } from '../../helpers/validator/progress.validator'

export const progressController = new Hono()
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
            get: ['operator', 'production_manager'],
            update: ['operator'],
            create: ['operator'],
            delete: ['production_manager'],
        })
    )
    /* .get('/u/', zValidator('param', orderCodeSchema), async (c) => {
        const params = c.req.valid('param')
        const progressRepo = new ProgressRepository()

        try {
            const progress = await progressRepo.findByOrderCode({ order_code: params.order_code })
            if (!progress) {
                return appResponse(c, 404, 'progress not found', null)
            }
            return appResponse(c, 200, 'success', progress)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    }) */
    .get('/timeline/:id', zValidator('param', idSchema), async (c) => {
        const params = c.req.valid('param')
        const progressRepo = new ProgressRepository()
        try {
            const progress = await progressRepo.findProgressById({ id: Number(params.id) })

            if (!progress || progress.length === 0) {
                return appResponse(c, 404, 'progress not found', null)
            }

            return appResponse(c, 200, 'success', progress)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })
    .post('/timeline', zValidator('form', progressSchema), async (c) => {
        const form = c.req.valid('form')
        const progressRepo = new ProgressRepository()

        try {
            const [progress] = await progressRepo.create({
                item: { ...form, timestamp: new Date().getTime() },
            })
            return appResponse(c, 201, 'progress created', progress)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })
    .get('/', zValidator('query', queryUrlSchema), async (c) => {
        const { q, page, sort, order, limit } = c.req.valid('query')
        const progressRepo = new ProgressRepository()

        try {
            const progresses = await progressRepo.list({ q, sort, page, limit, order })
            if (!progresses || progresses.items.length === 0) {
                return appResponse(c, 404, 'progress not found', {
                    items: [] as WorkOrderProgressEntity[],
                    meta: { totalItems: 0 },
                })
            }
            return appResponse(c, 200, 'success', progresses)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })
    .get('/:id', zValidator('param', idSchema), async (c) => {
        const params = c.req.valid('param')
        const progressRepo = new ProgressRepository()

        try {
            const progress = await progressRepo.findById({ id: Number(params.id) })
            if (!progress || progress.length === 0) {
                return appResponse(c, 404, 'progress not found', null)
            }
            return appResponse(c, 200, 'success', progress[0])
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })
    .post('/', zValidator('form', progressSchema), async (c) => {
        const form = c.req.valid('form')
        const progressRepo = new ProgressRepository()

        try {
            const [progress] = await progressRepo.create({
                item: { ...form, timestamp: new Date().getTime() },
            })
            return appResponse(c, 201, 'progress created', progress)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })
    .patch('/:id', zValidator('param', idSchema), zValidator('form', progressSchema), async (c) => {
        const params = c.req.valid('param')
        const form = c.req.valid('form')
        const progressRepo = new ProgressRepository()

        try {
            const update = await progressRepo.update({
                id: Number(params.id),
                item: { ...form },
            })
            return appResponse(c, 200, 'progress updated', update)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })
    .delete('/:id', zValidator('param', idSchema), async (c) => {
        const params = c.req.valid('param')
        const progressRepo = new ProgressRepository()

        try {
            const deleted = await progressRepo.delete({ id: Number(params.id) })
            if (!deleted) {
                return appResponse(c, 500, 'failed to delete progress', null)
            }
            return appResponse(c, 200, 'progress deleted', null)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })

