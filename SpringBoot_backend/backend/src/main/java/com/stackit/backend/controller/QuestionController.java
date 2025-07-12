package com.stackit.backend.controller;

import com.stackit.backend.dto.QuestionDto;
import com.stackit.backend.dto.request.CreateQuestionRequest;
import com.stackit.backend.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @GetMapping
    public ResponseEntity<?> getAllQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<QuestionDto> questions = questionService.getAllQuestions(pageable);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestionById(@PathVariable Long id) {
        try {
            QuestionDto question = questionService.getQuestionById(id);
            return ResponseEntity.ok(question);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping
    public ResponseEntity<?> createQuestion(
            @RequestBody CreateQuestionRequest request,
            @RequestParam Long userId) {
        try {
            QuestionDto question = questionService.createQuestion(request, userId);
            return ResponseEntity.ok(question);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long id, @RequestParam Long userId,
            @RequestBody CreateQuestionRequest request) {
        QuestionDto updated = questionService.updateQuestion(id, userId, request);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Question updated successfully");
        response.put("questionId", updated.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id, @RequestParam Long userId) {
        questionService.deleteQuestion(id, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Question deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> voteQuestion(@PathVariable Long id, @RequestParam Long userId,
            @RequestBody Map<String, Integer> voteRequest) {
        int voteCount = questionService.voteQuestion(id, userId, voteRequest.getOrDefault("vote", 0));
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Vote recorded");
        response.put("voteCount", voteCount);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tag/{tagName}")
    public ResponseEntity<?> getQuestionsByTag(@PathVariable String tagName) {
        try {
            List<QuestionDto> questions = questionService.getQuestionsByTag(tagName);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchQuestions(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<QuestionDto> questions = questionService.searchQuestions(q, pageable);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getQuestionsByUser(@PathVariable Long userId) {
        try {
            List<QuestionDto> questions = questionService.getQuestionsByUser(userId);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}