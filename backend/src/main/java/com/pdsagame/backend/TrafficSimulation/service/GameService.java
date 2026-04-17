package com.pdsagame.backend.TrafficSimulation.service;

import com.pdsagame.backend.TrafficSimulation.algorithm.GraphGenerator;
import com.pdsagame.backend.TrafficSimulation.algorithm.CoreLogic;
import com.pdsagame.backend.TrafficSimulation.model.TrafficEdge;
import com.pdsagame.backend.TrafficSimulation.exception.GameException;
import com.pdsagame.backend.TrafficSimulation.exception.GameValidationException;
import com.pdsagame.backend.TrafficSimulation.algorithm.MaxFlowResult;
import com.pdsagame.backend.TrafficSimulation.algorithm.Dinic;
import com.pdsagame.backend.TrafficSimulation.algorithm.EdmondsKarp;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GameService {

    private final GraphGenerator graphGenerator;
    private final CoreLogic coreLogic;

    private List<TrafficEdge> currentEdges;
    private Map<String, Map<String, Integer>> currentGraph;

    private long ekTime;
    private long dinicTime;

    public GameService(GraphGenerator graphGenerator, CoreLogic coreLogic) {
        this.graphGenerator = graphGenerator;
        this.coreLogic = coreLogic;
    }

    // ---------------- START GAME ----------------
    public List<TrafficEdge> startGame() {
        try {
            currentEdges = graphGenerator.generateGraph();
            if (currentEdges == null || currentEdges.isEmpty()) {
                throw new GameException("Failed to generate graph edges");
            }
            currentGraph = coreLogic.buildGraph(currentEdges);
            if (currentGraph == null || currentGraph.isEmpty()) {
                throw new GameException("Failed to build graph from edges");
            }
            return currentEdges;
        } catch (Exception e) {
            throw new GameException("Error starting game: " + e.getMessage(), e);
        }
    }

    // ---------------- MAX FLOW ----------------
    public MaxFlowResult calculateMaxFlow() {
        if (currentGraph == null || currentGraph.isEmpty()) {
            throw new GameValidationException("No active game. Please start a new game first.");
        }

        try {
            // ✅ FIX: clone graph (VERY IMPORTANT)
            Map<String, Map<String, Integer>> g1 = deepCopy(currentGraph);
            Map<String, Map<String, Integer>> g2 = deepCopy(currentGraph);

            // ---------------- EDMONDS KARP ----------------
            long start = System.nanoTime();
            int ek = EdmondsKarp.maxFlow(g1, "A", "T");
            long ekTime = Math.max(1, (System.nanoTime() - start) / 1_000_000);

            // ---------------- DINIC ----------------
            start = System.nanoTime();
            int dinic = Dinic.maxFlow(g2, "A", "T");
            long dinicTime = Math.max(1, (System.nanoTime() - start) / 1_000_000);

            if (ek < 0 || dinic < 0) {
                throw new GameException("Invalid max flow calculation result");
            }

            return new MaxFlowResult(Math.max(ek, dinic), ekTime, dinicTime);
        } catch (Exception e) {
            throw new GameException("Error calculating max flow: " + e.getMessage(), e);
        }
    }

    // ---------------- GETTERS ----------------
    // Removed ekTime and dinicTime getters as they're now returned in MaxFlowResult

    // ---------------- DEEP COPY FIX ----------------
    private Map<String, Map<String, Integer>> deepCopy(
            Map<String, Map<String, Integer>> original) {

        Map<String, Map<String, Integer>> copy = new HashMap<>();

        for (String u : original.keySet()) {
            copy.put(u, new HashMap<>(original.get(u)));
        }

        return copy;
    }
}
