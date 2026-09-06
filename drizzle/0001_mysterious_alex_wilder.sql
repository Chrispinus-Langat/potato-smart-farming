CREATE TABLE `field_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fieldId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`variety` varchar(80),
	`acreage` varchar(32),
	`plantedAt` timestamp,
	`healthScore` int NOT NULL DEFAULT 0,
	`note` text,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `field_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `field_history` ADD CONSTRAINT `field_history_fieldId_fields_id_fk` FOREIGN KEY (`fieldId`) REFERENCES `fields`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `field_history_field_recorded_idx` ON `field_history` (`fieldId`,`recordedAt`);
--> statement-breakpoint
INSERT INTO `field_history` (`fieldId`, `name`, `variety`, `acreage`, `plantedAt`, `healthScore`, `note`)
SELECT `id`, `name`, `variety`, `acreage`, `plantedAt`, `healthScore`, 'Imported existing field'
FROM `fields`;
