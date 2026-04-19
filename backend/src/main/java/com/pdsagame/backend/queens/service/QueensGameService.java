package com.pdsagame.backend.queens.service;

import com.pdsagame.backend.queens.algorithm.*;
import com.pdsagame.backend.queens.entity.*;
import com.pdsagame.backend.queens.exception.*;
import com.pdsagame.backend.queens.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class QueensGameService {

    @Value("${queens.board.size}")
    private int BOARD_SIZE = 16;
    @Value("${queens.solver.solution-limit}")
    private int SOLVER_LIMIT = 500; // solutions stored in DB per run

    private final QueensSolutionRepository solutionRepo;
    private final PlayerRecordRepository playerRepo;
    private final SolverRunRepository solverRunRepo;
    private final SequentialQueensSolver seqSolver;
    private final ThreadedQueensSolver thrSolver;

    public QueensGameService(QueensSolutionRepository solutionRepo,
                             PlayerRecordRepository playerRepo,
                             SolverRunRepository solverRunRepo,
                             SequentialQueensSolver seqSolver,
                             ThreadedQueensSolver thrSolver) {
        this.solutionRepo = solutionRepo;
        this.playerRepo = playerRepo;
        this.solverRunRepo = solverRunRepo;
        this.seqSolver = seqSolver;
        this.thrSolver = thrSolver;
    }

    // ------------------------------------------------------------------ Solvers

    /**
     * Run the sequential solver, persist solutions and timing to DB.
     */
    @Transactional
    public SolverRunDto runSequential() {
        SolveResult result = seqSolver.solve(BOARD_SIZE, SOLVER_LIMIT);
        persistSolutions(result.getSolutions());
        SolverRun run = solverRunRepo.save(
                new SolverRun(SolverRun.SolverType.SEQUENTIAL,
                        result.getSolutionCount(),
                        result.getExecutionTimeMs()));
        return toDto(run);
    }

    /**
     * Run the threaded solver, persist solutions and timing to DB.
     */
    @Transactional
    public SolverRunDto runThreaded() {
        try {
            SolveResult result = thrSolver.solve(BOARD_SIZE, SOLVER_LIMIT);
            persistSolutions(result.getSolutions());
            SolverRun run = solverRunRepo.save(
                    new SolverRun(SolverRun.SolverType.THREADED,
                            result.getSolutionCount(),
                            result.getExecutionTimeMs()));
            return toDto(run);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new SolverException("Threaded solver was interrupted", e);
        } catch (ExecutionException e) {
            throw new SolverException("Threaded solver encountered an error", e);
        }
    }

    /** Get the latest run results for both solver types for comparison. */
    public ComparisonDto getComparison() {
        Optional<SolverRun> seq = solverRunRepo.findTopBySolverTypeOrderByRanAtDesc(SolverRun.SolverType.SEQUENTIAL);
        Optional<SolverRun> thr = solverRunRepo.findTopBySolverTypeOrderByRanAtDesc(SolverRun.SolverType.THREADED);
        return new ComparisonDto(seq.map(this::toDto).orElse(null), thr.map(this::toDto).orElse(null));
    }

    /** Get all the comparisons */
    public List<SolverRunDto> getAllSolverRuns() {
        return solverRunRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    // ------------------------------------------------------------------ Gameplay

    /**
     * Submit a player's board. Validates, checks duplicates, saves to DB.
     *
     * @param playerName non-blank player name
     * @param placement  int[16] — placement[row] = col
     * @return SubmitResult describing outcome
     */
    @Transactional
    public SubmitResult submitSolution(String playerName, int[] placement) {
        // --- Validation ---
        validatePlayerName(playerName);
        validatePlacement(placement);

        if (!SequentialQueensSolver.isValidSolution(placement))
            throw new InvalidSolutionException("Queens are attacking each other. Not a valid solution.");

        String key = SequentialQueensSolver.toKey(placement);

        // --- Check if already identified ---
        Optional<QueensSolution> existing = solutionRepo.findBySolutionKey(key);

        if (existing.isPresent() && existing.get().isClaimed()) {
            // Check if all loaded solutions are claimed
            long unclaimed = solutionRepo.countByClaimed(false);
            if (unclaimed == 0) {
                // Reset all claims so the game can restart
                solutionRepo.resetAllClaims();
                return SubmitResult.allSolutionsFound(playerName);
            }
            return SubmitResult.alreadyClaimed(existing.get().getClaimedBy());
        }

        // --- Save solution if not already in DB ---
        QueensSolution solution;
        solution = existing.orElseGet(() -> solutionRepo.save(new QueensSolution(key, key)));

        // Mark as claimed
        solution.setClaimed(true);
        solution.setClaimedBy(playerName);
        solution.setClaimedAt(LocalDateTime.now());
        solutionRepo.save(solution);

        // Save player record
        playerRepo.save(new PlayerRecord(playerName, key));

        return SubmitResult.success(playerName, key);
    }

    /** Get all solutions with their claim status. */
    public List<SolutionDto> getAllSolutions() {
        return solutionRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    /** Get leaderboard: player name + solution count, sorted descending. */
    public List<LeaderboardEntry> getLeaderboard() {
        return playerRepo.findLeaderboard().stream()
                .map(row -> new LeaderboardEntry((String) row[0], ((Number) row[1]).longValue()))
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------ Private helpers

    private void persistSolutions(List<int[]> solutions) {
        for (int[] sol : solutions) {
            String key = SequentialQueensSolver.toKey(sol);
            if (!solutionRepo.existsBySolutionKey(key)) {
                solutionRepo.save(new QueensSolution(key, key));
            }
        }
    }

    private void validatePlayerName(String name) {
        if (name == null || name.isBlank())
            throw new ValidationException("Player name must not be blank.");
        if (name.length() > 100)
            throw new ValidationException("Player name must not exceed 100 characters.");
    }

    private void validatePlacement(int[] placement) {
        if (placement == null)
            throw new ValidationException("Placement array must not be null.");
        if (placement.length != BOARD_SIZE)
            throw new ValidationException("Placement must have exactly " + BOARD_SIZE + " entries.");
        for (int col : placement) {
            if (col < 0 || col >= BOARD_SIZE)
                throw new ValidationException("Each column value must be between 0 and " + (BOARD_SIZE - 1) + ".");
        }
    }

    private SolverRunDto toDto(SolverRun r) {
        return new SolverRunDto(r.getId(), r.getSolverType().name(), r.getSolutionsFound(), r.getExecutionTimeMs(), r.getRanAt());
    }

    private SolutionDto toDto(QueensSolution s) {
        return new SolutionDto(s.getId(), s.getSolutionKey(), s.isClaimed(), s.getClaimedBy(), s.getClaimedAt());
    }

    // ------------------------------------------------------------------ Inner DTOs

    public record SolverRunDto(Long id, String solverType, int solutionsFound, long executionTimeMs, LocalDateTime ranAt) {}
    public record ComparisonDto(SolverRunDto sequential, SolverRunDto threaded) {}
    public record SolutionDto(Long id, String solutionKey, boolean claimed, String claimedBy, LocalDateTime claimedAt) {}
    public record LeaderboardEntry(String playerName, long solutionsFound) {}

    public static class SubmitResult {
        public enum Status { SUCCESS, ALREADY_CLAIMED, ALL_FOUND }
        public final Status status;
        public final String message;
        public final String playerName;
        public final String solutionKey;

        private SubmitResult(Status status, String message, String playerName, String solutionKey) {
            this.status = status; this.message = message;
            this.playerName = playerName; this.solutionKey = solutionKey;
        }
        public static SubmitResult success(String name, String key) {
            return new SubmitResult(Status.SUCCESS, "Correct! Solution saved for " + name + ".", name, key);
        }
        public static SubmitResult alreadyClaimed(String claimedBy) {
            return new SubmitResult(Status.ALREADY_CLAIMED,
                    "This solution was already identified by " + claimedBy + ". Try a different arrangement!", null, null);
        }
        public static SubmitResult allSolutionsFound(String name) {
            return new SubmitResult(Status.ALL_FOUND,
                    "All solutions found! Claims have been reset. You can play again!", name, null);
        }
    }
}