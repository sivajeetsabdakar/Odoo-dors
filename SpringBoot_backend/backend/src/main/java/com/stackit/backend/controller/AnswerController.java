package com.stackit.backend.controller;

import com.stackit.backend.dto.AnswerDto;
import com.stackit.backend.dto.request.CreateAnswerRequest;
import com.stackit.backend.service.AnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AnswerController {

    @Autowired
    private AnswerService answerService;

    @GetMapping("/questions/{questionId}/answers")
    public ResponseEntity<?> getAnswersByQuestion(@PathVariable Long questionId) {
        try {
            List<AnswerDto> answers = answerService.getAnswersByQuestion(questionId);
            return ResponseEntity.ok(answers);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/questions/{questionId}/answers")
    public ResponseEntity<?> createAnswer(
            @PathVariable Long questionId,
            @RequestBody CreateAnswerRequest request,
            @RequestParam Long userId) {
        try {
            AnswerDto answer = answerService.createAnswer(request, questionId, userId);
            return ResponseEntity.ok(answer);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/answers/{answerId}/accept")
    public ResponseEntity<?> acceptAnswer(@PathVariable Long answerId, @RequestParam Long userId) {
        try {
            AnswerDto answer = answerService.acceptAnswer(answerId, userId);
            return ResponseEntity.ok(answer);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/answers/{id}")
    public ResponseEntity<?> updateAnswer(@PathVariable Long id, @RequestParam Long userId,
            @RequestBody Map<String, Object> request) {
        String description = (String) request.get("description");
        List<String> imageUrls = (List<String>) request.get("imageUrls");
        AnswerDto updated = answerService.updateAnswer(id, userId, description, imageUrls);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Answer updated successfully");
        response.put("answerId", updated.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/answers/{id}")
    public ResponseEntity<?> deleteAnswer(@PathVariable Long id, @RequestParam Long userId) {
        answerService.deleteAnswer(id, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Answer deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/answers/{id}/vote")
    public ResponseEntity<?> voteAnswer(@PathVariable Long id, @RequestParam Long userId,
            @RequestBody Map<String, Integer> voteRequest) {
        int voteCount = answerService.voteAnswer(id, userId, voteRequest.getOrDefault("vote", 0));
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Vote recorded");
        response.put("voteCount", voteCount);
        return ResponseEntity.ok(response);
    }
}