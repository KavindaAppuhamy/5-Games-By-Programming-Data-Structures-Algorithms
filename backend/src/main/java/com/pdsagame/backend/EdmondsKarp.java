package com.pdsagame.backend;

import java.util.*;

public class EdmondsKarp {

    public static int maxFlow(Map<String, Map<String, Integer>> graph, String source, String sink) {

        Map<String, Map<String, Integer>> residual = new HashMap<>();

        for (String u : graph.keySet()) {
            residual.putIfAbsent(u, new HashMap<>());
            for (String v : graph.get(u).keySet()) {
                residual.get(u).put(v, graph.get(u).get(v));
                residual.putIfAbsent(v, new HashMap<>());
                residual.get(v).putIfAbsent(u, 0);
            }
        }

        int maxFlow = 0;
        Map<String, String> parent = new HashMap<>();

        while (bfs(residual, source, sink, parent)) {

            int flow = Integer.MAX_VALUE;

            for (String v = sink; !v.equals(source); v = parent.get(v)) {
                String u = parent.get(v);
                flow = Math.min(flow, residual.get(u).get(v));
            }

            for (String v = sink; !v.equals(source); v = parent.get(v)) {
                String u = parent.get(v);
                residual.get(u).put(v, residual.get(u).get(v) - flow);
                residual.get(v).put(u, residual.get(v).get(u) + flow);
            }

            maxFlow += flow;
        }

        return maxFlow;
    }

    private static boolean bfs(Map<String, Map<String, Integer>> residual,
                               String source, String sink,
                               Map<String, String> parent) {

        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>();

        queue.add(source);
        visited.add(source);

        while (!queue.isEmpty()) {
            String u = queue.poll();

            for (String v : residual.getOrDefault(u, new HashMap<>()).keySet()) {
                if (!visited.contains(v) && residual.get(u).get(v) > 0) {
                    parent.put(v, u);
                    if (v.equals(sink)) return true;
                    visited.add(v);
                    queue.add(v);
                }
            }
        }
        return false;
    }
}