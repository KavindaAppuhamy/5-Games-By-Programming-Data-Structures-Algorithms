package com.pdsagame.backend.SnakeLadderGame.repository;

import com.pdsagame.backend.SnakeLadderGame.model.PlayerResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerResultRepository extends JpaRepository<PlayerResult, Long> {

    List<PlayerResult> findByPlayerNameIgnoreCase(String playerName);

    List<PlayerResult> findByCorrectTrue();

    @Query("SELECT pr FROM PlayerResult pr WHERE pr.correct = true ORDER BY pr.answeredAt DESC")
    List<PlayerResult> findCorrectAnswersOrderByDate();

    @Query("SELECT COUNT(pr) FROM PlayerResult pr WHERE pr.playerName = :playerName AND pr.correct = true")
    long countCorrectByPlayerName(String playerName);

    @Query("SELECT pr FROM PlayerResult pr ORDER BY pr.answeredAt DESC")
    List<PlayerResult> findAllOrderByDateDesc();
}
