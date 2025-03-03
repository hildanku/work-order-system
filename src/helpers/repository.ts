export type OrderQuery = 'ASC' | 'DESC'

export type ListArgs = {
    sort: string
    order: OrderQuery
    q: string
    limit: number
    page: number
    [key: string]: any
}

export type CreateArgs<T> = {
    item: Omit<T, 'id' | 'created_at' | 'updated_at'>
}

export type FindByIdArgs = {
    id: number
}

export type UpdateArgs<T> = {
    id: number
    item: Partial<Omit<T, 'id'>>
}

export type DeleteArgs = {
    id: number
}

export interface BaseRepository<T> {
    create(args: CreateArgs<T>): Promise<T[]>
    findById(args: FindByIdArgs): Promise<T[] | null>
    list(args: ListArgs): Promise<{ items: T[]; meta: { totalItems: number } }>
    update(args: UpdateArgs<T>): Promise<T[] | null>
    delete(args: DeleteArgs): Promise<boolean>
}
