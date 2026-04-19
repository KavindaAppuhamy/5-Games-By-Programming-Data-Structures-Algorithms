package com.pdsagame.backend.Minimum_Cost_Assignment.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.pdsagame.backend.Minimum_Cost_Assignment.dto.MinCostHistoryDTO;
import com.pdsagame.backend.Minimum_Cost_Assignment.dto.SolveRequestDTO;
import com.pdsagame.backend.Minimum_Cost_Assignment.dto.SolveResultDTO;
import com.pdsagame.backend.Minimum_Cost_Assignment.model.MinCostRound;
import com.pdsagame.backend.Minimum_Cost_Assignment.repository.MinCostRoundRepository;
import com.pdsagame.backend.Minimum_Cost_Assignment.service.MinCostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/mincost")
@CrossOrigin(origins = "*")
public class MinCostController {

    @Autowired
    private MinCostService service;

    @Autowired
    private MinCostRoundRepository repository;

    @PostMapping("/solve")
    public SolveResultDTO solve(@RequestBody SolveRequestDTO request) throws JsonProcessingException {
        return service.solve(request);
    }

    @GetMapping("/{id}")
    public MinCostRound get(@PathVariable UUID id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
    }

    @GetMapping("/player-status")
    public Map<String, Object> playerStatus(@RequestParam String playerName) {
        String cleanName = playerName == null ? "" : playerName.trim();
        long rounds = cleanName.isEmpty() ? 0 : repository.countByPlayerNameNormalized(cleanName);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("playerName", cleanName);
        result.put("roundsPlayed", rounds);
        result.put("remainingRounds", Math.max(0, 20 - rounds));
        result.put("status", rounds <= 0 ? "new" : rounds >= 20 ? "completed" : "active");
        return result;
    }

    @GetMapping("/history")
    @Transactional(readOnly = true)
    public Page<MinCostHistoryDTO> history(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size,
                                           @RequestParam(required = false) String playerName) {

        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        if (playerName == null || playerName.trim().isEmpty()) {
            return repository.findAllHistoryDTOs(pr);
        } else {
            String cleanName = playerName.trim();
            try {
                return repository.findByPlayerNameNormalizedDTO(cleanName, pr);
            } catch (Exception ex) {
                System.out.println("DEBUG: filtered history failed for playerName='" + cleanName + "' : " + ex.getMessage());
                return Page.empty(pr);
            }
        }
    }

    @DeleteMapping("/cleanup")
    public String cleanupByPlayer(@RequestParam String playerName) {
        if (playerName == null || playerName.trim().isEmpty()) {
            return "playerName required";
        }
        String clean = playerName.trim();
        int count = repository.deleteByPlayerNameNormalized(clean);
        System.out.println("DEBUG: cleanupByPlayer - deleted " + count + " rounds for '" + clean + "'");
        return "deleted=" + count;
    }

    @DeleteMapping("/cleanup-orphans")
    public String cleanupOrphans() {
        int count = repository.deleteOrphanedRounds();
        System.out.println("DEBUG: cleanupOrphans - deleted " + count + " orphaned rounds");
        return "deleted=" + count;
    }

    @GetMapping("/debug/all-players")
    public java.util.List<String> debugAllPlayers() {
        var allRounds = repository.findAll();
        System.out.println("DEBUG: Total rounds in database: " + allRounds.size());
        return allRounds.stream()
                .map(r -> "'" + r.getPlayerName() + "' (" + r.getId() + ")")
                .distinct()
                .sorted()
                .toList();
    }
}