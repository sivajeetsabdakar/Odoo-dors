# Testing Image and Video Moderation

This guide explains how to test the image and video moderation functionality of the StackIt Content Moderation API.

## Prerequisites

1. **Start the moderation service:**
   ```bash
   cd moderation_service
   python app.py
   ```

2. **Install required dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Testing Options

### Option 1: Comprehensive Test Suite

Run the complete test suite that includes text, image, and video moderation:

```bash
python test_moderation.py
```

This will test:
- ✅ Health check and service info
- ✅ Text moderation (7 test cases)
- ✅ Image moderation (5 test cases)
- ✅ Video moderation (5 test cases)
- ✅ Batch moderation
- ✅ API documentation

### Option 2: Image and Video Only

Run the dedicated image and video testing script:

```bash
python test_image_video.py
```

This focuses specifically on:
- 🖼️ Image moderation with various content types
- 🎥 Video moderation with different scenarios
- 📦 Batch moderation with multiple file types

## Test Cases

### Image Moderation Tests

The system tests these image types:

1. **Normal Image** - Simple geometric pattern (expected: allow)
2. **Skin Tone Image** - Images with skin-like colors (expected: flag)
3. **Red Dominant Image** - Images with dominant red colors (expected: flag)
4. **Large Image** - Very large images (expected: flag)
5. **Small Image** - Very small images (expected: allow)

### Video Moderation Tests

The system tests these video types:

1. **Normal Video** - Simple colored frames (expected: allow)
2. **Skin Tone Video** - Frames with skin-like colors (expected: flag)
3. **Red Dominant Video** - Frames with dominant red (expected: flag)
4. **Long Video** - Videos longer than 5 minutes (expected: flag)
5. **Short Video** - Videos shorter than 1 second (expected: flag)

## Manual Testing

### Test Image Moderation

```bash
# Using curl
curl -X POST "http://localhost:8000/moderate/image" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your_image.jpg"
```

### Test Video Moderation

```bash
# Using curl
curl -X POST "http://localhost:8000/moderate/video" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your_video.mp4"
```

### Test Batch Moderation

```bash
# Using curl
curl -X POST "http://localhost:8000/moderate/batch" \
  -F "text_content=Your text here" \
  -F "image_file=@your_image.jpg" \
  -F "video_file=@your_video.mp4"
```

## API Endpoints

### Image Moderation
- **Endpoint:** `POST /moderate/image`
- **Input:** Image file (multipart/form-data)
- **Output:** Moderation result with confidence scores

### Video Moderation
- **Endpoint:** `POST /moderate/video`
- **Input:** Video file (multipart/form-data)
- **Output:** Moderation result with frame analysis

### Batch Moderation
- **Endpoint:** `POST /moderate/batch`
- **Input:** Text content and/or image/video files
- **Output:** Combined moderation results

## Response Format

All moderation endpoints return the same response format:

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

### Moderation Actions

- **allow** - Content is appropriate
- **flag** - Content should be reviewed
- **block** - Content should be rejected

## Understanding Results

### Image Moderation Categories

- `high_skin_tone` - High percentage of skin-like colors
- `red_dominance` - Dominant red colors (potential violence)
- `large_size` - Image exceeds size limits
- `unsupported_format` - Unsupported image format

### Video Moderation Categories

- `too_long` - Video exceeds duration limit (5 minutes)
- `too_short` - Video below minimum duration (1 second)
- `invalid_video` - Corrupted or unsupported video format
- Frame analysis results from image moderation

### Confidence Scores

- **0.0-0.3** - Low confidence
- **0.3-0.7** - Medium confidence
- **0.7-1.0** - High confidence

## Troubleshooting

### Common Issues

1. **Server not running:**
   ```
   ❌ Cannot connect to server at http://localhost:8000
   ```
   **Solution:** Start the service with `python app.py`

2. **Missing dependencies:**
   ```
   ❌ ImportError: No module named 'cv2'
   ```
   **Solution:** Install OpenCV: `pip install opencv-python`

3. **Video creation fails:**
   ```
   ⚠️ OpenCV not available, creating dummy video file
   ```
   **Solution:** Install OpenCV for proper video testing

4. **Large file uploads:**
   ```
   ❌ HTTP Error: 413
   ```
   **Solution:** Reduce file size or increase server limits

### Performance Tips

- **Image testing:** Uses PIL to create test images (fast)
- **Video testing:** Requires OpenCV for proper video creation
- **Batch testing:** Tests multiple content types simultaneously
- **File cleanup:** Test scripts automatically clean up temporary files

## Expected Results

### Successful Test Run

```
🧪 Image and Video Moderation Test Suite
==================================================
✅ Server is running

🖼️  Testing Image Moderation
========================================
📸 Testing normal image...
✅ Created test_normal.jpg
✅ Result: allow (expected: allow)
   Confidence: 0.85
   Categories: ['normal']
   Reasons: []

📸 Testing skin_tone image...
✅ Created test_skin_tone.jpg
⚠️ Result: flag (expected: flag)
   Confidence: 0.72
   Categories: ['high_skin_tone']
   Reasons: ['high_skin_tone']

🎥 Testing Video Moderation
========================================
🎬 Testing normal video (3s)...
✅ Created test_normal.mp4
✅ Result: allow (expected: allow)
   Confidence: 0.80
   Categories: ['normal']
   Reasons: []
   Duration: 3.0s
   Frames: 90

📦 Testing Batch Moderation
========================================
Creating test content...
✅ Created batch_test_image.jpg
✅ Created batch_test_video.mp4
Sending batch moderation request...
✅ Batch moderation successful
   Overall decision: allow
   text: allow (confidence: 0.90)
   image: allow (confidence: 0.85)
   video: allow (confidence: 0.80)

📊 Test Summary
==================================================
Image Moderation: 5/5 tests passed
Video Moderation: 5/5 tests passed
Batch Moderation: ✅ PASS

📄 Results saved to image_video_test_results.json
🎉 Testing complete!
```

## Cost Savings

This free moderation service provides significant cost savings:

- **Text moderation:** FREE (vs $0.01-0.10 per request)
- **Image moderation:** FREE (vs $0.01-0.05 per image)
- **Video moderation:** FREE (vs $0.05-0.20 per video)
- **Total monthly savings:** $100-1000+ for typical usage

## Next Steps

1. **Review test results** in the generated JSON files
2. **Adjust moderation thresholds** if needed
3. **Integrate with your backend** using the API endpoints
4. **Deploy to production** with proper security configurations 