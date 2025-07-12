package com.stackit.backend.dto;

import com.stackit.backend.entity.Answer;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerDto {
    private Long id;
    private UserDto user;
    private String description;
    private List<String> imageUrls; // List of full image URLs
    private Boolean isAccepted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer voteCount;
    private Integer commentCount;
    private Integer userVote; // 1, -1, or 0 for no vote

    public static AnswerDto fromEntity(Answer answer) {
        AnswerDto dto = new AnswerDto();
        dto.setId(answer.getId());
        dto.setUser(UserDto.fromEntity(answer.getUser()));
        dto.setDescription(answer.getDescription());

        // Convert comma-separated URLs to list and add full URLs
        dto.setImageUrls(new java.util.ArrayList<>()); // Will be set by service layer

        dto.setIsAccepted(answer.getIsAccepted());
        dto.setCreatedAt(answer.getCreatedAt());
        dto.setUpdatedAt(answer.getUpdatedAt());

        if (answer.getVotes() != null) {
            dto.setVoteCount(answer.getVotes().stream()
                    .mapToInt(vote -> vote.getVoteType())
                    .sum());
        }

        if (answer.getComments() != null) {
            dto.setCommentCount(answer.getComments().size());
        }

        return dto;
    }
}