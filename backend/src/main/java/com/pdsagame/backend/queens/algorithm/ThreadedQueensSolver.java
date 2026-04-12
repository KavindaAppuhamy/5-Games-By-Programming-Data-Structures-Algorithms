package com.pdsagame.backend.queens.algorithm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.*;

/**
 * Multithreaded N-Queens solver.
 * Strategy:
 *   - Fix the first row's column to one of N values.
 *   - Distribute those N starting columns across THREAD_COUNT worker threads.
 *   - Each worker runs its own backtracking subtree independently (no shared state).
 *   - Results are merged after all workers are complete.
 * This avoids synchronization overhead on the hot path — each thread owns its own
 * board array and solution list, so there are no locks during the search.
 * Only the final merge into the shared result list uses synchronization.
 */
@Component
public class ThreadedQueensSolver {

    @Value("${queens.solver.thread-count}")
    private int THREAD_COUNT;

    /**
     * Solve the N-Queens problem using multiple threads.
     *
     * @param n     board size
     * @param limit max total solutions (0 = unlimited); applied per-thread proportionally
     * @return SolveResult with merged solutions and wall-clock time
     */
    public SolveResult solve(int n, int limit) throws InterruptedException, ExecutionException {
        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        List<Future<List<int[]>>> futures = new ArrayList<>();

        int perThread = (limit > 0) ? Math.max(1, limit / THREAD_COUNT) : 0;

        long start = System.currentTimeMillis();

        // Each thread handles a subset of first-row column values
        for (int startCol = 0; startCol < n; startCol++) {
            final int col = startCol;
            final int threadLimit = perThread;
            futures.add(executor.submit(() -> {
                List<int[]> partial = new ArrayList<>();
                int[] board = new int[n];
                board[0] = col;
                backtrack(board, 1, n, partial, threadLimit);
                return partial;
            }));
        }

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.MINUTES);

        List<int[]> allSolutions = Collections.synchronizedList(new ArrayList<>());
        for (Future<List<int[]>> future : futures) {
            List<int[]> partial = future.get();
            allSolutions.addAll(partial);
            if (limit > 0 && allSolutions.size() >= limit) break;
        }

        long elapsed = System.currentTimeMillis() - start;
        return new SolveResult(new ArrayList<>(allSolutions), elapsed, SolveResult.SolverType.THREADED);
    }

    private void backtrack(int[] board, int row, int n, List<int[]> solutions, int limit) {
        if (limit > 0 && solutions.size() >= limit) return;
        if (row == n) {
            solutions.add(board.clone());
            return;
        }
        for (int col = 0; col < n; col++) {
            if (isSafe(board, row, col)) {
                board[row] = col;
                backtrack(board, row + 1, n, solutions, limit);
                if (limit > 0 && solutions.size() >= limit) return;
            }
        }
    }

    private boolean isSafe(int[] board, int row, int col) {
        for (int i = 0; i < row; i++) {
            if (board[i] == col) return false;
            if (Math.abs(board[i] - col) == Math.abs(i - row)) return false;
        }
        return true;
    }
}