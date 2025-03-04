import { z } from 'zod'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const productSchema = z.object({
    name: z
        .string({ message: 'Name cant be blank' })
        .min(1, { message: 'Name cant be blank' }),
    description: z.string().optional(),
    image: z
        .custom<File>((file) => file instanceof File, { message: 'Invalid file' })
        .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.type), { message: 'Only JPG, PNG, and WEBP are allowed' })
        .refine((file) => file.size <= MAX_FILE_SIZE, { message: 'File size must be less than 2MB' }),
})

