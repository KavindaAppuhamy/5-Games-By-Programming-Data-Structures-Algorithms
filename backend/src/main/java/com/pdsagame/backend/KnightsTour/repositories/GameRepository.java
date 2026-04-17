package com.pdsagame.backend.KnightsTour.repositories;

import com.pdsagame.backend.knightstour.entity.GameSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<GameSession, Long> {
    
    // Find all games by player name
    List<GameSession> findByPlayerName(String playerName);
    
    // Find games by board size
    List<GameSession> findByBoardSize(Integer boardSize);
    
    // Get leaderboard - top players by wins
    @Query(value = "SELECT player_name, COUNT(*) as wins FROM knights_tour_games WHERE is_correct = true GROUP BY player_name ORDER BY wins DESC LIMIT 10", nativeQuery = true)
    List<Object[]> getLeaderboard();
    
    // Get algorithm performance comparison
    @Query(value = "SELECT algorithm_used, AVG(time_taken_ms) as avg_time, COUNT(*) as games_count FROM knights_tour_games GROUP BY algorithm_used", nativeQuery = true)
    List<Object[]> getAlgorithmPerformance();
}