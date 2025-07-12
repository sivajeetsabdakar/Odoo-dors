package com.stackit.backend.service;

import com.stackit.backend.dto.ModerationDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.util.List;
import java.util.Map;

@Service
public class ContentModerationService {

    private static final Logger logger = LoggerFactory.getLogger(ContentModerationService.class);

    @Value("${moderation.api.base-url:http://localhost:8000}")
    private String moderationApiBaseUrl;

    @Value("${moderation.api.enabled:true}")
    private boolean moderationEnabled;

    @Value("${moderation.api.timeout:30000}")
    private int timeout;

    private final RestTemplate restTemplate;

    public ContentModerationService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Moderate text content
     */
    public ModerationDto.ModerationResponse moderateText(String content, String contentType) {
        if (!moderationEnabled) {
            logger.info("Content moderation is disabled, allowing content");
            return createAllowResponse();
        }

        try {
            ModerationDto.ModerationRequest request = new ModerationDto.ModerationRequest(content, contentType);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<ModerationDto.ModerationRequest> entity = new HttpEntity<>(request, headers);

            String url = moderationApiBaseUrl + "/moderate/text";
            logger.debug("Sending text moderation request to: {}", url);

            ResponseEntity<ModerationDto.ModerationResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    ModerationDto.ModerationResponse.class);

            ModerationDto.ModerationResponse result = response.getBody();
            logger.info("Text moderation result: {} (confidence: {})",
                    result.getModerationAction(), result.getConfidence());

            return result;

        } catch (HttpClientErrorException e) {
            logger.error("HTTP error during text moderation: {}", e.getMessage());
            return createAllowResponse(); // Allow content on API errors
        } catch (ResourceAccessException e) {
            logger.error("Connection error during text moderation: {}", e.getMessage());
            return createAllowResponse(); // Allow content on connection errors
        } catch (Exception e) {
            logger.error("Unexpected error during text moderation: {}", e.getMessage());
            return createAllowResponse(); // Allow content on unexpected errors
        }
    }

    /**
     * Moderate image content by URL
     */
    public ModerationDto.ModerationResponse moderateImage(String imageUrl) {
        if (!moderationEnabled) {
            logger.info("Content moderation is disabled, allowing image");
            return createAllowResponse();
        }

        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            logger.warn("Empty image URL provided for moderation");
            return createAllowResponse();
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("image_url", imageUrl);

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

            String url = moderationApiBaseUrl + "/moderate/image";
            logger.debug("Sending image moderation request to: {}", url);

            ResponseEntity<ModerationDto.ModerationResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    ModerationDto.ModerationResponse.class);

            ModerationDto.ModerationResponse result = response.getBody();
            logger.info("Image moderation result: {} (confidence: {})",
                    result.getModerationAction(), result.getConfidence());

            return result;

        } catch (HttpClientErrorException e) {
            logger.error("HTTP error during image moderation: {}", e.getMessage());
            return createAllowResponse(); // Allow content on API errors
        } catch (ResourceAccessException e) {
            logger.error("Connection error during image moderation: {}", e.getMessage());
            return createAllowResponse(); // Allow content on connection errors
        } catch (Exception e) {
            logger.error("Unexpected error during image moderation: {}", e.getMessage());
            return createAllowResponse(); // Allow content on unexpected errors
        }
    }

    /**
     * Moderate multiple images
     */
    public List<ModerationDto.ModerationResponse> moderateImages(List<String> imageUrls) {
        if (!moderationEnabled) {
            logger.info("Content moderation is disabled, allowing all images");
            return imageUrls.stream()
                    .map(url -> createAllowResponse())
                    .toList();
        }

        return imageUrls.stream()
                .map(this::moderateImage)
                .toList();
    }

    /**
     * Batch moderation for text and images
     */
    public ModerationDto.BatchModerationResponse moderateBatch(String textContent, List<String> imageUrls) {
        if (!moderationEnabled) {
            logger.info("Content moderation is disabled, allowing batch content");
            return createAllowBatchResponse();
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            if (textContent != null && !textContent.trim().isEmpty()) {
                body.add("text_content", textContent);
            }

            // For batch, we'll moderate the first image URL if available
            if (imageUrls != null && !imageUrls.isEmpty()) {
                body.add("image_url", imageUrls.get(0));
            }

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

            String url = moderationApiBaseUrl + "/moderate/batch";
            logger.debug("Sending batch moderation request to: {}", url);

            ResponseEntity<ModerationDto.BatchModerationResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    ModerationDto.BatchModerationResponse.class);

            ModerationDto.BatchModerationResponse result = response.getBody();
            logger.info("Batch moderation result: {}", result.getOverallDecision());

            return result;

        } catch (HttpClientErrorException e) {
            logger.error("HTTP error during batch moderation: {}", e.getMessage());
            return createAllowBatchResponse(); // Allow content on API errors
        } catch (ResourceAccessException e) {
            logger.error("Connection error during batch moderation: {}", e.getMessage());
            return createAllowBatchResponse(); // Allow content on connection errors
        } catch (Exception e) {
            logger.error("Unexpected error during batch moderation: {}", e.getMessage());
            return createAllowBatchResponse(); // Allow content on unexpected errors
        }
    }

    /**
     * Check if content should be allowed based on moderation result
     */
    public boolean isContentAllowed(ModerationDto.ModerationResponse response) {
        if (response == null) {
            return true; // Allow if no response
        }

        return "allow".equalsIgnoreCase(response.getModerationAction()) ||
                response.isAppropriate();
    }

    /**
     * Check if content should be flagged for review
     */
    public boolean isContentFlagged(ModerationDto.ModerationResponse response) {
        if (response == null) {
            return false;
        }

        return "flag".equalsIgnoreCase(response.getModerationAction());
    }

    /**
     * Check if content should be blocked
     */
    public boolean isContentBlocked(ModerationDto.ModerationResponse response) {
        if (response == null) {
            return false;
        }

        return "block".equalsIgnoreCase(response.getModerationAction()) ||
                !response.isAppropriate();
    }

    /**
     * Create a default "allow" response for when moderation is disabled or fails
     */
    private ModerationDto.ModerationResponse createAllowResponse() {
        ModerationDto.ModerationResponse response = new ModerationDto.ModerationResponse();
        response.setAppropriate(true);
        response.setConfidence(1.0);
        response.setModerationAction("allow");
        response.setFlaggedReasons(List.of());
        response.setCategories(Map.of("normal", 1.0, "safe", 1.0));
        return response;
    }

    /**
     * Create a default "allow" batch response
     */
    private ModerationDto.BatchModerationResponse createAllowBatchResponse() {
        ModerationDto.BatchModerationResponse response = new ModerationDto.BatchModerationResponse();
        response.setOverallDecision("allow");
        response.setResults(Map.of(
                "text", createAllowResponse(),
                "image", createAllowResponse()));
        return response;
    }

    /**
     * Check if the moderation service is healthy
     */
    public boolean isServiceHealthy() {
        if (!moderationEnabled) {
            return true;
        }

        try {
            String url = moderationApiBaseUrl + "/health";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            logger.warn("Moderation service health check failed: {}", e.getMessage());
            return false;
        }
    }
}