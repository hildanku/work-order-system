ALTER TABLE `work_order_progress` ADD `created_at` bigint unsigned NOT NULL;--> statement-breakpoint
ALTER TABLE `work_order_progress` ADD `updated_at` bigint unsigned NOT NULL;--> statement-breakpoint
ALTER TABLE `work_order_progress` ADD `date_start` bigint unsigned;--> statement-breakpoint
ALTER TABLE `work_order_progress` ADD `date_end` bigint unsigned;--> statement-breakpoint
ALTER TABLE `work_order_progress` DROP COLUMN `time_spent`;