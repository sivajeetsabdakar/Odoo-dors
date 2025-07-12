# Content Moderation Integration

## Overview

The StackIt backend now includes comprehensive content moderation capabilities that automatically screen all user-generated content (questions, answers, comments, and images) before they are published. This integration uses an external AI-powered moderation service to ensure community guidelines are followed.

## Features

- ✅ **Text Moderation** - Screens questions, answers, and comments for inappropriate content
- 🖼️ **Image Moderation** - Analyzes uploaded images for NSFW or inappropriate content
- 🔄 **Automatic Integration** - All content creation and updates are automatically moderated
- 🛡️ **Graceful Fallback** - If moderation service is unavailable, content is allowed (configurable)
- 📊 **Detailed Feedback** - Provides specific reasons why content was blocked

## Configuration

### Application Properties

Add these properties to `application.properties`:

```properties
# Content Moderation Configuration
moderation.api.base-url=https://d1946e5cd06f.ngrok-free.app
moderation.api.enabled=true
moderation.api.timeout=30000
```

### Configuration Options

| Property                  | Default                               | Description                          |
| ------------------------- | ------------------------------------- | ------------------------------------ |
| `moderation.api.base-url` | `https://d1946e5cd06f.ngrok-free.app` | Base URL of the moderation service   |
| `moderation.api.enabled`  | `true`                                | Enable/disable content moderation    |
| `moderation.api.timeout`  | `30000`                               | Timeout for API calls (milliseconds) |

## Integration Points

### 1. Question Creation/Updates

**Service:** `QuestionService`
**Methods:** `createQuestion()`, `updateQuestion()`

**Moderation Applied:**

- Text content (title + description)
- Image URLs (if present)

**Example:**

```java
// Text moderation
String textContent = request.getTitle() + " " + request.getDescription();
ModerationDto.ModerationResponse textModeration = contentModerationService.moderateText(textContent, "question");

if (contentModerationService.isContentBlocked(textModeration)) {
    throw new ContentModerationException(
        "Question content violates community guidelines: " + String.join(", ", textModeration.getFlaggedReasons()),
        textContent,
        "question",
        textModeration.getModerationAction()
    );
}
```

### 2. Answer Creation/Updates

**Service:** `AnswerService`
**Methods:** `createAnswer()`, `updateAnswer()`

**Moderation Applied:**

- Text content (description)
- Image URLs (if present)

### 3. Comment Creation/Updates

**Service:** `CommentService`
**Methods:** `createComment()`, `updateComment()`

**Moderation Applied:**

- Text content (comment text)
- Image URLs (if present)

## API Endpoints

### Moderation Health Check

**GET** `/api/moderation/health`

Check if the moderation service is healthy.

**Response:**

```json
{
  "status": "healthy",
  "service": "content_moderation",
  "backend_connected": true
}
```

### Text Moderation

**POST** `/api/moderation/text`

Moderate text content directly.

**Request:**

```json
{
  "content": "Text to moderate",
  "content_type": "question"
}
```

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

### Image Moderation

**POST** `/api/moderation/image`

Moderate image by URL.

**Request:**

```json
{
  "image_url": "https://example.com/image.jpg"
}
```

### Batch Moderation

**POST** `/api/moderation/batch`

Moderate both text and images in one request.

**Request:**

```json
{
  "text_content": "Text to moderate",
  "image_url": "https://example.com/image.jpg"
}
```

## Error Handling

### ContentModerationException

When content is blocked, a `ContentModerationException` is thrown with details:

```java
throw new ContentModerationException(
    "Question content violates community guidelines: profanity detected",
    content,
    "question",
    "block"
);
```

### Global Exception Handler

The `GlobalExceptionHandler` automatically catches moderation exceptions and returns appropriate HTTP responses:

**Response (403 Forbidden):**

```json
{
  "error": "Question content violates community guidelines: profanity detected",
  "type": "content_moderation",
  "contentType": "question",
  "moderationAction": "block",
  "status": "blocked"
}
```

## Content Types

