import { eq } from "drizzle-orm";
import { Authentication, authenticationTable } from "../../config/db/schema";
import { FindByUser } from "../../helpers/types";
import { db } from "../../config/db";
import { CreateArgs, DeleteArgs, FindByIdArgs, BaseRepository, UpdateArgs } from "../../helpers/repository";

export interface AuthEntity extends Authentication { }

export class AuthenticationRepository implements Omit<BaseRepository<AuthEntity | null>, 'list' | 'findByUser'> {

    auth: AuthEntity[] = []

    async findByUser(args: FindByUser): Promise<AuthEntity | null> {
        const auth = await db
            .select()
            .from(authenticationTable)
            .where(
                eq(authenticationTable.user, args.userId)
            )
            .limit(1)

        console.log(auth[0])

        this.auth = auth

        return auth
    }

    async findById(args: FindByIdArgs): Promise<AuthEntity[] | null> {
        const auth = await db
            .select()
            .from(authenticationTable)
            .where(
                eq(authenticationTable.id, args.id)
            )
            .limit(1)

        this.auth = auth

        return auth
    }

    //    async list(args?: ListArgs): Promise<{ items: AuthEntity[]; meta: { totalItems: number } }> {    }

    async create(args: CreateArgs<AuthEntity>): Promise<AuthEntity[]> {
        const authId = await db
            .insert(authenticationTable)
            .values({ ...args.item })
            .$returningId()
        const auth = await db
            .select()
            .from(authenticationTable)
            .where(eq(authenticationTable.id, authId[0].id))
            .limit(1)
        this.auth = auth

        return auth
    }

    async update(args: UpdateArgs<AuthEntity>): Promise<AuthEntity[] | null> {
        const updated = await db
            .update(authenticationTable)
            .set({ ...args.item, updated_at: new Date().getTime() })
            .where(eq(authenticationTable.id, args.id))

        const auth = await db
            .select()
            .from(authenticationTable)
            .where(eq(authenticationTable.id, updated[0].insertId))
            .limit(1)
        this.auth = auth

        return auth
    }

    async delete(args: DeleteArgs): Promise<boolean> {
        try {
            await db.delete(authenticationTable).where(eq(authenticationTable.id, args.id))
            this.auth = []
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }
}
