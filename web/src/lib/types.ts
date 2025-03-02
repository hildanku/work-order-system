
import type { ComponentProps, Snippet } from 'svelte'
import type { Button } from './components/ui/button'
import type { CreateMutationOptions, DefaultError, StoreOrVal } from '@tanstack/svelte-query'

export class AuthError extends Error {
    constructor(msg: string) {
        super(msg)
    }
}

export class FetchError extends Error {
    constructor(msg: string) {
        super(msg)
    }
}

export type TableBulkBar<TData = unknown, TError = DefaultError, TVariables = void, TContext = unknown> = {
    mutation: StoreOrVal<CreateMutationOptions<TData, TError, TVariables, TContext>>
}

export type TableActions<TData> = {
    content: Snippet<[TData]>
}

export type TableSortProps = ComponentProps<typeof Button> & {
    value: string
    key: string
    parentKey: string
}

export class ResponseError<Result extends unknown> extends Error {
    status: number
    results: Result

    constructor(status: number, results: Result, message: string) {
        super(message)
        this.results = results
        this.status = status
    }
}
