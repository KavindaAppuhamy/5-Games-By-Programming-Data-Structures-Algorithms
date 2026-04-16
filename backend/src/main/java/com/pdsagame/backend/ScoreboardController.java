// ScoreboardController.java
package com.pdsagame.backend;

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
            @RequestParam(defaultValue = "50") int limit,
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

    @GetMapping("/player/{playerName}")
    public Map<String, Object> getPlayerStats(@PathVariable String playerName) {
        try {
            List<GameResult> playerGames = repository.findAll().stream()
                    .filter(game -> game.getPlayerName().equalsIgnoreCase(playerName))
                    .collect(Collectors.toList());

            if (playerGames.isEmpty()) {
                throw new GameValidationException("No games found for player: " + playerName);
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("playerName", playerName);
            stats.put("totalGames", playerGames.size());
            stats.put("wins", playerGames.stream().filter(GameResult::isWin).count());
            stats.put("losses", playerGames.stream().filter(g -> !g.isWin()).count());
            stats.put("avgGuessAccuracy", calculateAverageAccuracy(playerGames));
            stats.put("recentGames", playerGames.stream()
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .limit(10)
                    .map(this::convertToEntry)
                    .collect(Collectors.toList()));

            return stats;
        } catch (GameValidationException e) {
            throw e;
        } catch (Exception e) {
            throw new GameException("Error fetching player stats: " + e.getMessage(), e);
        }
    }

    @GetMapping("/top-players")
    public Map<String, Object> getTopPlayers(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<GameResult> allGames = repository.findAll();

            // Group by player and calculate stats
            Map<String, PlayerStats> playerStatsMap = new HashMap<>();

            for (GameResult game : allGames) {
                PlayerStats stats = playerStatsMap.computeIfAbsent(
                        game.getPlayerName(),
                        k -> new PlayerStats(game.getPlayerName())
                );
                stats.addGame(game);
            }

            // Sort by win rate and then by total games
            List<PlayerStats> topPlayers = playerStatsMap.values().stream()
                    .sorted((a, b) -> {
                        if (a.getWinRate() != b.getWinRate()) {
                            return Double.compare(b.getWinRate(), a.getWinRate());
                        }
                        return Integer.compare(b.getTotalGames(), a.getTotalGames());
                    })
                    .limit(limit)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("topPlayers", topPlayers);
            response.put("totalPlayers", playerStatsMap.size());

            return response;
        } catch (Exception e) {
            throw new GameException("Error fetching top players: " + e.getMessage(), e);
        }
    }

    @DeleteMapping("/clear")
    public Map<String, Object> clearScoreboard() {
        try {
            long count = repository.count();
            repository.deleteAll();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Scoreboard cleared successfully");
            response.put("deletedCount", count);

            return response;
        } catch (Exception e) {
            throw new GameException("Error clearing scoreboard: " + e.getMessage(), e);
        }
    }

    private ScoreboardEntry convertToEntry(GameResult result) {
        return new ScoreboardEntry(
                result.getId(),
                result.getPlayerName(),
                result.getGuessedValue(),
                result.getCorrectValue(),
                result.isWin(),
                result.getEdmondsKarpTimeMs(),
                result.getDinicTimeMs(),
                result.getCreatedAt()
        );
    }

    private Map<String, Object> calculateStatistics() {
        List<GameResult> allGames = repository.findAll();

        long totalWins = allGames.stream().filter(GameResult::isWin).count();
        long totalLosses = allGames.size() - totalWins;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalGames", allGames.size());
        stats.put("totalWins", totalWins);
        stats.put("totalLosses", totalLosses);
        stats.put("winRate", allGames.isEmpty() ? 0 :
                Math.round((totalWins * 100.0) / allGames.size()));

        // Find top player
        Map<String, Long> playerWins = allGames.stream()
                .filter(GameResult::isWin)
                .collect(Collectors.groupingBy(GameResult::getPlayerName, Collectors.counting()));

        String topPlayer = playerWins.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        stats.put("topPlayer", topPlayer);
        stats.put("topPlayerWins", topPlayer != null ? playerWins.get(topPlayer) : 0);

        // Average guess difference
        double avgDiff = allGames.stream()
                .mapToInt(g -> Math.abs(g.getGuessedValue() - g.getCorrectValue()))
                .average()
                .orElse(0.0);
        stats.put("averageGuessDifference", Math.round(avgDiff * 10.0) / 10.0);

        // Average algorithm times
        double avgEkTime = allGames.stream()
                .mapToLong(GameResult::getEdmondsKarpTimeMs)
                .average()
                .orElse(0.0);
        double avgDinicTime = allGames.stream()
                .mapToLong(GameResult::getDinicTimeMs)
                .average()
                .orElse(0.0);

        stats.put("averageEkTime", Math.round(avgEkTime * 10.0) / 10.0);
        stats.put("averageDinicTime", Math.round(avgDinicTime * 10.0) / 10.0);

        return stats;
    }

    private double calculateAverageAccuracy(List<GameResult> games) {
        if (games.isEmpty()) return 0.0;

        double totalAccuracy = games.stream()
                .mapToDouble(g -> {
                    int diff = Math.abs(g.getGuessedValue() - g.getCorrectValue());
                    int maxVal = Math.max(g.getGuessedValue(), g.getCorrectValue());
                    return maxVal == 0 ? 100.0 : (1.0 - (double) diff / maxVal) * 100.0;
                })
                .sum();

        return Math.round((totalAccuracy / games.size()) * 10.0) / 10.0;
    }
}

