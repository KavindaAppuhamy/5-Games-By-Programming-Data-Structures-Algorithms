package com.pdsagame.backend.TrafficSimulation.service;

import com.pdsagame.backend.TrafficSimulation.algorithm.*;
import com.pdsagame.backend.TrafficSimulation.model.TrafficEdge;
import com.pdsagame.backend.TrafficSimulation.exception.GameException;
import com.pdsagame.backend.TrafficSimulation.exception.GameValidationException;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TrafficGameService {

    private final GraphGenerator graphGenerator;
    private final CoreLogic coreLogic;

    private List<TrafficEdge> currentEdges;
    private Map<String, Map<String, Integer>> currentGraph;

    public TrafficGameService(GraphGenerator graphGenerator, CoreLogic coreLogic) {
        this.graphGenerator = graphGenerator;
        this.coreLogic = coreLogic;
    }

    // ---------------- START GAME ----------------
    public List<TrafficEdge> startGame(String algorithm) {
        currentEdges = graphGenerator.generateGraph();
        currentGraph = coreLogic.buildGraph(currentEdges);
        return currentEdges;
    }

    // ---------------- MAX FLOW (SIMULATED TIMING ONLY - NO System.nanoTime) ----------------
    public MaxFlowResult calculateMaxFlow(String algorithm) {
        if (currentGraph == null || currentGraph.isEmpty()) {
            throw new GameValidationException("No active game");
        }

        try {
            int ekFlow = -1;
            int dinicFlow = -1;
            long ekTime = 0;
            long dinicTime = 0;

            // Calculate graph metrics
            int V = currentGraph.size();
            int E = currentEdges.size();
            int maxCapacity = 0;
            for (TrafficEdge edge : currentEdges) {
                maxCapacity = Math.max(maxCapacity, edge.getCapacity());
            }
            int pathLength = calculatePathLength(currentGraph);

            // ---------------- EDMONDS KARP ----------------
            if ("EDMONDS_KARP".equals(algorithm) || "BOTH".equals(algorithm)) {
                Map<String, Map<String, Integer>> g1 = deepCopy(currentGraph);
                ekFlow = EdmondsKarp.maxFlow(g1, "A", "T");

                // SIMULATED TIMING - NO System.nanoTime()
                ekTime = calculateSimulatedEKTime(V, E, maxCapacity, pathLength, ekFlow);

                System.out.println("📊 Edmonds-Karp: Flow=" + ekFlow + ", Time=" + ekTime + "ms");
            }

            // ---------------- DINIC ----------------
            if ("DINIC".equals(algorithm) || "BOTH".equals(algorithm)) {
                Map<String, Map<String, Integer>> g2 = deepCopy(currentGraph);
                dinicFlow = Dinic.maxFlow(g2, "A", "T");

                // SIMULATED TIMING - NO System.nanoTime()
                dinicTime = calculateSimulatedDinicTime(V, E, maxCapacity, pathLength, dinicFlow);

                // Ensure Dinic is faster than EK
                if (ekTime > 0 && dinicTime >= ekTime) {
                    dinicTime = (long)(ekTime * 0.5); // Dinic is 50% faster
                }

                System.out.println("⚡ Dinic: Flow=" + dinicFlow + ", Time=" + dinicTime + "ms");
            }

            // ---------------- FINAL RESULT ----------------
            int maxFlow;
            if ("EDMONDS_KARP".equals(algorithm)) {
                maxFlow = ekFlow;
            } else if ("DINIC".equals(algorithm)) {
                maxFlow = dinicFlow;
            } else {
                maxFlow = ekFlow;
            }

            return new MaxFlowResult(maxFlow, ekTime, dinicTime);

        } catch (Exception e) {
            throw new GameException("Max flow error: " + e.getMessage(), e);
        }
    }

    // ---------------- SIMULATED TIMING FOR EDMONDS-KARP ----------------
    private long calculateSimulatedEKTime(int V, int E, int maxCap, int pathLen, int maxFlow) {
        // Base: 20ms for V=9, E=15
        double baseTime = 20.0;

        // Scale factors
        double vFactor = V / 9.0;
        double eFactor = Math.pow(E / 15.0, 1.5); // E² effect
        double flowFactor = Math.log(maxFlow + 1) / Math.log(22);
        double pathFactor = pathLen / 4.0;

        long timeMs = (long)(baseTime * vFactor * eFactor * flowFactor * pathFactor);

        // Add randomness ±20%
        timeMs = timeMs + (long)(timeMs * (Math.random() * 0.4 - 0.2));

        // Clamp: 15-50ms
        timeMs = Math.max(15, Math.min(50, timeMs));

        return timeMs;
    }

    // ---------------- SIMULATED TIMING FOR DINIC ----------------
    private long calculateSimulatedDinicTime(int V, int E, int maxCap, int pathLen, int maxFlow) {
        // Base: 8ms for V=9, E=15 (faster than EK)
        double baseTime = 8.0;

        // Scale factors (Dinic scales better)
        double vFactor = Math.pow(V / 9.0, 1.2);
        double eFactor = Math.sqrt(E / 15.0);
        double flowFactor = Math.sqrt(maxFlow) / 4.7;
        double pathFactor = pathLen / 4.0;

        long timeMs = (long)(baseTime * vFactor * eFactor * flowFactor * pathFactor);

        // Add randomness ±20%
        timeMs = timeMs + (long)(timeMs * (Math.random() * 0.4 - 0.2));

        // Clamp: 5-20ms
        timeMs = Math.max(5, Math.min(20, timeMs));

        return timeMs;
    }

    // ---------------- Helper: Calculate path length from A to T ----------------
    private int calculatePathLength(Map<String, Map<String, Integer>> graph) {
        if (!graph.containsKey("A")) return 4;

        Queue<String> queue = new LinkedList<>();
        Map<String, Integer> distance = new HashMap<>();
        Set<String> visited = new HashSet<>();

        queue.add("A");
        distance.put("A", 0);
        visited.add("A");

        while (!queue.isEmpty()) {
            String current = queue.poll();
            int dist = distance.get(current);

            if (current.equals("T")) {
                return dist;
            }

            for (String neighbor : graph.getOrDefault(current, new HashMap<>()).keySet()) {
                if (!visited.contains(neighbor) && graph.get(current).get(neighbor) > 0) {
                    visited.add(neighbor);
                    distance.put(neighbor, dist + 1);
                    queue.add(neighbor);
                }
            }
        }

        return 4;
    }

    // ---------------- DEEP COPY ----------------
    private Map<String, Map<String, Integer>> deepCopy(
            Map<String, Map<String, Integer>> original) {

        Map<String, Map<String, Integer>> copy = new HashMap<>();

        for (String u : original.keySet()) {
            copy.put(u, new HashMap<>(original.get(u)));
        }

        for (String u : original.keySet()) {
            for (String v : original.get(u).keySet()) {
                copy.putIfAbsent(v, new HashMap<>());
            }
        }

        return copy;
    }
}