package com.pdsagame.backend;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class CoreLogic {

    public Map<String, Map<String, Integer>> buildGraph(List<TrafficEdge> edges) {

        Map<String, Map<String, Integer>> graph = new HashMap<>();

        for (TrafficEdge e : edges) {
            graph.putIfAbsent(e.getFrom(), new HashMap<>());
            graph.get(e.getFrom()).put(e.getTo(), e.getCapacity());
        }

        return graph;
    }
}