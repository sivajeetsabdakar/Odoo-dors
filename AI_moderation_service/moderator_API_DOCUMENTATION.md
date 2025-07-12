# StackIt Content Moderation API Documentation

## Overview

The StackIt Content Moderation API is a free, open-source content moderation service that uses AI and computer vision to moderate text and images. It provides a RESTful API with support for both file uploads and URL-based content moderation.

**Base URL:** `http://localhost:8000` (development)  
**Version:** 1.0.0 (Free Version)  
**Cost:** Completely FREE - No paid APIs required

## Features

- ✅ **Text Moderation** - Profanity, hate speech, threats, spam detection
- 🖼️ **Image Moderation** - NSFW, violence, inappropriate content detection
- 📦 **Batch Moderation** - Process multiple content types in one request
- 🌐 **URL Support** - Moderate content from URLs (images)
- 📊 **Detailed Results** - Confidence scores, categories, and flagged reasons

## Authentication

Currently, no authentication is required for the free version. For production use, implement proper authentication.

## Rate Limits

- **Text moderation:** 100 requests/minute
- **Image moderation:** 50 requests/minute  
- **Batch moderation:** 30 requests/minute

## Response Format

All endpoints return responses in the following format:

```json
{
  "is_appropriate": true,
  "confidence": 0.85,
  "categories": {
    "normal": 0.85,
    "safe": 0.90
  },
  "flagged_reasons": [],
  "moderation_action": "allow"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `is_appropriate` | boolean | Whether the content is appropriate |
| `confidence` | float | Confidence score (0.0-1.0) |
| `categories` | object | Detection categories with scores |
| `flagged_reasons` | array | List of reasons why content was flagged |
| `moderation_action` | string | Final decision: "allow", "flag", or "block" |

## Endpoints

### 1. Health Check

**GET** `/health`

Check if the service is running and models are loaded.

**Response:**
```json
{
  "status": "healthy",
  "service": "content_moderation",
  "version": "free",
  "models_loaded": {
    "text_moderator": true,
    "image_moderator": true
  }
}
```

**Example:**
```bash
curl http://localhost:8000/health
```

### 2. Service Information

**GET** `/info`

Get detailed information about the service capabilities.

**Response:**
```json
{
  "service_name": "StackIt Content Moderation API",
  "version": "1.0.0 (Free Version)",
  "description": "AI-powered content moderation using only free and open-source tools",
  "features": {
    "text_moderation": {
      "models": ["Hugging Face Toxic-BERT", "Sentiment Analysis", "Custom Patterns"],
      "capabilities": ["Profanity", "Hate Speech", "Threats", "Spam", "Sentiment Analysis"]
    },
    "image_moderation": {
      "models": ["OpenCV Cascade Classifiers", "Color Analysis", "Texture Analysis"],
      "capabilities": ["Skin Tone Detection", "Object Detection", "Color Analysis", "Size Validation"]
    },
    
  },
  "cost": "Free - No paid APIs required",
  "technologies": ["FastAPI", "Hugging Face Transformers", "OpenCV", "PIL", "NLTK", "TextBlob"]
}
```

**Example:**
```bash
curl http://localhost:8000/info
```

### 3. Text Moderation

**POST** `/moderate/text`

Moderate text content using AI models and pattern matching.

**Request Body:**
```json
{
  "content": "Your text content here",
  "content_type": "text"
}
```

**Parameters:**
- `content` (string, required): The text to moderate
- `content_type` (string, optional): Type of content ("text", "question", "answer", "comment")

**Response:**
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

**Examples:**

```bash
# Using curl
curl -X POST "http://localhost:8000/moderate/text" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "How do I implement a binary search tree in Python?",
    "content_type": "question"
  }'

# Using Python requests
import requests

response = requests.post(
    "http://localhost:8000/moderate/text",
    json={
        "content": "This is a test message",
        "content_type": "comment"
    }
)
result = response.json()
```

### 4. Image Moderation

**POST** `/moderate/image`

Moderate image content using computer vision techniques. Supports both file uploads and URLs.

**Request Options:**

**Option A: File Upload**
```bash
curl -X POST "http://localhost:8000/moderate/image" \
  -F "file=@image.jpg"
```

**Option B: Image URL**
```bash
curl -X POST "http://localhost:8000/moderate/image" \
  -F "image_url=https://example.com/image.jpg"
```

**Parameters:**
- `file` (file, optional): Image file to upload
- `image_url` (string, optional): URL of the image to moderate

**Note:** Either `file` or `image_url` must be provided, but not both.

**Response:**
```json
{
  "is_appropriate": true,
  "confidence": 0.85,
  "categories": {
    "normal": 0.85,
    "safe": 0.90
  },
  "flagged_reasons": [],
  "moderation_action": "allow"
}
```

**Supported Image Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- BMP (.bmp)
- WebP (.webp)

**Examples:**

```python
import requests

# File upload
with open('image.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:8000/moderate/image', files=files)

