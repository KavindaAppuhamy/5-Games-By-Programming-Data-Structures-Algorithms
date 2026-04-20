package com.pdsagame.backend.SnakeLadderGame.algorithm;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Comparator;
import java.util.Map;
import java.util.PriorityQueue;

/**
 * Dijkstra-based algorithm to find the minimum number of dice throws
 * needed to reach the last cell in a Snake and Ladder game.
 *
 * While BFS is more naturally suited to unweighted graphs, Dijkstra
 * is applied here with unit-weight edges (each dice throw = 1 step).
 * This demonstrates the algorithm and allows timing comparison with BFS.
 *
 * Time Complexity:  O(N² log N²)  where N² = total cells
 * Space Complexity: O(N²)
 *
 * Both algorithms produce the same minimum result; the purpose is
 * benchmarking and educational comparison.
 */
@Component
public class DijkstraAlgorithm {

    /**
     * Result container holding the minimum throws and execution time.
     */
    public record Result(int minThrows, long timeNs) {}

    /**
     * Find minimum dice throws using Dijkstra's algorithm.
     * Each dice throw has a uniform weight of 1.
     *
     * @param totalCells Total number of cells (N*N)
     * @param snakes     Map of snake mouth -> tail positions
     * @param ladders    Map of ladder base -> top positions
     * @return Result containing minThrows and execution time in nanoseconds
     */
    public Result findMinThrows(int totalCells, Map<Integer, Integer> snakes, Map<Integer, Integer> ladders) {
        long startTime = System.nanoTime();

        // Build teleport array
        int[] teleport = buildTeleportArray(totalCells, snakes, ladders);

        // dist[i] = minimum dice throws to reach cell i
        int[] dist = new int[totalCells + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[1] = 0;

        // Priority queue: (distance, cell)
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
        pq.offer(new int[]{0, 1});

        while (!pq.isEmpty()) {
            int[] current = pq.poll();
            int currentDist = current[0];
            int currentCell = current[1];

            // Skip if we found a better path already
            if (currentDist > dist[currentCell]) continue;

            // Reached the destination
            if (currentCell == totalCells) {
                long timeNs = System.nanoTime() - startTime;
                return new Result(dist[totalCells], timeNs);
            }

            // Try all dice faces (weight = 1 each)
            for (int dice = 1; dice <= 6; dice++) {
                int next = currentCell + dice;
                if (next > totalCells) break;

                int destination = teleport[next];
                int newDist = currentDist + 1;

                if (newDist < dist[destination]) {
                    dist[destination] = newDist;
                    pq.offer(new int[]{newDist, destination});
                }
            }
        }

        long timeNs = System.nanoTime() - startTime;
        return new Result(dist[totalCells] == Integer.MAX_VALUE ? -1 : dist[totalCells], timeNs);
    }

    /**
     * Build a teleport array where teleport[i] = final destination from cell i.
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
