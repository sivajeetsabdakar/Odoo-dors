# Cloudinary Setup Guide for StackIt

## 🚀 **Why Cloudinary is Better**

### **Advantages over Local Storage:**

- ✅ **No server storage needed** - Images stored in the cloud
- ✅ **Automatic CDN** - Fast global delivery
- ✅ **Image optimization** - Automatic compression and format conversion
- ✅ **Scalability** - Handles any amount of images
- ✅ **Backup & reliability** - 99.9% uptime guarantee
- ✅ **Free tier** - 25 GB storage, 25 GB bandwidth/month
- ✅ **Easy integration** - Simple API

### **Database Storage:**

- **Before**: `questions/1/uuid-image.png` (relative paths)
- **After**: `https://res.cloudinary.com/your-cloud/image/upload/v1234567890/stackit/questions/1/uuid-image.jpg` (full URLs)

## 📋 **Setup Steps**

### **1. Create Cloudinary Account**

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up For Free"
3. Fill in your details
4. Verify your email

### **2. Get Your Credentials**

After signing up, go to your **Dashboard** and find:

```properties
Cloud Name: your_cloud_name
API Key: your_api_key
API Secret: your_api_secret
```

### **3. Update Application Properties**

Edit `backend/src/main/resources/application.properties`:

```properties
# Cloudinary Configuration
cloudinary.cloud-name=your_actual_cloud_name
cloudinary.api-key=your_actual_api_key
cloudinary.api-secret=your_actual_api_secret
```

### **4. Test the Integration**

```bash
# Start the application
./gradlew bootRun

# Test image upload
curl -X POST http://localhost:8080/api/files/upload/avatar \
  -F "file=@/path/to/test-image.jpg" \
  -F "userId=1"
```

## 🔧 **How It Works**

### **Upload Process:**

1. **Frontend** sends image file to `/api/files/upload/*`
2. **CloudinaryService** uploads to Cloudinary
3. **Cloudinary** returns secure HTTPS URL
4. **Database** stores the full URL
5. **Frontend** displays image directly from Cloudinary

### **Example Flow:**

```javascript
// 1. Upload image
const formData = new FormData();
formData.append("file", imageFile);
formData.append("questionId", "1");

const response = await fetch("/api/files/upload/question", {
  method: "POST",
  body: formData,
});

const { url } = await response.json();
// url = "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/stackit/questions/1/uuid-image.jpg"

// 2. Create question with image URL
const questionData = {
  title: "My Question",
  description: "With image",
  imageUrls: [url],
};

await fetch("/api/questions?userId=1", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(questionData),
});
```

## 📊 **Database Schema**

### **Questions Table:**

```sql
CREATE TABLE questions (
  id BIGINT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  image_urls TEXT, -- "url1,url2,url3"
  -- other fields...
);
```

### **Example Data:**

```sql
INSERT INTO questions (title, description, image_urls) VALUES (
  'How to implement authentication?',
  'I need help with JWT...',
  'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/stackit/questions/1/uuid-screenshot1.jpg,https://res.cloudinary.com/your-cloud/image/upload/v1234567890/stackit/questions/1/uuid-screenshot2.png'
);
```

## 🎯 **Benefits for StackIt**

### **Performance:**

- **Faster loading** - CDN delivery
- **Automatic optimization** - WebP conversion
- **No server bandwidth** - Images served from Cloudinary

### **Scalability:**

- **Unlimited images** - No server storage limits
- **Global access** - CDN worldwide
- **Automatic backup** - Cloudinary handles it

### **Development:**

- **Simpler code** - No file system management
- **Better testing** - No local file cleanup
- **Production ready** - Enterprise-grade service

## 🔒 **Security Features**

### **Cloudinary Security:**

- **HTTPS only** - All URLs are secure
- **Access control** - Private/public options
- **Virus scanning** - Automatic malware detection
- **Watermarking** - Optional brand protection

### **StackIt Security:**

- **File validation** - Type and size checks
- **UUID filenames** - Prevents conflicts
- **Organized folders** - Clear structure

## 💰 **Pricing**

### **Free Tier (Perfect for StackIt):**

- **25 GB storage**
- **25 GB bandwidth/month**
- **25,000 transformations/month**
- **No credit card required**

### **Paid Plans (if needed):**

- **Advanced**: $89/month for 225 GB storage
- **Custom**: Enterprise solutions available

## 🚀 **Production Deployment**

### **Environment Variables:**

```bash
# Production environment
export CLOUDINARY_CLOUD_NAME=your_production_cloud
export CLOUDINARY_API_KEY=your_production_key
export CLOUDINARY_API_SECRET=your_production_secret
```

### **Docker Configuration:**

```dockerfile
# Add to Dockerfile
ENV CLOUDINARY_CLOUD_NAME=your_cloud_name
ENV CLOUDINARY_API_KEY=your_api_key
ENV CLOUDINARY_API_SECRET=your_api_secret
```

## 🧪 **Testing**

### **Test Image Upload:**

```bash
# Create test image
echo "test image content" > test-image.jpg

# Upload to Cloudinary
curl -X POST http://localhost:8080/api/files/upload/question \
  -F "file=@test-image.jpg" \
  -F "questionId=1"

# Expected response:
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/stackit/questions/1/uuid-test-image.jpg",
  "message": "Question image uploaded successfully"
}
```

### **Test Image Display:**

```html
<!-- The URL can be used directly in img tags -->
<img
  src="https://res.cloudinary.com/your-cloud/image/upload/v1234567890/stackit/questions/1/uuid-test-image.jpg"
  alt="Test image"
/>
```

## 🔄 **Migration from Local Storage**

If you have existing local images:

1. **Export local images** from `uploads/` folder
2. **Upload to Cloudinary** using the new endpoints
3. **Update database** with new Cloudinary URLs
4. **Remove local storage** code and files

## 📚 **Additional Features**

### **Image Transformations:**

```java
// Add transformations to CloudinaryService
Map<String, Object> uploadResult = cloudinary.uploader().upload(
    file.getBytes(),
    ObjectUtils.asMap(
        "public_id", folder + "/" + uniqueFilename,
        "transformation", ObjectUtils.asMap(
            "width", 800,
            "height", 600,
            "crop", "fill",
            "quality", "auto",
            "fetch_format", "auto"
        )
    )
);
```

### **Thumbnail Generation:**

```java
// Generate thumbnails automatically
String thumbnailUrl = cloudinary.url()
    .transformation(new Transformation()
        .width(150)
        .height(150)
        .crop("fill"))
    .generate(publicId);
```

This Cloudinary integration provides a much more robust and scalable solution for image handling in StackIt! 🎉
