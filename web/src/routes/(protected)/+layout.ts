// WIP load access token
import type { LayoutLoad } from './$types'
import { goto } from '$app/navigation'
import { ACCESS_TOKEN } from '@/const'

export const load: LayoutLoad = async () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN)
    if (!accessToken) {
        goto('/login')
        return
    }
}
