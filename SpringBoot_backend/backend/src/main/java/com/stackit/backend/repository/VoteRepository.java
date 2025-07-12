package com.stackit.backend.repository;

import com.stackit.backend.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    Optional<Vote> findByUserIdAndAnswerId(Long userId, Long answerId);

    List<Vote> findByAnswerId(Long answerId);

    @Query("SELECT COUNT(v) FROM Vote v WHERE v.answer.id = :answerId AND v.voteType = 1")
    Long countUpvotesByAnswerId(@Param("answerId") Long answerId);

    @Query("SELECT COUNT(v) FROM Vote v WHERE v.answer.id = :answerId AND v.voteType = -1")
    Long countDownvotesByAnswerId(@Param("answerId") Long answerId);
}