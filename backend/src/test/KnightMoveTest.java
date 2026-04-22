package com.knightstour;

import com.knightstour.model.KnightMove;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class KnightMoveTest {

    @Test
    public void testChessNotationConversion() {
        KnightMove move = KnightMove.fromChessNotation("A1", 8);
        assertEquals("A1", move.toChessNotation(8));
        
        move = KnightMove.fromChessNotation("H8", 8);
        assertEquals("H8", move.toChessNotation(8));
        
        System.out.println("✅ Chess notation conversion test passed!");
    }

    @Test
    public void testValidMoves() {
        int[][] board = new int[8][8];
        List<KnightMove> moves = KnightMove.getValidMoves(0, 0, 8, board);
        
        // From A1 (0,0), knight can move to 2 positions
        assertEquals(2, moves.size());
        
        System.out.println("✅ Valid moves test passed!");
    }

    @Test
    public void testInvalidMove() {
        KnightMove move = new KnightMove(10, 10);
        assertFalse(move.isValid(8), "Position outside board should be invalid");
        
        System.out.println("✅ Invalid move test passed!");
    }
}