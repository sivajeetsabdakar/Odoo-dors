package com.stackit.backend.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAnswerRequest {

    private String description;
    private Set<String> imageUrls; // URLs of uploaded images
}