package com.pdsagame.backend.TrafficSimulation.repository;

import com.pdsagame.backend.TrafficSimulation.model.GameResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface Repository extends JpaRepository<GameResult, Long> {
    List<GameResult> findByPlayerNameOrderByCreatedAtDesc(String playerName);
    List<GameResult> findByPlayerName(String playerName);

    List<GameResult> findByPlayerNameContainingIgnoreCase(String playerName);
}