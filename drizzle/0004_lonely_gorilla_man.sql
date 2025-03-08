CREATE TABLE `work_order_progress` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`work_order` bigint unsigned NOT NULL,
	`status` text NOT NULL,
	`description` text NOT NULL,
	`timestamp` bigint unsigned NOT NULL,
	`time_spent` bigint unsigned,
	CONSTRAINT `work_order_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `image` text NOT NULL;--> statement-breakpoint
ALTER TABLE `work_order_progress` ADD CONSTRAINT `work_order_progress_work_order_work_orders_id_fk` FOREIGN KEY (`work_order`) REFERENCES `work_orders`(`id`) ON DELETE cascade ON UPDATE no action;