-- ========================================
-- StackIt Q&A Platform - Full SQL Schema
-- Target: Microsoft SQL Server (SSMS)
-- ========================================

-- 1. Create Database
IF NOT EXISTS (
    SELECT name FROM sys.databases WHERE name = N'StackIt'
)
BEGIN
    CREATE DATABASE StackIt;
    PRINT 'Database StackIt created successfully.';
END
ELSE
BEGIN
    PRINT 'Database StackIt already exists.';
END
GO

-- 2. Use the database
USE StackIt;
GO

-- 3. Drop tables if they already exist (order matters due to FK constraints)
IF OBJECT_ID('dbo.notifications', 'U') IS NOT NULL DROP TABLE dbo.notifications;
IF OBJECT_ID('dbo.votes', 'U') IS NOT NULL DROP TABLE dbo.votes;
IF OBJECT_ID('dbo.answers', 'U') IS NOT NULL DROP TABLE dbo.answers;
IF OBJECT_ID('dbo.question_tags', 'U') IS NOT NULL DROP TABLE dbo.question_tags;
IF OBJECT_ID('dbo.tags', 'U') IS NOT NULL DROP TABLE dbo.tags;
IF OBJECT_ID('dbo.questions', 'U') IS NOT NULL DROP TABLE dbo.questions;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
GO

-- 4. Create users table
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) UNIQUE NOT NULL,
    email NVARCHAR(200) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- 5. Create questions table
CREATE TABLE questions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME
);
GO

-- 6. Create tags table
CREATE TABLE tags (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) UNIQUE NOT NULL
);
GO

-- 7. Create question_tags table (many-to-many relationship)
CREATE TABLE question_tags (
    question_id INT NOT NULL FOREIGN KEY REFERENCES questions(id),
    tag_id INT NOT NULL FOREIGN KEY REFERENCES tags(id),
    PRIMARY KEY (question_id, tag_id)
);
GO

-- 8. Create answers table
CREATE TABLE answers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    question_id INT NOT NULL FOREIGN KEY REFERENCES questions(id),
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    description NVARCHAR(MAX) NOT NULL,
    is_accepted BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME
);
GO

-- 9. Create votes table
CREATE TABLE votes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    answer_id INT NOT NULL FOREIGN KEY REFERENCES answers(id),
    vote_type INT CHECK (vote_type IN (1, -1)) NOT NULL,
    CONSTRAINT unique_vote UNIQUE (user_id, answer_id)
);
GO

-- 10. Create notifications table
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    type NVARCHAR(50), -- 'answer', 'comment', 'mention'
    content NVARCHAR(255),
    is_read BIT DEFAULT 0,
    link NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE()
);
GO

PRINT 'StackIt schema created successfully.';
