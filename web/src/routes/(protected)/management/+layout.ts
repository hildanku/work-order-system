import { get } from 'svelte/store'
import type { LayoutLoad } from './$types'
import { goto } from '$app/navigation'

export const load: LayoutLoad = async (e) => {
    const parent = await e.parent()
    if (!parent.localUser) {
        goto('/')
        return
    }

    const getLocalUser = () => get(parent.localUser)
    console.log(getLocalUser)
    /* if (getLocalUser()?.role === 'guest' || getLocalUser()?.role === 'customer') {
        goto('/')
        return
    } */
}
