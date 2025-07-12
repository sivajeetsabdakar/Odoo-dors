package com.stackit.backend.repository;

import com.stackit.backend.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    List<Answer> findByQuestionIdOrderByIsAcceptedDescCreatedAtAsc(Long questionId);

    List<Answer> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT a FROM Answer a WHERE a.question.id = :questionId AND a.isAccepted = true")
    Answer findAcceptedAnswerByQuestionId(@Param("questionId") Long questionId);

    @Query("SELECT COUNT(a) FROM Answer a WHERE a.user.id = :userId AND a.isAccepted = true")
    Long countAcceptedAnswersByUserId(@Param("userId") Long userId);
}