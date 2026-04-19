package com.pdsagame.backend.SnakeLadderGame.controller;

import com.pdsagame.backend.SnakeLadderGame.dto.GameDtos.*;
import com.pdsagame.backend.SnakeLadderGame.dto.RoundSummaryDto;
import com.pdsagame.backend.SnakeLadderGame.model.PlayerResult;
import com.pdsagame.backend.SnakeLadderGame.repository.PlayerResultRepository;
import com.pdsagame.backend.SnakeLadderGame.service.SnakeLadderGameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/snake")
@RequiredArgsConstructor
@Slf4j
public class GameController {

    private final SnakeLadderGameService snakeLadderGameService;
    private final PlayerResultRepository playerResultRepository; // ✅ Injected as a bean

    @PostMapping("/new")
    public ResponseEntity<ApiResponse<NewGameResponse>> newGame(
            @Valid @RequestBody NewGameRequest request) {
        log.info("New game request: boardSize={}", request.getBoardSize());
        NewGameResponse response = snakeLadderGameService.createNewGame(request.getBoardSize());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Game created successfully", response));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<SubmitAnswerResponse>> submitAnswer(
            @Valid @RequestBody SubmitAnswerRequest request) {
        log.info("Submit answer from player: {}", request.getPlayerName());
        SubmitAnswerResponse response = snakeLadderGameService.submitAnswer(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntry>>> getLeaderboard() {
        List<LeaderboardEntry> leaderboard = snakeLadderGameService.getLeaderboard();
        return ResponseEntity.ok(ApiResponse.success(leaderboard));
    }

    @GetMapping("/stats/{roundId}")
    public ResponseEntity<ApiResponse<AlgorithmStats>> getStats(@PathVariable Long roundId) {
        AlgorithmStats stats = snakeLadderGameService.getAlgorithmStats(roundId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Snake & Ladder API is running!"));
    }

    // Add to GameController.java

    @GetMapping("/rounds")
    public ResponseEntity<ApiResponse<List<RoundSummaryDto>>> getAllRounds(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.success(snakeLadderGameService.getAllRounds(limit)));
    }

    @GetMapping("/rounds/player/{playerName}")
    public ResponseEntity<ApiResponse<List<RoundSummaryDto>>> getRoundsByPlayer(
            @PathVariable String playerName,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.success(
                snakeLadderGameService.getRoundsByPlayer(playerName, limit)));
    }

    @GetMapping("/players")
    public ResponseEntity<ApiResponse<List<String>>> getPlayerNames() {
        return ResponseEntity.ok(ApiResponse.success(snakeLadderGameService.getAllPlayerNames()));
    }
}