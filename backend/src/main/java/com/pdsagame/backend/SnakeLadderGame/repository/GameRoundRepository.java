package com.pdsagame.backend.SnakeLadderGame.repository;

import com.pdsagame.backend.SnakeLadderGame.model.GameRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameRoundRepository extends JpaRepository<GameRound, Long> {

    @Query("SELECT g FROM GameRound g ORDER BY g.createdAt DESC")
    List<GameRound> findAllOrderByCreatedAtDesc();

    @Query("SELECT AVG(g.bfsTimeNs) FROM GameRound g WHERE g.boardSize = :boardSize")
    Double findAvgBfsTimeByBoardSize(int boardSize);

    @Query("SELECT AVG(g.dijkstraTimeNs) FROM GameRound g WHERE g.boardSize = :boardSize")
    Double findAvgDijkstraTimeByBoardSize(int boardSize);
}
