package com.pdsagame.backend.SnakeLadderGame.controller;

import com.pdsagame.backend.SnakeLadderGame.dto.GameDtos.*;
import com.pdsagame.backend.SnakeLadderGame.service.SnakeLadderGameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/snake")
@RequiredArgsConstructor
@Slf4j
public class GameController {

    private final SnakeLadderGameService snakeLadderGameService;

    /**
     * POST /api/game/new
     * Start a new game round.
     */
    @PostMapping("/new")
    public ResponseEntity<ApiResponse<NewGameResponse>> newGame(
            @Valid @RequestBody NewGameRequest request) {
        log.info("New game request: boardSize={}", request.getBoardSize());
        NewGameResponse response = snakeLadderGameService.createNewGame(request.getBoardSize());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Game created successfully", response));
    }

    /**
     * POST /api/game/submit
     * Submit a player's answer.
     */
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<SubmitAnswerResponse>> submitAnswer(
            @Valid @RequestBody SubmitAnswerRequest request) {
        log.info("Submit answer from player: {}", request.getPlayerName());
        SubmitAnswerResponse response = snakeLadderGameService.submitAnswer(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/game/leaderboard
     * Fetch top players with correct answers.
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntry>>> getLeaderboard() {
        List<LeaderboardEntry> leaderboard = snakeLadderGameService.getLeaderboard();
        return ResponseEntity.ok(ApiResponse.success(leaderboard));
    }

    /**
     * GET /api/game/stats/{roundId}
     * Get algorithm stats for a specific round.
     */
    @GetMapping("/stats/{roundId}")
    public ResponseEntity<ApiResponse<AlgorithmStats>> getStats(@PathVariable Long roundId) {
        AlgorithmStats stats = snakeLadderGameService.getAlgorithmStats(roundId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /**
     * GET /api/game/health
     * Health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Snake & Ladder API is running!"));
    }
}
