package com.stackit.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {

        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret));
    }

    public String uploadImage(MultipartFile file, String folder) throws IOException {
        // Validate file
        validateFile(file);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        // Upload to Cloudinary
        Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "public_id", folder + "/" + uniqueFilename,
                        "resource_type", "image",
                        "transformation", ObjectUtils.asMap(
                                "quality", "auto",
                                "fetch_format", "auto")));

        return (String) uploadResult.get("secure_url");
    }

    public void deleteImage(String imageUrl) {
        try {
            // Extract public_id from URL
            String publicId = extractPublicIdFromUrl(imageUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            // Log error but don't throw exception for cleanup operations
            System.err.println("Error deleting image from Cloudinary: " + imageUrl + " - " + e.getMessage());
        }
    }

    public String uploadAvatar(MultipartFile file, Long userId) throws IOException {
        return uploadImage(file, "stackit/avatars");
    }

    public String uploadQuestionImage(MultipartFile file, Long questionId) throws IOException {
        return uploadImage(file, "stackit/questions/" + questionId);
    }

    public String uploadAnswerImage(MultipartFile file, Long answerId) throws IOException {
        return uploadImage(file, "stackit/answers/" + answerId);
    }

    public String uploadCommentImage(MultipartFile file, Long commentId) throws IOException {
        return uploadImage(file, "stackit/comments/" + commentId);
    }

    private void validateFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }

        // Check file size (10MB limit)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IOException("File size exceeds maximum allowed size of 10MB");
        }

        // Check file type
        String contentType = file.getContentType();
        if (contentType == null || !isValidImageType(contentType)) {
            throw new IOException("File type not allowed. Allowed types: JPEG, PNG, GIF, WebP");
        }
    }

    private boolean isValidImageType(String contentType) {
        return contentType.equals("image/jpeg") ||
                contentType.equals("image/png") ||
                contentType.equals("image/gif") ||
                contentType.equals("image/webp");
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private String extractPublicIdFromUrl(String imageUrl) {
        // Cloudinary URLs format:
        // https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
        try {
            String[] parts = imageUrl.split("/upload/");
            if (parts.length > 1) {
                String afterUpload = parts[1];
                // Remove version prefix if present
                if (afterUpload.startsWith("v")) {
                    afterUpload = afterUpload.substring(afterUpload.indexOf("/") + 1);
                }
                // Remove file extension
                int lastDotIndex = afterUpload.lastIndexOf(".");
                if (lastDotIndex > 0) {
                    afterUpload = afterUpload.substring(0, lastDotIndex);
                }
                return afterUpload;
            }
        } catch (Exception e) {
            System.err.println("Error extracting public_id from URL: " + imageUrl);
        }
        return null;
    }
}