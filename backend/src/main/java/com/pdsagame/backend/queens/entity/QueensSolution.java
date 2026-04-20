package com.pdsagame.backend.queens.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "queens_solutions")
public class QueensSolution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "solution_key", unique = true, nullable = false, length = 100)
    private String solutionKey;          // comma-separated col indices e.g. "1,3,0,2,..."

    @Column(name = "solution_array", nullable = false, length = 200)
    private String solutionArray;        // same value, kept for readability

    @Column(name = "is_claimed")
    private boolean claimed = false;     // true once a player identifies it

    @Column(name = "claimed_by")
    private String claimedBy;

    @Column(name = "claimed_at")
    private LocalDateTime claimedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public QueensSolution() {}

    public QueensSolution(String solutionKey, String solutionArray) {
        this.solutionKey = solutionKey;
        this.solutionArray = solutionArray;
    }
}