CREATE TABLE `aiSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`minConfidenceThreshold` int NOT NULL DEFAULT 70,
	`autoResponseThreshold` int NOT NULL DEFAULT 90,
	`aiEnabled` boolean NOT NULL DEFAULT true,
	`autoResponseEnabled` boolean NOT NULL DEFAULT false,
	`requireHumanReviewUrgent` boolean NOT NULL DEFAULT true,
	`requireHumanReviewNegative` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `aiSettings_organizationId_unique` UNIQUE(`organizationId`)
);
