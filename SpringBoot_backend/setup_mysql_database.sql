-- StackIt MySQL Database Setup
-- Run this script to create the database and user

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS stackit_db;

-- Use the database
USE stackit_db;

-- Grant privileges to root user (adjust if using different user)
GRANT ALL PRIVILEGES ON stackit_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;

-- Show the database
SHOW DATABASES;
SELECT DATABASE();

-- The tables will be created automatically by Hibernate when you start the application
-- with ddl-auto=create-drop in application.properties 