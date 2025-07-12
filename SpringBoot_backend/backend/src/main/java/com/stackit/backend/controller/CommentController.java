package com.stackit.backend.controller;

import com.stackit.backend.dto.CommentDto;
import com.stackit.backend.dto.request.CreateCommentRequest;
import com.stackit.backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping("/answers/{answerId}/comments")
    public ResponseEntity<?> getCommentsByAnswer(@PathVariable Long answerId) {
        try {
            List<CommentDto> comments = commentService.getCommentsByAnswer(answerId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/answers/{answerId}/comments")
    public ResponseEntity<?> createComment(
            @PathVariable Long answerId,
            @RequestBody CreateCommentRequest request,
            @RequestParam Long userId) {
        try {
            CommentDto comment = commentService.createComment(request, answerId, userId);
            return ResponseEntity.ok(comment);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        try {
            commentService.deleteComment(commentId, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Comment deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<?> updateComment(@PathVariable Long id, @RequestParam Long userId,
            @RequestBody Map<String, Object> request) {
        String content = (String) request.get("content");
        List<String> imageUrls = (List<String>) request.get("imageUrls");
        CommentDto updated = commentService.updateComment(id, userId, content, imageUrls);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Comment updated successfully");
        response.put("commentId", updated.getId());
        return ResponseEntity.ok(response);
    }
}