package com.stackit.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public class ModerationDto {

    public static class ModerationRequest {
        private String content;
        @JsonProperty("content_type")
        private String contentType;

        public ModerationRequest() {
        }

        public ModerationRequest(String content, String contentType) {
            this.content = content;
            this.contentType = contentType;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getContentType() {
            return contentType;
        }

        public void setContentType(String contentType) {
            this.contentType = contentType;
        }
    }

    public static class ModerationResponse {
        @JsonProperty("is_appropriate")
        private boolean isAppropriate;
        private double confidence;
        private Map<String, Double> categories;
        @JsonProperty("flagged_reasons")
        private List<String> flaggedReasons;
        @JsonProperty("moderation_action")
        private String moderationAction;

        public ModerationResponse() {
        }

        public boolean isAppropriate() {
            return isAppropriate;
        }

        public void setAppropriate(boolean appropriate) {
            isAppropriate = appropriate;
        }

        public double getConfidence() {
            return confidence;
        }

        public void setConfidence(double confidence) {
            this.confidence = confidence;
        }

        public Map<String, Double> getCategories() {
            return categories;
        }

        public void setCategories(Map<String, Double> categories) {
            this.categories = categories;
        }

        public List<String> getFlaggedReasons() {
            return flaggedReasons;
        }

        public void setFlaggedReasons(List<String> flaggedReasons) {
            this.flaggedReasons = flaggedReasons;
        }

        public String getModerationAction() {
            return moderationAction;
        }

        public void setModerationAction(String moderationAction) {
            this.moderationAction = moderationAction;
        }
    }

    public static class ImageModerationRequest {
        @JsonProperty("image_url")
        private String imageUrl;

        public ImageModerationRequest() {
        }

        public ImageModerationRequest(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }

    public static class BatchModerationRequest {
        @JsonProperty("text_content")
        private String textContent;
        @JsonProperty("image_url")
        private String imageUrl;

        public BatchModerationRequest() {
        }

        public BatchModerationRequest(String textContent, String imageUrl) {
            this.textContent = textContent;
            this.imageUrl = imageUrl;
        }

        public String getTextContent() {
            return textContent;
        }

        public void setTextContent(String textContent) {
            this.textContent = textContent;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }

    public static class BatchModerationResponse {
        private Map<String, ModerationResponse> results;
        @JsonProperty("overall_decision")
        private String overallDecision;

        public BatchModerationResponse() {
        }

        public Map<String, ModerationResponse> getResults() {
            return results;
        }

        public void setResults(Map<String, ModerationResponse> results) {
            this.results = results;
        }

        public String getOverallDecision() {
            return overallDecision;
        }

        public void setOverallDecision(String overallDecision) {
            this.overallDecision = overallDecision;
        }
    }
}