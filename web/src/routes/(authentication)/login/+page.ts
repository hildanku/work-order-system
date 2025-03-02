import { superValidate } from 'sveltekit-superforms/server';
import { loginSchema } from '@root/helpers/validator/auth.validator'
import type { PageLoad } from './$types'
import { zod } from 'sveltekit-superforms/adapters'

export const load: PageLoad = async () => {
    const form = await superValidate(zod(loginSchema))
    return { form }
}
