# StackIt Database Setup Guide

## 🚨 **Issue Identified**

Your MySQL database is missing the `image_urls` columns that are required for the image upload functionality. The current schema only has basic columns but is missing:

- `image_urls` in `questions` table
- `image_urls` in `answers` table
- `image_urls` in `comments` table
- `avatar_url` in `users` table

## 🔧 **Solution: Add Missing Columns**

### **Option 1: Run SQL Migration (Recommended)**

Execute the following SQL commands in your MySQL database:

```sql
-- Add image_urls column to questions table
ALTER TABLE `questions`
ADD COLUMN `image_urls` TEXT NULL COMMENT 'Comma-separated list of Cloudinary image URLs';

-- Add image_urls column to answers table
ALTER TABLE `answers`
ADD COLUMN `image_urls` TEXT NULL COMMENT 'Comma-separated list of Cloudinary image URLs';

-- Add image_urls column to comments table
ALTER TABLE `comments`
ADD COLUMN `image_urls` TEXT NULL COMMENT 'Comma-separated list of Cloudinary image URLs';

-- Add avatar_url column to users table
ALTER TABLE `users`
ADD COLUMN `avatar_url` VARCHAR(500) NULL COMMENT 'Single Cloudinary avatar URL';

-- Verify the changes
DESCRIBE `questions`;
DESCRIBE `answers`;
DESCRIBE `comments`;
DESCRIBE `users`;
```

### **Option 2: Use Hibernate Auto-Update**

1. **Update application.properties** to use MySQL:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/stackit_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=your_mysql_password

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

2. **Restart the application** - Hibernate will automatically add the missing columns.

## 📊 **Expected Database Schema**

After running the migration, your tables should look like this:

### **Questions Table:**

```sql
CREATE TABLE `questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image_urls` text COMMENT 'Comma-separated list of Cloudinary image URLs',
  `view_count` int DEFAULT '0',
  `is_closed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_questions_user_id` (`user_id`),
  KEY `idx_questions_created_at` (`created_at`),
  KEY `idx_questions_view_count` (`view_count`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### **Answers Table:**

```sql
CREATE TABLE `answers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `description` text NOT NULL,
  `image_urls` text COMMENT 'Comma-separated list of Cloudinary image URLs',
  `is_accepted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_answers_question_id` (`question_id`),
  KEY `idx_answers_user_id` (`user_id`),
  CONSTRAINT `answers_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `answers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### **Comments Table:**

```sql
CREATE TABLE `comments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `answer_id` bigint NOT NULL,
  `content` text NOT NULL,
  `image_urls` text COMMENT 'Comma-separated list of Cloudinary image URLs',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comments_user_id` (`user_id`),
  KEY `idx_comments_answer_id` (`answer_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`answer_id`) REFERENCES `answers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### **Users Table:**

```sql
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'USER',
  `avatar_url` varchar(500) COMMENT 'Single Cloudinary avatar URL',
  `bio` text,
  `reputation` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## 🚀 **Quick Setup Steps**

### **1. Run the Migration**

```bash
# Connect to your MySQL database
mysql -u root -p stackit_db

# Run the migration script
source database_migration.sql;
```

### **2. Update Application Properties**

Edit `backend/src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/stackit_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=your_actual_mysql_password

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

### **3. Restart the Application**

```bash
./gradlew bootRun
```

### **4. Verify the Setup**

```sql
-- Check if columns were added
DESCRIBE questions;
DESCRIBE answers;
DESCRIBE comments;
DESCRIBE users;

-- Expected output should show:
-- questions.image_urls (TEXT)
-- answers.image_urls (TEXT)
-- comments.image_urls (TEXT)
-- users.avatar_url (VARCHAR(500))
```

## 🧪 **Test the Image Upload**

After setting up the database, test the image upload functionality:

```bash
# 1. Upload an image
curl -X POST http://localhost:8080/api/files/upload/question \
  -F "file=@/path/to/test-image.jpg" \
  -F "questionId=1"

# Expected response:
{
  "url": "https://res.cloudinary.com/dgx0i7afm/image/upload/v1234567890/stackit/questions/1/uuid-image.jpg",
  "message": "Question image uploaded successfully"
}

# 2. Create a question with the image
curl -X POST "http://localhost:8080/api/questions?userId=1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Question with Image",
    "description": "This question has an image",
    "tags": ["test"],
    "imageUrls": ["https://res.cloudinary.com/dgx0i7afm/image/upload/v1234567890/stackit/questions/1/uuid-image.jpg"]
  }'

# 3. Verify the image URL is stored
SELECT id, title, image_urls FROM questions WHERE id = 1;
```

## 🎯 **Expected Results**

After completing the setup:

1. ✅ **Database Schema**: All tables have image URL columns
2. ✅ **Image Upload**: Files upload to Cloudinary successfully
3. ✅ **URL Storage**: Cloudinary URLs stored in database
4. ✅ **API Responses**: Full image URLs returned in API responses
5. ✅ **Frontend Display**: Images display directly from Cloudinary URLs

## 🔍 **Troubleshooting**

### **If columns already exist:**

```sql
-- Check if columns exist
SHOW COLUMNS FROM questions LIKE 'image_urls';
SHOW COLUMNS FROM answers LIKE 'image_urls';
SHOW COLUMNS FROM comments LIKE 'image_urls';
SHOW COLUMNS FROM users LIKE 'avatar_url';
```

### **If migration fails:**

```sql
-- Drop and recreate tables (WARNING: This will delete all data)
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS users;

-- Then restart the application with ddl-auto=create-drop
```

### **If application won't start:**

1. Check MySQL connection settings
2. Verify database exists: `CREATE DATABASE IF NOT EXISTS stackit_db;`
3. Check user permissions: `GRANT ALL PRIVILEGES ON stackit_db.* TO 'root'@'localhost';`

The image URL functionality will work perfectly once the database schema is updated! 🎉
