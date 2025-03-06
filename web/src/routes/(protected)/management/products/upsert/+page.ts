import { superValidate } from 'sveltekit-superforms'
import type { PageLoad } from './$types'
import { zod } from 'sveltekit-superforms/adapters'
import { productSchema } from '@root/helpers/validator/product.validator'

export const load: PageLoad = async () => {
    return {
        form: await superValidate(zod(productSchema))
    }
}
