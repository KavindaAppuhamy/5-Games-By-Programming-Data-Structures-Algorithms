package com.pdsagame.backend.algorithm;

import com.pdsagame.backend.SnakeLadderGame.algorithm.BfsAlgorithm;
import com.pdsagame.backend.SnakeLadderGame.algorithm.DijkstraAlgorithm;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("BFS Algorithm Tests")
class BfsAlgorithmTest {

    private BfsAlgorithm bfs;

    @BeforeEach
    void setUp() {
        bfs = new BfsAlgorithm();
    }

    @Test
    @DisplayName("No snakes or ladders - simple 6x6 board")
    void testNoSnakesOrLadders() {
        // On a 6x6 board (36 cells), with no snakes/ladders,
        // minimum throws = ceil((36-1)/6) = 6
        BfsAlgorithm.Result result = bfs.findMinThrows(36, new HashMap<>(), new HashMap<>());
        assertEquals(6, result.minThrows());
        assertTrue(result.timeNs() >= 0);
    }

    @Test
    @DisplayName("Single ladder shortcut reduces throws")
    void testSingleLadder() {
        Map<Integer, Integer> ladders = new HashMap<>();
        ladders.put(2, 35); // Giant ladder near start -> near end
        BfsAlgorithm.Result result = bfs.findMinThrows(36, new HashMap<>(), ladders);
        // Should be 2 throws: roll 1 (land on 2, climb to 35), roll 1 (reach 36)
        assertEquals(2, result.minThrows());
    }

    @Test
    @DisplayName("Snake forces longer path")
    void testSingleSnake() {
        Map<Integer, Integer> snakes = new HashMap<>();
        snakes.put(35, 2); // Snake near the end forces backtrack
        BfsAlgorithm.Result result = bfs.findMinThrows(36, snakes, new HashMap<>());
        // Must avoid cell 35, requiring more careful navigation
        assertTrue(result.minThrows() >= 6);
    }

    @Test
    @DisplayName("Result is positive and time is non-negative")
    void testResultConstraints() {
        Map<Integer, Integer> snakes = new HashMap<>();
        snakes.put(10, 3);
        Map<Integer, Integer> ladders = new HashMap<>();
        ladders.put(5, 20);
        BfsAlgorithm.Result result = bfs.findMinThrows(36, snakes, ladders);
        assertTrue(result.minThrows() > 0);
        assertTrue(result.timeNs() >= 0);
    }

    @Test
    @DisplayName("BFS and Dijkstra produce same result")
    void testBfsMatchesDijkstra() {
        DijkstraAlgorithm dijkstra = new DijkstraAlgorithm();
        Map<Integer, Integer> snakes = Map.of(15, 4, 30, 12);
        Map<Integer, Integer> ladders = Map.of(3, 22, 8, 28);
        BfsAlgorithm.Result bfsResult = bfs.findMinThrows(36, snakes, ladders);
        DijkstraAlgorithm.Result dijkstraResult = dijkstra.findMinThrows(36, snakes, ladders);
        assertEquals(bfsResult.minThrows(), dijkstraResult.minThrows(),
            "BFS and Dijkstra must agree on the minimum throws");
    }

    @Test
    @DisplayName("Teleport array correctly maps snake positions")
    void testTeleportArraySnakes() {
        Map<Integer, Integer> snakes = Map.of(10, 2, 20, 5);
        int[] teleport = bfs.buildTeleportArray(36, snakes, new HashMap<>());
        assertEquals(2, teleport[10]);
        assertEquals(5, teleport[20]);
        assertEquals(1, teleport[1]);   // unchanged
        assertEquals(36, teleport[36]); // end unchanged
    }

    @Test
    @DisplayName("Teleport array correctly maps ladder positions")
    void testTeleportArrayLadders() {
        Map<Integer, Integer> ladders = Map.of(4, 25, 8, 30);
        int[] teleport = bfs.buildTeleportArray(36, new HashMap<>(), ladders);
        assertEquals(25, teleport[4]);
        assertEquals(30, teleport[8]);
        assertEquals(3, teleport[3]); // unchanged
    }

    @ParameterizedTest
    @CsvSource({"36,6", "64,8", "100,10", "144,12"})
    @DisplayName("Minimum throws are reasonable for various board sizes")
    void testVariousBoardSizes(int totalCells, int boardSize) {
        BfsAlgorithm.Result result = bfs.findMinThrows(totalCells, new HashMap<>(), new HashMap<>());
        assertTrue(result.minThrows() >= 1, "Min throws must be at least 1");
        assertTrue(result.minThrows() <= totalCells, "Min throws cannot exceed total cells");
    }

    @Test
    @DisplayName("Many ladders dramatically reduces minimum throws")
    void testManyLadders() {
        // Staircase of ladders: 2->12, 13->23, 24->34, 35->36
        Map<Integer, Integer> ladders = new HashMap<>();
        ladders.put(2, 12);
        ladders.put(13, 23);
        ladders.put(24, 34);
        BfsAlgorithm.Result result = bfs.findMinThrows(36, new HashMap<>(), ladders);
        // Should be achievable in very few throws
        assertTrue(result.minThrows() <= 4);
    }

    @Test
    @DisplayName("Out-of-range teleport entries are ignored")
    void testOutOfRangeTeleport() {
        Map<Integer, Integer> snakes = new HashMap<>();
        snakes.put(100, 1); // Out of range for 36-cell board
        assertDoesNotThrow(() -> bfs.buildTeleportArray(36, snakes, new HashMap<>()));
    }
}
