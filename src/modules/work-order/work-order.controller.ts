import { Hono } from "hono";
import { jwtMiddleware, roleMiddleware } from "../../helpers/middleware/middleware";
import { zValidator } from "@hono/zod-validator";
import { WorkOrderEntity, WorkOrderRepository } from "./work-order.repository";
import { idSchema, queryUrlSchema } from "../../helpers/validator/base.validator";
import { appResponse } from "../../helpers/response";
import { workOrderSchema } from "../../helpers/validator/work-order.validator";
import { UserRepository } from "../user/user.repository";
import { ProductRepository } from "../product/product.repository";

export const workOrderController = new Hono()
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
        })
    )
    .get('/', zValidator('query', queryUrlSchema), async (c) => {
        const { q, page, sort, order, limit } = c.req.valid('query')
        const WORepo = new WorkOrderRepository()

        try {
            const workOrders = await WORepo.list({ q, sort, page, limit, order })
            if (!workOrders || workOrders.items.length === 0) {
                return appResponse(c, 404, 'wo not found', {
                    items: [] as WorkOrderEntity[],
                    meta: {
                        totalItems: 0
                    }
                })
            }
            return appResponse(c, 200, 'success', workOrders)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })
    .get('/:id', zValidator('param', idSchema), async (c) => {
        const params = c.req.valid('param')
        const WORepo = new WorkOrderRepository()
        try {
            const workOrder = await WORepo.findById({ id: Number(params.id) })
            if (!workOrder || workOrder.length === 0) {
                return appResponse(c, 404, 'wo not found', null)
            }
            return appResponse(c, 200, 'success', workOrder[0])
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })
    .post('/', zValidator('form', workOrderSchema), async (c) => {
        const form = c.req.valid('form')
        const WORepo = new WorkOrderRepository()
        const userRepo = new UserRepository()
        const productRepo = new ProductRepository()
        try {
            const user = await userRepo.findById({ id: form.user })
            if (!user || user.length === 0) {
                return appResponse(c, 404, 'user is not found', null)
            }
            if (user[0].role !== 'operator') {
                return appResponse(c, 400, 'user must be operator', null)
            }
            const product = await productRepo.findById({ id: form.product })
            if (!product || product.length === 0) {
                return appResponse(c, 404, 'product is not found', null)
            }
            const [workOrder] = await WORepo.create({
                item: {
                    user: form.user,
                    product: form.product,
                    order_code: form.order_code,
                    quantity: form.quantity,
                    status: form.status,
                    deadline: form.deadline,
                }
            })
            return appResponse(c, 201, 'work order created', workOrder)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })
    .patch('/:id', zValidator('param', idSchema), zValidator('form', workOrderSchema), async (c) => {
        const params = c.req.valid('param')
        const form = c.req.valid('form')
        const WORepo = new WorkOrderRepository()
        try {
            const update = WORepo.update({
                id: Number(params.id),
                item: {
                    ...form
                }
            })
            return appResponse(c, 200, 'work order updated', update)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })
    .delete('/:id', zValidator('param', idSchema), async (c) => {
        const params = c.req.valid('param')
        const WORepo = new WorkOrderRepository()
        try {
            const deleted = await WORepo.delete({ id: Number(params.id) })
            if (!deleted) {
                return appResponse(c, 500, 'failed to delete work order', null)
            }
            return appResponse(c, 200, 'work order deleted', null)
        } catch (error) {
            console.error(error)
            return appResponse(c, 500, 'something went wrong', null)
        }
    })
