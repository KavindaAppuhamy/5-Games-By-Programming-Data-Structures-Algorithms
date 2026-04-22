package com.pdsagame.backend.queens.algorithm;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class SolveResult {

    public enum SolverType { SEQUENTIAL, THREADED }

    private final List<int[]> solutions;
    private final long executionTimeMs;
    private final SolverType solverType;

    public int getSolutionCount() { return solutions.size(); }
}