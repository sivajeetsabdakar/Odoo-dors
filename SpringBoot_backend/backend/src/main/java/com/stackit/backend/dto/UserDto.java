package com.stackit.backend.dto;

import com.stackit.backend.entity.User;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private User.UserRole role;
    private String avatarUrl;
    private String bio;
    private Integer reputation;
    private LocalDateTime createdAt;

    public static UserDto fromEntity(User user) {
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getReputation(),
                user.getCreatedAt());
    }
}