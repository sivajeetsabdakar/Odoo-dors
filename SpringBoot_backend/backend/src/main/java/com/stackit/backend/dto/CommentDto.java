package com.stackit.backend.dto;

import com.stackit.backend.entity.Comment;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {
    private Long id;
    private UserDto user;
    private String content;
    private List<String> imageUrls; // List of full image URLs
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommentDto fromEntity(Comment comment) {
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setUser(UserDto.fromEntity(comment.getUser()));
        dto.setContent(comment.getContent());

        // Convert comma-separated URLs to list and add full URLs
        dto.setImageUrls(new java.util.ArrayList<>()); // Will be set by service layer

        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }
}