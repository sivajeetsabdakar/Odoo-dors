package com.stackit.backend.exception;

public class ContentModerationException extends RuntimeException {

    private final String content;
    private final String contentType;
    private final String moderationAction;

    public ContentModerationException(String message, String content, String contentType, String moderationAction) {
        super(message);
        this.content = content;
        this.contentType = contentType;
        this.moderationAction = moderationAction;
    }

    public ContentModerationException(String message, String content, String contentType) {
        this(message, content, contentType, "block");
    }

    public ContentModerationException(String message) {
        this(message, null, null, "block");
    }

    public String getContent() {
        return content;
    }

    public String getContentType() {
        return contentType;
    }

    public String getModerationAction() {
        return moderationAction;
    }
}