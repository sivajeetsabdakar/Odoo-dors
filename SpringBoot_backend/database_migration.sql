-- StackIt Database Migration: Add Image URL Support
-- Run this script to add missing image URL columns to existing tables

-- Add image_urls column to questions table
ALTER TABLE `questions` 
ADD COLUMN `image_urls` TEXT NULL COMMENT 'Comma-separated list of Cloudinary image URLs';

-- Add image_urls column to answers table
ALTER TABLE `answers` 
ADD COLUMN `image_urls` TEXT NULL COMMENT 'Comma-separated list of Cloudinary image URLs';

-- Add image_urls column to comments table
ALTER TABLE `comments` 
ADD COLUMN `image_urls` TEXT NULL COMMENT 'Comma-separated list of Cloudinary image URLs';

-- Add avatar_url column to users table (if not already exists)
ALTER TABLE `users` 
ADD COLUMN `avatar_url` VARCHAR(500) NULL COMMENT 'Single Cloudinary avatar URL';

-- Verify the changes
DESCRIBE `questions`;
DESCRIBE `answers`;
DESCRIBE `comments`;
DESCRIBE `users`;

-- Optional: Add indexes for better performance
CREATE INDEX `idx_questions_image_urls` ON `questions` (`image_urls`(100));
CREATE INDEX `idx_answers_image_urls` ON `answers` (`image_urls`(100));
CREATE INDEX `idx_comments_image_urls` ON `comments` (`image_urls`(100));
CREATE INDEX `idx_users_avatar_url` ON `users` (`avatar_url`(100)); 