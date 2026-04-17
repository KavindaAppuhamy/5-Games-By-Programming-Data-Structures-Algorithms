package com.pdsagame.backend.Minimum_Cost_Assignment.service;

import com.pdsagame.backend.Minimum_Cost_Assignment.dto.AssignmentDTO;

import java.util.List;

public interface MinCostSolver {
    SolveResult solve(int[][] costMatrix);

    class SolveResult {
        public List<AssignmentDTO> assignments;
        public long totalCost;
    }
}
