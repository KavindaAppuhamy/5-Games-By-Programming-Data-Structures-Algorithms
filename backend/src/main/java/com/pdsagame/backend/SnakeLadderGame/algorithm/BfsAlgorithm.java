package com.pdsagame.backend.SnakeLadderGame.algorithm;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;

/**
 * BFS-based algorithm to find the minimum number of dice throws
 * needed to reach the last cell in a Snake and Ladder game.
 *
 * Time Complexity:  O(N²)  where N² = total cells
 * Space Complexity: O(N²)
 *
 * BFS guarantees the shortest path in an unweighted graph.
 * We model each cell as a node; edges represent dice throws (1-6).
 * Snakes/ladders are treated as teleporters applied instantly.
 */
/**
 * Find minimum dice throws using Breadth-First Search.
 * @return Result containing minThrows and execution time in nanoseconds
 */

@Component
public class BfsAlgorithm {

    /**
     * Result container holding the minimum throws and execution time.
     */
    public record Result(int minThrows, long timeNs) {}

    public Result findMinThrows(int totalCells, Map<Integer, Integer> snakes, Map<Integer, Integer> ladders) {
        long startTime = System.nanoTime();

        // Build the teleport map: cell -> destination (after snake/ladder)
        int[] teleport = buildTeleportArray(totalCells, snakes, ladders);

        // BFS
        int[] dist = new int[totalCells + 1];
        Arrays.fill(dist, -1);
        dist[1] = 0;

        Queue<Integer> queue = new LinkedList<>();
        queue.offer(1);

        while (!queue.isEmpty()) {
            int current = queue.poll();

            // Try all dice faces
            for (int dice = 1; dice <= 6; dice++) {
                int next = current + dice;

                if (next > totalCells) break;

                // Apply snake or ladder
                int destination = teleport[next];

                if (dist[destination] == -1) {
                    dist[destination] = dist[current] + 1;

                    if (destination == totalCells) {
                        long timeNs = System.nanoTime() - startTime;
                        return new Result(dist[destination], timeNs);
                    }

                    queue.offer(destination);
                }
            }
        }

        long timeNs = System.nanoTime() - startTime;
        // If unreachable (shouldn't happen on a valid board)
        return new Result(dist[totalCells] == -1 ? -1 : dist[totalCells], timeNs);
    }

    /**
     * Build a teleport array where teleport[i] = final destination from cell i.
     * If cell i has no snake/ladder, teleport[i] = i.
     */
    public int[] buildTeleportArray(int totalCells, Map<Integer, Integer> snakes, Map<Integer, Integer> ladders) {
        int[] teleport = new int[totalCells + 1];
        for (int i = 1; i <= totalCells; i++) {
            teleport[i] = i;
        }
        snakes.forEach((mouth, tail) -> {
            if (mouth >= 1 && mouth <= totalCells && tail >= 1 && tail <= totalCells) {
                teleport[mouth] = tail;
            }
        });
        ladders.forEach((base, top) -> {
            if (base >= 1 && base <= totalCells && top >= 1 && top <= totalCells) {
                teleport[base] = top;
            }
        });
        return teleport;
    }
}
