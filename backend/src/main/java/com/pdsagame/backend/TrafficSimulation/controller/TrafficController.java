package com.pdsagame.backend.TrafficSimulation.controller;

import com.pdsagame.backend.TrafficSimulation.service.TrafficGameService;
import com.pdsagame.backend.TrafficSimulation.repository.Repository;
import com.pdsagame.backend.TrafficSimulation.dto.GameSubmitRequest;
import com.pdsagame.backend.TrafficSimulation.model.GameResult;
import com.pdsagame.backend.TrafficSimulation.exception.GameException;
import com.pdsagame.backend.TrafficSimulation.exception.GameValidationException;

import com.pdsagame.backend.TrafficSimulation.service.MaxFlowResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import jakarta.validation.Valid;

import java.util.*;

@RestController
@RequestMapping("/api/game")
@CrossOrigin("*")
public class TrafficController {

    private final TrafficGameService gameService;
    private final Repository repository;

    @Autowired
    public TrafficController(TrafficGameService gameService, Repository repository) {
        this.gameService = gameService;
        this.repository = repository;
    }

    // ---------------- START GAME ----------------
    @GetMapping("/start")
    public Map<String, Object> startGame(@RequestParam(defaultValue = "BOTH") String algorithm) {
        try {
            System.out.println(">>> START GAME called with algorithm: " + algorithm);
            Map<String, Object> res = new HashMap<>();
            res.put("edges", gameService.startGame(algorithm));
            res.put("algorithm", algorithm);
            return res;
        } catch (GameException e) {
            System.err.println(">>> GameException in startGame: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println(">>> Unexpected error in startGame: " + e.getMessage());
            e.printStackTrace();
            throw new GameException("Unexpected error starting game: " + e.getMessage(), e);
        }
    }

    // ---------------- SUBMIT GUESS ----------------
    @PostMapping("/submit")
    public Map<String, Object> submit(@Valid @RequestBody GameSubmitRequest request) {
        try {
            System.out.println(">>> SUBMIT called with: name=" + request.getName() + ", guess=" + request.getGuess() + ", algorithm=" + request.getAlgorithm());

            String name = request.getName();
            int guess = request.getGuess();
            String algorithm = request.getAlgorithm();

            // Calculate max flow with selected algorithm
            MaxFlowResult result = gameService.calculateMaxFlow(algorithm);
            int correct = result.getMaxFlow();
            System.out.println(">>> Max flow calculated: " + correct);

            boolean win = (guess == correct);

            // Get player's current round and score - WITH NULL CHECK
            List<GameResult> playerGames = repository.findByPlayerNameOrderByCreatedAtDesc(name);
            if (playerGames == null) {
                playerGames = new ArrayList<>();
            }

            int currentRound = playerGames.size() + 1;
            int totalScore = 0;
            for (GameResult g : playerGames) {
                if (g.isWin()) {
                    totalScore += 10;
                }
            }

            int roundScore = win ? 10 : 0;
            totalScore += roundScore;

            // Save game result
            GameResult gameResult = new GameResult();
            gameResult.setPlayerName(name);
            gameResult.setGuessedValue(guess);
            gameResult.setCorrectValue(correct);
            gameResult.setWin(win);
            gameResult.setAlgorithmUsed(algorithm);
            gameResult.setRoundNumber(currentRound);
            gameResult.setRoundScore(roundScore);
            gameResult.setTotalScore(totalScore);

            // Set algorithm-specific time
            if ("EDMONDS_KARP".equals(algorithm)) {
                gameResult.setAlgorithmTimeMs(result.getEkTimeMs());
            } else if ("DINIC".equals(algorithm)) {
                gameResult.setAlgorithmTimeMs(result.getDinicTimeMs());
            } else {
                gameResult.setAlgorithmTimeMs((result.getEkTimeMs() + result.getDinicTimeMs()) / 2);
            }

            gameResult.setEdmondsKarpTimeMs(result.getEkTimeMs());
            gameResult.setDinicTimeMs(result.getDinicTimeMs());

            System.out.println(">>> Saving game result to database...");
            repository.save(gameResult);
            System.out.println(">>> Game result saved successfully!");

            // Response
            Map<String, Object> res = new HashMap<>();
            res.put("correct", correct);
            res.put("win", win);
            res.put("roundNumber", currentRound);
            res.put("roundScore", roundScore);
            res.put("totalScore", totalScore);
            res.put("algorithm", algorithm);
            res.put("algorithmTime", gameResult.getAlgorithmTimeMs());

            return res;
        } catch (GameValidationException | GameException e) {
            System.err.println(">>> Validation/Game Exception: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println(">>> Unexpected error in submit: " + e.getMessage());
            e.printStackTrace();
            throw new GameException("Unexpected error submitting guess: " + e.getMessage(), e);
        }
    }

    // ---------------- GET PLAYER STATS ----------------
    @GetMapping("/player-stats")
    public Map<String, Object> getPlayerStats(@RequestParam String playerName) {
        try {
            System.out.println(">>> Getting stats for player: " + playerName);

            List<GameResult> playerGames = repository.findByPlayerNameOrderByCreatedAtDesc(playerName);
            if (playerGames == null) {
                playerGames = new ArrayList<>();
            }

            int totalRounds = playerGames.size();
            int totalScore = 0;
            int wins = 0;

            for (GameResult g : playerGames) {
                if (g.isWin()) {
                    totalScore += 10;
                    wins++;
                }
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("playerName", playerName);
            stats.put("roundsPlayed", totalRounds);
            stats.put("totalScore", totalScore);
            stats.put("wins", wins);
            stats.put("losses", totalRounds - wins);
            stats.put("winRate", totalRounds > 0 ? (wins * 100.0 / totalRounds) : 0);

            return stats;
        } catch (Exception e) {
            System.err.println(">>> Error in getPlayerStats: " + e.getMessage());
            e.printStackTrace();

            // Return empty stats instead of throwing
            Map<String, Object> stats = new HashMap<>();
            stats.put("playerName", playerName);
            stats.put("roundsPlayed", 0);
            stats.put("totalScore", 0);
            stats.put("wins", 0);
            stats.put("losses", 0);
            stats.put("winRate", 0);
            return stats;
        }
    }
}