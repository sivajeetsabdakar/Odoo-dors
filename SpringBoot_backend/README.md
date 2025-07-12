# StackIt - Q&A Forum Platform

A minimal question-and-answer platform supporting collaborative learning and structured knowledge sharing. Built with Spring Boot backend and designed to support both web and mobile clients.

## 🚀 Features

### Core Features

- **User Authentication** - Register, login, and JWT-based authentication
- **Questions & Answers** - Create, view, and manage Q&A content
- **Rich Text Editor** - Support for formatted content with images and links
- **Tagging System** - Categorize questions with relevant tags
- **Voting System** - Upvote/downvote answers
- **Real-time Notifications** - WebSocket-based notifications for user interactions
- **Mobile Support** - API designed for mobile app integration
- **Content Moderation** - AI-powered content screening for questions, answers, comments, and images

### User Roles

- **Guest** - View questions and answers
- **User** - Register, post questions/answers, vote
- **Admin** - Moderate content, manage users

## 🏗️ Architecture

### Technology Stack

- **Backend**: Spring Boot 3.5.3 (Java 17)
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Real-time**: WebSocket
- **Content Moderation**: AI-powered external service
- **Build Tool**: Gradle

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile Client  │    │   Admin Panel   │
│   (React.js)    │    │ (React Native)  │    │   (React.js)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      Spring Boot API      │
                    │      (REST + WebSocket)   │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │       PostgreSQL DB       │
                    └───────────────────────────┘
```

## 📋 Prerequisites

- Java 17 or higher
- PostgreSQL 12 or higher
- Gradle 7.0 or higher
- Content Moderation Service (optional - see setup instructions)

## 🛠️ Setup Instructions

### 1. Database Setup

1. **Install PostgreSQL** (if not already installed)

   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib

   # macOS (using Homebrew)
   brew install postgresql

   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**

   ```bash
   # Connect to PostgreSQL
   sudo -u postgres psql

   # Create database
   CREATE DATABASE stackit_db;

   # Create user (optional)
   CREATE USER stackit_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE stackit_db TO stackit_user;

   # Exit PostgreSQL
   \q
   ```

3. **Run Database Schema**
   ```bash
   # Connect to the database
   psql -U postgres -d stackit_db -f database/schema.sql
   ```

### 2. Content Moderation Service (Optional)

The platform includes AI-powered content moderation. To enable it:

1. **Start the Moderation Service**

   ```bash
   # The moderation service is running on https://d1946e5cd06f.ngrok-free.app
   # The service is already configured and ready to use
   ```

2. **Configure Moderation**
   Edit `backend/src/main/resources/application.properties`:

   ```properties
   # Content Moderation Configuration
   moderation.api.base-url=https://d1946e5cd06f.ngrok-free.app
   moderation.api.enabled=true
   moderation.api.timeout=30000
   ```

3. **Test Moderation**
   ```bash
   # Run the test script
   python test_moderation_integration.py
   ```

**Note**: If the moderation service is not available, content will be allowed automatically to prevent service disruption.

### 3. Backend Setup

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd "SB Backend"
   ```

2. **Configure Database Connection**
   Edit `backend/src/main/resources/application.properties`:

   ```properties
   # Update these values according to your PostgreSQL setup
   spring.datasource.url=jdbc:postgresql://localhost:5432/stackit_db
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   ```

3. **Build and Run**

   ```bash
   cd backend
   ./gradlew build
   ./gradlew bootRun
   ```

   The application will start on `http://localhost:8080`

### 4. API Testing

You can test the API using tools like Postman or curl:

#### Authentication

```bash
# Register a new user
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

#### Questions

```bash
# Get all questions
curl http://localhost:8080/api/questions

# Create a question
curl -X POST http://localhost:8080/api/questions?userId=1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to implement JWT authentication?",
    "description": "I need help implementing JWT authentication in my Spring Boot application.",
    "tags": ["java", "spring-boot", "jwt"]
  }'

