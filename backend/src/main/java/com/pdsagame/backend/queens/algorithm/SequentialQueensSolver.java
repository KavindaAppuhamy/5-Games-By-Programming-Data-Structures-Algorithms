package com.pdsagame.backend.queens.algorithm;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Sequential (single-threaded) backtracking solver for the N-Queens problem.
 * Algorithm:
 *   - Place one queen per row using backtracking.
 *   - For each row, try every column. Accept the column only if no previously
 *     placed queen attacks it (same column or same diagonal).
 *   - When all N rows are filled, record the solution.
 * Time complexity: O(N!) in the worst case, but pruning reduces this significantly.
 * Space complexity: O(N) for the board array + O(solutions * N) for stored results.
 */
@Component
public class SequentialQueensSolver {

    private int n;
    private int[] board;
    private List<int[]> solutions;

    /**
     * Solve the N-Queens problem sequentially.
     *
     * @param n     board size (use 16 for the game)
     * @param limit max solutions to collect (0 = unlimited)
     * @return SolveResult containing solutions and elapsed time in ms
     */
    public SolveResult solve(int n, int limit) {
        this.n = n;
        this.board = new int[n];
        this.solutions = new ArrayList<>();

        long start = System.currentTimeMillis();
        backtrack(0, limit);
        long elapsed = System.currentTimeMillis() - start;

        return new SolveResult(new ArrayList<>(solutions), elapsed, SolveResult.SolverType.SEQUENTIAL);
    }

    private void backtrack(int row, int limit) {
        if (limit > 0 && solutions.size() >= limit) return;
        if (row == n) {
            solutions.add(board.clone());
            return;
        }
        for (int col = 0; col < n; col++) {
            if (isSafe(row, col)) {
                board[row] = col;
                backtrack(row + 1, limit);
                if (limit > 0 && solutions.size() >= limit) return;
            }
        }
    }

    /**
     * Check whether placing a queen at (row, col) conflicts with any already-placed queen.
     */
    private boolean isSafe(int row, int col) {
        for (int i = 0; i < row; i++) {
            if (board[i] == col) return false;                          // same column
            if (Math.abs(board[i] - col) == Math.abs(i - row)) return false; // diagonal
        }
        return true;
    }

    /**
     * Validate an externally supplied board (e.g., from a player submission).
     *
     * @param placement int array of length N where placement[row] = col
     * @return true, if no two queens threaten each other
     */
    public static boolean isValidSolution(int[] placement) {
        int len = placement.length;
        for (int i = 0; i < len; i++) {
            if (placement[i] < 0 || placement[i] >= len) return false;
            for (int j = i + 1; j < len; j++) {
                if (placement[i] == placement[j]) return false;
                if (Math.abs(placement[i] - placement[j]) == Math.abs(i - j)) return false;
            }
        }
        return true;
    }

    /** Convert int[] to the canonical comma-separated key used in the DB. */
    public static String toKey(int[] placement) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < placement.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(placement[i]);
        }
        return sb.toString();
    }

    /** Convert a comma-separated key back to int[]. */
    public static int[] fromKey(String key) {
        String[] parts = key.split(",");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i].trim());
        return arr;
    }
}