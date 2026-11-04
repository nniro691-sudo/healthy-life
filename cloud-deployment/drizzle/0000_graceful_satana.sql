CREATE TABLE `actors` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`room` text NOT NULL,
	`name` text NOT NULL,
	`state` text NOT NULL,
	`mat` text,
	`updated` integer NOT NULL,
	`last_greet` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `one_actor_per_mat` ON `actors` (`room`,`mat`);--> statement-breakpoint
CREATE INDEX `actors_room_updated` ON `actors` (`room`,`updated`);--> statement-breakpoint
CREATE TABLE `greetings` (
	`id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`sender` text NOT NULL,
	`target` text NOT NULL,
	`name` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `greetings_target_created` ON `greetings` (`target`,`created`);