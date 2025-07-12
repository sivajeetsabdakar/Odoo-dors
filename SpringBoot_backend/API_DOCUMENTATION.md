# StackIt API Documentation

## Base URL

```
https://<your-ngrok-url>/api
```

---

## 1. Authentication Endpoints

### 1.1 Register User

**POST** `/auth/register`

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
  "avatarUrl": "/api/files/avatars/uuid-filename.jpg" // optional
}
```

**Response (Success - 200):**

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER",
  "avatarUrl": "/api/files/avatars/uuid-filename.jpg",
  "bio": null,
  "reputation": 0,
  "createdAt": "2024-01-01T10:00:00"
}
```

**Response (Error - 400):**

```json
{
  "error": "Error message"
}
```

### 1.2 Login User

**POST** `/auth/login`

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response (Success - 200):**

```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "USER",
    "avatarUrl": null,
    "bio": null,
    "reputation": 0,
    "createdAt": "2024-01-01T10:00:00"
  },
  "token": "dummy-jwt-token"
}
```

**Response (Error - 400):**

```json
{
  "error": "Invalid credentials"
}
```

### 1.3 Get Current User

**GET** `/auth/me?userId={userId}`

**Response (Success - 200):**

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER",
  "avatarUrl": null,
  "bio": null,
  "reputation": 0,
  "createdAt": "2024-01-01T10:00:00"
}
```

---

## 2. Questions Endpoints

### 2.1 Get All Questions (Paginated)

**GET** `/questions?page={page}&size={size}`

**Query Parameters:**

- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10)

**Response (Success - 200):**

```json
{
  "content": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "USER",
        "avatarUrl": null,
        "bio": null,
        "reputation": 0,
        "createdAt": "2024-01-01T10:00:00"
      },
      "title": "How to implement authentication?",
      "description": "I need help with JWT authentication...",
      "imageUrls": [
        "/api/files/questions/1/uuid-screenshot1.png",
        "/api/files/questions/1/uuid-screenshot2.jpg"
      ],
      "viewCount": 15,
      "isClosed": false,
      "createdAt": "2024-01-01T10:00:00",
      "updatedAt": "2024-01-01T10:00:00",
      "tags": ["authentication", "jwt", "spring-boot"],
      "answerCount": 3,
      "hasAcceptedAnswer": true
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "sorted": false,
      "unsorted": true
    }
  },
  "totalElements": 25,
  "totalPages": 3,
  "last": false,
  "first": true,
  "numberOfElements": 10
}
```

### 2.2 Get Question by ID

**GET** `/questions/{id}`

**Response (Success - 200):**

```json
{
  "id": 1,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "USER",
    "avatarUrl": null,
    "bio": null,
    "reputation": 0,
    "createdAt": "2024-01-01T10:00:00"
  },
  "title": "How to implement authentication?",
  "description": "I need help with JWT authentication...",
  "imageUrls": [
    "/api/files/questions/1/uuid-screenshot1.png",
    "/api/files/questions/1/uuid-screenshot2.jpg"
  ],
  "viewCount": 15,
  "isClosed": false,
  "createdAt": "2024-01-01T10:00:00",
  "updatedAt": "2024-01-01T10:00:00",
  "tags": ["authentication", "jwt", "spring-boot"],
  "answerCount": 3,
  "hasAcceptedAnswer": true
}
```

### 2.3 Create Question

**POST** `/questions?userId={userId}`

**Request Body:**

```json
{
  "title": "How to implement authentication?",
  "description": "I need help with JWT authentication in my Spring Boot application...",
  "tags": ["authentication", "jwt", "spring-boot"],
  "imageUrls": [
    "/api/files/questions/1/uuid-screenshot1.png",
    "/api/files/questions/1/uuid-screenshot2.jpg"
  ]
}
```

**Response (Success - 200):**

```json
{
  "id": 1,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "USER",
    "avatarUrl": null,
    "bio": null,
    "reputation": 0,
    "createdAt": "2024-01-01T10:00:00"
  },
  "title": "How to implement authentication?",
  "description": "I need help with JWT authentication in my Spring Boot application...",
  "imageUrls": [
    "/api/files/questions/1/uuid-screenshot1.png",
    "/api/files/questions/1/uuid-screenshot2.jpg"
  ],
  "viewCount": 0,
  "isClosed": false,
  "createdAt": "2024-01-01T10:00:00",
  "updatedAt": "2024-01-01T10:00:00",
  "tags": ["authentication", "jwt", "spring-boot"],
  "answerCount": 0,
  "hasAcceptedAnswer": false
}
```

### 2.4 Update Question

**PUT** `/questions/{id}?userId={userId}`

**Request Body:**

```json
{
  "title": "Updated Question Title",
  "description": "Updated description...",
  "tags": ["java", "backend"],
  "imageUrls": ["/api/files/questions/1/new-image.jpg"]
}
```

**Response:**

```json
{
  "message": "Question updated successfully",
  "questionId": 1
}
```

### 2.5 Delete Question

**DELETE** `/questions/{id}?userId={userId}`

**Response:**

```json
{
  "message": "Question deleted successfully"
}
```

### 2.6 Vote on Question

**POST** `/questions/{id}/vote?userId={userId}`

**Request Body:**

```json
{
  "vote": 1 // 1 for upvote, -1 for downvote, 0 to remove vote
}
```

**Response:**

```json
{
  "message": "Vote recorded",
  "voteCount": 6
}
```

### 2.4 Get Questions by Tag

**GET** `/questions/tag/{tagName}`

**Response (Success - 200):**

```json
[
  {
    "id": 1,
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "USER",
      "avatarUrl": null,
      "bio": null,
      "reputation": 0,
      "createdAt": "2024-01-01T10:00:00"
    },
    "title": "How to implement authentication?",
    "description": "I need help with JWT authentication...",
    "imageUrls": [
      "/api/files/questions/1/uuid-screenshot1.png",
      "/api/files/questions/1/uuid-screenshot2.jpg"
    ],
    "viewCount": 15,
    "isClosed": false,
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-01T10:00:00",
    "tags": ["authentication", "jwt", "spring-boot"],
    "answerCount": 3,
    "hasAcceptedAnswer": true
  }
]
```

### 2.5 Search Questions

**GET** `/questions/search?q={query}&page={page}&size={size}`

**Query Parameters:**

- `q` (required): Search query
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10)

**Response (Success - 200):**

```json
{
  "content": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "USER",
        "avatarUrl": null,
        "bio": null,
        "reputation": 0,
        "createdAt": "2024-01-01T10:00:00"
      },
      "title": "How to implement authentication?",
      "description": "I need help with JWT authentication...",
      "imageUrls": [
        "/api/files/questions/1/uuid-screenshot1.png",
        "/api/files/questions/1/uuid-screenshot2.jpg"
      ],
      "viewCount": 15,
      "isClosed": false,
      "createdAt": "2024-01-01T10:00:00",
      "updatedAt": "2024-01-01T10:00:00",
      "tags": ["authentication", "jwt", "spring-boot"],
      "answerCount": 3,
      "hasAcceptedAnswer": true
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "sorted": false,
      "unsorted": true
    }
  },
  "totalElements": 5,
  "totalPages": 1,
  "last": true,
  "first": true,
  "numberOfElements": 5
}
```

### 2.6 Get Questions by User

**GET** `/questions/user/{userId}`

**Response (Success - 200):**

```json
[
  {
    "id": 1,
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "USER",
      "avatarUrl": null,
      "bio": null,
      "reputation": 0,
      "createdAt": "2024-01-01T10:00:00"
    },
    "title": "How to implement authentication?",
    "description": "I need help with JWT authentication...",
    "imageUrls": [
      "/api/files/questions/1/uuid-screenshot1.png",
      "/api/files/questions/1/uuid-screenshot2.jpg"
    ],
    "viewCount": 15,
    "isClosed": false,
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-01T10:00:00",
    "tags": ["authentication", "jwt", "spring-boot"],
    "answerCount": 3,
    "hasAcceptedAnswer": true
  }
]
```

---

## 3. Answers Endpoints

### 3.1 Get Answers by Question

**GET** `/questions/{questionId}/answers`

**Response (Success - 200):**

```json
[
  {
    "id": 1,
    "user": {
      "id": 2,
      "username": "jane_smith",
      "email": "jane@example.com",
      "role": "USER",
      "avatarUrl": null,
      "bio": null,
      "reputation": 50,
      "createdAt": "2024-01-01T09:00:00"
    },
    "description": "You can use Spring Security with JWT...",
    "imageUrls": [
      "/api/files/answers/1/uuid-diagram.jpg",
      "/api/files/answers/1/uuid-code-screenshot.png"
    ],
    "isAccepted": true,
    "createdAt": "2024-01-01T11:00:00",
    "updatedAt": "2024-01-01T11:00:00",
    "voteCount": 5,
    "commentCount": 2,
    "userVote": 0
  }
]
```

### 3.2 Create Answer

**POST** `/questions/{questionId}/answers?userId={userId}`

**Request Body:**

```json
{
  "description": "You can use Spring Security with JWT tokens. Here's how...",
  "imageUrls": [
    "/api/files/answers/1/uuid-diagram.jpg",
    "/api/files/answers/1/uuid-code-screenshot.png"
  ]
}
```

**Response (Success - 200):**

```json
{
  "id": 1,
  "user": {
    "id": 2,
    "username": "jane_smith",
    "email": "jane@example.com",
    "role": "USER",
    "avatarUrl": null,
    "bio": null,
    "reputation": 50,
    "createdAt": "2024-01-01T09:00:00"
  },
  "description": "You can use Spring Security with JWT tokens. Here's how...",
  "imageUrls": [
    "/api/files/answers/1/uuid-diagram.jpg",
    "/api/files/answers/1/uuid-code-screenshot.png"
  ],
  "isAccepted": false,
  "createdAt": "2024-01-01T11:00:00",
  "updatedAt": "2024-01-01T11:00:00",
  "voteCount": 0,
  "commentCount": 0,
  "userVote": 0
}
```

### 3.3 Update Answer

**PUT** `/answers/{id}?userId={userId}`

**Request Body:**

```json
{
  "description": "Updated answer...",
  "imageUrls": ["/api/files/answers/1/updated-diagram.png"]
}
```

**Response:**

```json
{
  "message": "Answer updated successfully",
  "answerId": 1
}
```

### 3.4 Delete Answer

**DELETE** `/answers/{id}?userId={userId}`

**Response:**

```json
{
  "message": "Answer deleted successfully"
}
```

### 3.5 Vote on Answer

**POST** `/answers/{id}/vote?userId={userId}`

**Request Body:**

```json
{
  "vote": 1
}
```

**Response:**

```json
{
  "message": "Vote recorded",
  "voteCount": 6
}
```

---

## 4. Comments Endpoints

### 4.1 Get Comments by Answer

**GET** `/answers/{answerId}/comments`

**Response (Success - 200):**

```json
[
  {
    "id": 1,
    "user": {
      "id": 2,
      "username": "jane_smith",
      "email": "jane@example.com",
      "role": "USER",
      "avatarUrl": null,
      "bio": null,
      "reputation": 50,
      "createdAt": "2024-01-01T09:00:00"
    },
    "content": "Great answer! Here's a screenshot...",
    "imageUrls": [
      "/api/files/comments/1/uuid-image1.jpg",
      "/api/files/comments/1/uuid-image2.png"
    ],
    "createdAt": "2024-01-01T12:00:00",
    "updatedAt": "2024-01-01T12:00:00"
  }
]
```

### 4.2 Create Comment

**POST** `/answers/{answerId}/comments?userId={userId}`

**Request Body:**

```json
{
  "content": "Great answer! Here's a screenshot...",
  "imageUrls": [
    "/api/files/comments/1/image1.jpg",
    "/api/files/comments/1/image2.png"
  ]
}
```

**Response (Success - 200):**

```json
{
  "id": 1,
  "user": {
    "id": 2,
    "username": "jane_smith",
    "email": "jane@example.com",
    "role": "USER",
    "avatarUrl": null,
    "bio": null,
    "reputation": 50,
    "createdAt": "2024-01-01T09:00:00"
  },
  "content": "Great answer! Here's a screenshot...",
  "imageUrls": [
    "/api/files/comments/1/uuid-image1.jpg",
    "/api/files/comments/1/uuid-image2.png"
  ],
  "createdAt": "2024-01-01T12:00:00",
  "updatedAt": "2024-01-01T12:00:00"
}
```

### 4.3 Update Comment

**PUT** `/comments/{id}?userId={userId}`

**Request Body:**

```json
{
  "content": "Updated comment content",
  "imageUrls": ["/api/files/comments/1/fixed-image.png"]
}
```

**Response:**

```json
{
  "message": "Comment updated successfully",
  "commentId": 1
}
```

### 4.4 Delete Comment

**DELETE** `/comments/{id}?userId={userId}`

**Response:**

```json
{
  "message": "Comment deleted successfully"
}
```

---

## 5. User Profile

### 5.1 Update User Profile

**PUT** `/users/{id}`

**Request Body:**

```json
{
  "username": "new_name",
  "bio": "Updated bio",
  "avatarUrl": "/api/files/avatars/new-avatar.jpg"
}
```

**Response:**

```json
{
  "message": "Profile updated successfully"
}
```

---

## 6. Tags Endpoints

### 6.1 Get All Tags

**GET** `/tags`

**Response (Success - 200):**

```json
[
  {
    "id": 1,
    "name": "java",
    "description": "Java programming language",
    "usageCount": 25
  },
  {
    "id": 2,
    "name": "spring-boot",
    "description": "Spring Boot framework",
    "usageCount": 18
  },
  {
    "id": 3,
    "name": "authentication",
    "description": "User authentication and authorization",
    "usageCount": 12
  }
]
```

### 6.2 Search Tags

**GET** `/tags/search?q={query}`

**Response (Success - 200):**

```json
[
  {
    "id": 1,
    "name": "java",
    "description": "Java programming language",
    "usageCount": 25
  },
  {
    "id": 2,
    "name": "javascript",
    "description": "JavaScript programming language",
    "usageCount": 20
  }
]
```

### 6.3 Get Popular Tags

**GET** `/tags/popular`

**Response (Success - 200):**

```json
[
  {
    "id": 1,
    "name": "java",
    "description": "Java programming language",
    "usageCount": 25
  },
  {
    "id": 2,
    "name": "spring-boot",
    "description": "Spring Boot framework",
    "usageCount": 18
  },
  {
    "id": 3,
    "name": "authentication",
    "description": "User authentication and authorization",
    "usageCount": 12
  }
]
```

---

## 7. Data Models

### 7.1 User Model

```json
{
  "id": "Long",
  "username": "String",
  "email": "String",
  "role": "GUEST | USER | ADMIN",
  "avatarUrl": "String (nullable)",
  "bio": "String (nullable)",
  "reputation": "Integer",
  "createdAt": "LocalDateTime"
}
```

### 7.2 Question Model

```json
{
  "id": "Long",
  "user": "UserDto",
  "title": "String",
  "description": "String",
  "imageUrls": "List<String> (full URLs)",
  "viewCount": "Integer",
  "isClosed": "Boolean",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime",
  "tags": "Set<String>",
  "answerCount": "Integer",
  "hasAcceptedAnswer": "Boolean"
}
```

### 7.3 Answer Model

```json
{
  "id": "Long",
  "user": "UserDto",
  "description": "String",
  "imageUrls": "List<String> (full URLs)",
  "isAccepted": "Boolean",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime",
  "voteCount": "Integer",
  "commentCount": "Integer",
  "userVote": "Integer (1, -1, or 0)"
}
```

### 7.4 Comment Model

```json
{
  "id": "Long",
  "user": "UserDto",
  "content": "String",
  "imageUrls": "List<String> (full URLs)",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime"
}
```

### 7.5 Tag Model

```json
{
  "id": "Long",
  "name": "String",
  "description": "String",
  "usageCount": "Integer"
}
```

---

## 8. Error Responses

All endpoints return consistent error responses:

**Error Response Format:**

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**

- `200`: Success
- `400`: Bad Request (validation errors, invalid data)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

---

## 9. Frontend Integration Notes

### 9.1 Authentication Flow

1. User registers/logs in via `/auth/register` or `/auth/login`
2. Store the returned user ID for subsequent API calls
3. Pass `userId` as a query parameter for authenticated endpoints

### 9.2 Pagination

- Use `page` and `size` parameters for paginated endpoints
- Page numbers start from 0
- Default page size is 10

### 9.3 Search and Filtering

- Use `/questions/search` for question search
- Use `/tags/search` for tag search
- Use `/questions/tag/{tagName}` for filtering by tag

### 9.4 Real-time Features

- Currently no WebSocket implementation
- Consider polling for updates or implementing WebSocket endpoints

### 9.5 File Uploads

- **Avatar Upload**: `POST /api/files/upload/avatar`
- **Question Images**: `POST /api/files/upload/question`
- **Answer Images**: `POST /api/files/upload/answer`
- **Comment Images**: `POST /api/files/upload/comment`
- **File Serving**: `GET /api/files/{directory}/{filename}`
- **File Deletion**: `DELETE /api/files/{filePath}`

**Supported Formats**: JPEG, PNG, GIF, WebP
**Max File Size**: 10MB

### 9.6 Image Retrieval

When you retrieve questions, answers, or comments, the `imageUrls` field will contain a list of full URLs that can be directly used in your frontend:

**Example Response:**

```json
{
  "id": 1,
  "title": "Question with Images",
  "description": "Here's my question...",
  "imageUrls": [
    "/api/files/questions/1/uuid-screenshot1.png",
    "/api/files/questions/1/uuid-screenshot2.jpg"
  ]
}
```

**Frontend Usage:**

```javascript
// Display images in your frontend
question.imageUrls.forEach((imageUrl) => {
  const img = document.createElement("img");
  img.src = `http://localhost:8080${imageUrl}`;
  img.alt = "Question image";
  document.body.appendChild(img);
});
```

**Image URLs are automatically converted to full URLs** when retrieved from the API, so you don't need to manually construct them.

---

## 10. Testing the API

### 10.1 Using curl

**Register a user:**

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Create a question:**

```bash
curl -X POST "http://localhost:8080/api/questions?userId=1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Question",
    "description": "This is a test question",
    "tags": ["test", "api"]
  }'
