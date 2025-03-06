import { z } from 'zod'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const fileValidation = z
    .instanceof(File)
    .refine(
        (file) => {
            return ALLOWED_IMAGE_TYPES.includes(file.type)
        },
        {
            message: 'Invalid file type. Only JPEG, and PNG are allowed.',
        },
    )
    // .refine(
    //     (file) => {
    //         return file.size <= MAX_FILE_SIZE
    //     },
    //     { message: 'Maximum avatar size is 2MB' },
    // )

export const productSchema = z.object({
    name: z
        .string({ message: 'Name cant be blank' })
        .min(1, { message: 'Name cant be blank' }),
    description: z.string().optional(),
    image: z.union([z.string(), fileValidation]).optional().nullable(),
})
//   image: z.union([
//    z.array(fileValidation).optional(),
//  fileValidation.optional(),
//  z.string().optional()
//])

