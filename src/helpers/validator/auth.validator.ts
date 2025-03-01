import { z } from "zod";

export const registerSchema = z
    .object({
        name: z.string({ message: 'Name cant be blank' }).min(1, { message: 'Name cant be blank' }),
        username: z
            .string({ message: 'Username cant be blank' })
            .min(8, { message: 'Username is too short, minimum 8 characters' })
            .max(100, { message: 'Username is too long, maximum 100 characters' })
            .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' }),
        email: z
            .string({ message: 'Email cant be blank' }),
        password: z
            .string({ message: 'Password cant be blank' })
            .min(8, { message: 'Password is too short, minimum 8 characters' })
            .max(255, { message: 'Password is too long, maximum 255 characters' }),
        confirm_password: z
            .string({ message: 'Confirm password cant be blank' })
            .min(8, { message: 'Confirm password is too short, minimum 8 characters' })
            .max(255, { message: 'Confirm password is too long, maximum 255 characters' }),
    })
    .refine(
        (d) => {
            if (d.confirm_password !== d.password) {
                return false
            }

            return true
        },
        { message: 'Password do not match', path: ['confirm_password'] },
    )

export const loginSchema = z.object({
    username: z
        .string({ message: 'Username cant be blank' })
        .min(8, { message: 'Username is too short, minimum 8 characters' })
        .max(100, { message: 'Username is too long, maximum 100 characters' })
        .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' }),
    password: z
        .string({ message: 'Password cant be blank' })
        .min(8, { message: 'Password is too short, minimum 8 characters' })
        .max(255, { message: 'Password is too long, maximum 255 characters' }),
})
