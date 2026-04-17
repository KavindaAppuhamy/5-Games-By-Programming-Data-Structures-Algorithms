package com.pdsagame.backend.Minimum_Cost_Assignment.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "min_cost_round")
public class MinCostRound {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "player_name")
    private String playerName;

    @Column(name = "n", nullable = false)
    private int n;

    @Column(name = "min_cost")
    private int minCost;

    @Column(name = "max_cost")
    private int maxCost;

    @Column(name = "seed")
    private Long seed;

    @Column(name = "algorithm")
    private String algorithm;

    @Column(name = "total_cost")
    private Long totalCost;

    @Column(name = "runtime_ms")
    private Long runtimeMs;

    @Lob
    @Column(name = "assignments", columnDefinition = "text")
    private String assignments;

    @Lob
    @Column(name = "comparison_results", columnDefinition = "text")
    private String comparisonResults;

    public MinCostRound() {
    }

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public int getN() {
        return n;
    }

    public void setN(int n) {
        this.n = n;
    }

    public int getMinCost() {
        return minCost;
    }

    public void setMinCost(int minCost) {
        this.minCost = minCost;
    }

    public int getMaxCost() {
        return maxCost;
    }

    public void setMaxCost(int maxCost) {
        this.maxCost = maxCost;
    }

    public Long getSeed() {
        return seed;
    }

    public void setSeed(Long seed) {
        this.seed = seed;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public Long getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(Long totalCost) {
        this.totalCost = totalCost;
    }

    public Long getRuntimeMs() {
        return runtimeMs;
    }

    public void setRuntimeMs(Long runtimeMs) {
        this.runtimeMs = runtimeMs;
    }

    public String getAssignments() {
        return assignments;
    }

    public void setAssignments(String assignments) {
        this.assignments = assignments;
    }

    public String getComparisonResults() {
        return comparisonResults;
    }

    public void setComparisonResults(String comparisonResults) {
        this.comparisonResults = comparisonResults;
    }
}
