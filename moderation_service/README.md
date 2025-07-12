# StackIt Content Moderation API (Free Version)

AI-powered content moderation for text, images, and videos using **only free and open-source tools**. No paid APIs required!

## 🚀 Features

- **Text Moderation**: Detects profanity, hate speech, threats, and spam using Hugging Face models
- **Image Moderation**: Analyzes images for inappropriate content using OpenCV and computer vision
- **Video Moderation**: Extracts and analyzes key frames from videos
- **Batch Processing**: Moderate multiple content types in a single request
- **Configurable Thresholds**: Adjustable sensitivity levels for different content types
- **Real-time API**: Fast REST API for integration with your backend
- **100% Free**: No paid APIs, no usage limits, no costs

## 📋 Requirements

- Python 3.8+
- **No API keys required!** - Everything is free and open-source

## 🛠️ Installation

1. **Clone or download the moderation service**
2. **Install dependencies**:
   ```bash
   cd moderation_service
   pip install -r requirements.txt
   ```

3. **Start the service**:
   ```bash
   python app.py
   ```

That's it! No API keys, no configuration needed.

## 🚀 Running the Service

```bash
# Start the server
python app.py

# Or using uvicorn directly
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. Health Check
```http
GET /health
```

#### 2. Moderate Text
```http
POST /moderate/text
Content-Type: application/json

{
  "content": "Your text content here",
  "content_type": "question"  // "text", "question", "answer", "comment"
}
```

**Response:**
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

#### 3. Moderate Image
```http
POST /moderate/image
Content-Type: multipart/form-data

file: [image file]
```

#### 4. Moderate Video
```http
POST /moderate/video
Content-Type: multipart/form-data

file: [video file]
```

#### 5. Batch Moderation
```http
POST /moderate/batch
Content-Type: multipart/form-data

text_content: "Optional text content"
image_file: [optional image file]
video_file: [optional video file]
```

#### 6. Service Information
```http
GET /info
```

## 🔧 Integration with Your Backend

### Example Integration (Node.js/Express)

```javascript
const axios = require('axios');

async function moderateContent(content, type) {
  try {
    let response;
    
    if (type === 'text') {
      response = await axios.post('http://localhost:8000/moderate/text', {
        content: content,
        content_type: 'question'
      });
    } else if (type === 'image') {
      const formData = new FormData();
      formData.append('file', content);
      
      response = await axios.post('http://localhost:8000/moderate/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    const result = response.data;
    
    if (result.moderation_action === 'block') {
      throw new Error('Content blocked: ' + result.flagged_reasons.join(', '));
    } else if (result.moderation_action === 'flag') {
      console.log('Content flagged for review: ', result.flagged_reasons);
    }
    
    return result;
  } catch (error) {
    console.error('Moderation failed:', error);
    throw error;
  }
}
```

### Example Integration (Python/Flask)

```python
import requests

def moderate_content(content, content_type):
    try:
        if content_type == 'text':
            response = requests.post('http://localhost:8000/moderate/text', json={
                'content': content,
                'content_type': 'question'
            })
        elif content_type == 'image':
            with open(content, 'rb') as f:
                files = {'file': f}
                response = requests.post('http://localhost:8000/moderate/image', files=files)
        
        result = response.json()
        
        if result['moderation_action'] == 'block':
            raise Exception(f"Content blocked: {', '.join(result['flagged_reasons'])}")
        elif result['moderation_action'] == 'flag':
            print(f"Content flagged for review: {result['flagged_reasons']}")
        
        return result
    except Exception as e:
        print(f"Moderation failed: {e}")
        raise e
```

## ⚙️ Configuration

### Moderation Actions

- **allow**: Content is appropriate and can be posted
- **flag**: Content should be reviewed by moderators
- **block**: Content is inappropriate and should be rejected

## 🔍 Content Detection Categories

### Text Moderation (Free Models)
- **Hugging Face Toxic-BERT**: Detects toxic, severe_toxic, obscene, threat, insult, identity_hate
- **Sentiment Analysis**: Detects negative sentiment
- **Custom Patterns**: Profanity, hate speech, threats, spam
- **TextBlob Analysis**: Excessive punctuation, all caps detection

### Image Moderation (Computer Vision)
- **Skin Tone Detection**: Identifies potential NSFW content
- **Color Analysis**: Red dominance (violence), color distribution
- **Object Detection**: Face detection, body detection using OpenCV
- **Texture Analysis**: Pattern recognition, brightness analysis
- **Size Validation**: Suspicious file sizes, aspect ratios

### Video Moderation
- **Frame Extraction**: Analyzes key frames from videos
- **Duration Validation**: Checks video length limits
- **Format Validation**: Ensures supported video formats
- **Frame Analysis**: Same capabilities as image moderation

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Considerations

1. **Environment Variables**: Use proper environment variable management
2. **Model Caching**: Models are downloaded on first use, consider pre-downloading
3. **Rate Limiting**: Implement rate limiting for your API endpoints
4. **Monitoring**: Add logging and monitoring for the moderation service
5. **Scaling**: Consider using multiple instances for high traffic

## 🧪 Testing

### Test the API

```bash
# Test text moderation
curl -X POST "http://localhost:8000/moderate/text" \
  -H "Content-Type: application/json" \
  -d '{"content": "This is a test message", "content_type": "text"}'

# Test health endpoint
curl "http://localhost:8000/health"

# Get service info
curl "http://localhost:8000/info"
```

### Test with Sample Content

```python
# Test inappropriate content
test_content = "I hate everyone and want to kill them all"
# This should return moderation_action: "block"

# Test normal content
test_content = "How do I solve this programming problem?"
# This should return moderation_action: "allow"
```

## 💰 Cost Comparison

| Feature | Paid APIs | Our Free Solution |
|---------|-----------|-------------------|
| Text Moderation | $0.01-0.10 per request | **FREE** |
| Image Moderation | $0.01-0.05 per image | **FREE** |
| Video Moderation | $0.05-0.20 per video | **FREE** |
| API Calls | Usage limits | **Unlimited** |
| Setup Time | 30+ minutes | **5 minutes** |

## 🔮 Future Enhancements

- [ ] Audio moderation for voice messages
- [ ] Real-time streaming moderation
- [ ] Custom model training on your data
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Context-aware moderation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the API documentation at `http://localhost:8000/docs`
2. Review the logs for error messages
3. Ensure all dependencies are installed
4. Check the `/health` endpoint for model loading status

## 🎯 Why This Solution?

### ✅ **Advantages of Free Version**
- **No Costs**: Zero API fees, no usage limits
- **Privacy**: All processing happens locally
- **Customizable**: Full control over models and thresholds
- **Reliable**: No dependency on external API availability
- **Fast**: No network latency for API calls
- **Offline**: Works without internet connection

### ⚠️ **Trade-offs**
- **Setup Time**: Models need to be downloaded once
- **Resource Usage**: Requires more CPU/memory than API calls
- **Accuracy**: May be slightly less accurate than commercial APIs
- **Maintenance**: Need to update models manually

## 🏆 Conclusion

This free content moderation system provides **enterprise-level capabilities** without any costs. Perfect for:

- **Hackathons**: Quick setup, no budget required
- **Startups**: Cost-effective solution for content safety
- **Learning**: Understand how AI moderation works
- **Prototyping**: Test ideas before investing in paid solutions

**Start protecting your platform today - completely free! 🚀** 