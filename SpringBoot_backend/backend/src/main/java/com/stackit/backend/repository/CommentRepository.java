package com.stackit.backend.repository;

import com.stackit.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByAnswerIdOrderByCreatedAtAsc(Long answerId);

    List<Comment> findByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByAnswerId(Long answerId);
}