// ScoreboardEntry.java
class ScoreboardEntry {
    private Long id;
    private String playerName;
    private int guessedValue;
    private int correctValue;
    private boolean win;
    private long edmondsKarpTimeMs;
    private long dinicTimeMs;
    private LocalDateTime createdAt;

    public ScoreboardEntry(Long id, String playerName, int guessedValue,
                           int correctValue, boolean win, long edmondsKarpTimeMs,
                           long dinicTimeMs, LocalDateTime createdAt) {
        this.id = id;
        this.playerName = playerName;
        this.guessedValue = guessedValue;
        this.correctValue = correctValue;
        this.win = win;
        this.edmondsKarpTimeMs = edmondsKarpTimeMs;
        this.dinicTimeMs = dinicTimeMs;
        this.createdAt = createdAt;
    }

    // Getters
    public Long getId() { return id; }
    public String getPlayerName() { return playerName; }
    public int getGuessedValue() { return guessedValue; }
    public int getCorrectValue() { return correctValue; }
    public boolean isWin() { return win; }
    public long getEdmondsKarpTimeMs() { return edmondsKarpTimeMs; }
    public long getDinicTimeMs() { return dinicTimeMs; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

// PlayerStats.java
class PlayerStats {
    private String playerName;
    private int totalGames;
    private int wins;
    private int losses;
    private List<Integer> recentGuesses;
    private double averageGuessAccuracy;

    public PlayerStats(String playerName) {
        this.playerName = playerName;
        this.totalGames = 0;
        this.wins = 0;
        this.losses = 0;
        this.recentGuesses = new ArrayList<>();
    }

    public void addGame(GameResult game) {
        totalGames++;
        if (game.isWin()) {
            wins++;
        } else {
            losses++;
        }
        recentGuesses.add(Math.abs(game.getGuessedValue() - game.getCorrectValue()));

        // Calculate average accuracy
        int diff = Math.abs(game.getGuessedValue() - game.getCorrectValue());
        int maxVal = Math.max(game.getGuessedValue(), game.getCorrectValue());
        double accuracy = maxVal == 0 ? 100.0 : (1.0 - (double) diff / maxVal) * 100.0;

        averageGuessAccuracy = ((averageGuessAccuracy * (totalGames - 1)) + accuracy) / totalGames;
    }

    public double getWinRate() {
        return totalGames == 0 ? 0.0 : (wins * 100.0) / totalGames;
    }

    // Getters
    public String getPlayerName() { return playerName; }
    public int getTotalGames() { return totalGames; }
    public int getWins() { return wins; }
    public int getLosses() { return losses; }
    public double getAverageGuessAccuracy() {
        return Math.round(averageGuessAccuracy * 10.0) / 10.0;
    }
}