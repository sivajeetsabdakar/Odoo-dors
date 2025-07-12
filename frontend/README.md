# StackIt Frontend

A modern Q&A platform frontend built with Next.js 15, integrating with the Spring Boot backend API.

## Features

- 🔐 **User Authentication** - Login, signup, and profile management
- ❓ **Question Management** - Ask, edit, vote, and delete questions
- 💬 **Answer System** - Answer questions, vote, and mark as accepted
- 🖼️ **Cloudinary Image Uploads** - Fast image uploads with CDN delivery
- 🏷️ **Tagging System** - Organize questions with tags
- 🔍 **Search & Filter** - Find questions by title, tags, or content
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Running StackIt Backend (Spring Boot) on `http://localhost:8080`
- Cloudinary account for image uploads

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   
   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## Image Upload Integration

This app uses **Cloudinary** for image uploads instead of backend file storage:

- ✅ Images uploaded directly to Cloudinary
- ✅ Automatic optimization and CDN delivery
- ✅ Only URLs sent to backend
- ✅ Secure server-side upload endpoints

See [CLOUDINARY_INTEGRATION.md](./CLOUDINARY_INTEGRATION.md) for detailed implementation.

## Backend Integration

This frontend is designed to work with the StackIt Spring Boot backend. It integrates with all the API endpoints documented in the backend's API_DOCUMENTATION.md:

### Authentication Endpoints
- User registration and login
- Profile management  
- Current user retrieval

### Question Management
- CRUD operations for questions
- Voting system
- Tag management
- Image uploads
- Search and filtering
- Pagination

### Answer System
- Create, edit, delete answers
- Voting on answers
- Accept answers (question authors)

### File Upload System
- Avatar uploads
- Question image uploads
- Answer image uploads
- Comment image uploads

## Key Features Implemented

✅ **Complete API Integration**
- All endpoints from the backend API documentation are integrated
- Proper error handling for all API calls
- Loading states for async operations

✅ **Authentication System**
- Login/signup with backend validation
- User profile management with avatar upload
- Role-based access control

✅ **Question Management**
- Create questions with rich text editor
- Image upload support
- Tag system with search
- Voting and pagination

✅ **Answer System**
- Rich text answers with image support
- Voting on answers
- Visual indicators for accepted answers

✅ **File Upload System**
- Complete integration with backend file endpoints
- Support for avatars, question images, answer images
- Proper file serving through backend URLs

✅ **Search & Filter**
- Real-time search through questions
- Filter by tags, newest, most voted
- Pagination support

✅ **Responsive UI**
- Mobile-first design
- Modern glassmorphism effects
- Consistent component library

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8080/api)

## Build for Production

```bash
npm run build
npm start
```

## Troubleshooting

1. **Backend Connection Issues**
   - Ensure the backend is running on `http://localhost:8080`
   - Check CORS configuration in the backend
   - Verify the `NEXT_PUBLIC_API_URL` environment variable

2. **Authentication Issues**
   - Clear browser localStorage if needed
   - Check that user registration/login endpoints are working

3. **File Upload Issues**
   - Ensure backend file upload endpoints are properly configured
   - Check file size limits and supported formats
