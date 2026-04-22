package com.pdsagame.backend.TrafficSimulation.model;

public class TrafficEdge {
    private String from;
    private String to;
    private int capacity;

    public TrafficEdge() {}

    public TrafficEdge(String from, String to, int capacity) {
        this.from = from;
        this.to = to;
        this.capacity = capacity;
    }

    public String getFrom() { return from; }
    public String getTo() { return to; }
    public int getCapacity() { return capacity; }
}