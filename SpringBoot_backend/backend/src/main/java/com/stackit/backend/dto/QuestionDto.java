package com.stackit.backend.dto;

import com.stackit.backend.entity.Question;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {
    private Long id;
    private UserDto user;
    private String title;
    private String description;
    private List<String> imageUrls; // List of full image URLs
    private Integer viewCount;
    private Boolean isClosed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<String> tags;
    private Integer answerCount;
    private Boolean hasAcceptedAnswer;

    public static QuestionDto fromEntity(Question question) {
        QuestionDto dto = new QuestionDto();
        dto.setId(question.getId());
        dto.setUser(UserDto.fromEntity(question.getUser()));
        dto.setTitle(question.getTitle());
        dto.setDescription(question.getDescription());

        // Convert comma-separated URLs to list and add full URLs
        dto.setImageUrls(new java.util.ArrayList<>()); // Will be set by service layer

        dto.setViewCount(question.getViewCount());
        dto.setIsClosed(question.getIsClosed());
        dto.setCreatedAt(question.getCreatedAt());
        dto.setUpdatedAt(question.getUpdatedAt());

        if (question.getTags() != null) {
            dto.setTags(question.getTags().stream()
                    .map(tag -> tag.getName())
                    .collect(Collectors.toSet()));
        }

        if (question.getAnswers() != null) {
            dto.setAnswerCount(question.getAnswers().size());
            dto.setHasAcceptedAnswer(question.getAnswers().stream()
                    .anyMatch(answer -> answer.getIsAccepted()));
        }

        return dto;
    }
}