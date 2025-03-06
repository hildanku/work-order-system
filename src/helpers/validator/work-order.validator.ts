import { z } from "zod";
import { ROLE, WORK_ORDER_STATUS } from "../const";

export const workOrderSchema = z.object({
    product: z.coerce.number(),
    user: z.coerce.number(),
    order_code: z.string(),
    quantity: z.coerce.number(),
    status: z.enum(WORK_ORDER_STATUS),
    deadline: z.coerce.number(),
})
