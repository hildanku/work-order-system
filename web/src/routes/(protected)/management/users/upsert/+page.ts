import { superValidate } from 'sveltekit-superforms'
import type { PageLoad } from './$types'
import { zod } from 'sveltekit-superforms/adapters'
import { userSchema } from '@root/helpers/validator/user.validator'
// import { createUserSchema } from '@root/lib/zod/user'

export const load: PageLoad = async () => {
	return {
		form: await superValidate(zod(userSchema))
	}
}
