package com.pdsagame.backend;

public class MaxFlowResult {
    private final int maxFlow;
    private final long ekTimeMs;
    private final long dinicTimeMs;

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
}