```

**Get all questions:**

```bash
curl -X GET "http://localhost:8080/api/questions?page=0&size=10"
```

**Upload avatar:**

```bash
curl -X POST http://localhost:8080/api/files/upload/avatar \
  -F "file=@/path/to/avatar.jpg" \
  -F "userId=1"
```

**Create question with images:**

```bash
# First upload images
curl -X POST http://localhost:8080/api/files/upload/question \
  -F "file=@/path/to/screenshot.png" \
  -F "questionId=1"

# Then create question with image URLs
curl -X POST "http://localhost:8080/api/questions?userId=1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Question with Images",
    "description": "Here is my question with screenshots...",
    "tags": ["test", "images"],
    "imageUrls": ["/api/files/questions/1/uuid-screenshot.png"]
  }'
```

**Content Moderation:**

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
    "text_content": "Test message with image",
    "image_url": "https://example.com/image.jpg"
  }'

# Test content creation with moderation (will be blocked if inappropriate)
curl -X POST "http://localhost:8080/api/questions?userId=1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Question",
    "description": "This is a test question with potentially inappropriate content",
    "tags": ["test"],
    "imageUrls": []
  }'
```

### 10.2 Using Postman

1. Import the collection (if available)
2. Set base URL to `http://localhost:8080/api`
3. Update `userId` parameters as needed
4. Test endpoints in sequence

