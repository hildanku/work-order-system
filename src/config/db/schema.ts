import { bigint, char, json, mysqlTable, serial, text } from "drizzle-orm/mysql-core";

export const userTable = mysqlTable('users', {
    id: serial().primaryKey(),
    created_at: bigint({ mode: 'number', unsigned: true })
        .notNull()
        .$defaultFn(() => new Date().getTime()),
    updated_at: bigint({ mode: 'number', unsigned: true })
        .notNull()
        .$defaultFn(() => new Date().getTime()),
    username: char({ length: 100 }).notNull().unique(),
    name: text().notNull(),
    role: text({ enum: ['production_manager', 'operator'] })
        .default('operator')
        .notNull(),
    avatar: text(),
    email: text().notNull(),
})

export type User = typeof userTable.$inferSelect

export const authenticationTable = mysqlTable('authentications', {
    id: serial().primaryKey(),
    created_at: bigint({ mode: 'number', unsigned: true })
        .notNull()
        .$defaultFn(() => new Date().getTime()),
    updated_at: bigint({ mode: 'number', unsigned: true })
        .notNull()
        .$defaultFn(() => new Date().getTime()),

    user: bigint({ mode: 'number', unsigned: true })
        .references(() => userTable.id, { onDelete: 'cascade' }),
    hash_password: text().notNull(),
    refresh_token: text(),
})

export type Authentication = typeof authenticationTable.$inferSelect

export const productTable = mysqlTable('products', {
    id: serial().primaryKey(),
    created_at: bigint({ mode: 'number', unsigned: true })
        .notNull()
        .$defaultFn(() => new Date().getTime()),
    updated_at: bigint({ mode: 'number', unsigned: true })
        .notNull()
        .$defaultFn(() => new Date().getTime()),
    name: text().notNull(),
    description: text(),
    image: text().notNull(),
})

export type Product = typeof productTable.$inferSelect

export const workOrderTable = mysqlTable('work_orders', {
    id: serial().primaryKey(),
    created_at: bigint({ mode: 'number', unsigned: true })
        .notNull()
        .$defaultFn(() => new Date().getTime()),
    updated_at: bigint({ mode: 'number', unsigned: true })
        .notNull()
        .$defaultFn(() => new Date().getTime()),
    order_code: text(),
    product: bigint({ mode: 'number', unsigned: true })
        .references(() => productTable.id, { onDelete: 'set null' }),
    user: bigint({ mode: 'number', unsigned: true })
        .references(() => userTable.id, { onDelete: 'set null' }),
    quantity: bigint({ mode: 'number', unsigned: true }),
    deadline: bigint({ mode: 'number', unsigned: true }),
    status: text({ enum: ['pending', 'in_progress', 'completed', 'canceled'] })
        .default('pending'),
})

export type WorkOrder = typeof workOrderTable.$inferSelect

export const workOrderProgressTable = mysqlTable('work_order_progress', {
    id: serial().primaryKey(),
    created_at: bigint({ mode: 'number', unsigned: true })
        .notNull()
        .$defaultFn(() => new Date().getTime()),
    updated_at: bigint({ mode: 'number', unsigned: true })
        .notNull()
        .$defaultFn(() => new Date().getTime()),
    work_order: bigint({ mode: 'number', unsigned: true })
        .notNull()
        .references(() => workOrderTable.id, { onDelete: 'cascade' }),
    status: text({ enum: ['pending', 'in_progress', 'completed', 'canceled'] })
        .notNull(),
    description: text().notNull(),
    timestamp: bigint({ mode: 'number', unsigned: true })
        .notNull()
        .$defaultFn(() => new Date().getTime()),
    date_start: bigint({ mode: 'number', unsigned: true }),
    date_end: bigint({ mode: 'number', unsigned: true }),
});

export type WorkOrderProgress = typeof workOrderProgressTable.$inferSelect;
