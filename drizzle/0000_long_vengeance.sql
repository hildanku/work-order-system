CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`created_at` bigint unsigned NOT NULL,
	`updated_at` bigint unsigned NOT NULL,
	`username` char(100) NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL DEFAULT ('operator'),
	`avatar` text,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
