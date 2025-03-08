import { z } from 'zod

export const progressSchema = z.object({
    work_order: z.coerce.string(),
    status: z.enum(['pending', 'in_progress', 'completed', 'canceled']),
    description: z.string().min(1, 'Description is required'),
    timestamp: z.number().int().positive().optional(),
    time_spent: z.number().int().positive().optional(),
})
