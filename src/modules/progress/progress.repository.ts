import { BaseRepository, CreateArgs, DeleteArgs, FindByIdArgs, ListArgs, UpdateArgs } from '../../helpers/repository'
import { workOrderProgressTable, type WorkOrderProgress, workOrderTable, productTable } from '../../config/db/schema'
import { db } from '../../config/db'
import { AnyColumn, asc, count, desc, eq, like, or } from 'drizzle-orm'
import { LIMIT } from '../../helpers/const'
import { WorkOrderEntity } from '../work-order/work-order.repository'

export interface WorkOrderProgressEntity extends WorkOrderProgress { }

export type FindByOrderCodeArgs = {
    order_code: string
}

export type ExpandedWorkOrderProgressEntity = {
    work_order_progress: WorkOrderProgressEntity
    work_order: WorkOrderEntity | null
}

export class WorkOrderProgressRepository implements Omit<BaseRepository<WorkOrderProgressEntity>, 'list'> {

    workOrderProgress: WorkOrderProgressEntity[] = []

    async findProgressById(args: FindByIdArgs) {
        const progress = await db
            .select()
            .from(workOrderProgressTable)
            .leftJoin(workOrderTable, eq(workOrderProgressTable.work_order, workOrderTable.id))
            .leftJoin(productTable, eq(workOrderTable.product, productTable.id))
            .where(
                eq(
                    workOrderProgressTable.work_order, args.id
                )
            )
        return progress
    }

    async findByOrderCode(args: FindByIdArgs): Promise<WorkOrderProgressEntity[] | null> {
        const progress = await db
            .select()
            .from(workOrderProgressTable)
            .where(eq(workOrderProgressTable.work_order, args.id))

        this.workOrderProgress = progress
        return progress
    }

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

        console.log('progressRecords', progressRecords)
        const [progressCount] = await db.select({ totalItems: count() }).from(workOrderProgressTable)

        return {
            items: progressRecords,
            meta: {
                totalItems: progressCount.totalItems
            }
        }
    }
}

