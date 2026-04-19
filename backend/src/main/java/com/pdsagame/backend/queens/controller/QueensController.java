package com.pdsagame.backend.queens.controller;

import com.pdsagame.backend.queens.service.QueensGameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/queens")
@CrossOrigin(origins = "*")
public class QueensController {

    private final QueensGameService service;

    public QueensController(QueensGameService service) {
        this.service = service;
    }

    // ------------------------------------------------ Solver endpoints

    /**
     * POST /api/queens/solve/sequential
     * Runs the sequential backtracking solver and saves results to DB.
     */
    @PostMapping("/solve/sequential")
    public ResponseEntity<QueensGameService.SolverRunDto> runSequential() {
        return ResponseEntity.ok(service.runSequential());
    }

    /**
     * POST /api/queens/solve/threaded
     * Runs the multithreaded solver and saves results to DB.
     */
    @PostMapping("/solve/threaded")
    public ResponseEntity<QueensGameService.SolverRunDto> runThreaded() {
        return ResponseEntity.ok(service.runThreaded());
    }

    /**
     * GET /api/queens/solve/compare
     * Returns the latest sequential vs threaded run results for comparison.
     */
    @GetMapping("/solve/compare")
    public ResponseEntity<QueensGameService.ComparisonDto> compare() {
        return ResponseEntity.ok(service.getComparison());
    }

    /**
     * GET /api/queens/solve/get
     * Returns all the sequential vs threaded run results for comparison.
     */
    @GetMapping("/solve/get")
    public ResponseEntity<List<QueensService.SolverRunDto>> getAllSolverRuns() {
        return ResponseEntity.ok(service.getAllSolverRuns());
    }

    // ------------------------------------------------ Game endpoints

    /**
     * POST /api/queens/submit
     * Body: { "playerName": "Alice", "placement": [1,3,0,2, ...] }
     * Validates and records a player's solution attempt.
     */
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submit(@RequestBody SubmitRequest request) {
        QueensGameService.SubmitResult result = service.submitSolution(request.playerName(), request.placement());
        return ResponseEntity.ok(Map.of(
                "status", result.status.name(),
                "message", result.message,
                "playerName", result.playerName != null ? result.playerName : "",
                "solutionKey", result.solutionKey != null ? result.solutionKey : ""
        ));
    }

    /**
     * GET /api/queens/solutions
     * Returns all solutions in DB with claim status.
     */
    @GetMapping("/solutions")
    public ResponseEntity<List<QueensGameService.SolutionDto>> getSolutions() {
        return ResponseEntity.ok(service.getAllSolutions());
    }

    /**
     * GET /api/queens/leaderboard
     * Returns player rankings sorted by number of solutions found.
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<QueensGameService.LeaderboardEntry>> getLeaderboard() {
        return ResponseEntity.ok(service.getLeaderboard());
    }

    // ------------------------------------------------ Request record

    public record SubmitRequest(String playerName, int[] placement) {}
}