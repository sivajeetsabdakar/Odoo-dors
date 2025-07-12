# Quick Start Guide - StackIt Q&A Platform

## 🚀 **Option 1: Use H2 Database (Easiest - No Setup Required)**

This option uses an in-memory H2 database, perfect for quick testing and development.

```bash
# Start with H2 database
cd backend
./gradlew bootRun -Dspring.profiles.active=h2
```

**Access:**

- API: http://localhost:8080
- H2 Console: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:stackit_db`
  - Username: `sa`
  - Password: (leave empty)

## 🗄️ **Option 2: Use MySQL Database**

### **Step 1: Install MySQL**

- **Windows:** Download from https://dev.mysql.com/downloads/installer/
- **macOS:** `brew install mysql && brew services start mysql`
- **Linux:** `sudo apt install mysql-server`

### **Step 2: Create Database**

```bash
mysql -u root -p
CREATE DATABASE stackit_db;
EXIT;
```

### **Step 3: Start Application**

```bash
cd backend
./gradlew bootRun
```

## 🐳 **Option 3: Use Docker (Recommended)**

```bash
# Start everything with Docker
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 🧪 **Test Your Setup**

### **1. Test API Endpoints**

```bash
# Get all tags
curl http://localhost:8080/api/tags

# Register a user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### **2. Test with Admin User**

```bash
# Login as admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@stackit.com",
    "password": "admin123"
  }'
```

### **3. Create a Question**

```bash
curl -X POST http://localhost:8080/api/questions?userId=1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to implement JWT authentication?",
    "description": "I need help implementing JWT authentication in my Spring Boot application.",
    "tags": ["java", "spring-boot", "jwt"]
  }'
```

## 🔧 **Troubleshooting**

### **MySQL Connection Issues**

```bash
# Check if MySQL is running
# Windows: Check Services app
# macOS: brew services list
# Linux: sudo systemctl status mysql

# Reset MySQL password if needed
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### **Port Already in Use**

```bash
# Check what's using port 8080
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # macOS/Linux

# Kill process if needed
taskkill /PID <process_id>    # Windows
kill -9 <process_id>          # macOS/Linux
```

### **Gradle Issues**

```bash
# Clean and rebuild
./gradlew clean build

# Refresh dependencies
./gradlew --refresh-dependencies
```

## 📱 **API Endpoints**

### **Authentication**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### **Questions**

- `GET /api/questions` - List all questions
- `POST /api/questions` - Create new question
- `GET /api/questions/{id}` - Get single question
- `GET /api/questions/tag/{tagName}` - Get questions by tag
- `GET /api/questions/search` - Search questions

### **Answers**

- `GET /api/questions/{id}/answers` - Get answers for question
- `POST /api/questions/{id}/answers` - Post new answer
- `POST /api/answers/{id}/accept` - Mark answer as accepted

### **Tags**

- `GET /api/tags` - List all tags
- `GET /api/tags/search` - Search tags
- `GET /api/tags/popular` - Get popular tags

## 🎯 **Default Data**

The application automatically creates:

- **10 default tags** (java, spring-boot, react, etc.)
- **1 admin user** (admin@stackit.com / admin123)

## 🚀 **Next Steps**

1. **Test the API** using the endpoints above
2. **Build your frontend** (React.js for web)
3. **Build your mobile app** (React Native)
4. **Add more features** as needed

---

**🎉 Your StackIt Q&A platform is ready!**
