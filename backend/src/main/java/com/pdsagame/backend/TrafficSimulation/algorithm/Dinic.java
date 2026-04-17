package com.pdsagame.backend.TrafficSimulation.algorithm;

import java.util.*;

public class Dinic {

    static class Edge {
        String to;
        int cap;
        Edge(String to, int cap) {
            this.to = to;
            this.cap = cap;
        }
    }

    static Map<String, Integer> level;

    public static int maxFlow(Map<String, Map<String, Integer>> graph, String s, String t) {

        Map<String, List<Edge>> adj = new HashMap<>();

        for (String u : graph.keySet()) {
            adj.putIfAbsent(u, new ArrayList<>());

            for (String v : graph.get(u).keySet()) {
                int c = graph.get(u).get(v);

                adj.get(u).add(new Edge(v, c));

                adj.putIfAbsent(v, new ArrayList<>());
                adj.get(v).add(new Edge(u, 0));
            }
        }

        int flow = 0;

        while (bfs(adj, s, t)) {
            Map<String, Integer> ptr = new HashMap<>();

            int pushed;
            while ((pushed = dfs(adj, s, t, Integer.MAX_VALUE, ptr)) > 0) {
                flow += pushed;
            }
        }

        return flow;
    }

    private static boolean bfs(Map<String, List<Edge>> adj, String s, String t) {

        level = new HashMap<>();
        Queue<String> q = new LinkedList<>();

        q.add(s);
        level.put(s, 0);

        while (!q.isEmpty()) {
            String u = q.poll();

            for (Edge e : adj.getOrDefault(u, List.of())) {
                if (!level.containsKey(e.to) && e.cap > 0) {
                    level.put(e.to, level.get(u) + 1);
                    q.add(e.to);
                }
            }
        }

        return level.containsKey(t);
    }

    private static int dfs(Map<String, List<Edge>> adj,
                           String u, String t,
                           int flow,
                           Map<String, Integer> ptr) {

        if (u.equals(t)) return flow;

        ptr.putIfAbsent(u, 0);

        for (; ptr.get(u) < adj.getOrDefault(u, List.of()).size(); ptr.put(u, ptr.get(u) + 1)) {

            Edge e = adj.get(u).get(ptr.get(u));

            if (e.cap > 0 && level.getOrDefault(e.to, -1) == level.get(u) + 1) {

                int pushed = dfs(adj, e.to, t, Math.min(flow, e.cap), ptr);

                if (pushed > 0) {
                    e.cap -= pushed;
                    return pushed;
                }
            }
        }

        return 0;
    }
}