---

## 11. Development Notes

### 11.1 Current Limitations

- No JWT token authentication (using userId parameter)
- No WebSocket real-time updates
- No voting system implementation
- No notification system
- Content moderation requires external service to be running

### 11.2 Future Enhancements

- Implement proper JWT authentication
- Add file upload endpoints
- Implement WebSocket for real-time features
- Add voting system
- Add comment system
- Add notification system
- Add user profile management
- Add question/answer editing
- ✅ Content moderation (implemented)
- Add moderation analytics and reporting
- Add user appeals for blocked content
- Add custom moderation rules per community

### 11.3 Security Considerations

- Currently using simple userId parameter (not secure for production)
- No rate limiting implemented
- No input validation beyond basic requirements
- CORS is set to allow all origins (`*`)
- Content moderation provides protection against inappropriate content
- Moderation service fallback allows content if service is unavailable

---

## 12. File Upload Endpoints

### 12.1 Upload Avatar

**POST** `/files/upload/avatar`

**Form Data:**

- `file` (required): Image file (JPEG, PNG, GIF, WebP)
- `userId` (required): User ID

**Response (Success - 200):**

```json
{
  "filePath": "avatars/uuid-filename.jpg",
  "url": "/api/files/avatars/uuid-filename.jpg",
  "message": "Avatar uploaded successfully"
}
```