# URL-based
data = {'image_url': 'https://example.com/image.jpg'}
response = requests.post('http://localhost:8000/moderate/image', data=data)

result = response.json()
```

### 5. Batch Moderation

**POST** `/moderate/batch`

Moderate multiple content types in a single request. Supports files and URLs.

**Request Options:**

**Option A: Files Only**
```bash
curl -X POST "http://localhost:8000/moderate/batch" \
  -F "text_content=Your text here" \
  -F "image_file=@image.jpg"
```

**Option B: URLs Only**
```bash
curl -X POST "http://localhost:8000/moderate/batch" \
  -F "text_content=Your text here" \
  -F "image_url=https://example.com/image.jpg"
```

**Option C: Mixed (Files + URLs)**
```bash
curl -X POST "http://localhost:8000/moderate/batch" \
  -F "text_content=Your text here" \
  -F "image_file=@image.jpg"
```

**Parameters:**
- `text_content` (string, optional): Text to moderate
- `image_file` (file, optional): Image file to upload
- `image_url` (string, optional): URL of image to moderate

**Response:**
```json
{
  "results": {
    "text": {
      "is_appropriate": true,
      "confidence": 0.92,
      "categories": {"normal": 0.92},
      "flagged_reasons": [],
      "moderation_action": "allow"
    },
    "image": {
      "is_appropriate": true,
      "confidence": 0.85,
      "categories": {"normal": 0.85},
      "flagged_reasons": [],
      "moderation_action": "allow"
    }
  },
  "overall_decision": "allow"
}
```

**Examples:**

```python
import requests

# Mixed content types
files = {
    'image_file': open('image.jpg', 'rb')
}
data = {
    'text_content': 'This is a test message',
    'image_url': 'https://example.com/another-image.jpg'
}

response = requests.post('http://localhost:8000/moderate/batch', files=files, data=data)
result = response.json()
```

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 413 | Payload Too Large |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Error Scenarios

**Invalid URL:**
```json
{
  "detail": "Failed to download image from URL: Connection timeout"
}
```

**Unsupported Format:**
```json
{
  "detail": "File must be an image"
}
```

**Missing Required Field:**
```json
{
  "detail": "Either file or image_url must be provided"
}
```

**File Too Large:**
```json
{
  "detail": "File size exceeds maximum limit of 100MB"
}
```

## Content Categories

### Text Moderation Categories

| Category | Description | Threshold |
|----------|-------------|-----------|
| `profanity` | Profane language detected | 0.6 |
| `hate_speech` | Hate speech or discrimination | 0.7 |
| `threats` | Violent threats or intimidation | 0.8 |
| `spam` | Spam or promotional content | 0.5 |
| `all_caps` | Excessive capitalization | 0.8 |
| `excessive_punctuation` | Too many punctuation marks | 0.7 |

### Image Moderation Categories

| Category | Description | Threshold |
|----------|-------------|-----------|
| `high_skin_tone` | High percentage of skin-like colors | 0.4 |
| `red_dominance` | Dominant red colors (potential violence) | 0.6 |
| `faces_detected` | Number of faces detected | >5 faces |
| `bodies_detected` | Number of bodies detected | >3 bodies |
| `high_edge_density` | High edge density (potential weapons) | 0.1 |
| `large_size` | Image exceeds size limits | >10MB |
| `unsupported_format` | Unsupported image format | N/A |



## Moderation Actions

### Action Types

| Action | Description | When Applied |
|--------|-------------|--------------|
| `allow` | Content is appropriate | Low risk, normal content |
| `flag` | Content should be reviewed | Medium risk, suspicious content |
| `block` | Content should be rejected | High risk, inappropriate content |

### Decision Logic

**Text Moderation:**
- `allow`: No concerning patterns detected
- `flag`: Profanity, spam, or excessive formatting
- `block`: Hate speech, threats, or severe violations

**Image Moderation:**
- `allow`: Normal images with low risk indicators
- `flag`: High skin tone, red dominance, or multiple faces
- `block`: Unsupported formats or processing errors



## Performance & Limits

### File Size Limits

| Content Type | Maximum Size |
|--------------|--------------|
| Images | 10 MB |
| Text | 10,000 characters |

### Processing Times

| Content Type | Average Time |
|--------------|--------------|
| Text | <100ms |
| Images | 1-3 seconds |
| Batch | Sum of individual processing times |

### Supported Formats

**Images:** JPEG, PNG, GIF, BMP, WebP  
**Text:** Any UTF-8 encoded text

## Best Practices

### 1. Error Handling

Always implement proper error handling:

```python
try:
    response = requests.post(url, data=data, files=files)
    response.raise_for_status()
    result = response.json()
except requests.exceptions.RequestException as e:
    print(f"Request failed: {e}")
except ValueError as e:
    print(f"Invalid response: {e}")
```

### 2. Timeout Configuration

Set appropriate timeouts for different content types:

```python
# Text moderation (fast)
response = requests.post(url, json=data, timeout=5)

