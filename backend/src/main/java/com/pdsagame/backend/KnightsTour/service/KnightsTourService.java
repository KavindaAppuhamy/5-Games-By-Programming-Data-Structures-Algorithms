package com.pdsagame.backend.KnightsTour.service;

import com.knightstour.model.KnightMove;
import com.knightstour.entity.GameSession;
import com.knightstour.repositories.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class KnightsTourService {
    
    @Autowired
    private GameRepository gameRepository;
    
    private int boardSize;
    private int[][] board;
    private List<String> solution;
    
    // ========== ALGORITHM 1: Warnsdorff's Heuristic ==========
    
    public List<String> solveWithWarnsdorff(int size, String startPos) {
        long startTime = System.nanoTime();
        
        boardSize = size;
        board = new int[boardSize][boardSize];
        solution = new ArrayList<>();
        
        KnightMove start = KnightMove.fromChessNotation(startPos, boardSize);
        
        boolean success = warnsdorffTour(start.getRow(), start.getCol(), 1);
        
        long endTime = System.nanoTime();
        long timeTakenMs = (endTime - startTime) / 1_000_000;
        
        System.out.println("⚡ Warnsdorff completed in " + timeTakenMs + "ms, Success: " + success);
        
        return success ? solution : null;
    }
    
    private boolean warnsdorffTour(int row, int col, int moveCount) {
        board[row][col] = moveCount;
        solution.add(new KnightMove(row, col).toChessNotation(boardSize));
        
        if (moveCount == boardSize * boardSize) {
            return true;
        }
        
        List<MoveWithDegree> nextMoves = getNextMovesWithDegree(row, col);
        nextMoves.sort(Comparator.comparingInt(m -> m.degree));
        
        for (MoveWithDegree next : nextMoves) {
            if (warnsdorffTour(next.row, next.col, moveCount + 1)) {
                return true;
            }
        }
        
        board[row][col] = 0;
        solution.remove(solution.size() - 1);
        return false;
    }
    
    private List<MoveWithDegree> getNextMovesWithDegree(int row, int col) {
        List<MoveWithDegree> moves = new ArrayList<>();
        
        for (int i = 0; i < 8; i++) {
            int newRow = row + KnightMove.MOVE_ROW[i];
            int newCol = col + KnightMove.MOVE_COL[i];
            
            KnightMove move = new KnightMove(newRow, newCol);
            if (move.isValid(boardSize) && board[newRow][newCol] == 0) {
                int degree = countOnwardMoves(newRow, newCol);
                moves.add(new MoveWithDegree(newRow, newCol, degree));
            }
        }
        return moves;
    }
    
    private int countOnwardMoves(int row, int col) {
        int count = 0;
        for (int i = 0; i < 8; i++) {
            int newRow = row + KnightMove.MOVE_ROW[i];
            int newCol = col + KnightMove.MOVE_COL[i];
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
    
    // ========== ALGORITHM 2: Standard Backtracking ==========
    
    public List<String> solveWithBacktracking(int size, String startPos) {
        long startTime = System.nanoTime();
        
        boardSize = size;
        board = new int[boardSize][boardSize];
        solution = new ArrayList<>();
        
        KnightMove start = KnightMove.fromChessNotation(startPos, boardSize);
        
        board[start.getRow()][start.getCol()] = 1;
        solution.add(start.toChessNotation(boardSize));
        
        boolean success = backtrackingTour(start.getRow(), start.getCol(), 2);
        
        long endTime = System.nanoTime();
        long timeTakenMs = (endTime - startTime) / 1_000_000;
        
        System.out.println("🐢 Backtracking completed in " + timeTakenMs + "ms, Success: " + success);
        
        return success ? solution : null;
    }
    
    private boolean backtrackingTour(int row, int col, int moveCount) {
        if (moveCount > boardSize * boardSize) {
            return true;
        }
        
        List<KnightMove> nextMoves = KnightMove.getValidMoves(row, col, boardSize, board);
        
        for (KnightMove move : nextMoves) {
            int newRow = move.getRow();
            int newCol = move.getCol();
            
            board[newRow][newCol] = moveCount;
            solution.add(move.toChessNotation(boardSize));
            
            if (backtrackingTour(newRow, newCol, moveCount + 1)) {
                return true;
            }
            
            board[newRow][newCol] = 0;
            solution.remove(solution.size() - 1);
        }
        
        return false;
    }
    
    // ========== Run Both Algorithms and Compare ==========
    
    public Map<String, Object> runComparison(int boardSize, String startPosition) {
        Map<String, Object> result = new HashMap<>();
        
        System.out.println("\n🎮 Starting new Knight's Tour game round...");
        System.out.println("Board Size: " + boardSize + "x" + boardSize);
        System.out.println("Start Position: " + startPosition);
        System.out.println("----------------------------------------");
        
        List<String> warnsdorffSolution = solveWithWarnsdorff(boardSize, startPosition);
        List<String> backtrackingSolution = solveWithBacktracking(boardSize, startPosition);
        
        result.put("boardSize", boardSize);
        result.put("startPosition", startPosition);
        
        Map<String, Object> warnsdorffResult = new HashMap<>();
        warnsdorffResult.put("solution", warnsdorffSolution);
        warnsdorffResult.put("success", warnsdorffSolution != null);
        warnsdorffResult.put("timeMs", 0);
        
        Map<String, Object> backtrackingResult = new HashMap<>();
        backtrackingResult.put("solution", backtrackingSolution);
        backtrackingResult.put("success", backtrackingSolution != null);
        backtrackingResult.put("timeMs", 0);
        
        result.put("warnsdorff", warnsdorffResult);
        result.put("backtracking", backtrackingResult);
        
        System.out.println("----------------------------------------");
        
        return result;
    }
    
    // ========== DATABASE METHODS ==========
    
    public void saveGameResult(String playerName, int boardSize, String startPosition, 
                               List<String> solution, String algorithmUsed, 
                               boolean isCorrect, long timeTakenMs, int movesMade) {
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
            
            gameRepository.save(session);
            System.out.println("✅ Game result saved to database for player: " + playerName);
        } catch (Exception e) {
            System.err.println("❌ Failed to save to database: " + e.getMessage());
        }
    }
}