### 12.2 Upload Question Image

**POST** `/files/upload/question`

**Form Data:**

- `file` (required): Image file (JPEG, PNG, GIF, WebP)
- `questionId` (required): Question ID

**Response (Success - 200):**

```json
{
  "filePath": "questions/1/uuid-filename.jpg",
  "url": "/api/files/questions/1/uuid-filename.jpg",
  "message": "Question image uploaded successfully"
}
```

### 12.3 Upload Answer Image

**POST** `/files/upload/answer`

**Form Data:**

- `file` (required): Image file (JPEG, PNG, GIF, WebP)
- `answerId` (required): Answer ID

**Response (Success - 200):**

```json
{
  "filePath": "answers/1/uuid-filename.jpg",
  "url": "/api/files/answers/1/uuid-filename.jpg",
  "message": "Answer image uploaded successfully"
}
```

### 12.4 Upload Comment Image

**POST** `/files/upload/comment`

**Form Data:**

- `file` (required): Image file (JPEG, PNG, GIF, WebP)
- `commentId` (required): Comment ID

**Response (Success - 200):**

```json
{
  "filePath": "comments/1/uuid-filename.jpg",
  "url": "/api/files/comments/1/uuid-filename.jpg",
  "message": "Comment image uploaded successfully"
}
```

