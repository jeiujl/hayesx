CREATE TABLE `flights` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`date` text NOT NULL,
	`signed_at` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `flights_owner_date` ON `flights` (`owner`,`date`);--> statement-breakpoint
CREATE TABLE `settings` (
	`owner` text NOT NULL,
	`kind` text NOT NULL,
	`data` text NOT NULL,
	PRIMARY KEY(`owner`, `kind`)
);
