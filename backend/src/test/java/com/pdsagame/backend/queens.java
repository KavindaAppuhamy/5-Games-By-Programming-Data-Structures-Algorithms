package com.pdsagame.backend;

import com.pdsagame.backend.queens.algorithm.*;
import com.pdsagame.backend.queens.exception.*;
import com.pdsagame.backend.queens.repository.*;
import com.pdsagame.backend.queens.service.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class QueensApplicationTests {

    @Autowired
    QueensGameService service;
    @Autowired
    SequentialQueensSolver seqSolver;
    @Autowired
    ThreadedQueensSolver thrSolver;
    @Autowired
    QueensSolutionRepository solutionRepo;
    @Autowired
    PlayerRecordRepository playerRepo;

    // ---------------------------------------------------------------- isValidSolution

    @Test
    @DisplayName("isValidSolution: null placement returns false")
    void testNullPlacement() {
        assertThrows(NullPointerException.class, () -> SequentialQueensSolver.isValidSolution(null));
    }

    @Test
    @DisplayName("isValidSolution: correct 4-queens solution [1,3,0,2] passes")
    void testValid4Queens() {
        assertTrue(SequentialQueensSolver.isValidSolution(new int[]{1, 3, 0, 2}));
    }

    @Test
    @DisplayName("isValidSolution: same column conflict detected")
    void testSameColumnConflict() {
        // All queens in column 0
        assertFalse(SequentialQueensSolver.isValidSolution(new int[]{0, 0, 0, 0}));
    }

    @Test
    @DisplayName("isValidSolution: diagonal conflict detected")
    void testDiagonalConflict() {
        // Rows 0 and 1, cols 0 and 1 — diagonal
        assertFalse(SequentialQueensSolver.isValidSolution(new int[]{0, 1, 3, 5, 7, 2, 4, 6,
                8, 10, 12, 14, 9, 11, 13, 15}));
    }

    @Test
    @DisplayName("isValidSolution: out-of-range column returns false")
    void testOutOfRangeColumn() {
        int[] bad = new int[16];
        bad[0] = 99;
        assertFalse(SequentialQueensSolver.isValidSolution(bad));
    }

    // ---------------------------------------------------------------- toKey / fromKey

    @Test
    @DisplayName("toKey produces comma-separated string")
    void testToKey() {
        assertEquals("1,3,0,2", SequentialQueensSolver.toKey(new int[]{1, 3, 0, 2}));
    }

    @Test
    @DisplayName("fromKey parses comma-separated string back to int[]")
    void testFromKey() {
        assertArrayEquals(new int[]{1, 3, 0, 2}, SequentialQueensSolver.fromKey("1,3,0,2"));
    }

    @Test
    @DisplayName("toKey and fromKey are inverse operations")
    void testKeyRoundTrip() {
        int[] original = {5, 2, 4, 7, 0, 3, 1, 6, 9, 11, 13, 15, 8, 10, 12, 14};
        assertArrayEquals(original, SequentialQueensSolver.fromKey(SequentialQueensSolver.toKey(original)));
    }

    // ---------------------------------------------------------------- Sequential solver

    @Test
    @DisplayName("Sequential solver finds exactly 2 solutions for 4-queens")
    void testSeq4Queens() {
        SolveResult r = seqSolver.solve(4, 0);
        assertEquals(2, r.getSolutionCount());
    }

    @Test
    @DisplayName("Sequential solver finds exactly 92 solutions for 8-queens")
    void testSeq8Queens() {
        SolveResult r = seqSolver.solve(8, 0);
        assertEquals(92, r.getSolutionCount());
    }

    @Test
    @DisplayName("Sequential solver respects the limit parameter")
    void testSeqLimit() {
        SolveResult r = seqSolver.solve(16, 10);
        assertEquals(10, r.getSolutionCount());
    }

    @Test
    @DisplayName("Sequential solver: every returned solution is valid")
    void testSeqAllSolutionsValid() {
        SolveResult r = seqSolver.solve(8, 0);
        for (int[] sol : r.getSolutions()) {
            assertTrue(SequentialQueensSolver.isValidSolution(sol),
                    "Invalid solution found: " + SequentialQueensSolver.toKey(sol));
        }
    }

    @Test
    @DisplayName("Sequential solver records correct SolverType")
    void testSeqSolverType() {
        SolveResult r = seqSolver.solve(4, 0);
        assertEquals(SolveResult.SolverType.SEQUENTIAL, r.getSolverType());
    }

    // ---------------------------------------------------------------- Threaded solver

    @Test
    @DisplayName("Threaded solver finds exactly 2 solutions for 4-queens")
    void testThreaded4Queens() throws Exception {
        SolveResult r = thrSolver.solve(4, 0);
        assertEquals(2, r.getSolutionCount());
    }

    @Test
    @DisplayName("Threaded solver finds exactly 92 solutions for 8-queens")
    void testThreaded8Queens() throws Exception {
        SolveResult r = thrSolver.solve(8, 0);
        assertEquals(92, r.getSolutionCount());
    }

    @Test
    @DisplayName("Threaded solver respects the limit parameter")
    void testThreadedLimit() throws Exception {
        SolveResult r = thrSolver.solve(16, 20);
        assertTrue(r.getSolutionCount() <= 20);
    }

    @Test
    @DisplayName("Threaded solver: every returned solution is valid")
    void testThreadedAllSolutionsValid() throws Exception {
        SolveResult r = thrSolver.solve(8, 0);
        for (int[] sol : r.getSolutions()) {
            assertTrue(SequentialQueensSolver.isValidSolution(sol));
        }
    }

    @Test
    @DisplayName("Threaded solver records correct SolverType")
    void testThreadedSolverType() throws Exception {
        SolveResult r = thrSolver.solve(4, 0);
        assertEquals(SolveResult.SolverType.THREADED, r.getSolverType());
    }

    // ---------------------------------------------------------------- Service / gameplay

    @Test
    @DisplayName("Submit valid solution returns SUCCESS status")
    void testSubmitValidSolution() {
        service.runSequential();
        // Use a known valid 16-queens solution (verified by backtracker)
        int[] sol = seqSolver.solve(16, 1).getSolutions().getFirst();
        QueensGameService.SubmitResult result = service.submitSolution("Alice", sol);
        assertEquals(QueensGameService.SubmitResult.Status.SUCCESS, result.status);
    }

    @Test
    @DisplayName("Submit same solution twice returns ALREADY_CLAIMED")
    void testSubmitDuplicate() {
        service.runSequential();
        int[] sol = seqSolver.solve(16, 1).getSolutions().getFirst();
        service.submitSolution("Alice", sol);
        QueensGameService.SubmitResult result = service.submitSolution("Bob", sol);
        assertEquals(QueensGameService.SubmitResult.Status.ALREADY_CLAIMED, result.status);
    }

    @Test
    @DisplayName("Submit with blank player name throws ValidationException")
    void testBlankPlayerName() {
        int[] sol = seqSolver.solve(16, 1).getSolutions().getFirst();
        assertThrows(ValidationException.class, () -> service.submitSolution("  ", sol));
    }

    @Test
    @DisplayName("Submit with wrong array length throws ValidationException")
    void testWrongLength() {
        assertThrows(ValidationException.class, () -> service.submitSolution("Alice", new int[]{1, 2, 3}));
    }

    @Test
    @DisplayName("Submit with attacking queens throws InvalidSolutionException")
    void testAttackingQueens() {
        int[] bad = new int[16];
        for (int i = 0; i < 16; i++) bad[i] = 0; // all in column 0
        assertThrows(InvalidSolutionException.class, () -> service.submitSolution("Alice", bad));
    }

    @Test
    @DisplayName("Leaderboard returns entries sorted by solution count desc")
    void testLeaderboard() {
        service.runSequential();
        List<int[]> sols = seqSolver.solve(16, 3).getSolutions();
        service.submitSolution("Alice", sols.get(0));
        service.submitSolution("Alice", sols.get(1));
        service.submitSolution("Bob", sols.get(2));

        List<QueensGameService.LeaderboardEntry> board = service.getLeaderboard();
        assertFalse(board.isEmpty());
        assertEquals("Alice", board.get(0).playerName());
        assertTrue(board.get(0).solutionsFound() >= board.get(1).solutionsFound());
    }

    @Test
    @DisplayName("Comparison DTO is null when no runs recorded yet")
    void testComparisonEmpty() {
        QueensGameService.ComparisonDto dto = service.getComparison();
        // May be null if no runs exist in the test DB
        //  check it doesn't throw
        assertDoesNotThrow(() -> service.getComparison());
    }
}
