import { client } from '@/client'
import type { LayoutLoad } from './$types'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/const'
import { goto } from '$app/navigation'
import { writable, type Writable } from 'svelte/store'
import { appFetch } from '@/fetch'
import type { UserEntity } from '@root/modules/user/user.repository'

export const prerender = true
export const ssr = false
export const csr = true

export const load: LayoutLoad = async (event) => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN)
    let localUser = writable<UserEntity | undefined>(undefined)

    if (accessToken) {
        try {
         const response = await client.auth.current_user.$get(undefined, {
                fetch: (input: URL | RequestInfo, init?: RequestInit | undefined) => appFetch(input, init, event.fetch),
                init: { headers: { Authorization: accessToken } }
            })

            if (response.status !== 200) {
                throw new Error('Failed to fetch user')
            }

            const resData = await response.json()
            if (!resData || !resData.results) {
                throw new Error('User not found')
            }

            localUser.set(resData.results)
        } catch (error) {
            console.error(error)
            localStorage.removeItem(ACCESS_TOKEN)
            localStorage.removeItem(REFRESH_TOKEN)
            goto('/login')

            return {
                fetch: event.fetch,
                localUser: localUser as Writable<undefined>
            }
        }
    }

    return {
        fetch: event.fetch,
        localUser: localUser
    }
}
