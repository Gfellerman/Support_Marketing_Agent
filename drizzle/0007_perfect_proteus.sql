CREATE TABLE `workflowTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` enum('ecommerce','saas','retail','services','general','custom') NOT NULL DEFAULT 'custom',
	`tags` json,
	`icon` varchar(10) DEFAULT '📋',
	`triggerType` enum('welcome','abandoned_cart','order_confirmation','shipping','custom') NOT NULL,
	`steps` json NOT NULL,
	`isPublic` boolean DEFAULT false,
	`usageCount` int DEFAULT 0,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflowTemplates_id` PRIMARY KEY(`id`)
);
