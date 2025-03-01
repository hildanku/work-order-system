import { AnyColumn, asc, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "../../config/db";
import { User, userTable } from "../../config/db/schema";
import { BaseRepository, CreateArgs, DeleteArgs, FindByIdArgs, ListArgs, UpdateArgs } from "../../helpers/repository";
import { LIMIT } from "../../helpers/const";

export interface UserEntity extends User { }

export type FindByUsername = {
    username: string
}

export class UserRepository implements BaseRepository<UserEntity> {

    user: UserEntity[] = []

    public async getUserCount() {
        return await db.select({ count: count() }).from(userTable)
    }

    async findById(args: FindByIdArgs): Promise<UserEntity[] | null> {
        const users = await db.select().from(userTable).where(eq(userTable.id, args.id))
        this.user = users

        return users
    }

    async findByUsername(args: FindByUsername) {
        const user = await db.select().from(userTable).where(eq(userTable.username, args.username))
        this.user = user
        return user
    }

    async create(args: CreateArgs<UserEntity>): Promise<UserEntity[]> {
        const insertUser = await db
            .insert(userTable)
            .values({ ...args.item })
            .$returningId()

        const users = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, insertUser[0].id))

        this.user = users

        return users
    }

    async update(args: UpdateArgs<UserEntity>): Promise<UserEntity[] | null> {
        await db
            .update(userTable)
            .set({ ...args.item, avatar: args.item.avatar ?? undefined, updated_at: new Date().getTime() })
            .where(eq(userTable.id, args.id))

        const updatedUser = await this.findById({ id: args.id })
        if (updatedUser) {
            this.user = updatedUser
        }

        return updatedUser
    }

    async list(args: Partial<ListArgs>): Promise<{ items: UserEntity[]; meta: { totalItems: number } }> {

        const users = await db
            .select()
            .from(userTable)
            .where(
                or(
                    //
                    args.q ? like(userTable.name, `%${args.q}%`) : undefined,
                    args.q ? eq(userTable.username, args.q) : undefined,
                ),
            )
            .limit(args.limit || LIMIT)
            .offset(((args.page || 1) - 1) * (args.limit || LIMIT) || 0)
            .orderBy(
                args.order === 'ASC' ?
                    asc(userTable[args.sort as keyof typeof userTable] as AnyColumn)
                    : desc(userTable[args.sort as keyof typeof userTable] as AnyColumn),
            )
        this.user = users

        const [userCount] = await db.select({ totalItems: count() }).from(userTable)

        return { items: users, meta: { totalItems: userCount.totalItems } }


    }

    async delete(args: DeleteArgs): Promise<boolean> {
        try {
            await db.delete(userTable).where(eq(userTable.id, args.id))
            this.user = []
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }
}
