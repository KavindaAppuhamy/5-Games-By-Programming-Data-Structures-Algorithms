package com.pdsagame.backend.TrafficSimulation.service;

public class MaxFlowResult {

    private final int maxFlow;
    private final long ekTimeMs;
    private final long dinicTimeMs;

    // Constructor used in GameService
    public MaxFlowResult(int maxFlow, long ekTimeMs, long dinicTimeMs) {
        this.maxFlow = maxFlow;
        this.ekTimeMs = ekTimeMs;
        this.dinicTimeMs = dinicTimeMs;
    }

    public int getMaxFlow() {
        return maxFlow;
    }

    public long getEkTimeMs() {
        return ekTimeMs;
    }

    public long getDinicTimeMs() {
        return dinicTimeMs;
    }

    // Helper method to get the appropriate time based on algorithm
    public long getAlgorithmTime(String algorithm) {
        if ("EDMONDS_KARP".equals(algorithm)) {
            return ekTimeMs;
        } else if ("DINIC".equals(algorithm)) {
            return dinicTimeMs;
        } else {
            // For BOTH, return the max time (or average if preferred)
            return Math.max(ekTimeMs, dinicTimeMs);
        }
    }

    @Override
    public String toString() {
        return "MaxFlowResult{" +
                "maxFlow=" + maxFlow +
                ", ekTimeMs=" + ekTimeMs +
                ", dinicTimeMs=" + dinicTimeMs +
                '}';
    }
}