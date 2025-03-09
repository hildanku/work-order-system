import { z } from "zod";
import { fileValidation } from "./product.validator";

export const userSchema = z.object({
    username: z.string(),
    name: z.string(),
    role: z.enum(['production_manager', 'operator']),
    avatar: z.union([z.string(), fileValidation]).optional().nullable(),
    email: z.string(),
    password: z.string(),
})
