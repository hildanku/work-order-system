import { hc } from 'hono/client'
import { getContext, setContext } from 'svelte'
import { writable } from 'svelte/store'

import type { authenticationController } from '@root/modules/auth/auth.controller'
import type { userController } from '@root/modules/user/user.controller'
import type { productController } from '@root/modules/product/product.controller'
import type { workOrderController } from '@root/modules/work-order/work-order.controller'

export const client = {
    auth: hc<typeof authenticationController>('/api/auth'),
    user: hc<typeof userController>('/api/user'),
    product: hc<typeof productController>('/api/product'),
    workOrder: hc<typeof workOrderController>('/api/work-order'),
    //user: hc<typeof userCont
}

export const setClient = () => setContext('hc', writable(client))
export const getClient = () => getContext<ReturnType<typeof setClient>>('hc')
