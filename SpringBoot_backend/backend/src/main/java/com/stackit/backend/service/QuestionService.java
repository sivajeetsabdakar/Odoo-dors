package com.stackit.backend.service;

import com.stackit.backend.dto.QuestionDto;
import com.stackit.backend.dto.request.CreateQuestionRequest;
import com.stackit.backend.entity.Question;
import com.stackit.backend.entity.Tag;
import com.stackit.backend.entity.User;
import com.stackit.backend.repository.QuestionRepository;
import com.stackit.backend.repository.TagRepository;
import com.stackit.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImageService imageService;

    public QuestionDto createQuestion(CreateQuestionRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Question question = new Question();
        question.setUser(user);
        question.setTitle(request.getTitle());
        question.setDescription(request.getDescription());

        // Handle image URLs
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            String imageUrlsString = imageService.convertToString(new java.util.ArrayList<>(request.getImageUrls()));
            question.setImageUrls(imageUrlsString);
        }

        // Handle tags
        Set<Tag> tags = new HashSet<>();
        if (request.getTags() != null) {
            for (String tagName : request.getTags()) {
                Tag tag = tagRepository.findByName(tagName)
                        .orElseGet(() -> {
                            Tag newTag = new Tag();
                            newTag.setName(tagName);
                            return tagRepository.save(newTag);
                        });
                tags.add(tag);
            }
        }
        question.setTags(tags);

        Question savedQuestion = questionRepository.save(question);
        QuestionDto dto = QuestionDto.fromEntity(savedQuestion);
        dto.setImageUrls(imageService.convertToFullUrls(savedQuestion.getImageUrls()));
        return dto;
    }

    public Page<QuestionDto> getAllQuestions(Pageable pageable) {
        return questionRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(question -> {
                    QuestionDto dto = QuestionDto.fromEntity(question);
                    dto.setImageUrls(imageService.convertToFullUrls(question.getImageUrls()));
                    return dto;
                });
    }

    public QuestionDto getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // Increment view count
        question.setViewCount(question.getViewCount() + 1);
        questionRepository.save(question);

        QuestionDto dto = QuestionDto.fromEntity(question);
        dto.setImageUrls(imageService.convertToFullUrls(question.getImageUrls()));
        return dto;
    }

    public List<QuestionDto> getQuestionsByTag(String tagName) {
        return questionRepository.findByTagName(tagName)
                .stream()
                .map(question -> {
                    QuestionDto dto = QuestionDto.fromEntity(question);
                    dto.setImageUrls(imageService.convertToFullUrls(question.getImageUrls()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public Page<QuestionDto> searchQuestions(String searchTerm, Pageable pageable) {
        return questionRepository.findBySearchTerm(searchTerm, pageable)
                .map(question -> {
                    QuestionDto dto = QuestionDto.fromEntity(question);
                    dto.setImageUrls(imageService.convertToFullUrls(question.getImageUrls()));
                    return dto;
                });
    }

    public List<QuestionDto> getQuestionsByUser(Long userId) {
        return questionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(question -> {
                    QuestionDto dto = QuestionDto.fromEntity(question);
                    dto.setImageUrls(imageService.convertToFullUrls(question.getImageUrls()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public QuestionDto updateQuestion(Long id, Long userId, CreateQuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        if (!question.getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the question owner can update the question");
        }
        question.setTitle(request.getTitle());
        question.setDescription(request.getDescription());
        // Handle image URLs
        if (request.getImageUrls() != null) {
            question.setImageUrls(imageService.convertToString(new java.util.ArrayList<>(request.getImageUrls())));
        }
        // Handle tags
        Set<Tag> tags = new HashSet<>();
        if (request.getTags() != null) {
            for (String tagName : request.getTags()) {
                Tag tag = tagRepository.findByName(tagName)
                        .orElseGet(() -> {
                            Tag newTag = new Tag();
                            newTag.setName(tagName);
                            return tagRepository.save(newTag);
                        });
                tags.add(tag);
            }
        }
        question.setTags(tags);
        Question saved = questionRepository.save(question);
        QuestionDto dto = QuestionDto.fromEntity(saved);
        dto.setImageUrls(imageService.convertToFullUrls(saved.getImageUrls()));
        return dto;
    }

    public void deleteQuestion(Long id, Long userId) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        if (!question.getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the question owner can delete the question");
        }
        questionRepository.delete(question);
    }

    public int voteQuestion(Long id, Long userId, int vote) {
        // TODO: Implement voting logic (e.g., upvote/downvote, store in Vote entity)
        // For now, just return 0
        return 0;
    }
}