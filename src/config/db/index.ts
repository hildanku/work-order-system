import { drizzle } from 'drizzle-orm/mysql2'
import 'dotenv/config'

export const db = drizzle(process.env.DATABASE_URL!)
