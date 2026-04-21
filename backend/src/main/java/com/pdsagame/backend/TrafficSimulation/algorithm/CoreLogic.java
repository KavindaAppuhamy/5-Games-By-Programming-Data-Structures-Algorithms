package com.pdsagame.backend.TrafficSimulation.algorithm;

import com.pdsagame.backend.TrafficSimulation.model.TrafficEdge;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CoreLogic {

    public Map<String, Map<String, Integer>> buildGraph(List<TrafficEdge> edges) {

        Map<String, Map<String, Integer>> graph = new HashMap<>();

        // Initialize nodes
        for (TrafficEdge e : edges) {
            graph.putIfAbsent(e.getFrom(), new HashMap<>());
            graph.putIfAbsent(e.getTo(), new HashMap<>());
        }

        // Add edges + reverse edges
        for (TrafficEdge e : edges) {

            String u = e.getFrom();
            String v = e.getTo();
            int cap = e.getCapacity();

            graph.get(u).put(v, cap);
            graph.get(v).putIfAbsent(u, 0);
        }

        return graph;
    }
}