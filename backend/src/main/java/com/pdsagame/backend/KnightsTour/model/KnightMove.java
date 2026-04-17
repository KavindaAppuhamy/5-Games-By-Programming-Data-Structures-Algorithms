package com.pdsagame.backend.KnightsTour.model;

import java.util.ArrayList;
import java.util.List;

public class KnightMove {
    private int row;
    private int col;
    
    // All 8 possible moves for a knight
    public static final int[] MOVE_ROW = {2, 1, -1, -2, -2, -1, 1, 2};
    public static final int[] MOVE_COL = {1, 2, 2, 1, -1, -2, -2, -1};
    
    public KnightMove(int row, int col) {
        this.row = row;
        this.col = col;
    }
    
    // Getters - IMPORTANT! These allow access to private fields
    public int getRow() { 
        return row; 
    }
    
    public int getCol() { 
        return col; 
    }
    
    public void setRow(int row) { 
        this.row = row; 
    }
    
    public void setCol(int col) { 
        this.col = col; 
    }
    
    // Convert to chess notation (e.g., row=0,col=0 -> "A1")
    public String toChessNotation(int boardSize) {
        char colLetter = (char) ('A' + col);
        int rowNumber = boardSize - row;
        return "" + colLetter + rowNumber;
    }
    
    // Convert from chess notation to row/col
    public static KnightMove fromChessNotation(String notation, int boardSize) {
        char colLetter = notation.charAt(0);
        int rowNumber = Integer.parseInt(notation.substring(1));
        int col = colLetter - 'A';
        int row = boardSize - rowNumber;
        return new KnightMove(row, col);
    }
    
    public boolean isValid(int boardSize) {
        return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
    }
    
    // Get all valid moves from a position
    public static List<KnightMove> getValidMoves(int row, int col, int boardSize, int[][] board) {
        List<KnightMove> moves = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            int newRow = row + MOVE_ROW[i];
            int newCol = col + MOVE_COL[i];
            KnightMove move = new KnightMove(newRow, newCol);
            if (move.isValid(boardSize) && board[newRow][newCol] == 0) {
                moves.add(move);
            }
        }
        return moves;
    }
}