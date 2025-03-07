import { superValidate } from "sveltekit-superforms";
import type { PageLoad } from "./$types";
import { zod } from "sveltekit-superforms/adapters";
import { workOrderSchema } from "@root/helpers/validator/work-order.validator";

export const load: PageLoad = async () => {
    return {
        form: await superValidate(zod(workOrderSchema))
    }
}