The moderation service supports different content types for better accuracy:

| Content Type | Description                    | Used For     |
| ------------ | ------------------------------ | ------------ |
| `question`   | Question title and description | Questions    |
| `answer`     | Answer description             | Answers      |
| `comment`    | Comment text                   | Comments     |
| `text`       | Generic text content           | General text |
| `image`      | Image content                  | All images   |

## Moderation Actions

The moderation service can take three actions:

| Action  | Description                | HTTP Status           |
| ------- | -------------------------- | --------------------- |
| `allow` | Content is appropriate     | 200 OK                |
| `flag`  | Content should be reviewed | 200 OK (with warning) |
| `block` | Content should be rejected | 403 Forbidden         |

## Fallback Behavior

If the moderation service is unavailable or disabled:

1. **Service Unavailable**: Content is allowed to prevent service disruption
2. **Disabled**: All content is automatically allowed
3. **Timeout**: Content is allowed after timeout period
4. **API Errors**: Content is allowed with error logging

## Logging

The moderation service provides comprehensive logging:

```java
logger.info("Text moderation result: {} (confidence: {})",
    result.getModerationAction(), result.getConfidence());
logger.error("HTTP error during text moderation: {}", e.getMessage());
```

## Testing

### Test Moderation Service

1. **Health Check:**

```bash
curl http://localhost:8080/api/moderation/health
```

2. **Text Moderation:**

```bash
curl -X POST http://localhost:8080/api/moderation/text \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message", "content_type": "question"}'
```

3. **Image Moderation:**

```bash
curl -X POST http://localhost:8080/api/moderation/image \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/image.jpg"}'
```

### Test Content Creation

1. **Create Question with Inappropriate Content:**

```bash
curl -X POST http://localhost:8080/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inappropriate Title",
    "description": "Inappropriate content here",
    "tags": ["java"],
    "userId": 1
  }'
```

Expected response (403 Forbidden):

```json
{
  "error": "Question content violates community guidelines: profanity detected",
  "type": "content_moderation",
  "contentType": "question",
  "moderationAction": "block",
  "status": "blocked"
}
```

## Security Considerations

1. **API Key Management**: The moderation service currently doesn't require authentication for the free version
2. **Content Privacy**: Text content is sent to the external moderation service
3. **Image URLs**: Only image URLs are sent, not the actual image files
4. **Error Handling**: Sensitive information is not exposed in error messages
5. **Rate Limiting**: The moderation service has built-in rate limits

## Monitoring

### Health Monitoring

Monitor the moderation service health:

```bash
# Check service health
curl http://localhost:8080/api/moderation/health

# Check application health (includes moderation)
curl http://localhost:8080/actuator/health
```

### Log Monitoring

Monitor these log patterns:

- `ContentModerationService` - Moderation service interactions
- `ContentModerationException` - Blocked content events
- `GlobalExceptionHandler` - Exception handling

## Troubleshooting

### Common Issues

1. **Moderation Service Unavailable**

   - Check if the service is running on the configured URL
   - Verify network connectivity
   - Check service logs

2. **Content Always Allowed**

   - Verify `moderation.api.enabled=true`
   - Check service health endpoint
   - Review error logs

3. **Timeout Issues**
   - Increase `moderation.api.timeout` value
   - Check network latency
   - Consider using batch moderation for multiple images

### Debug Mode

Enable debug logging:

```properties
logging.level.com.stackit.backend.service.ContentModerationService=DEBUG
```

## Future Enhancements

1. **Caching**: Cache moderation results for repeated content
2. **Batch Processing**: Process multiple content items in parallel
3. **Custom Rules**: Allow custom moderation rules per community
4. **User Appeals**: Allow users to appeal blocked content
5. **Analytics**: Track moderation statistics and trends
6. **Machine Learning**: Train custom models for specific content types

## Dependencies

The moderation integration requires:

- Spring Boot Web (for REST client)
- Jackson (for JSON serialization)
- SLF4J (for logging)

No additional external dependencies are required beyond the existing Spring Boot stack.