### 12.5 Serve File

**GET** `/files/{directory}/{filename}`

**Response (Success - 200):**

- Returns the image file with appropriate content type

### 12.6 Delete File

**DELETE** `/files/{filePath}`

**Response (Success - 200):**

```json
{
  "message": "File deleted successfully"
}
```

---

## 13. Content Moderation Endpoints

The StackIt platform includes AI-powered content moderation that automatically screens all user-generated content (questions, answers, comments, and images) before publication.

### 13.1 Moderation Service Health Check

**GET** `/moderation/health`

Check if the content moderation service is healthy and available.

**Response (Success - 200):**

```json
{
  "status": "healthy",
  "service": "content_moderation",
  "backend_connected": true
}
```

**Response (Service Unavailable - 200):**

```json
{
  "status": "unhealthy",
  "service": "content_moderation",
  "backend_connected": false
}
```

### 13.2 Moderate Text Content

**POST** `/moderation/text`

Moderate text content using AI models and pattern matching.

**Request Body:**

```json
{
  "content": "Text content to moderate",
  "content_type": "question"
}
```

**Content Types:**

- `question` - Question title and description
- `answer` - Answer description
- `comment` - Comment text
- `text` - Generic text content

**Response (Success - 200):**

```json
{
  "is_appropriate": true,
  "confidence": 0.92,
  "categories": {
    "normal": 0.92,
    "safe": 0.95
  },
  "flagged_reasons": [],
  "moderation_action": "allow"
}
```

