package com.stackit.backend.controller;

import com.stackit.backend.dto.ModerationDto;
import com.stackit.backend.service.ContentModerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/moderation")
@CrossOrigin(origins = "*")
public class ModerationController {

        @Autowired
        private ContentModerationService contentModerationService;

        /**
         * Health check for moderation service
         */
        @GetMapping("/health")
        public ResponseEntity<Map<String, Object>> checkHealth() {
                boolean isHealthy = contentModerationService.isServiceHealthy();
                Map<String, Object> response = Map.of(
                                "status", isHealthy ? "healthy" : "unhealthy",
                                "service", "content_moderation",
                                "backend_connected", isHealthy);

                return ResponseEntity.ok(response);
        }

        /**
         * Moderate text content
         */
        @PostMapping("/text")
        public ResponseEntity<ModerationDto.ModerationResponse> moderateText(
                        @RequestBody ModerationDto.ModerationRequest request) {

                ModerationDto.ModerationResponse response = contentModerationService.moderateText(
                                request.getContent(),
                                request.getContentType());

                return ResponseEntity.ok(response);
        }

        /**
         * Moderate image by URL
         */
        @PostMapping("/image")
        public ResponseEntity<ModerationDto.ModerationResponse> moderateImage(
                        @RequestBody ModerationDto.ImageModerationRequest request) {

                ModerationDto.ModerationResponse response = contentModerationService.moderateImage(
                                request.getImageUrl());

                return ResponseEntity.ok(response);
        }

        /**
         * Batch moderation for text and images
         */
        @PostMapping("/batch")
        public ResponseEntity<ModerationDto.BatchModerationResponse> moderateBatch(
                        @RequestBody ModerationDto.BatchModerationRequest request) {

                ModerationDto.BatchModerationResponse response = contentModerationService.moderateBatch(
                                request.getTextContent(),
                                request.getImageUrl() != null ? java.util.List.of(request.getImageUrl()) : null);

                return ResponseEntity.ok(response);
        }
}