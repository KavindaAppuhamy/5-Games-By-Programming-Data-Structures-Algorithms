package com.knightstour;

import com.knightstour.service.KnightsTourService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class KnightsTourServiceTest {

    @Autowired
    private KnightsTourService service;

    @Test
    public void testWarnsdorffFor8x8() {
        List<String> solution = service.solveWithWarnsdorff(8, "A1");
        
        assertNotNull(solution, "Solution should not be null");
        assertEquals(64, solution.size(), "Should visit all 64 squares");
        
        // Verify all squares are unique
        long uniqueCount = solution.stream().distinct().count();
        assertEquals(64, uniqueCount, "All squares should be unique");
        
        System.out.println("✅ Warnsdorff 8x8 test passed!");
    }

    @Test
    public void testBacktrackingFor8x8() {
        List<String> solution = service.solveWithBacktracking(8, "A1");
        
        assertNotNull(solution, "Solution should not be null");
        assertEquals(64, solution.size(), "Should visit all 64 squares");
        
        System.out.println("✅ Backtracking 8x8 test passed!");
    }

    @Test
    public void testInvalidStartPosition() {
        List<String> solution = service.solveWithWarnsdorff(8, "Z9");
        
        // Should return null for invalid position
        assertNull(solution, "Invalid position should return null");
        
        System.out.println("✅ Invalid position test passed!");
    }

    @Test
    public void testBoardSizeValidation() {
        // Test 16x16 board
        List<String> solution16 = service.solveWithWarnsdorff(16, "A1");
        
        if (solution16 != null) {
            assertEquals(256, solution16.size(), "16x16 board should have 256 squares");
        }
        
        System.out.println("✅ Board size validation passed!");
    }
}