**Response (Content Blocked - 200):**

```json
{
  "is_appropriate": false,
  "confidence": 0.85,
  "categories": {
    "profanity": 0.85,
    "inappropriate": 0.78
  },
  "flagged_reasons": ["profanity", "inappropriate language"],
  "moderation_action": "block"
}
```

### 13.3 Moderate Image by URL

**POST** `/moderation/image`

Moderate image content using computer vision techniques.

**Request Body:**

```json
{
  "image_url": "https://example.com/image.jpg"
}
```

**Response (Success - 200):**

```json
{
  "is_appropriate": true,
  "confidence": 0.88,
  "categories": {
    "normal": 0.88,
    "safe": 0.92
  },
  "flagged_reasons": [],
  "moderation_action": "allow"
}
```

**Response (Image Blocked - 200):**

```json
{
  "is_appropriate": false,
  "confidence": 0.76,
  "categories": {
    "nsfw": 0.76,
    "inappropriate": 0.82
  },
  "flagged_reasons": ["nsfw content", "inappropriate imagery"],
  "moderation_action": "block"
}
```

### 13.4 Batch Moderation

**POST** `/moderation/batch`

Moderate both text and images in a single request.

**Request Body:**

```json
{
  "text_content": "Text content to moderate",
  "image_url": "https://example.com/image.jpg"
}
```

