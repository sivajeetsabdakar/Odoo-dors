package com.stackit.backend.controller;

import com.stackit.backend.entity.Tag;
import com.stackit.backend.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    @Autowired
    private TagRepository tagRepository;

    @GetMapping
    public ResponseEntity<?> getAllTags() {
        try {
            List<Tag> tags = tagRepository.findAll();
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchTags(@RequestParam String q) {
        try {
            List<Tag> tags = tagRepository.findByNameContaining(q);
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/popular")
    public ResponseEntity<?> getPopularTags() {
        try {
            List<Tag> tags = tagRepository.findMostPopularTags();
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}