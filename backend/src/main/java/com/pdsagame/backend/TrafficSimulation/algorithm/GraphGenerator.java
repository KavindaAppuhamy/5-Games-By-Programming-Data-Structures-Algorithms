package com.pdsagame.backend.TrafficSimulation.algorithm;

import com.pdsagame.backend.TrafficSimulation.model.TrafficEdge;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class GraphGenerator {

    private final Random random = new Random();

    public List<TrafficEdge> generateGraph() {
        return List.of(
                new TrafficEdge("A","B",rand()),
                new TrafficEdge("A","C",rand()),
                new TrafficEdge("A","D",rand()),
                new TrafficEdge("B","E",rand()),
                new TrafficEdge("B","F",rand()),
                new TrafficEdge("C","E",rand()),
                new TrafficEdge("C","F",rand()),
                new TrafficEdge("D","F",rand()),
                new TrafficEdge("E","G",rand()),
                new TrafficEdge("E","H",rand()),
                new TrafficEdge("F","H",rand()),
                new TrafficEdge("G","T",rand()),
                new TrafficEdge("H","T",rand())
        );
    }

    private int rand() {
        return new Random().nextInt(11) + 5;
    }
}
