package com.pdsagame.backend.TrafficSimulation.controller;

import com.pdsagame.backend.TrafficSimulation.repository.Repository;
import com.pdsagame.backend.TrafficSimulation.model.GameResult;
import com.pdsagame.backend.TrafficSimulation.exception.GameException;

import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/scoreboard")
@CrossOrigin("*")
public class ScoreboardController {

    private final Repository repository;

    public ScoreboardController(Repository repository) {
        this.repository = repository;
    }

    @GetMapping("/all")
    public Map<String, Object> getScoreboard(
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        try {
            Sort.Direction sortDirection = Sort.Direction.fromString(direction);
            PageRequest pageRequest = PageRequest.of(0, limit, Sort.by(sortDirection, sortBy));

            List<GameResult> results = repository.findAll(pageRequest).getContent();
            List<ScoreboardEntry> scores = results.stream()
                    .map(this::convertToEntry)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("scores", scores);
            response.put("statistics", calculateStatistics());
            response.put("total", repository.count());

            return response;
        } catch (Exception e) {
            throw new GameException("Error fetching scoreboard: " + e.getMessage(), e);
        }
    }

    private ScoreboardEntry convertToEntry(GameResult result) {
        return new ScoreboardEntry(
                result.getId(),
                result.getPlayerName(),
                result.getGuessedValue(),
                result.getCorrectValue(),
                result.isWin(),
                result.getAlgorithmUsed(),
                result.getRoundNumber(),
                result.getRoundScore(),
                result.getTotalScore(),
                result.getAlgorithmTimeMs(),
                result.getCreatedAt()
        );
    }

    private Map<String, Object> calculateStatistics() {
        List<GameResult> allGames = repository.findAll();

        long totalWins = allGames.stream().filter(GameResult::isWin).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalGames", allGames.size());
        stats.put("totalWins", totalWins);
        stats.put("winRate", allGames.isEmpty() ? 0 :
                Math.round((totalWins * 100.0) / allGames.size()));

        // Find top player by total score
        Map<String, Integer> playerScores = new HashMap<>();
        for (GameResult game : allGames) {
            playerScores.merge(game.getPlayerName(), game.getTotalScore(), Math::max);
        }

        String topPlayer = playerScores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        stats.put("topPlayer", topPlayer);
        stats.put("highestScore", topPlayer != null ? playerScores.get(topPlayer) : 0);

        return stats;
    }
}

class ScoreboardEntry {
    private Long id;
    private String playerName;
    private int guessedValue;
    private int correctValue;
    private boolean win;
    private String algorithmUsed;
    private int roundNumber;
    private int roundScore;
    private int totalScore;
    private long algorithmTimeMs;
    private LocalDateTime createdAt;

    public ScoreboardEntry(Long id, String playerName, int guessedValue,
                           int correctValue, boolean win, String algorithmUsed,
                           int roundNumber, int roundScore, int totalScore,
                           long algorithmTimeMs, LocalDateTime createdAt) {
        this.id = id;
        this.playerName = playerName;
        this.guessedValue = guessedValue;
        this.correctValue = correctValue;
        this.win = win;
        this.algorithmUsed = algorithmUsed;
        this.roundNumber = roundNumber;
        this.roundScore = roundScore;
        this.totalScore = totalScore;
        this.algorithmTimeMs = algorithmTimeMs;
        this.createdAt = createdAt;
    }

    // Getters
    public Long getId() { return id; }
    public String getPlayerName() { return playerName; }
    public int getGuessedValue() { return guessedValue; }
    public int getCorrectValue() { return correctValue; }
    public boolean isWin() { return win; }
    public String getAlgorithmUsed() { return algorithmUsed; }
    public int getRoundNumber() { return roundNumber; }
    public int getRoundScore() { return roundScore; }
    public int getTotalScore() { return totalScore; }
    public long getAlgorithmTimeMs() { return algorithmTimeMs; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}