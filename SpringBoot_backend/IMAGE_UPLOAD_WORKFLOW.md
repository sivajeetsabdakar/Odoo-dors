# Image Upload and Retrieval Workflow - StackIt Platform

## 📋 **Overview**

This document explains how images are uploaded, stored, and retrieved in the StackIt Q&A platform. Images can be attached to questions, answers, comments, and user profiles.

## 🔄 **Complete Workflow**

### **Step 1: Upload Images**

First, upload images using the file upload endpoints:

```bash
# Upload question images
curl -X POST http://localhost:8080/api/files/upload/question \
  -F "file=@/path/to/screenshot1.png" \
  -F "questionId=1"

# Response:
{
  "filePath": "questions/1/uuid-screenshot1.png",
  "url": "/api/files/questions/1/uuid-screenshot1.png",
  "message": "Question image uploaded successfully"
}

# Upload another image
curl -X POST http://localhost:8080/api/files/upload/question \
  -F "file=@/path/to/screenshot2.jpg" \
  -F "questionId=1"

# Response:
{
  "filePath": "questions/1/uuid-screenshot2.jpg",
  "url": "/api/files/questions/1/uuid-screenshot2.jpg",
  "message": "Question image uploaded successfully"
}
```

### **Step 2: Create Content with Images**

Use the returned URLs when creating questions, answers, or comments:

```bash
# Create question with images
curl -X POST "http://localhost:8080/api/questions?userId=1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to implement authentication?",
    "description": "I need help with JWT authentication. Here are some screenshots of my current setup...",
    "tags": ["authentication", "jwt", "spring-boot"],
    "imageUrls": [
      "/api/files/questions/1/uuid-screenshot1.png",
      "/api/files/questions/1/uuid-screenshot2.jpg"
    ]
  }'
```

### **Step 3: Retrieve Content with Images**

When you retrieve the content, images are automatically included as full URLs:

```bash
# Get question by ID
curl -X GET "http://localhost:8080/api/questions/1"

# Response:
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
  "description": "I need help with JWT authentication. Here are some screenshots of my current setup...",
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

## 🖼️ **Image Storage Structure**

```
uploads/
├── avatars/
│   └── uuid-avatar.jpg
├── questions/
│   └── 1/
│       ├── uuid-screenshot1.png
│       └── uuid-screenshot2.jpg
├── answers/
│   └── 1/
│       ├── uuid-diagram.jpg
│       └── uuid-code-screenshot.png
└── comments/
    └── 1/
        └── uuid-image.png
```

## 📱 **Frontend Integration Examples**

### **React Example**

```jsx
import React, { useState, useEffect } from "react";

function QuestionDetail({ questionId }) {
  const [question, setQuestion] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Fetch question
    fetch(`/api/questions/${questionId}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestion(data);
        setImages(data.imageUrls || []);
      });
  }, [questionId]);

  return (
    <div>
      <h1>{question?.title}</h1>
      <p>{question?.description}</p>

      {/* Display images */}
      <div className="question-images">
        {images.map((imageUrl, index) => (
          <img
            key={index}
            src={`http://localhost:8080${imageUrl}`}
            alt={`Question image ${index + 1}`}
            style={{ maxWidth: "100%", margin: "10px 0" }}
          />
        ))}
      </div>
    </div>
  );
}
```

### **Image Upload Component**

```jsx
import React, { useState } from "react";

function ImageUpload({ questionId, onImagesUploaded }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map((file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("questionId", questionId);

        return fetch("/api/files/upload/question", {
          method: "POST",
          body: formData,
        }).then((res) => res.json());
      });

      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map((result) => result.url);

      onImagesUploaded(imageUrls);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading images...</p>}
    </div>
  );
}
```

## 🔧 **Technical Details**

### **Image Processing**

1. **Upload**: Images are validated and stored with UUID filenames
2. **Storage**: Images are stored in organized directories
3. **URL Conversion**: Relative paths are converted to full URLs automatically
4. **Retrieval**: Images are served via `/api/files/{directory}/{filename}`

### **Data Flow**

```
Frontend Upload → FileController → FileUploadService → File System
                                                      ↓
Database Storage ← QuestionService ← ImageService ← URL Processing
                                                      ↓
Frontend Display ← QuestionController ← ImageService ← Full URL Generation
```

### **Image URL Conversion**

- **Storage**: `questions/1/uuid-image.png` (relative path)
- **Retrieval**: `/api/files/questions/1/uuid-image.png` (full URL)

## 🚀 **Best Practices**

### **For Frontend Developers**

1. **Always check for imageUrls array**: Some content may not have images
2. **Handle loading states**: Images may take time to load
3. **Provide fallbacks**: Show placeholder for failed image loads
4. **Optimize image display**: Use appropriate sizing and lazy loading

### **For Backend Developers**

1. **Image validation**: Check file type and size
2. **Cleanup**: Delete old images when content is deleted
3. **Security**: Validate file paths to prevent directory traversal
4. **Performance**: Consider image compression and CDN for production

## 🧪 **Testing**

### **Test Image Upload**

```bash
# Create a test image
echo "test image content" > test-image.jpg

# Upload it
curl -X POST http://localhost:8080/api/files/upload/question \
  -F "file=@test-image.jpg" \
  -F "questionId=1"

# Verify it's accessible
curl -I http://localhost:8080/api/files/questions/1/uuid-test-image.jpg
```

### **Test Complete Workflow**

```bash
# 1. Upload images
curl -X POST http://localhost:8080/api/files/upload/question \
  -F "file=@screenshot1.png" \
  -F "questionId=1"

# 2. Create question with images
curl -X POST "http://localhost:8080/api/questions?userId=1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Question",
    "description": "Test description with images",
    "tags": ["test"],
    "imageUrls": ["/api/files/questions/1/uuid-screenshot1.png"]
  }'

# 3. Retrieve and verify images
curl -X GET "http://localhost:8080/api/questions/1" | jq '.imageUrls'
```

This workflow ensures that images are properly uploaded, stored, and retrieved in your StackIt Q&A platform! 🎉
