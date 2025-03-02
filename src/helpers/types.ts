export type FindByUser = {
    userId: number
}
export type ENV = {
    JWT_ACCESS_SECRET: string
    JWT_REFRESH_SECRET: string
}
export type Role = 'production_manager' | 'operator'

export type roleMiddlewareArgs = {
    create: Role[]
    get: Role[]
    update: Role[]
    delete: Role[]
}
