package com.stackit.backend.service;

import com.stackit.backend.dto.CommentDto;
import com.stackit.backend.dto.request.CreateCommentRequest;
import com.stackit.backend.entity.Answer;
import com.stackit.backend.entity.Comment;
import com.stackit.backend.entity.User;
import com.stackit.backend.repository.AnswerRepository;
import com.stackit.backend.repository.CommentRepository;
import com.stackit.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImageService imageService;

    public List<CommentDto> getCommentsByAnswer(Long answerId) {
        List<Comment> comments = commentRepository.findByAnswerIdOrderByCreatedAtAsc(answerId);
        return comments.stream()
                .map(comment -> {
                    CommentDto dto = CommentDto.fromEntity(comment);
                    dto.setImageUrls(imageService.convertToFullUrls(comment.getImageUrls()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public CommentDto createComment(CreateCommentRequest request, Long answerId, Long userId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setAnswer(answer);
        comment.setUser(user);
        comment.setContent(request.getContent());

        // Handle image URLs
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            String imageUrlsString = imageService
                    .convertToString(new java.util.ArrayList<>(request.getImageUrls()));
            comment.setImageUrls(imageUrlsString);
        }

        Comment savedComment = commentRepository.save(comment);
        CommentDto dto = CommentDto.fromEntity(savedComment);
        dto.setImageUrls(imageService.convertToFullUrls(savedComment.getImageUrls()));
        return dto;
    }

    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Only comment owner can delete comments");
        }

        commentRepository.delete(comment);
    }

    public CommentDto updateComment(Long id, Long userId, String content, List<String> imageUrls) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the comment owner can update the comment");
        }
        comment.setContent(content);
        if (imageUrls != null) {
            comment.setImageUrls(imageService.convertToString(new java.util.ArrayList<>(imageUrls)));
        }
        Comment saved = commentRepository.save(comment);
        CommentDto dto = CommentDto.fromEntity(saved);
        dto.setImageUrls(imageService.convertToFullUrls(saved.getImageUrls()));
        return dto;
    }
}