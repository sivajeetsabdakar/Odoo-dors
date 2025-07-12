"use server"
import { uploadImageToCloudinary, uploadMultipleImages } from './cloudinary';

// Wrapper functions for different types of uploads
export const uploadQuestionImages = async (files) => {
  return uploadMultipleImages(files, 'stack-it/questions');
};

export const uploadAnswerImages = async (files) => {
  return uploadMultipleImages(files, 'stack-it/answers');
};

export const uploadAvatarImage = async (file) => {
  return uploadImageToCloudinary(file, 'stack-it/avatars');
};

export const uploadCommentImages = async (files) => {
  return uploadMultipleImages(files, 'stack-it/comments');
};

// Validation functions
export const validateImageFile = async (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed');
  }

  if (file.size > maxSize) {
    throw new Error('Image size must be less than 10MB');
  }

  return true;
};

export const validateImageFiles = (files) => {
  return files.map(validateImageFile);
};

// Helper to get optimized image URL
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return null;
  
  // If it's already a Cloudinary URL, we can optimize it
  if (url.includes('cloudinary.com')) {
    const { width, height, quality = 'auto' } = options;
    
    // Extract the public ID from the URL
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1) {
      const publicIdParts = urlParts.slice(uploadIndex + 1);
      const publicId = publicIdParts.join('/');
      
      // Build optimized URL
      let transformations = [`q_${quality}`];
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      
      const baseUrl = urlParts.slice(0, uploadIndex + 1).join('/');
      return `${baseUrl}/${transformations.join(',')}/c_fill/${publicId}`;
    }
  }
  
  return url;
};
