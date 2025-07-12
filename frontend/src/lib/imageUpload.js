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

// Validation function - made async to comply with Server Actions
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

// Validation function for multiple files - made async to comply with Server Actions
export const validateImageFiles = async (files) => {
  const results = await Promise.all(files.map(validateImageFile));
  return results;
};
