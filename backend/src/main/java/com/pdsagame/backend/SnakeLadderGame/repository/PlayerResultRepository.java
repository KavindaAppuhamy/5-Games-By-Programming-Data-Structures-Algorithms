package com.pdsagame.backend.SnakeLadderGame.repository;

import com.pdsagame.backend.SnakeLadderGame.dto.RoundSummaryDto;
import com.pdsagame.backend.SnakeLadderGame.model.PlayerResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerResultRepository extends JpaRepository<PlayerResult, Long> {

    // Matches your exact SQL query (individual player)
    @Query("""
        SELECT new com.pdsagame.backend.SnakeLadderGame.dto.RoundSummaryDto(
            gr.id,
            gr.boardSize,
            gr.minDiceThrows,
            gr.bfsTimeNs,
            gr.dijkstraTimeNs,
            pr.playerAnswer,
            pr.correct,
            pr.playerId
        )
        FROM GameRound gr
        JOIN PlayerResult pr ON gr.id = pr.gameRoundId
        JOIN Player p        ON pr.playerId = p.id
        WHERE p.name = :playerName
        ORDER BY gr.createdAt DESC
        """)
    List<RoundSummaryDto> findRoundsByPlayerName(@Param("playerName") String playerName);

    // All players version
    @Query("""
        SELECT new com.pdsagame.backend.SnakeLadderGame.dto.RoundSummaryDto(
            gr.id,
            gr.boardSize,
            gr.minDiceThrows,
            gr.bfsTimeNs,
            gr.dijkstraTimeNs,
            pr.playerAnswer,
            pr.correct,
            pr.playerId
        )
        FROM GameRound gr
        JOIN PlayerResult pr ON gr.id = pr.gameRoundId
        JOIN Player p        ON pr.playerId = p.id
        ORDER BY gr.createdAt DESC
        """)
    List<RoundSummaryDto> findAllRoundsWithPlayers();

    // For leaderboard
    @Query("""
        SELECT p.name
        FROM Player p
        ORDER BY p.name ASC
        """)
    List<String> findAllPlayerNames();

    @Query("SELECT pr FROM PlayerResult pr WHERE pr.correct = true ORDER BY pr.answeredAt DESC")
    List<PlayerResult> findCorrectAnswersOrderByDate();

    @Query("SELECT pr FROM PlayerResult pr ORDER BY pr.answeredAt DESC")
    List<PlayerResult> findAllOrderByDateDesc();

    @Query("""
    SELECT p.name, pr.answeredAt
    FROM PlayerResult pr
    JOIN Player p ON pr.playerId = p.id
    WHERE pr.correct = true
    ORDER BY pr.answeredAt DESC
    """)
    List<Object[]> findCorrectAnswersWithPlayerName();
}
