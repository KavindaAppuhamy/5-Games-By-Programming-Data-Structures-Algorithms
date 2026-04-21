package com.pdsagame.backend.algorithm;

import com.pdsagame.backend.SnakeLadderGame.algorithm.DijkstraAlgorithm;
import com.pdsagame.backend.SnakeLadderGame.algorithm.BfsAlgorithm;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Dijkstra Algorithm Tests")
class DijkstraAlgorithmTest {

    private DijkstraAlgorithm dijkstra;

    @BeforeEach
    void setUp() {
        dijkstra = new DijkstraAlgorithm();
    }

    @Test
    @DisplayName("No snakes or ladders - simple 6x6 board")
    void testNoSnakesOrLadders() {
        DijkstraAlgorithm.Result result = dijkstra.findMinThrows(36, new HashMap<>(), new HashMap<>());
        assertEquals(6, result.minThrows());
        assertTrue(result.timeNs() >= 0);
    }

    @Test
    @DisplayName("Single ladder near start significantly reduces throws")
    void testSingleLadder() {
        Map<Integer, Integer> ladders = new HashMap<>();
        ladders.put(2, 35);
        DijkstraAlgorithm.Result result = dijkstra.findMinThrows(36, new HashMap<>(), ladders);
        assertEquals(2, result.minThrows());
    }

    @Test
    @DisplayName("Snake near the end increases throw count")
    void testSingleSnake() {
        Map<Integer, Integer> snakes = new HashMap<>();
        snakes.put(35, 2);
        DijkstraAlgorithm.Result result = dijkstra.findMinThrows(36, snakes, new HashMap<>());
        assertTrue(result.minThrows() >= 6);
    }

    @Test
    @DisplayName("Teleport array correctly reflects snakes")
    void testTeleportSnakes() {
        Map<Integer, Integer> snakes = Map.of(18, 7, 25, 3);
        int[] teleport = dijkstra.buildTeleportArray(36, snakes, new HashMap<>());
        assertEquals(7, teleport[18]);
        assertEquals(3, teleport[25]);
        assertEquals(36, teleport[36]);
    }

    @Test
    @DisplayName("Teleport array correctly reflects ladders")
    void testTeleportLadders() {
        Map<Integer, Integer> ladders = Map.of(6, 29, 11, 33);
        int[] teleport = dijkstra.buildTeleportArray(36, new HashMap<>(), ladders);
        assertEquals(29, teleport[6]);
        assertEquals(33, teleport[11]);
    }

    @Test
    @DisplayName("Result is always positive")
    void testResultPositive() {
        Map<Integer, Integer> snakes = Map.of(14, 5);
        Map<Integer, Integer> ladders = Map.of(7, 19);
        DijkstraAlgorithm.Result result = dijkstra.findMinThrows(36, snakes, ladders);
        assertTrue(result.minThrows() > 0);
    }

    @ParameterizedTest
    @CsvSource({"36,6", "64,8", "100,10", "144,12"})
    @DisplayName("Handles different board sizes correctly")
    void testBoardSizes(int totalCells, int boardSize) {
        DijkstraAlgorithm.Result result = dijkstra.findMinThrows(totalCells, new HashMap<>(), new HashMap<>());
        assertTrue(result.minThrows() >= 1);
        assertTrue(result.minThrows() <= totalCells);
    }

    @Test
    @DisplayName("Multiple snakes and ladders - consistent result with BFS")
    void testComplexBoardConsistency() {
        BfsAlgorithm bfs = new BfsAlgorithm();
        Map<Integer, Integer> snakes = new HashMap<>();
        snakes.put(32, 10);
        snakes.put(19, 7);
        snakes.put(27, 3);
        Map<Integer, Integer> ladders = new HashMap<>();
        ladders.put(4, 21);
        ladders.put(9, 31);
        ladders.put(16, 26);

        DijkstraAlgorithm.Result dResult = dijkstra.findMinThrows(36, snakes, ladders);
        BfsAlgorithm.Result bfsResult = bfs.findMinThrows(36, snakes, ladders);

        assertEquals(dResult.minThrows(), bfsResult.minThrows(),
            "Dijkstra and BFS must produce identical minimum throws");
    }

    @Test
    @DisplayName("Execution time is recorded and non-negative")
    void testExecutionTimeRecorded() {
        DijkstraAlgorithm.Result result = dijkstra.findMinThrows(100, new HashMap<>(), new HashMap<>());
        assertTrue(result.timeNs() >= 0, "Execution time must be non-negative");
    }

    @Test
    @DisplayName("Large board (12x12=144 cells) with many snakes and ladders")
    void testLargeBoard() {
        Map<Integer, Integer> snakes = new HashMap<>();
        snakes.put(140, 10);
        snakes.put(120, 30);
        snakes.put(100, 50);
        Map<Integer, Integer> ladders = new HashMap<>();
        ladders.put(5, 60);
        ladders.put(20, 80);
        ladders.put(35, 110);

        DijkstraAlgorithm.Result result = dijkstra.findMinThrows(144, snakes, ladders);
        assertTrue(result.minThrows() > 0);
        assertTrue(result.minThrows() < 144);
    }
}
