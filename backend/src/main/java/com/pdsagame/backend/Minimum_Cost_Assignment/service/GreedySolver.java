package com.pdsagame.backend.Minimum_Cost_Assignment.service;

import com.pdsagame.backend.Minimum_Cost_Assignment.dto.AssignmentDTO;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component("greedySolver")
public class GreedySolver implements MinCostSolver {

    @Override
    public SolveResult solve(int[][] costMatrix) {
        int n = costMatrix.length;
        Set<Integer> usedTasks = new HashSet<>();
        List<AssignmentDTO> assignments = new ArrayList<>(n);
        long total = 0L;

        for (int agent = 0; agent < n; agent++) {
            int bestTask = -1;
            int bestCost = Integer.MAX_VALUE;
            for (int task = 0; task < n; task++) {
                if (usedTasks.contains(task)) continue;
                int cost = costMatrix[agent][task];
                if (cost < bestCost) {
                    bestCost = cost;
                    bestTask = task;
                }
            }
            if (bestTask == -1) {
                for (int task = 0; task < n; task++) {
                    if (!usedTasks.contains(task)) { bestTask = task; bestCost = costMatrix[agent][task]; break; }
                }
            }
            usedTasks.add(bestTask);
            assignments.add(new AssignmentDTO(agent, bestTask, bestCost));
            total += bestCost;
        }

        MinCostSolver.SolveResult result = new MinCostSolver.SolveResult();
        result.assignments = assignments;
        result.totalCost = total;
        return result;
    }
}

