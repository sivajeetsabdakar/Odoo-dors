# Content Moderation API

AI-powered content moderation for text and images using free, open-source tools.

## Requirements

- Python 3.8+
- No API keys required

## Installation

```bash
cd moderation_service
pip install -r requirements.txt
python app.py
```

## API Endpoints

### Base URL
```
http://localhost:8000
```

### Health Check
```http
GET /health
```

### Text Moderation
```http
POST /moderate/text
Content-Type: application/json

{
  "content": "Your text content",
  "content_type": "question"
}
```

### Image Moderation
```http
POST /moderate/image
Content-Type: multipart/form-data

file: [image file]
```

### Batch Moderation
```http
POST /moderate/batch
Content-Type: multipart/form-data

text_content: "Optional text"
image_file: [optional image file]
```

## Response Format

```json
{
  "is_appropriate": true,
  "confidence": 0.95,
  "categories": {
    "toxic": 0.1,
    "hate": 0.05
  },
  "flagged_reasons": [],
  "moderation_action": "allow"
}
```

## Moderation Actions

- `allow`: Content is appropriate
- `flag`: Content needs review
- `block`: Content is inappropriate

## Detection Categories

### Text
- Profanity, hate speech, threats, spam
- Sentiment analysis
- Custom pattern matching

### Images
- Skin tone detection
- Color analysis
- Object detection (faces, bodies)
- Size validation

## Testing

```bash
# Health check
curl http://localhost:8000/health

# Text moderation
curl -X POST "http://localhost:8000/moderate/text" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message", "content_type": "text"}'
```

## Docker

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
``` 