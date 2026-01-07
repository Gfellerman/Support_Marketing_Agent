-- Migration: Add AI Feedback table for learning & optimization
-- Phase 5: Learning & Optimization

CREATE TABLE IF NOT EXISTS `aiFeedback` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `organizationId` int NOT NULL,
  `interactionId` int NOT NULL,
  `agentId` int,
  `rating` enum('positive', 'negative') NOT NULL,
  `wasUsed` boolean NOT NULL DEFAULT false,
  `wasEdited` boolean NOT NULL DEFAULT false,
  `editDistance` int,
  `originalResponse` text,
  `finalResponse` text,
  `category` varchar(100),
  `tone` varchar(50),
  `comment` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_aiFeedback_org` (`organizationId`),
  INDEX `idx_aiFeedback_interaction` (`interactionId`),
  INDEX `idx_aiFeedback_agent` (`agentId`),
  INDEX `idx_aiFeedback_rating` (`rating`),
  INDEX `idx_aiFeedback_created` (`createdAt`),
  INDEX `idx_aiFeedback_category` (`category`),
  INDEX `idx_aiFeedback_analytics` (`organizationId`, `createdAt`, `rating`)
);

-- Add index on aiInteractions for analytics queries
CREATE INDEX IF NOT EXISTS `idx_aiInteractions_analytics` ON `aiInteractions` (`organizationId`, `createdAt`, `wasUsed`);
