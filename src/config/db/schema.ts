import { bigint, char, mysqlTable, serial, text } from "drizzle-orm/mysql-core";

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
})

export type User = typeof userTable.$inferSelect


