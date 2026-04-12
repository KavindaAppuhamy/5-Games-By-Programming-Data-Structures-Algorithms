package com.pdsagame.backend.SnakeLadderGame.service;

import com.pdsagame.backend.SnakeLadderGame.exception.InvalidBoardConfigException;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service responsible for randomly generating valid Snake and Ladder board configurations.
 * Ensures no overlaps between snakes, ladders, start (cell 1) and end (cell N²).
 */
@Service
public class BoardGeneratorService {

    private static final int DICE_FACES = 6;

    /**
     * Generate a random board configuration with N-2 snakes and N-2 ladders.
     *
     * @param n Board size (NxN), must be between 6 and 12 inclusive.
     * @return BoardConfig containing snakes and ladders maps.
     */
    public BoardConfig generateBoard(int n) {
        validateBoardSize(n);

        int totalCells = n * n;
        int count = n - 2; // Number of snakes AND ladders

        Set<Integer> usedCells = new HashSet<>();
        usedCells.add(1);           // Start cell - reserved
        usedCells.add(totalCells);  // End cell - reserved

        Map<Integer, Integer> snakes = generateSnakes(totalCells, count, usedCells);
        Map<Integer, Integer> ladders = generateLadders(totalCells, count, usedCells);

        return new BoardConfig(n, totalCells, snakes, ladders);
    }

    /**
     * Generate random snakes. Snake: mouth (higher) -> tail (lower).
     */
    private Map<Integer, Integer> generateSnakes(int totalCells, int count, Set<Integer> usedCells) {
        Map<Integer, Integer> snakes = new HashMap<>();
        Random random = new Random();
        int attempts = 0;
        int maxAttempts = 10000;

        while (snakes.size() < count && attempts < maxAttempts) {
            attempts++;
            // Mouth: cells 2 to totalCells-1 (not start or end)
            int mouth = random.nextInt(totalCells - 2) + 2;
            // Tail must be strictly less than mouth
            int tail = random.nextInt(mouth - 1) + 1;

            if (!usedCells.contains(mouth) && !usedCells.contains(tail)) {
                snakes.put(mouth, tail);
                usedCells.add(mouth);
                usedCells.add(tail);
            }
        }

        if (snakes.size() < count) {
            throw new InvalidBoardConfigException(
                "Could not generate " + count + " non-overlapping snakes for board size " + (int)Math.sqrt(totalCells));
        }

        return snakes;
    }

    /**
     * Generate random ladders. Ladder: base (lower) -> top (higher).
     */
    private Map<Integer, Integer> generateLadders(int totalCells, int count, Set<Integer> usedCells) {
        Map<Integer, Integer> ladders = new HashMap<>();
        Random random = new Random();
        int attempts = 0;
        int maxAttempts = 10000;

        while (ladders.size() < count && attempts < maxAttempts) {
            attempts++;
            // Base: cells 2 to totalCells-2
            int base = random.nextInt(totalCells - 2) + 2;
            // Top must be strictly greater than base, and less than totalCells
            if (base >= totalCells - 1) {
                continue; // Not enough room for a ladder top
            }
            int top = random.nextInt(totalCells - base - 1) + base + 1;

            if (!usedCells.contains(base) && !usedCells.contains(top)) {
                ladders.put(base, top);
                usedCells.add(base);
                usedCells.add(top);
            }
        }

        if (ladders.size() < count) {
            throw new InvalidBoardConfigException(
                "Could not generate " + count + " non-overlapping ladders for board size " + (int)Math.sqrt(totalCells));
        }

        return ladders;
    }

    /**
     * Serialize a map to string format: "from1:to1,from2:to2,..."
     */
    public String serializeMap(Map<Integer, Integer> map) {
        StringBuilder sb = new StringBuilder();
        map.forEach((k, v) -> {
            if (!sb.isEmpty()) sb.append(",");
            sb.append(k).append(":").append(v);
        });
        return sb.toString();
    }

    /**
     * Deserialize a string back to a map.
     */
    public Map<Integer, Integer> deserializeMap(String serialized) {
        Map<Integer, Integer> map = new HashMap<>();
        if (serialized == null || serialized.isBlank()) return map;
        for (String pair : serialized.split(",")) {
            String[] parts = pair.split(":");
            if (parts.length == 2) {
                map.put(Integer.parseInt(parts[0].trim()), Integer.parseInt(parts[1].trim()));
            }
        }
        return map;
    }

    private void validateBoardSize(int n) {
        if (n < 6 || n > 12) {
            throw new InvalidBoardConfigException("Board size must be between 6 and 12, got: " + n);
        }
    }

    /**
     * Immutable board configuration record.
     */
    public record BoardConfig(
        int boardSize,
        int totalCells,
        Map<Integer, Integer> snakes,
        Map<Integer, Integer> ladders
    ) {}
}
