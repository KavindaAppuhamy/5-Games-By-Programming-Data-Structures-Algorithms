package com.pdsagame.backend.queens.repository;

import com.pdsagame.backend.queens.entity.PlayerRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerRecordRepository extends JpaRepository<PlayerRecord, Long> {

    List<PlayerRecord> findByPlayerNameOrderBySubmittedAtDesc(String playerName);

    boolean existsByPlayerNameAndSolutionKey(String playerName, String solutionKey);

    @Query("SELECT p.playerName, COUNT(p) as cnt FROM PlayerRecord p GROUP BY p.playerName ORDER BY cnt DESC")
    List<Object[]> findLeaderboard();

    long countByPlayerName(String playerName);
}