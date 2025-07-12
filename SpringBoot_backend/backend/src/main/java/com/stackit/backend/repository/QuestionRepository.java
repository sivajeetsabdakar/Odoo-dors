package com.stackit.backend.repository;

import com.stackit.backend.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    Page<Question> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Question> findByTagsNameInOrderByCreatedAtDesc(List<String> tagNames, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.title LIKE %:searchTerm% OR q.description LIKE %:searchTerm%")
    Page<Question> findBySearchTerm(@Param("searchTerm") String searchTerm, Pageable pageable);

    List<Question> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT q FROM Question q JOIN q.tags t WHERE t.name = :tagName ORDER BY q.createdAt DESC")
    List<Question> findByTagName(@Param("tagName") String tagName);
}