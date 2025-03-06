import { BaseRepository, CreateArgs, DeleteArgs, FindByIdArgs, ListArgs, UpdateArgs } from "../../helpers/repository";
import { productTable, userTable, workOrderTable, type WorkOrder } from "../../config/db/schema";
import { db } from "../../config/db";
import { AnyColumn, asc, count, desc, eq, like, or } from "drizzle-orm";
import { LIMIT } from "../../helpers/const";
import { ProductEntity } from "../product/product.repository";
import { UserEntity } from "../user/user.repository";

export interface WorkOrderEntity extends WorkOrder { }

export type ExpandedWorkOrderEntity = {
    work_orders: WorkOrderEntity
    products: ProductEntity | null
    users: UserEntity | null
}

export class WorkOrderRepository implements Omit<BaseRepository<WorkOrderEntity>, 'list'> {

    workOrder: WorkOrderEntity[] = []


    async findById(args: FindByIdArgs): Promise<WorkOrderEntity[] | null> {
        const workOrders = await db
            .select()
            .from(workOrderTable)
            .where(
                eq(
                    workOrderTable.id, args.id
                )
            )

        this.workOrder = workOrders
        return workOrders
    }

    async create(args: CreateArgs<WorkOrderEntity>): Promise<WorkOrderEntity[]> {
        const insertWorkOrder = await db
            .insert(workOrderTable)
            .values({ ...args.item })
            .$returningId()

        const workOrder = await db
            .select()
            .from(workOrderTable)
            .where(
                eq(workOrderTable.id, insertWorkOrder[0].id)
            )

        this.workOrder = workOrder

        return workOrder
    }

    async update(args: UpdateArgs<WorkOrderEntity>): Promise<WorkOrderEntity[] | null> {
        await db
            .update(workOrderTable)
            .set({ ...args.item, updated_at: new Date().getTime() })
            .where(
                eq(
                    workOrderTable.id, args.id
                )
            )

        const updatedWorkOrder = await this.findById({ id: args.id })
        if (updatedWorkOrder) {
            this.workOrder = updatedWorkOrder
        }
        return updatedWorkOrder
    }

    async delete(args: DeleteArgs): Promise<boolean> {
        try {

            await db
                .delete(workOrderTable)
                .where(
                    eq(
                        workOrderTable.id, args.id
                    )
                )
            this.workOrder = []
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }

    async list(args: Partial<ListArgs>): Promise<{ items: ExpandedWorkOrderEntity[]; meta: { totalItems: number; }; }> {
        const workOrders = await db
            .select()
            .from(workOrderTable)
            .leftJoin(productTable, eq(workOrderTable.product, productTable.id))
            .leftJoin(userTable, eq(workOrderTable.user, userTable.id))
            .where(
                or(
                    args.q ? eq(workOrderTable.order_code, args.q) : undefined,
                    args.q ? like(workOrderTable.deadline, `%${args.q}%`) : undefined,
                    args.q ? like(workOrderTable.product, `%${args.q}%`) : undefined
                )
            )
            .limit(args.limit || LIMIT)
            .offset(((args.page || 1) - 1) * (args.limit || LIMIT))
            .orderBy(
                args.order === 'ASC' ?
                    asc(workOrderTable[args.sort as keyof typeof workOrderTable] as AnyColumn)
                    : desc(workOrderTable[args.sort as keyof typeof workOrderTable] as AnyColumn),

            )

        const [workOrderCount] = await db.select({ totalItems: count() }).from(workOrderTable)

        return {
            items: workOrders,
            meta: {
                totalItems: workOrderCount.totalItems
            }
        }
    }
}
