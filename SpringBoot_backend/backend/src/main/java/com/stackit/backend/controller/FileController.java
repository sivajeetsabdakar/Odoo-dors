package com.stackit.backend.controller;

import com.stackit.backend.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping("/upload/avatar")
    public ResponseEntity<?> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {
        try {
            String imageUrl = cloudinaryService.uploadAvatar(file, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Avatar uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/upload/question")
    public ResponseEntity<?> uploadQuestionImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("questionId") Long questionId) {
        try {
            String imageUrl = cloudinaryService.uploadQuestionImage(file, questionId);

            Map<String, Object> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Question image uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/upload/answer")
    public ResponseEntity<?> uploadAnswerImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("answerId") Long answerId) {
        try {
            String imageUrl = cloudinaryService.uploadAnswerImage(file, answerId);

            Map<String, Object> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Answer image uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/upload/comment")
    public ResponseEntity<?> uploadCommentImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("commentId") Long commentId) {
        try {
            String imageUrl = cloudinaryService.uploadCommentImage(file, commentId);

            Map<String, Object> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Comment image uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteImage(@RequestParam("imageUrl") String imageUrl) {
        try {
            cloudinaryService.deleteImage(imageUrl);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Image deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete image: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}