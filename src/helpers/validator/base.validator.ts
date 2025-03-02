import { z } from "zod"
import { LIMIT, ORDER, SORT } from "../const"
import { OrderQuery } from "../repository"

export const queryUrlSchema = z.object({
    q: z.string().default(''),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(LIMIT),
    sort: z.string().default(SORT),
    order: z
        .string()
        .default(ORDER)
        .transform((d) => d as OrderQuery),
})
export const idSchema = z.object({
	id: z.coerce.number({ message: 'Invalid id' }),
})
