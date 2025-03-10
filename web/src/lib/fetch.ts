import { goto } from '$app/navigation'
import { client } from './client'
import { ACCESS_TOKEN, REFRESH_TOKEN } from './const'
import { AuthError } from './types'
import * as Jose from 'jose'

type GetNewJWTArgs = {
    onFailed: () => void
}

export class JWT {
    private readonly _access: string = ACCESS_TOKEN
    private readonly _refresh: string = REFRESH_TOKEN

    public get access(): string {
        const access = localStorage.getItem(this._access)
        if (!access) throw new AuthError('jwt token missing')

        return access
    }

    public get refresh(): string {
        const refresh = localStorage.getItem(this._refresh)
        if (!refresh) throw new AuthError('jwt token missing')

        return refresh
    }

    public set access(v: string) {
        localStorage.setItem(this._access, v)
    }

    public set refresh(v: string) {
        localStorage.setItem(this._refresh, v)
    }

    public deleteAccessToken() {
        localStorage.removeItem(this._access)
    }

    public deleteRefreshToken() {
        localStorage.removeItem(this._refresh)
    }

    public deleteToken() {
        this.deleteAccessToken()
        this.deleteRefreshToken()
    }

    public validateAccess(): boolean {
        const access = this.access
        if (!access) return false

        const decodedAccess = Jose.decodeJwt(access)
        if (!decodedAccess.exp) return false

        return decodedAccess.exp > new Date().getTime() / 1000
    }

    public validateRefresh(): boolean {
        const refresh = this.refresh
        if (!refresh) return false

        const decodedRefresh = Jose.decodeJwt(refresh)
        if (!decodedRefresh.exp) return false

        return decodedRefresh.exp > new Date().getTime() / 1000
    }

    public async getNewJWT(args?: Partial<GetNewJWTArgs>) {
        const response = await client.auth.refresh.$post({ form: { refresh_token: this.refresh } })
        const { results } = await response.json()

        if (!results || response.status !== 200) {
            this.deleteToken()
            if (args && args.onFailed) {
                args.onFailed()
                goto('/login')
            }

            throw new AuthError('invalid token')
        }

        //jika token baru berhasil di fetch, set token lagi
        this.access = results.access_token
        this.refresh = results.refresh_token
    }
}

export async function appFetch(input: URL | RequestInfo, init?: RequestInit | undefined, fetcher?: typeof fetch) {
    const jwt = new JWT()

    if (!jwt.validateAccess()) {
        console.log('token tidak valid, mencoba refresh jwt')
        if (!jwt.validateRefresh()) {
            jwt.deleteToken()
            goto('/login')

            throw new AuthError('invalid token')
        }

        await jwt.getNewJWT()
        if (!init) {
            init = {}
        }
        if (!init.headers) {
            init.headers = new Headers()
        }

        const newHeader = new Headers(init.headers)
        newHeader.set('Authorization', jwt.access)
        init.headers = newHeader
        console.log('refresh jwt berhasil')

        return fetcher ? await fetcher(input, init) : await fetch(input, init)
    }
    console.log('token valid')
    const originalReq = fetcher ? await fetcher(input, init) : await fetch(input, init)

    return originalReq
}
