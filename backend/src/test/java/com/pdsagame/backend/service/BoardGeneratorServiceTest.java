package com.pdsagame.backend.service;

import com.pdsagame.backend.SnakeLadderGame.exception.InvalidBoardConfigException;
import com.pdsagame.backend.SnakeLadderGame.service.BoardGeneratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("BoardGeneratorService Tests")
class BoardGeneratorServiceTest {

    private BoardGeneratorService service;

    @BeforeEach
    void setUp() {
        service = new BoardGeneratorService();
    }

    @ParameterizedTest
    @ValueSource(ints = {6, 7, 8, 9, 10, 11, 12})
    @DisplayName("Valid board sizes generate correct snake/ladder count (N-2)")
    void testValidBoardSizes(int n) {
        BoardGeneratorService.BoardConfig board = service.generateBoard(n);
        int expected = n - 2;
        assertEquals(expected, board.snakes().size(), "Snake count should be N-2");
        assertEquals(expected, board.ladders().size(), "Ladder count should be N-2");
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 1, 2, 5, 13, 100})
    @DisplayName("Invalid board sizes throw InvalidBoardConfigException")
    void testInvalidBoardSizes(int n) {
        assertThrows(InvalidBoardConfigException.class, () -> service.generateBoard(n));
    }

    @Test
    @DisplayName("Total cells equals N*N")
    void testTotalCells() {
        BoardGeneratorService.BoardConfig board = service.generateBoard(8);
        assertEquals(64, board.totalCells());
    }

    @Test
    @DisplayName("Cell 1 (start) is not used by any snake or ladder")
    void testStartCellNotUsed() {
        for (int n = 6; n <= 12; n++) {
            BoardGeneratorService.BoardConfig board = service.generateBoard(n);
            assertFalse(board.snakes().containsKey(1), "Start cell cannot be snake mouth");
            assertFalse(board.snakes().containsValue(1), "Start cell cannot be snake tail for snake at same position");
            assertFalse(board.ladders().containsKey(1), "Start cell cannot be ladder base");
        }
    }

    @Test
    @DisplayName("Last cell (N*N) is not used by any snake or ladder")
    void testEndCellNotUsed() {
        int n = 8;
        int totalCells = n * n;
        BoardGeneratorService.BoardConfig board = service.generateBoard(n);
        assertFalse(board.snakes().containsKey(totalCells), "End cell cannot be snake mouth");
        assertFalse(board.ladders().containsKey(totalCells), "End cell cannot be ladder base");
        assertFalse(board.ladders().containsValue(totalCells), "End cell should not be ladder top (avoids trivial win)");
    }

    @Test
    @DisplayName("Snakes always go downward (mouth > tail)")
    void testSnakesGoDown() {
        BoardGeneratorService.BoardConfig board = service.generateBoard(8);
        board.snakes().forEach((mouth, tail) ->
            assertTrue(mouth > tail, "Snake mouth " + mouth + " must be above tail " + tail));
    }

    @Test
    @DisplayName("Ladders always go upward (base < top)")
    void testLaddersGoUp() {
        BoardGeneratorService.BoardConfig board = service.generateBoard(8);
        board.ladders().forEach((base, top) ->
            assertTrue(base < top, "Ladder base " + base + " must be below top " + top));
    }

    @Test
    @DisplayName("No cell appears in both snakes and ladders")
    void testNoOverlapBetweenSnakesAndLadders() {
        BoardGeneratorService.BoardConfig board = service.generateBoard(8);
        for (Map.Entry<Integer, Integer> snake : board.snakes().entrySet()) {
            assertFalse(board.ladders().containsKey(snake.getKey()),
                "Snake mouth " + snake.getKey() + " cannot also be a ladder base");
            assertFalse(board.ladders().containsValue(snake.getKey()),
                "Snake mouth " + snake.getKey() + " cannot also be a ladder top");
            assertFalse(board.ladders().containsKey(snake.getValue()),
                "Snake tail " + snake.getValue() + " cannot also be a ladder base");
        }
    }

    @Test
    @DisplayName("Serialization and deserialization round-trip is lossless")
    void testSerializeDeserializeRoundTrip() {
        Map<Integer, Integer> original = Map.of(15, 4, 30, 10, 25, 7);
        String serialized = service.serializeMap(original);
        Map<Integer, Integer> restored = service.deserializeMap(serialized);
        assertEquals(original, restored, "Serialization round-trip must be lossless");
    }

    @Test
    @DisplayName("Deserialize empty string returns empty map")
    void testDeserializeEmpty() {
        Map<Integer, Integer> result = service.deserializeMap("");
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Deserialize null returns empty map")
    void testDeserializeNull() {
        Map<Integer, Integer> result = service.deserializeMap(null);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("All cell positions are within valid range [1, N*N]")
    void testAllCellsWithinRange() {
        int n = 9;
        int totalCells = n * n;
        BoardGeneratorService.BoardConfig board = service.generateBoard(n);

        board.snakes().forEach((mouth, tail) -> {
            assertTrue(mouth >= 1 && mouth <= totalCells, "Snake mouth out of range: " + mouth);
            assertTrue(tail >= 1 && tail <= totalCells, "Snake tail out of range: " + tail);
        });

        board.ladders().forEach((base, top) -> {
            assertTrue(base >= 1 && base <= totalCells, "Ladder base out of range: " + base);
            assertTrue(top >= 1 && top <= totalCells, "Ladder top out of range: " + top);
        });
    }

    @Test
    @DisplayName("Each game round generates a different configuration (randomness check)")
    void testRandomnessBetweenRounds() {
        BoardGeneratorService.BoardConfig board1 = service.generateBoard(8);
        BoardGeneratorService.BoardConfig board2 = service.generateBoard(8);
        // Not guaranteed to differ every time, but overwhelmingly likely
        // This is a probabilistic test; failure rate is astronomically low
        boolean sameSnakes = board1.snakes().equals(board2.snakes());
        boolean sameLadders = board1.ladders().equals(board2.ladders());
        // At least one should differ (extremely high probability)
        assertFalse(sameSnakes && sameLadders,
            "Two consecutive boards should almost never be identical");
    }
}
