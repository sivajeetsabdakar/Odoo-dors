package com.stackit.backend.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ImageService {

    /**
     * Convert comma-separated image URLs to a list of URLs
     * With Cloudinary, URLs are already full URLs, so we just need to split them
     */
    public List<String> convertToFullUrls(String imageUrls) {
        if (imageUrls == null || imageUrls.trim().isEmpty()) {
            return List.of();
        }

        return Arrays.stream(imageUrls.split(","))
                .map(String::trim)
                .filter(url -> !url.isEmpty())
                .collect(Collectors.toList());
    }

    /**
     * Convert a list of image URLs to comma-separated string for storage
     * With Cloudinary, we store the full URLs directly
     */
    public String convertToString(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return null;
        }

        return imageUrls.stream()
                .map(String::trim)
                .filter(url -> !url.isEmpty())
                .collect(Collectors.joining(","));
    }

    /**
     * Validate if a URL is a valid Cloudinary URL
     */
    public boolean isValidCloudinaryUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }

        // Check if it's a Cloudinary URL
        return url.contains("res.cloudinary.com");
    }

    /**
     * Extract Cloudinary public ID from URL
     */
    public String extractPublicIdFromUrl(String imageUrl) {
        if (imageUrl == null || !isValidCloudinaryUrl(imageUrl)) {
            return null;
        }

        try {
            // Cloudinary URLs format:
            // https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
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