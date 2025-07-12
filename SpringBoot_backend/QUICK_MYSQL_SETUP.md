# Quick MySQL Setup for StackIt

## 🚨 **Problem**

You dropped your database and the entities aren't being created because the application is still configured for H2 instead of MySQL.

## 🔧 **Solution**

### **Step 1: Create MySQL Database**

Run this in MySQL:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS stackit_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON stackit_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

Or run the setup script:

```bash
mysql -u root -p < setup_mysql_database.sql
```

### **Step 2: Application Properties Updated**

I've already updated your `application.properties` to use MySQL:

```properties
# Database Configuration - Using MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/stackit_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=root

# JPA Configuration for MySQL
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

### **Step 3: Start the Application**

```bash
./gradlew bootRun
```

### **Step 4: Verify Tables Created**

After starting the application, check MySQL:

```sql
USE stackit_db;
SHOW TABLES;

-- You should see:
-- answers
-- comments
-- question_tags
-- questions
-- tags
-- users
-- votes

-- Check if image_urls columns exist:
DESCRIBE questions;
DESCRIBE answers;
DESCRIBE comments;
DESCRIBE users;
```

## 🎯 **Expected Results**

After starting the application, you should see:

1. ✅ **Database created**: `stackit_db` exists
2. ✅ **Tables created**: All entity tables with proper columns
3. ✅ **Image URL columns**: All tables have `image_urls` columns
4. ✅ **Application running**: No database connection errors

## 🧪 **Test the Setup**

```bash
# 1. Test database connection
curl -X GET http://localhost:8080/api/questions

# 2. Create a user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# 3. Upload an image
curl -X POST http://localhost:8080/api/files/upload/question \
  -F "file=@/path/to/test-image.jpg" \
  -F "questionId=1"
```

## 🔍 **Troubleshooting**

### **If application won't start:**

1. **Check MySQL is running:**

```bash
sudo systemctl status mysql
# or
sudo service mysql status
```

2. **Check MySQL connection:**

```bash
mysql -u root -p
```

3. **Check database exists:**

```sql
SHOW DATABASES;
USE stackit_db;
SHOW TABLES;
```

### **If tables aren't created:**

1. **Check application logs** for Hibernate errors
2. **Verify MySQL dialect** is set correctly
3. **Check user permissions** on the database

### **If you get connection errors:**

1. **Update password** in `application.properties` if different
2. **Check MySQL port** (default is 3306)
3. **Verify MySQL is accepting connections** from localhost

## 🎉 **Success Indicators**

- ✅ Application starts without database errors
- ✅ All tables created in MySQL
- ✅ Image upload endpoints work
- ✅ Questions can be created with images

The application will now use MySQL and create all the necessary tables with image URL support! 🚀
