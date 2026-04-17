package com.pdsagame.backend.Minimum_Cost_Assignment.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.pdsagame.backend.Minimum_Cost_Assignment.dto.SolveRequestDTO;
import com.pdsagame.backend.Minimum_Cost_Assignment.dto.SolveResultDTO;
import com.pdsagame.backend.Minimum_Cost_Assignment.model.MinCostRound;
import com.pdsagame.backend.Minimum_Cost_Assignment.repository.MinCostRoundRepository;
import com.pdsagame.backend.Minimum_Cost_Assignment.service.MinCostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/mincost")
public class MinCostController {

    @Autowired
    private MinCostService service;

    @Autowired
    private MinCostRoundRepository repository;

    @PostMapping("/solve")
    public SolveResultDTO solve(@RequestBody SolveRequestDTO request) throws JsonProcessingException {
        return service.solve(request);
    }

    @GetMapping("/history")
    public Page<MinCostRound> history(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public MinCostRound get(@PathVariable UUID id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
    }
}

