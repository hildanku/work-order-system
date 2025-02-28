CREATE TABLE `authentications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`created_at` bigint unsigned NOT NULL,
	`updated_at` bigint unsigned NOT NULL,
	`user` bigint unsigned,
	`hash_password` text NOT NULL,
	`refresh_token` text,
	CONSTRAINT `authentications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`created_at` bigint unsigned NOT NULL,
	`updated_at` bigint unsigned,
	`name` text NOT NULL,
	`description` text,
	`image` json NOT NULL,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`created_at` bigint unsigned NOT NULL,
	`updated_at` bigint unsigned,
	`order_code` text,
	`product` bigint unsigned,
	`user` bigint unsigned,
	`quantity` bigint unsigned,
	`deadline` bigint unsigned,
	`status` text DEFAULT ('pending'),
	CONSTRAINT `work_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `authentications` ADD CONSTRAINT `authentications_user_users_id_fk` FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_product_products_id_fk` FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_user_users_id_fk` FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;