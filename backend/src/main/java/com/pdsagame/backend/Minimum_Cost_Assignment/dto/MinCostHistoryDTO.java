package com.pdsagame.backend.Minimum_Cost_Assignment.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class MinCostHistoryDTO {
    private UUID id;
    private String playerName;
    private int n;
    private String algorithm;
    private Long totalCost;
    private Long runtimeMs;
    private LocalDateTime createdAt;

    // Constructor
    public MinCostHistoryDTO(UUID id, String playerName, int n, String algorithm, Long totalCost, Long runtimeMs, LocalDateTime createdAt) {
        this.id = id;
        this.playerName = playerName;
        this.n = n;
        this.algorithm = algorithm;
        this.totalCost = totalCost;
        this.runtimeMs = runtimeMs;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }
    public int getN() { return n; }
    public void setN(int n) { this.n = n; }
    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }
    public Long getTotalCost() { return totalCost; }
    public void setTotalCost(Long totalCost) { this.totalCost = totalCost; }
    public Long getRuntimeMs() { return runtimeMs; }
    public void setRuntimeMs(Long runtimeMs) { this.runtimeMs = runtimeMs; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}