ALTER TABLE `products` MODIFY COLUMN `updated_at` bigint unsigned NOT NULL;--> statement-breakpoint
ALTER TABLE `work_orders` MODIFY COLUMN `updated_at` bigint unsigned NOT NULL;