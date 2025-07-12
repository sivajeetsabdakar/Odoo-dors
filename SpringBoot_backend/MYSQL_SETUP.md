# MySQL Database Setup for StackIt Q&A Platform

## 🗄️ **MySQL Setup Options**

### **Option 1: Using Docker (Recommended - Easiest)**

If you have Docker installed:

```bash
# Start the entire stack with MySQL
docker-compose up --build -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### **Option 2: Install MySQL Locally**

#### **Windows Installation:**

1. **Download MySQL:**

   - Go to: https://dev.mysql.com/downloads/installer/
   - Download "MySQL Installer for Windows"
   - Choose "Developer Default" or "Server only"

2. **Install MySQL:**

   - Run installer as Administrator
   - Choose "Developer Default" setup type
   - Set root password (remember this!)
   - Keep default port (3306)
   - Complete installation

3. **Verify Installation:**
   ```bash
   mysql --version
   ```

#### **macOS Installation:**

```bash
# Using Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Set root password
mysql_secure_installation
```

#### **Linux (Ubuntu/Debian) Installation:**

```bash
# Update package list
sudo apt update

# Install MySQL
sudo apt install mysql-server

# Secure installation
sudo mysql_secure_installation

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql
```

### **Option 3: Using XAMPP (Windows/macOS)**

1. **Download XAMPP:**

   - Go to: https://www.apachefriends.org/
   - Download for your OS

2. **Install and Start:**
   - Install XAMPP
   - Start Apache and MySQL from XAMPP Control Panel
   - MySQL will be available on localhost:3306

## 🛠️ **Database Setup Steps**

### **Step 1: Create Database**

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE stackit_db;
USE stackit_db;

# Exit MySQL
EXIT;
```

### **Step 2: Run Schema**

```bash
# Run the MySQL schema
mysql -u root -p stackit_db < database/schema_mysql.sql
```

### **Step 3: Verify Setup**

```bash
# Connect to database
mysql -u root -p stackit_db

# Check tables
SHOW TABLES;

# Check default data
SELECT * FROM tags;
SELECT * FROM users;

# Exit
EXIT;
```

## ⚙️ **Configuration**

### **Update Application Properties**

Make sure your `backend/src/main/resources/application.properties` has:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/stackit_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_password_here
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

### **Common Issues & Solutions**

#### **1. Connection Refused**

```bash
# Check if MySQL is running
# Windows: Check Services app
# macOS: brew services list
# Linux: sudo systemctl status mysql
```

#### **2. Access Denied**

```bash
# Reset root password
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

#### **3. SSL Connection Error**

Add `?useSSL=false` to your database URL:

```
jdbc:mysql://localhost:3306/stackit_db?useSSL=false&serverTimezone=UTC
```

#### **4. Timezone Error**

Add `serverTimezone=UTC` to your database URL:

```
jdbc:mysql://localhost:3306/stackit_db?serverTimezone=UTC
```

## 🚀 **Quick Start Commands**

### **Using Docker:**

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **Using Local MySQL:**

```bash
# Start MySQL (if not running)
# Windows: Start from Services
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql

# Run schema
mysql -u root -p stackit_db < database/schema_mysql.sql

# Start Spring Boot
cd backend
./gradlew bootRun
```

## 📊 **Database Schema Overview**

### **Tables Created:**

- `users` - User accounts and profiles
- `questions` - Questions posted by users
- `answers` - Answers to questions
- `tags` - Question tags/categories
- `question_tags` - Many-to-many relationship
- `votes` - User votes on answers
- `comments` - Comments on answers
- `notifications` - User notifications
- `user_sessions` - Mobile device tokens

### **Default Data:**

- 10 default tags (java, spring-boot, react, etc.)
- 1 admin user (admin@stackit.com / admin123)

## 🔍 **Testing Database Connection**

```bash
# Test connection
mysql -u root -p -e "USE stackit_db; SHOW TABLES;"

# Test Spring Boot connection
curl http://localhost:8080/api/tags
```

## 📝 **Useful MySQL Commands**

```sql
-- Show all databases
SHOW DATABASES;

-- Use database
USE stackit_db;

-- Show all tables
SHOW TABLES;

-- Describe table structure
DESCRIBE users;

-- Show table data
SELECT * FROM tags LIMIT 5;

-- Check user count
SELECT COUNT(*) FROM users;

-- Check question count
SELECT COUNT(*) FROM questions;
```

## 🆘 **Troubleshooting**

### **Port Already in Use:**

```bash
# Check what's using port 3306
netstat -ano | findstr :3306  # Windows
lsof -i :3306                 # macOS/Linux
```

### **Permission Issues:**

```bash
# Grant all privileges to root
mysql -u root -p
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

### **Reset Database:**

```bash
# Drop and recreate
mysql -u root -p -e "DROP DATABASE IF EXISTS stackit_db; CREATE DATABASE stackit_db;"
mysql -u root -p stackit_db < database/schema_mysql.sql
```

---

**🎉 Your MySQL database is now ready for the StackIt Q&A platform!**