# Get question by ID
curl http://localhost:8080/api/questions/1
```

#### Content Moderation

```bash
# Check moderation service health
curl http://localhost:8080/api/moderation/health

# Moderate text content
curl -X POST http://localhost:8080/api/moderation/text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "How do I implement a binary search tree?",
    "content_type": "question"
  }'

# Moderate image by URL
curl -X POST http://localhost:8080/api/moderation/image \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/image.jpg"
  }'

# Batch moderation (text + image)
curl -X POST http://localhost:8080/api/moderation/batch \
  -H "Content-Type: application/json" \
  -d '{
    "text_content": "Test message",
    "image_url": "https://example.com/image.jpg"
  }'
```

## 📱 Mobile Integration

### Push Notifications

The platform supports push notifications for mobile devices:

1. **Register Device Token**

   ```bash
   curl -X POST http://localhost:8080/api/mobile/register-device \
     -H "Content-Type: application/json" \
     -d '{
       "userId": 1,
       "deviceToken": "fcm_token_here",
       "deviceType": "ANDROID"
     }'
   ```

2. **WebSocket Connection**
   Connect to `ws://localhost:8080/ws` for real-time notifications.

### Mobile API Endpoints

- `POST /api/mobile/register-device` - Register device for push notifications
- `DELETE /api/mobile/unregister-device` - Unregister device
- `POST /api/mobile/sync` - Sync offline changes

## 🔔 Notification System

### Notification Types

- **Answer Notification** - Someone answered your question
- **Comment Notification** - Someone commented on your answer
- **Mention Notification** - Someone mentioned you with @username
- **Vote Notification** - Someone voted on your answer
- **Accept Notification** - Your answer was marked as accepted
- **Admin Notification** - Platform-wide announcements

### WebSocket Events

- `/topic/notifications` - Broadcast notifications
- `/user/queue/notifications` - User-specific notifications
- `/topic/questions/{id}` - Real-time question updates

## 🗄️ Database Schema

The application uses the following main tables:

- `users` - User accounts and profiles
- `questions` - Questions posted by users
- `answers` - Answers to questions
- `tags` - Question tags/categories
- `votes` - User votes on answers
- `comments` - Comments on answers
- `notifications` - User notifications
- `user_sessions` - Mobile device tokens

## 🔒 Security

### Authentication

- JWT-based authentication
- Password hashing with BCrypt
- Role-based access control (RBAC)

### API Security

- CORS configuration for cross-origin requests
- Input validation and sanitization
- Rate limiting (to be implemented)

## 🚀 Deployment

### Development

```bash
./gradlew bootRun
```

### Production

```bash
./gradlew build
java -jar build/libs/backend-0.0.1-SNAPSHOT.jar
```

### Docker (Optional)

```bash
# Build Docker image
docker build -t stackit-backend .

# Run container
docker run -p 8080:8080 stackit-backend
```

## 📊 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Questions Endpoints

- `GET /api/questions` - List questions (with pagination)
- `POST /api/questions` - Create new question
- `GET /api/questions/{id}` - Get single question
- `GET /api/questions/tag/{tagName}` - Get questions by tag
- `GET /api/questions/search` - Search questions

### Answers Endpoints

- `GET /api/questions/{id}/answers` - Get answers for question
- `POST /api/questions/{id}/answers` - Post new answer
- `POST /api/answers/{id}/accept` - Mark answer as accepted

### Tags Endpoints

- `GET /api/tags` - List all tags
- `GET /api/tags/search` - Search tags

### Notifications Endpoints

- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/mark-read` - Mark notifications as read

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 🔮 Future Enhancements

### Phase 2

- Search functionality with Elasticsearch
- User reputation system
- Badges and achievements
- Question bounties
- Advanced analytics

### Phase 3

- AI-powered question suggestions
- Content moderation with ML
- Multi-language support
- API for third-party integrations

---

**Happy Coding! 🚀**
