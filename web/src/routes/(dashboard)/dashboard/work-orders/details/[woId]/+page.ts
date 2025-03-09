import { superValidate } from 'sveltekit-superforms'
import type { PageLoad } from './$types'
import { zod } from 'sveltekit-superforms/adapters'
import { progressSchema } from '@root/helpers/validator/progress.validator'
export const load: PageLoad = async () => {
    return {
        form: await superValidate(zod(progressSchema))
    }
}
