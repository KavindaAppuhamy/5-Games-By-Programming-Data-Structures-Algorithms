package com.pdsagame.backend.Minimum_Cost_Assignment.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.pdsagame.backend.Minimum_Cost_Assignment.dto.SolveRequestDTO;
import com.pdsagame.backend.Minimum_Cost_Assignment.dto.SolveResultDTO;
import com.pdsagame.backend.Minimum_Cost_Assignment.model.MinCostRound;
import com.pdsagame.backend.Minimum_Cost_Assignment.repository.MinCostRoundRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class MinCostService {

    @Autowired
    private MinCostRoundRepository repository;

    @Autowired
    @Qualifier("greedySolver")
    private MinCostSolver greedySolver;

    @Autowired
    @Qualifier("hungarianSolver")
    private MinCostSolver hungarianSolver;

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    public SolveResultDTO solve(SolveRequestDTO request) throws JsonProcessingException {
        int n = request.getN() != null ? request.getN() : randomInRange(50, 100);
        if (n <= 0) throw new IllegalArgumentException("n must be > 0");
        int minCost = request.getMinCost() != null ? request.getMinCost() : 20;
        int maxCost = request.getMaxCost() != null ? request.getMaxCost() : 200;
        if (minCost > maxCost) throw new IllegalArgumentException("minCost must be <= maxCost");

        long seed = request.getSeed() != null ? request.getSeed() : new Random().nextLong();
        Random rnd = new Random(seed);
        int[][] matrix = new int[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                matrix[i][j] = rnd.nextInt(maxCost - minCost + 1) + minCost;
            }
        }

        String cleanPlayerName = request.getPlayerName() == null ? "" : request.getPlayerName().trim();
        if (cleanPlayerName.isEmpty()) {
            throw new IllegalArgumentException("playerName is required");
        }

        String algorithm = request.getAlgorithm() != null ? request.getAlgorithm().toLowerCase() : "hungarian";
        boolean persist = request.getPersist() == null || request.getPersist();

        SolveResultDTO dto = new SolveResultDTO();
        dto.setN(n);
        dto.setSeed(seed);
        dto.setPlayerName(cleanPlayerName);
        dto.setCreatedAt(LocalDateTime.now());

        if (algorithm.equals("both")) {
            long startG = System.nanoTime();
            MinCostSolver.SolveResult gres = greedySolver.solve(matrix);
            long gMs = (System.nanoTime() - startG) / 1_000_000;

            long startH = System.nanoTime();
            MinCostSolver.SolveResult hres = hungarianSolver.solve(matrix);
            long hMs = (System.nanoTime() - startH) / 1_000_000;

            Map<String, Object> comp = new LinkedHashMap<>();
            comp.put("greedy", Map.of("totalCost", gres.totalCost, "runtimeMs", gMs, "assignments", gres.assignments));
            comp.put("hungarian", Map.of("totalCost", hres.totalCost, "runtimeMs", hMs, "assignments", hres.assignments));

            dto.setAlgorithm("both");
            dto.setAssignments(hres.assignments);
            dto.setTotalCost(hres.totalCost);
            dto.setRuntimeMs(hMs);

            if (persist) {
                MinCostRound round = new MinCostRound();
                round.setId(UUID.randomUUID());
                round.setCreatedAt(dto.getCreatedAt());
                round.setPlayerName(cleanPlayerName);
                round.setN(n);
                round.setMinCost(minCost);
                round.setMaxCost(maxCost);
                round.setSeed(seed);
                round.setAlgorithm("both");
                round.setTotalCost(hres.totalCost);
                round.setRuntimeMs(hMs);
                round.setAssignments(jsonMapper.writeValueAsString(hres.assignments));
                round.setComparisonResults(jsonMapper.writeValueAsString(comp));

                // DEBUG log to help trace persistence and player name
                System.out.println("DEBUG: Persisting round: id=" + round.getId() + " playerName='" + round.getPlayerName() + "' n=" + n + " algorithm=both totalCost=" + hres.totalCost + " runtimeMs=" + hMs);

                repository.save(round);
                dto.setRoundId(round.getId());
            }
            return dto;
        }

        if (algorithm.equals("greedy") || algorithm.equals("hungarian")) {
            MinCostSolver solver = algorithm.equals("greedy") ? greedySolver : hungarianSolver;
            long start = System.nanoTime();
            MinCostSolver.SolveResult res = solver.solve(matrix);
            long ms = (System.nanoTime() - start) / 1_000_000;

            dto.setAlgorithm(algorithm);
            dto.setAssignments(res.assignments);
            dto.setTotalCost(res.totalCost);
            dto.setRuntimeMs(ms);

            if (persist) {
                MinCostRound round = new MinCostRound();
                round.setId(UUID.randomUUID());
                round.setCreatedAt(dto.getCreatedAt());
                round.setPlayerName(cleanPlayerName);
                round.setN(n);
                round.setMinCost(minCost);
                round.setMaxCost(maxCost);
                round.setSeed(seed);
                round.setAlgorithm(algorithm);
                round.setTotalCost(res.totalCost);
                round.setRuntimeMs(ms);
                round.setAssignments(jsonMapper.writeValueAsString(res.assignments));

                // DEBUG logging
                System.out.println("DEBUG: Persisting round: id=" + round.getId() + " playerName='" + round.getPlayerName() + "' n=" + n + " algorithm=" + algorithm + " totalCost=" + res.totalCost + " runtimeMs=" + ms);

                repository.save(round);
                dto.setRoundId(round.getId());
            }
            return dto;
        }

        throw new IllegalArgumentException("Unknown algorithm: " + algorithm);
    }

    private int randomInRange(int a, int b) {
        return new Random().nextInt(b - a + 1) + a;
    }
}
