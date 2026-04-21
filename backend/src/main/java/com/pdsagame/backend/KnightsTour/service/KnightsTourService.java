package com.pdsagame.backend.KnightsTour.service;

import com.pdsagame.backend.KnightsTour.model.KnightMove;
import com.pdsagame.backend.KnightsTour.entity.GameSession;
import com.pdsagame.backend.KnightsTour.repositories.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class KnightsTourService {

    @Autowired
    private GameRepository gameRepository;

    private static final int[] MOVE_ROW = {2, 1, -1, -2, -2, -1, 1, 2};
    private static final int[] MOVE_COL = {1, 2, 2, 1, -1, -2, -2, -1};

    // ========== WARNSDORFF'S HEURISTIC ==========

    public List<String> solveWithWarnsdorff(int size, String startPos) {
        long startTime = System.nanoTime();

        int boardSize = size;
        int[][] board = new int[boardSize][boardSize];
        List<String> solution = new ArrayList<>();

        KnightMove start = KnightMove.fromChessNotation(startPos, boardSize);
        boolean success = warnsdorffTour(start.getRow(), start.getCol(), 1, boardSize, board, solution);

        long timeTakenMs = (System.nanoTime() - startTime) / 1_000_000;
        System.out.println("⚡ Warnsdorff completed in " + timeTakenMs + "ms, Success: " + success);

        return success ? solution : null;
    }

    private boolean warnsdorffTour(int row, int col, int moveCount,
                                   int boardSize, int[][] board, List<String> solution) {
        board[row][col] = moveCount;
        solution.add(new KnightMove(row, col).toChessNotation(boardSize));

        if (moveCount == boardSize * boardSize) {
            return true;
        }

        List<MoveWithDegree> nextMoves = getNextMovesWithDegree(row, col, boardSize, board);
        nextMoves.sort(Comparator.comparingInt(m -> m.degree));

        for (MoveWithDegree next : nextMoves) {
            if (warnsdorffTour(next.row, next.col, moveCount + 1, boardSize, board, solution)) {
                return true;
            }
        }

        // Backtrack
        board[row][col] = 0;
        solution.remove(solution.size() - 1);
        return false;
    }

    private List<MoveWithDegree> getNextMovesWithDegree(int row, int col, int boardSize, int[][] board) {
        List<MoveWithDegree> moves = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            int newRow = row + MOVE_ROW[i];
            int newCol = col + MOVE_COL[i];
            KnightMove move = new KnightMove(newRow, newCol);
            if (move.isValid(boardSize) && board[newRow][newCol] == 0) {
                int degree = countOnwardMoves(newRow, newCol, boardSize, board);
                moves.add(new MoveWithDegree(newRow, newCol, degree));
            }
        }
        return moves;
    }

    private int countOnwardMoves(int row, int col, int boardSize, int[][] board) {
        int count = 0;
        for (int i = 0; i < 8; i++) {
            int newRow = row + MOVE_ROW[i];
            int newCol = col + MOVE_COL[i];
            KnightMove move = new KnightMove(newRow, newCol);
            if (move.isValid(boardSize) && board[newRow][newCol] == 0) {
                count++;
            }
        }
        return count;
    }

    private static class MoveWithDegree {
        int row, col, degree;
        MoveWithDegree(int row, int col, int degree) {
            this.row = row;
            this.col = col;
            this.degree = degree;
        }
    }

    // ========== BACKTRACKING ALGORITHM ==========

    public List<String> solveWithBacktracking(int size, String startPos) {
        long startTime = System.nanoTime();

        int boardSize = size;
        int[][] board = new int[boardSize][boardSize];
        List<String> solution = new ArrayList<>();

        KnightMove start = KnightMove.fromChessNotation(startPos, boardSize);
        board[start.getRow()][start.getCol()] = 1;
        solution.add(start.toChessNotation(boardSize));

        boolean success = backtrackingTour(start.getRow(), start.getCol(), 2, boardSize, board, solution);

        long timeTakenMs = (System.nanoTime() - startTime) / 1_000_000;
        System.out.println("🐢 Backtracking completed in " + timeTakenMs + "ms, Success: " + success);

        return success ? solution : null;
    }

    private boolean backtrackingTour(int row, int col, int moveCount,
                                     int boardSize, int[][] board, List<String> solution) {
        if (moveCount > boardSize * boardSize) {
            return true;
        }

        List<KnightMove> nextMoves = KnightMove.getValidMoves(row, col, boardSize, board);

        for (KnightMove move : nextMoves) {
            int newRow = move.getRow();
            int newCol = move.getCol();

            board[newRow][newCol] = moveCount;
            solution.add(move.toChessNotation(boardSize));

            if (backtrackingTour(newRow, newCol, moveCount + 1, boardSize, board, solution)) {
                return true;
            }

            board[newRow][newCol] = 0;
            solution.remove(solution.size() - 1);
        }

        return false;
    }

    // ========== COMPARISON ==========

    public Map<String, Object> runComparison(int boardSize, String startPosition) {
        Map<String, Object> result = new HashMap<>();

        System.out.println("\n🎮 Starting Knight's Tour comparison...");
        System.out.println("Board: " + boardSize + "x" + boardSize + " | Start: " + startPosition);
        System.out.println("----------------------------------------");

        long warnStart = System.currentTimeMillis();
        List<String> warnsdorffSolution = null;
        try {
            warnsdorffSolution = solveWithWarnsdorff(boardSize, startPosition);
        } catch (Exception e) {
            System.err.println("Warnsdorff error: " + e.getMessage());
        }
        long warnsdorffTime = System.currentTimeMillis() - warnStart;

        long backStart = System.currentTimeMillis();
        List<String> backtrackingSolution = null;
        try {
            backtrackingSolution = solveWithBacktracking(boardSize, startPosition);
        } catch (Exception e) {
            System.err.println("Backtracking error: " + e.getMessage());
        }
        long backtrackingTime = System.currentTimeMillis() - backStart;

        Map<String, Object> warnsdorffMap = new HashMap<>();
        warnsdorffMap.put("solution", warnsdorffSolution != null ? warnsdorffSolution : Collections.emptyList());
        warnsdorffMap.put("success", warnsdorffSolution != null);
        warnsdorffMap.put("timeMs", warnsdorffTime);

        Map<String, Object> backtrackingMap = new HashMap<>();
        backtrackingMap.put("solution", backtrackingSolution != null ? backtrackingSolution : Collections.emptyList());
        backtrackingMap.put("success", backtrackingSolution != null);
        backtrackingMap.put("timeMs", backtrackingTime);

        result.put("boardSize", boardSize);
        result.put("startPosition", startPosition);
        result.put("warnsdorff", warnsdorffMap);
        result.put("backtracking", backtrackingMap);

        System.out.println("✅ Warnsdorff: " + warnsdorffTime + "ms | Success: " + (warnsdorffSolution != null));
        System.out.println("✅ Backtracking: " + backtrackingTime + "ms | Success: " + (backtrackingSolution != null));
        System.out.println("----------------------------------------");

        return result;
    }

    // ========== DATABASE METHODS ==========

    public void saveGameResult(String playerName, int boardSize, String startPosition,
                               List<String> solution, String algorithmUsed,
                               boolean isCorrect, long timeTakenMs, int movesMade,
                               Integer warnsdorffTimeMs, Integer backtrackingTimeMs) {
        try {
            GameSession session = new GameSession();
            session.setPlayerName(playerName);
            session.setBoardSize(boardSize);
            session.setStartPosition(startPosition);
            session.setSolutionSequence(String.join(",", solution));
            session.setAlgorithmUsed(algorithmUsed);
            session.setIsCorrect(isCorrect);
            session.setTimeTakenMs(timeTakenMs);
            session.setMovesMade(movesMade);
            session.setWarnsdorffTimeMs(warnsdorffTimeMs);
            session.setBacktrackingTimeMs(backtrackingTimeMs);

            gameRepository.save(session);
            System.out.println("✅ Saved game for: " + playerName
                    + " | Warnsdorff: " + warnsdorffTimeMs + "ms"
                    + " | Backtracking: " + backtrackingTimeMs + "ms");
        } catch (Exception e) {
            System.err.println("❌ Failed to save: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public List<Object[]> getLeaderboard() {
        return gameRepository.getLeaderboard();
    }

    public List<GameSession> getPlayerGames(String playerName) {
        return gameRepository.findByPlayerName(playerName);
    }
}