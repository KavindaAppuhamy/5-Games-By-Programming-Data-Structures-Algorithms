package com.pdsagame.backend.TrafficSimulation.controller;

import com.pdsagame.backend.TrafficSimulation.repository.Repository;
import com.pdsagame.backend.TrafficSimulation.model.GameResult;

import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin("*")
public class AnalyticsController {

    private final Repository repository;

    public AnalyticsController(Repository repository) {
        this.repository = repository;
    }

    @GetMapping("/player/{playerName}")
    public Map<String, Object> getPlayerAnalytics(@PathVariable String playerName) {

        Map<String, Object> analytics = new HashMap<>();

        try {
            // ✅ OPTIONAL: support partial search (recommended)
            List<GameResult> playerGames = repository
                    .findByPlayerNameContainingIgnoreCase(playerName);

            // 🔥 FIX 1: handle empty results safely
            if (playerGames == null || playerGames.isEmpty()) {
                analytics.put("summary", new HashMap<>());
                analytics.put("roundsData", new ArrayList<>());
                analytics.put("algorithmUsage", new ArrayList<>());
                analytics.put("performanceMetrics", new ArrayList<>());
                return analytics;
            }

            // ================= SUMMARY =================
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalRounds", playerGames.size());
            summary.put("totalScore", playerGames.stream()
                    .mapToInt(GameResult::getTotalScore)
                    .max().orElse(0));
            summary.put("wins", playerGames.stream()
                    .filter(GameResult::isWin).count());
            summary.put("winRate", calculateWinRate(playerGames));
            summary.put("avgTime", calculateAvgTime(playerGames));
            summary.put("accuracy", calculateAccuracy(playerGames));

            analytics.put("summary", summary);

            // ================= ROUNDS DATA =================
            List<Map<String, Object>> roundsData = new ArrayList<>();

            List<GameResult> sortedGames = playerGames.stream()
                    .sorted(Comparator.comparing(GameResult::getRoundNumber))
                    .collect(Collectors.toList());

            for (GameResult game : sortedGames) {
                Map<String, Object> round = new HashMap<>();
                round.put("round", game.getRoundNumber());
                round.put("score", game.getRoundScore());
                round.put("cumulativeScore", game.getTotalScore());
                round.put("correct", game.isWin());
                round.put("algorithm", game.getAlgorithmUsed());
                round.put("time", game.getAlgorithmTimeMs());
                roundsData.add(round);
            }

            analytics.put("roundsData", roundsData);

            // ================= ALGORITHM USAGE =================
            Map<String, Long> algoCount = playerGames.stream()
                    .collect(Collectors.groupingBy(
                            GameResult::getAlgorithmUsed,
                            Collectors.counting()
                    ));

            List<Map<String, Object>> algorithmUsage = new ArrayList<>();

            for (Map.Entry<String, Long> entry : algoCount.entrySet()) {
                Map<String, Object> usage = new HashMap<>();
                usage.put("name", getAlgorithmDisplayName(entry.getKey()));
                usage.put("value", (entry.getValue() * 100.0) / playerGames.size());
                algorithmUsage.add(usage);
            }

            analytics.put("algorithmUsage", algorithmUsage);

            // ================= PERFORMANCE METRICS =================
            List<Map<String, Object>> performanceMetrics = new ArrayList<>();
            performanceMetrics.add(createMetric("Win Rate", calculateWinRate(playerGames)));
            performanceMetrics.add(createMetric("Accuracy", calculateAccuracy(playerGames)));
            performanceMetrics.add(createMetric("Speed", calculateSpeedScore(playerGames)));
            performanceMetrics.add(createMetric("Consistency", calculateConsistency(playerGames)));
            performanceMetrics.add(createMetric("Improvement", calculateImprovement(playerGames)));

            analytics.put("performanceMetrics", performanceMetrics);

        } catch (Exception e) {
            // 🔥 FIX 2: NEVER crash → log instead
            e.printStackTrace();

            analytics.clear();
            analytics.put("error", "Failed to fetch analytics");
        }

        return analytics;
    }

