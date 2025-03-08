import { BaseRepository, CreateArgs, DeleteArgs, FindByIdArgs, ListArgs, UpdateArgs } from '../../helpers/repository'
import { workOrderProgressTable, type WorkOrderProgress, workOrderTable } from '../../config/db/schema'
import { db } from '../../config/db'
import { AnyColumn, asc, count, desc, eq, like, or } from 'drizzle-orm'
import { LIMIT } from '../../helpers/const'

export interface WorkOrderProgressEntity extends WorkOrderProgress { }

export class WorkOrderProgressRepository implements Omit<BaseRepository<WorkOrderProgressEntity>, 'list'> {

    workOrderProgress: WorkOrderProgressEntity[] = []

    async findById(args: FindByIdArgs): Promise<WorkOrderProgressEntity[] | null> {
        const progressRecords = await db
            .select()
            .from(workOrderProgressTable)
            .where(eq(workOrderProgressTable.id, args.id))

        this.workOrderProgress = progressRecords
        return progressRecords
    }

    async create(args: CreateArgs<WorkOrderProgressEntity>): Promise<WorkOrderProgressEntity[]> {
        const insertProgress = await db
            .insert(workOrderProgressTable)
            .values({ ...args.item })
            .$returningId()

        const progressRecord = await db
            .select()
            .from(workOrderProgressTable)
            .where(eq(workOrderProgressTable.id, insertProgress[0].id))

        this.workOrderProgress = progressRecord
        return progressRecord
    }

    async update(args: UpdateArgs<WorkOrderProgressEntity>): Promise<WorkOrderProgressEntity[] | null> {
        await db
            .update(workOrderProgressTable)
            .set({ ...args.item, timestamp: new Date().getTime() })
            .where(eq(workOrderProgressTable.id, args.id))

        const updatedProgress = await this.findById({ id: args.id })
        if (updatedProgress) {
            this.workOrderProgress = updatedProgress
        }
        return updatedProgress
    }

    async delete(args: DeleteArgs): Promise<boolean> {
        try {
            await db
                .delete(workOrderProgressTable)
                .where(eq(workOrderProgressTable.id, args.id))

            this.workOrderProgress = []
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }

    async list(args: Partial<ListArgs>): Promise<{ items: WorkOrderProgressEntity[]; meta: { totalItems: number } }> {
        const progressRecords = await db
            .select()
            .from(workOrderProgressTable)
            .where(
                or(
                    args.q ? like(workOrderProgressTable.description, `%${args.q}%`) : undefined
                )
            )
            .limit(args.limit || LIMIT)
            .offset(((args.page || 1) - 1) * (args.limit || LIMIT))
            .orderBy(
                args.order === 'ASC' ?
                    asc(workOrderProgressTable[args.sort as keyof typeof workOrderProgressTable] as AnyColumn)
                    : desc(workOrderProgressTable[args.sort as keyof typeof workOrderProgressTable] as AnyColumn)
            )

        const [progressCount] = await db.select({ totalItems: count() }).from(workOrderProgressTable)

        return {
            items: progressRecords,
            meta: {
                totalItems: progressCount.totalItems
            }
        }
    }
}

