import { AnyColumn, asc, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "../../config/db";
import { Product, productTable } from "../../config/db/schema";
import { BaseRepository, CreateArgs, DeleteArgs, FindByIdArgs, ListArgs, UpdateArgs } from "../../helpers/repository";
import { LIMIT } from "../../helpers/const";

export interface ProductEntity extends Product { }

export class ProductRepository implements BaseRepository<ProductEntity> {
    product: ProductEntity[] = [];

    async findById(args: FindByIdArgs): Promise<ProductEntity[] | null> {
        const products = await db.select().from(productTable).where(eq(productTable.id, args.id));
        this.product = products;
        return products;
    }

    async create(args: CreateArgs<ProductEntity>): Promise<ProductEntity[]> {
        const insertProduct = await db
            .insert(productTable)
            .values({ ...args.item })
            .$returningId();

        const products = await db
            .select()
            .from(productTable)
            .where(eq(productTable.id, insertProduct[0].id));

        this.product = products;
        return products;
    }

    async update(args: UpdateArgs<ProductEntity>): Promise<ProductEntity[] | null> {
        await db
            .update(productTable)
            .set({ ...args.item, updated_at: new Date().getTime() })
            .where(eq(productTable.id, args.id));

        const updatedProduct = await this.findById({ id: args.id });
        if (updatedProduct) {
            this.product = updatedProduct;
        }

        return updatedProduct;
    }

    async list(args: Partial<ListArgs>): Promise<{ items: ProductEntity[]; meta: { totalItems: number } }> {
        const products = await db
            .select()
            .from(productTable)
            .where(
                or(
                    args.q ? like(productTable.name, `%${args.q}%`) : undefined,
                    args.q ? like(productTable.description, `%${args.q}%`) : undefined,
                ),
            )
            .limit(args.limit || LIMIT)
            .offset(((args.page || 1) - 1) * (args.limit || LIMIT) || 0)
            .orderBy(
                args.order === "ASC"
                    ? asc(productTable[args.sort as keyof typeof productTable] as AnyColumn)
                    : desc(productTable[args.sort as keyof typeof productTable] as AnyColumn),
            );

        this.product = products;

        const [productCount] = await db.select({ totalItems: count() }).from(productTable);

        return {
            items: products,
            meta: { totalItems: productCount.totalItems },
        };
    }

    async delete(args: DeleteArgs): Promise<boolean> {
        try {
            await db.delete(productTable).where(eq(productTable.id, args.id));
            this.product = [];
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}
