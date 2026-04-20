package com.pdsagame.backend.queens.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "queens_solver_runs")
public class SolverRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "solver_type", nullable = false)
    private SolverType solverType;

    @Column(name = "solutions_found", nullable = false)
    private int solutionsFound;

    @Column(name = "execution_time_ms", nullable = false)
    private long executionTimeMs;

    @Column(name = "ran_at")
    private LocalDateTime ranAt;

    @PrePersist
    protected void onCreate() {
        ranAt = LocalDateTime.now();
    }

    public enum SolverType { SEQUENTIAL, THREADED }

    public SolverRun() {}

    public SolverRun(SolverType solverType, int solutionsFound, long executionTimeMs) {
        this.solverType = solverType;
        this.solutionsFound = solutionsFound;
        this.executionTimeMs = executionTimeMs;
    }
}