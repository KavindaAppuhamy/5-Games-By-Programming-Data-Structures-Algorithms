package com.pdsagame.backend.Minimum_Cost_Assignment.dto;

public class AssignmentDTO {
    private int agentIndex;
    private int taskIndex;
    private int cost;

    public AssignmentDTO() {}

    public AssignmentDTO(int agentIndex, int taskIndex, int cost) {
        this.agentIndex = agentIndex;
        this.taskIndex = taskIndex;
        this.cost = cost;
    }

    public int getAgentIndex() {
        return agentIndex;
    }

    public void setAgentIndex(int agentIndex) {
        this.agentIndex = agentIndex;
    }

    public int getTaskIndex() {
        return taskIndex;
    }

    public void setTaskIndex(int taskIndex) {
        this.taskIndex = taskIndex;
    }

    public int getCost() {
        return cost;
    }

    public void setCost(int cost) {
        this.cost = cost;
    }
}
