package com.pdsagame.backend.Minimum_Cost_Assignment.repository;

import com.pdsagame.backend.Minimum_Cost_Assignment.model.MinCostRound;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Repository
public interface MinCostRoundRepository extends JpaRepository<MinCostRound, UUID> {

    @Query("SELECT r FROM MinCostRound r WHERE LOWER(TRIM(COALESCE(r.playerName, ''))) = LOWER(TRIM(:playerName))")
    Page<MinCostRound> findByPlayerNameNormalized(@Param("playerName") String playerName, Pageable pageable);

    @Query("SELECT COUNT(r) FROM MinCostRound r WHERE LOWER(TRIM(COALESCE(r.playerName, ''))) = LOWER(TRIM(:playerName))")
    long countByPlayerNameNormalized(@Param("playerName") String playerName);

    @Modifying
    @Transactional
    @Query("DELETE FROM MinCostRound r WHERE LOWER(TRIM(COALESCE(r.playerName, ''))) = LOWER(TRIM(:playerName))")
    int deleteByPlayerNameNormalized(@Param("playerName") String playerName);

    @Modifying
    @Transactional
    @Query("DELETE FROM MinCostRound r WHERE r.playerName IS NULL OR TRIM(r.playerName) = ''")
    int deleteOrphanedRounds();
}
