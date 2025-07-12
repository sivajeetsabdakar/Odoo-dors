package com.stackit.backend.service;

import com.stackit.backend.dto.AnswerDto;
import com.stackit.backend.dto.request.CreateAnswerRequest;
import com.stackit.backend.entity.Answer;
import com.stackit.backend.entity.Question;
import com.stackit.backend.entity.User;
import com.stackit.backend.repository.AnswerRepository;
import com.stackit.backend.repository.QuestionRepository;
import com.stackit.backend.repository.UserRepository;
import com.stackit.backend.exception.ContentModerationException;
import com.stackit.backend.dto.ModerationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnswerService {

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImageService imageService;

    @Autowired
    private ContentModerationService contentModerationService;

    public List<AnswerDto> getAnswersByQuestion(Long questionId) {
        List<Answer> answers = answerRepository.findByQuestionIdOrderByIsAcceptedDescCreatedAtAsc(questionId);
        return answers.stream()
                .map(answer -> {
                    AnswerDto dto = AnswerDto.fromEntity(answer);
                    dto.setImageUrls(imageService.convertToFullUrls(answer.getImageUrls()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public AnswerDto createAnswer(CreateAnswerRequest request, Long questionId, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Moderate text content
        ModerationDto.ModerationResponse textModeration = contentModerationService
                .moderateText(request.getDescription(), "answer");

        if (contentModerationService.isContentBlocked(textModeration)) {
            throw new ContentModerationException(
                    "Answer content violates community guidelines: "
                            + String.join(", ", textModeration.getFlaggedReasons()),
                    request.getDescription(),
                    "answer",
                    textModeration.getModerationAction());
        }

        // Moderate images if present
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<String> imageUrlsList = new java.util.ArrayList<>(request.getImageUrls());
            List<ModerationDto.ModerationResponse> imageModerations = contentModerationService
                    .moderateImages(imageUrlsList);

            for (int i = 0; i < imageModerations.size(); i++) {
                ModerationDto.ModerationResponse imageModeration = imageModerations.get(i);
                if (contentModerationService.isContentBlocked(imageModeration)) {
                    throw new ContentModerationException(
                            "Answer image violates community guidelines: "
                                    + String.join(", ", imageModeration.getFlaggedReasons()),
                            imageUrlsList.get(i),
                            "image",
                            imageModeration.getModerationAction());
                }
            }
        }

        Answer answer = new Answer();
        answer.setQuestion(question);
        answer.setUser(user);
        answer.setDescription(request.getDescription());

        // Handle image URLs
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            String imageUrlsString = imageService
                    .convertToString(new java.util.ArrayList<>(request.getImageUrls()));
            answer.setImageUrls(imageUrlsString);
        }

        Answer savedAnswer = answerRepository.save(answer);
        AnswerDto dto = AnswerDto.fromEntity(savedAnswer);
        dto.setImageUrls(imageService.convertToFullUrls(savedAnswer.getImageUrls()));
        return dto;
    }

    public AnswerDto acceptAnswer(Long answerId, Long userId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));

        Question question = answer.getQuestion();
        if (!question.getUser().getId().equals(userId)) {
            throw new RuntimeException("Only question owner can accept answers");
        }

        // Unaccept other answers for this question
        List<Answer> otherAnswers = answerRepository
                .findByQuestionIdOrderByIsAcceptedDescCreatedAtAsc(question.getId());
        otherAnswers.forEach(a -> {
            if (!a.getId().equals(answerId) && a.getIsAccepted()) {
                a.setIsAccepted(false);
                answerRepository.save(a);
            }
        });

        answer.setIsAccepted(true);
        Answer savedAnswer = answerRepository.save(answer);
        AnswerDto dto = AnswerDto.fromEntity(savedAnswer);
        dto.setImageUrls(imageService.convertToFullUrls(savedAnswer.getImageUrls()));
        return dto;
    }

    public AnswerDto updateAnswer(Long id, Long userId, String description, List<String> imageUrls) {
        Answer answer = answerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Answer not found"));
        if (!answer.getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the answer owner can update the answer");
        }

        // Moderate text content
        ModerationDto.ModerationResponse textModeration = contentModerationService.moderateText(description, "answer");

        if (contentModerationService.isContentBlocked(textModeration)) {
            throw new ContentModerationException(
                    "Updated answer content violates community guidelines: "
                            + String.join(", ", textModeration.getFlaggedReasons()),
                    description,
                    "answer",
                    textModeration.getModerationAction());
        }

        // Moderate images if present
        if (imageUrls != null && !imageUrls.isEmpty()) {
            List<ModerationDto.ModerationResponse> imageModerations = contentModerationService
                    .moderateImages(imageUrls);

            for (int i = 0; i < imageModerations.size(); i++) {
                ModerationDto.ModerationResponse imageModeration = imageModerations.get(i);
                if (contentModerationService.isContentBlocked(imageModeration)) {
                    throw new ContentModerationException(
                            "Updated answer image violates community guidelines: "
                                    + String.join(", ", imageModeration.getFlaggedReasons()),
                            imageUrls.get(i),
                            "image",
                            imageModeration.getModerationAction());
                }
            }
        }

        answer.setDescription(description);
        if (imageUrls != null) {
            answer.setImageUrls(imageService.convertToString(new java.util.ArrayList<>(imageUrls)));
        }
        Answer saved = answerRepository.save(answer);
        AnswerDto dto = AnswerDto.fromEntity(saved);
        dto.setImageUrls(imageService.convertToFullUrls(saved.getImageUrls()));
        return dto;
    }

    public void deleteAnswer(Long id, Long userId) {
        Answer answer = answerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Answer not found"));
        if (!answer.getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the answer owner can delete the answer");
        }
        answerRepository.delete(answer);
    }

    public int voteAnswer(Long id, Long userId, int vote) {
        // TODO: Implement voting logic (e.g., upvote/downvote, store in Vote entity)
        // For now, just return 0
        return 0;
    }
}