# Image moderation (medium)
response = requests.post(url, files=files, timeout=30)
```

### 3. Batch Processing

Use batch moderation for multiple content types:

```python
# Efficient: Single request
batch_data = {
    'text_content': text,
    'image_url': image_url
}
response = requests.post('/moderate/batch', data=batch_data)

# Inefficient: Multiple requests
requests.post('/moderate/text', json={'content': text})
requests.post('/moderate/image', data={'image_url': image_url})
```

### 4. URL Validation

Validate URLs before sending:

```python
import re

def is_valid_url(url):
    pattern = r'^https?://.+'
    return bool(re.match(pattern, url))

if is_valid_url(image_url):
    response = requests.post('/moderate/image', data={'image_url': image_url})
```

## Integration Examples

### Python Integration

```python
import requests
import json

class ContentModerator:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
    
    def moderate_text(self, content, content_type="text"):
        response = requests.post(
            f"{self.base_url}/moderate/text",
            json={"content": content, "content_type": content_type}
        )
        return response.json()
    
    def moderate_image_url(self, image_url):
        response = requests.post(
            f"{self.base_url}/moderate/image",
            data={"image_url": image_url}
        )
        return response.json()
    
    def moderate_batch(self, text=None, image_url=None):
        data = {}
        if text:
            data['text_content'] = text
        if image_url:
            data['image_url'] = image_url
        
        response = requests.post(f"{self.base_url}/moderate/batch", data=data)
        return response.json()

# Usage
moderator = ContentModerator()

# Moderate text
result = moderator.moderate_text("This is a test message")
print(f"Text result: {result['moderation_action']}")

# Moderate image from URL
result = moderator.moderate_image_url("https://example.com/image.jpg")
print(f"Image result: {result['moderation_action']}")

# Batch moderation
result = moderator.moderate_batch(
    text="Test message",
    image_url="https://example.com/image.jpg"
)
print(f"Batch result: {result['overall_decision']}")
```

### JavaScript/Node.js Integration

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class ContentModerator {
    constructor(baseUrl = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
    }

    async moderateText(content, contentType = 'text') {
        const response = await axios.post(`${this.baseUrl}/moderate/text`, {
            content,
            content_type: contentType
        });
        return response.data;
    }

    async moderateImageUrl(imageUrl) {
        const formData = new FormData();
        formData.append('image_url', imageUrl);
        
        const response = await axios.post(`${this.baseUrl}/moderate/image`, formData, {
            headers: formData.getHeaders()
        });
        return response.data;
    }

    async moderateImageFile(imagePath) {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imagePath));
        
        const response = await axios.post(`${this.baseUrl}/moderate/image`, formData, {
            headers: formData.getHeaders()
        });
        return response.data;
    }

    async moderateBatch(text, imageUrl) {
        const formData = new FormData();
        if (text) formData.append('text_content', text);
        if (imageUrl) formData.append('image_url', imageUrl);
        
        const response = await axios.post(`${this.baseUrl}/moderate/batch`, formData, {
            headers: formData.getHeaders()
        });
        return response.data;
    }
}

// Usage
const moderator = new ContentModerator();

async function testModeration() {
    try {
        // Text moderation
        const textResult = await moderator.moderateText('This is a test message');
        console.log('Text result:', textResult.moderation_action);

        // Image moderation from URL
        const imageResult = await moderator.moderateImageUrl('https://example.com/image.jpg');
        console.log('Image result:', imageResult.moderation_action);

        // Batch moderation
        const batchResult = await moderator.moderateBatch(
            'Test message',
            'https://example.com/image.jpg'
        );
        console.log('Batch result:', batchResult.overall_decision);
    } catch (error) {
        console.error('Moderation error:', error.response?.data || error.message);
    }
}

testModeration();
```

## Cost Comparison

### Free vs Paid Services

| Service | Text | Image | Monthly Cost (1000 requests) |
|---------|------|-------|------------------------------|
| **StackIt (Free)** | ✅ FREE | ✅ FREE | **$0** |
| Google Cloud Vision | $1.50/1000 | $1.50/1000 | **$3,000** |
| AWS Rekognition | $1.00/1000 | $1.00/1000 | **$2,000** |
| Azure Content Moderator | $1.00/1000 | $1.00/1000 | **$2,000** |

**Monthly Savings:** $3,000+ for typical usage

## Support & Resources

- **GitHub Repository:** [Link to repo]
- **Documentation:** This file
- **Testing Guide:** `TESTING_GUIDE.md`
- **Examples:** `test_moderation.py`

## Changelog

### Version 1.0.0 (Current)
- ✅ Text moderation with AI models
- ✅ Image moderation with computer vision
- ✅ URL support for images
- ✅ Batch moderation capabilities
- ✅ Comprehensive error handling
- ✅ Detailed response format
- ✅ Free and open-source

---

**Note:** This is the free version of the StackIt Content Moderation API. For enterprise features, contact the development team. 