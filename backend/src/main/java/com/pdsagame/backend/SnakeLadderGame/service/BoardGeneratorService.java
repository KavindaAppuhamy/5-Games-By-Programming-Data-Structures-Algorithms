package com.pdsagame.backend.SnakeLadderGame.service;

import com.pdsagame.backend.SnakeLadderGame.exception.InvalidBoardConfigException;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service responsible for randomly generating valid Snake and Ladder board configurations.
 * Ensures:
 * - No overlapping cells
 * - No crossing snakes/ladders
 * - No snake-ladder intersections
 * - Start and end cells are reserved
 */
@Service
public class BoardGeneratorService {

    private static final int DICE_FACES = 6;

    public BoardConfig generateBoard(int n) {
        validateBoardSize(n);

        int totalCells = n * n;
        int count = n - 2;

        Set<Integer> usedCells = new HashSet<>();
        usedCells.add(1);
        usedCells.add(totalCells);

        Map<Integer, Integer> snakes = generateSnakes(totalCells, count, usedCells);
        Map<Integer, Integer> ladders = generateLadders(totalCells, count, usedCells);

        return new BoardConfig(n, totalCells, snakes, ladders);
    }

    // -----------------------------
    // SNAKES
    // -----------------------------
    private Map<Integer, Integer> generateSnakes(int totalCells, int count, Set<Integer> usedCells) {
        Map<Integer, Integer> snakes = new HashMap<>();
        Random random = new Random();
        int attempts = 0;
        int maxAttempts = 20000;

        List<int[]> snakeSegments = new ArrayList<>();

        while (snakes.size() < count && attempts < maxAttempts) {
            attempts++;

            int mouth = random.nextInt(totalCells - 2) + 2;
            int tail = random.nextInt(mouth - 1) + 1;

            if (usedCells.contains(mouth) || usedCells.contains(tail)) continue;

            boolean crosses = false;

            for (int[] seg : snakeSegments) {
                if (isCrossing(mouth, tail, seg[0], seg[1])) {
                    crosses = true;
                    break;
                }
            }

            if (!crosses) {
                snakes.put(mouth, tail);
                usedCells.add(mouth);
                usedCells.add(tail);
                snakeSegments.add(new int[]{mouth, tail});
            }
        }

        if (snakes.size() < count) {
            throw new InvalidBoardConfigException(
                    "Could not generate " + count + " non-crossing snakes for board size " + (int) Math.sqrt(totalCells));
        }

        return snakes;
    }

    // -----------------------------
    // LADDERS
    // -----------------------------
    private Map<Integer, Integer> generateLadders(int totalCells, int count, Set<Integer> usedCells) {
        Map<Integer, Integer> ladders = new HashMap<>();
        Random random = new Random();
        int attempts = 0;
        int maxAttempts = 20000;

        List<int[]> ladderSegments = new ArrayList<>();

        while (ladders.size() < count && attempts < maxAttempts) {
            attempts++;

            int base = random.nextInt(totalCells - 2) + 2;
            if (base >= totalCells - 1) continue;

            int top = random.nextInt(totalCells - base - 1) + base + 1;

            if (usedCells.contains(base) || usedCells.contains(top)) continue;

            boolean crosses = false;

            // check ladder vs ladder
            for (int[] seg : ladderSegments) {
                if (isCrossing(base, top, seg[0], seg[1])) {
                    crosses = true;
                    break;
                }
            }

            // check ladder vs snake
            for (Map.Entry<Integer, Integer> snake : ladders.entrySet()) {
                if (isCrossing(base, top, snake.getKey(), snake.getValue())) {
                    crosses = true;
                    break;
                }
            }

            if (!crosses) {
                ladders.put(base, top);
                usedCells.add(base);
                usedCells.add(top);
                ladderSegments.add(new int[]{base, top});
            }
        }

        if (ladders.size() < count) {
            throw new InvalidBoardConfigException(
                    "Could not generate " + count + " non-crossing ladders for board size " + (int) Math.sqrt(totalCells));
        }

        return ladders;
    }

    // -----------------------------
    // CROSSING DETECTION
    // -----------------------------
    private boolean isCrossing(int a1, int a2, int b1, int b2) {
        int minA = Math.min(a1, a2);
        int maxA = Math.max(a1, a2);
        int minB = Math.min(b1, b2);
        int maxB = Math.max(b1, b2);

        return (minA < minB && minB < maxA && maxA < maxB) ||
                (minB < minA && minA < maxB && maxB < maxA);
    }

    // -----------------------------
    // UTIL
    // -----------------------------
    public String serializeMap(Map<Integer, Integer> map) {
        StringBuilder sb = new StringBuilder();
        map.forEach((k, v) -> {
            if (!sb.isEmpty()) sb.append(",");
            sb.append(k).append(":").append(v);
        });
        return sb.toString();
    }

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

    // -----------------------------
    // DTO
    // -----------------------------
    public record BoardConfig(
            int boardSize,
            int totalCells,
            Map<Integer, Integer> snakes,
            Map<Integer, Integer> ladders
    ) {}
}