package com.pdsagame.backend.queens.repository;

import com.pdsagame.backend.queens.entity.QueensSolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QueensSolutionRepository extends JpaRepository<QueensSolution, Long> {

    Optional<QueensSolution> findBySolutionKey(String solutionKey);

    boolean existsBySolutionKey(String solutionKey);

    List<QueensSolution> findByClaimedFalse();

    List<QueensSolution> findByClaimedTrue();

    long countByClaimed(boolean claimed);

    @Modifying
    @Query("UPDATE QueensSolution s SET s.claimed = false, s.claimedBy = null, s.claimedAt = null")
    void resetAllClaims();
}