    @GetMapping("/all-players")
    public Map<String, Object> getAllPlayersAnalytics() {

        Map<String, Object> analytics = new HashMap<>();

        try {
            List<GameResult> allGames = repository.findAll();

            // 🔥 FIX: handle empty DB
            if (allGames == null || allGames.isEmpty()) {
                analytics.put("playersComparison", new ArrayList<>());
                analytics.put("overall", new HashMap<>());
                return analytics;
            }

            Map<String, List<GameResult>> playerGamesMap = allGames.stream()
                    .collect(Collectors.groupingBy(GameResult::getPlayerName));

            // ================= PLAYERS COMPARISON =================
            List<Map<String, Object>> playersComparison = new ArrayList<>();

            for (Map.Entry<String, List<GameResult>> entry : playerGamesMap.entrySet()) {

                String playerName = entry.getKey();
                List<GameResult> games = entry.getValue();

                Map<String, Object> playerData = new HashMap<>();
                playerData.put("name", playerName);
                playerData.put("totalScore", games.stream()
                        .mapToInt(GameResult::getTotalScore)
                        .max().orElse(0));
                playerData.put("rounds", games.size());
                playerData.put("wins", games.stream()
                        .filter(GameResult::isWin).count());
                playerData.put("avgTime", calculateAvgTime(games));
                playerData.put("winRate", calculateWinRate(games));

                playersComparison.add(playerData);
            }

            analytics.put("playersComparison",
                    playersComparison.stream()
                            .sorted((a, b) -> Integer.compare(
                                    (int) b.get("totalScore"),
                                    (int) a.get("totalScore")))
                            .collect(Collectors.toList())
            );

            // ================= OVERALL =================
            Map<String, Object> overall = new HashMap<>();
            overall.put("totalPlayers", playerGamesMap.size());
            overall.put("totalGames", allGames.size());
            overall.put("avgScore", allGames.stream()
                    .mapToInt(GameResult::getTotalScore)
                    .average().orElse(0));

            analytics.put("overall", overall);

        } catch (Exception e) {
            e.printStackTrace();

            analytics.clear();
            analytics.put("error", "Failed to fetch all players analytics");
        }

        return analytics;
    }

    // ================= HELPER METHODS =================

    private String getAlgorithmDisplayName(String algorithm) {
        switch (algorithm) {
            case "EDMONDS_KARP": return "Edmonds-Karp";
            case "DINIC": return "Dinic";
            case "BOTH": return "Both";
            default: return algorithm;
        }
    }

    private double calculateWinRate(List<GameResult> games) {
        if (games.isEmpty()) return 0.0;
        long wins = games.stream().filter(GameResult::isWin).count();
        return Math.round((wins * 100.0) / games.size() * 10.0) / 10.0;
    }

    private double calculateAccuracy(List<GameResult> games) {
        if (games.isEmpty()) return 0.0;

        double totalAccuracy = games.stream()
                .mapToDouble(g -> {
                    int diff = Math.abs(g.getGuessedValue() - g.getCorrectValue());
                    int maxVal = Math.max(g.getGuessedValue(), g.getCorrectValue());
                    return maxVal == 0 ? 100.0 :
                            (1.0 - (double) diff / maxVal) * 100.0;
                })
                .sum();

        return Math.round((totalAccuracy / games.size()) * 10.0) / 10.0;
    }

    private long calculateAvgTime(List<GameResult> games) {
        if (games.isEmpty()) return 0;

        return (long) games.stream()
                .mapToLong(GameResult::getAlgorithmTimeMs)
                .average()
                .orElse(0);
    }

    private double calculateSpeedScore(List<GameResult> games) {
        if (games.isEmpty()) return 0.0;

        double avgTime = calculateAvgTime(games);
        return Math.min(100,
                Math.round((1000.0 / Math.max(avgTime, 1)) * 100.0) / 100.0);
    }

    private double calculateConsistency(List<GameResult> games) {
        if (games.size() < 2) return 100.0;

        List<Integer> scores = games.stream()
                .sorted(Comparator.comparing(GameResult::getRoundNumber))
                .map(GameResult::getRoundScore)
                .collect(Collectors.toList());

        double mean = scores.stream().mapToInt(Integer::intValue)
                .average().orElse(0);

        double variance = 0;
        for (int score : scores) {
            variance += Math.pow(score - mean, 2);
        }

        variance /= scores.size();

        double consistency = 100 - Math.min(100, Math.sqrt(variance) * 20);
        return Math.round(consistency * 10.0) / 10.0;
    }

    private double calculateImprovement(List<GameResult> games) {
        if (games.size() < 2) return 50.0;

        List<GameResult> sortedGames = games.stream()
                .sorted(Comparator.comparing(GameResult::getRoundNumber))
                .collect(Collectors.toList());

        int mid = games.size() / 2;

        int firstHalf = sortedGames.subList(0, mid).stream()
                .mapToInt(GameResult::getRoundScore).sum();

        int secondHalf = sortedGames.subList(mid, games.size()).stream()
                .mapToInt(GameResult::getRoundScore).sum();

        double improvement = ((secondHalf - firstHalf) * 100.0)
                / Math.max(firstHalf, 1);

        return Math.round(
                Math.max(0, Math.min(100, improvement + 50)) * 10.0
        ) / 10.0;
    }

    private Map<String, Object> createMetric(String metric, double value) {
        Map<String, Object> m = new HashMap<>();
        m.put("metric", metric);
        m.put("value", value);
        return m;
    }
}