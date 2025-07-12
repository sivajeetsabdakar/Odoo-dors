package com.stackit.backend.repository;

import com.stackit.backend.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT t FROM Tag t WHERE t.name LIKE %:searchTerm%")
    List<Tag> findByNameContaining(@Param("searchTerm") String searchTerm);

    @Query("SELECT t FROM Tag t ORDER BY (SELECT COUNT(qt) FROM Question q JOIN q.tags qt WHERE qt.id = t.id) DESC")
    List<Tag> findMostPopularTags();
}