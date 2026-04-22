package com.pdsagame.backend.Minimum_Cost_Assignment.service;

import com.pdsagame.backend.Minimum_Cost_Assignment.dto.AssignmentDTO;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component("hungarianSolver")
public class HungarianSolver implements MinCostSolver {


    @Override
    public SolveResult solve(int[][] cost) {
        int n = cost.length;
        int[][] a = new int[n + 1][n + 1];
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                a[i][j] = cost[i - 1][j - 1];
            }
        }

        int[] u = new int[n + 1];
        int[] v = new int[n + 1];
        int[] p = new int[n + 1];
        int[] way = new int[n + 1];

        for (int i = 1; i <= n; i++) {
            p[0] = i;
            int j0 = 0;
            int[] minv = new int[n + 1];
            boolean[] used = new boolean[n + 1];
            for (int j = 0; j <= n; j++) minv[j] = Integer.MAX_VALUE;
            used[0] = true;
            do {
                used[j0] = true;
                int i0 = p[j0];
                int delta = Integer.MAX_VALUE;
                int j1 = 0;
                for (int j = 1; j <= n; j++) {
                    if (used[j]) continue;
                    int cur = a[i0][j] - u[i0] - v[j];
                    if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
                    if (minv[j] < delta) { delta = minv[j]; j1 = j; }
                }
                for (int j = 0; j <= n; j++) {
                    if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
                    else { minv[j] -= delta; }
                }
                j0 = j1;
            } while (p[j0] != 0);

            do {
                int j1 = way[j0];
                p[j0] = p[j1];
                j0 = j1;
            } while (j0 != 0);
        }

        int[] assignment = new int[n + 1];
        for (int j = 1; j <= n; j++) {
            assignment[p[j]] = j;
        }

        List<AssignmentDTO> assignments = new ArrayList<>(n);
        long total = 0L;
        for (int i = 1; i <= n; i++) {
            int task = assignment[i] - 1;
            int agent = i - 1;
            int c = cost[agent][task];
            assignments.add(new AssignmentDTO(agent, task, c));
            total += c;
        }

        MinCostSolver.SolveResult result = new MinCostSolver.SolveResult();
        result.assignments = assignments;
        result.totalCost = total;
        return result;
    }
}