**Response (Success - 200):**

```json
{
  "results": {
    "text": {
      "is_appropriate": true,
      "confidence": 0.92,
      "categories": { "normal": 0.92 },
      "flagged_reasons": [],
      "moderation_action": "allow"
    },
    "image": {
      "is_appropriate": true,
      "confidence": 0.88,
      "categories": { "normal": 0.88 },
      "flagged_reasons": [],
      "moderation_action": "allow"
    }
  },
  "overall_decision": "allow"
}
```

### 13.5 Content Moderation Error Responses

When content is blocked during creation/update operations, the API returns a 403 Forbidden status with detailed information:

**Response (Content Blocked - 403):**

```json
{
  "error": "Question content violates community guidelines: profanity detected",
  "type": "content_moderation",
  "contentType": "question",
  "moderationAction": "block",
  "status": "blocked"
}
```

### 13.6 Moderation Actions

The moderation service can take three actions:

| Action  | Description                | HTTP Status           |
| ------- | -------------------------- | --------------------- |
| `allow` | Content is appropriate     | 200 OK                |
| `flag`  | Content should be reviewed | 200 OK (with warning) |
| `block` | Content should be rejected | 403 Forbidden         |

### 13.7 Automatic Content Moderation

All content creation and update endpoints automatically include moderation:

- **Questions**: Title + description and images are moderated
- **Answers**: Description and images are moderated
- **Comments**: Comment text and images are moderated

If the moderation service is unavailable, content is automatically allowed to prevent service disruption.

---

## 14. CORS & ngrok Notes

- If using ngrok, set your backend CORS config to allow your ngrok URL (e.g., `https://abc12345.ngrok-free.app`).
- All API endpoints are under `/api` (e.g., `/api/questions`).
- For local and ngrok testing, update your Postman `baseUrl` accordingly.

---

## 15. Quick Start for Frontend

1. **Start the backend server:**

   ```bash
   cd backend
   ./gradlew bootRun
   ```

2. **Test the API is running:**

   ```bash
   curl http://localhost:8080/api/tags
   ```

3. **Register a test user:**

   ```bash
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "password123",
       "confirmPassword": "password123"
     }'
   ```

4. **Test content moderation (optional):**

   ```bash
   # Check if moderation service is running
   curl http://localhost:8080/api/moderation/health

   # Test text moderation
   curl -X POST http://localhost:8080/api/moderation/text \
     -H "Content-Type: application/json" \
     -d '{"content": "Test message", "content_type": "question"}'
   ```

5. **Start building your frontend!**

The API is ready to use with the endpoints documented above. Remember to handle errors appropriately and implement proper loading states in your frontend application.

**Note**: Content moderation is automatically applied to all user-generated content. If the moderation service is not running, content will be allowed automatically to prevent service disruption.
