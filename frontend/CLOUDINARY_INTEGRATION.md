# Cloudinary Integration Setup

This document explains how the Cloudinary integration has been implemented in the Stack-It frontend.

## Features Implemented

✅ **Image uploads to Cloudinary** instead of backend storage
✅ **Secure upload via API routes** (no unsigned presets needed)
✅ **Reusable ImageUpload component** with preview and progress
✅ **Optimized image delivery** with automatic format conversion
✅ **Image deletion** functionality
✅ **Integration with Ask Question form**
✅ **Integration with Answer forms**
✅ **Integration with Profile avatars**

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dgx
NEXT_PUBLIC_CLOUDINARY_API_KEY=6315529
CLOUDINARY_API_SECRET=E29gknAi
```

## How It Works

### 1. Image Upload Flow

1. User selects images using the `ImageUpload` component
2. Images are immediately uploaded to Cloudinary via `/api/cloudinary/upload`
3. Cloudinary URLs are displayed in the UI with preview
4. When form is submitted, only the Cloudinary URLs are sent to the backend
5. Backend stores URLs instead of handling file uploads

### 2. Components Updated

- **`/ask` page**: Uses new ImageUpload component for question images
- **`/question/[id]` page**: Uses ImageUpload component for answer images  
- **`/profile` page**: Uses Cloudinary for avatar uploads
- **`ImageUpload` component**: New reusable component with upload progress

### 3. API Routes Added

- **`/api/cloudinary/upload`**: Handles secure image uploads
- **`/api/cloudinary/delete`**: Handles image deletion

### 4. Utilities Created

- **`src/lib/cloudinary.js`**: Core Cloudinary configuration and functions
- **`src/lib/imageUpload.js`**: Wrapper functions for different upload types

## Benefits

1. **Better Performance**: Images served from Cloudinary's global CDN
2. **Automatic Optimization**: Format conversion (WebP, AVIF) and compression
3. **Scalability**: No server storage or bandwidth concerns
4. **Reliability**: Cloudinary handles image processing and delivery
5. **Developer Experience**: Clean, reusable components

## Usage Examples

### Using ImageUpload Component

```jsx
import ImageUpload from "@/components/ImageUpload"

function MyForm() {
  const [uploadedImages, setUploadedImages] = useState([])

  const handleImagesUploaded = (images) => {
    setUploadedImages(images)
    // images is an array of { url, publicId, width, height }
  }

  return (
    <ImageUpload
      onImagesUploaded={handleImagesUploaded}
      maxFiles={5}
      folder="my-app/category"
    />
  )
}
```

### Direct Upload Functions

```jsx
import { uploadImageToCloudinary } from "@/lib/cloudinary"

// Upload single image
const result = await uploadImageToCloudinary(file, "my-folder")
// Returns: { url, publicId, width, height }

// Upload multiple images
import { uploadMultipleImages } from "@/lib/cloudinary"
const results = await uploadMultipleImages(files, "my-folder")
```

## File Structure

```
src/
├── lib/
│   ├── cloudinary.js          # Core Cloudinary config & functions
│   └── imageUpload.js         # Upload utilities & validation
├── components/
│   └── ImageUpload.js         # Reusable upload component
└── app/
    └── api/
        └── cloudinary/
            ├── upload/
            │   └── route.js   # Secure upload endpoint
            └── delete/
                └── route.js   # Image deletion endpoint
```

## Next Steps

The integration is complete and ready to use. The backend should be updated to:

1. Accept `imageUrls` arrays in question/answer creation endpoints
2. Remove file upload handling for images (keep only for other file types if needed)
3. Store the Cloudinary URLs directly in the database

## Testing

1. Visit `/ask` page and try uploading images
2. Check that images appear immediately after upload
3. Submit a question and verify URLs are sent to backend
4. Test the same flow for answers and profile avatar

The images will be stored in your Cloudinary account under the `stack-it/` folder structure.
