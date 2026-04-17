package com.knightstour.controller;

import com.knightstour.service.KnightsTourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/knights-tour")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class KnightsTourController {
    
    @Autowired
    private KnightsTourService knightsTourService;
    
    @PostMapping("/solve")
    public Map<String, Object> solveKnightTour(@RequestBody Map<String, Object> request) {
        int boardSize = (int) request.get("boardSize");
        String startPosition = (String) request.get("startPosition");
        
        System.out.println("📥 Received solve request: boardSize=" + boardSize + ", startPosition=" + startPosition);
        
        return knightsTourService.runComparison(boardSize, startPosition);
    }
    
    @PostMapping("/verify")
    public Map<String, Boolean> verifyAnswer(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> playerAnswer = (List<String>) request.get("answer");
        @SuppressWarnings("unchecked")
        List<String> correctSolution = (List<String>) request.get("correctSolution");
        
        boolean isCorrect = playerAnswer != null && correctSolution != null && 
                           playerAnswer.equals(correctSolution);
        
        return Map.of("correct", isCorrect);
    }
    
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "OK", "message", "Knight's Tour Service is running!");
    }
    
    @PostMapping("/save-result")
    public Map<String, String> saveGameResult(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("📥 Received save request: " + request);
            
            String playerName = (String) request.get("playerName");
            Integer boardSize = (Integer) request.get("boardSize");
            String startPosition = (String) request.get("startPosition");
            String solutionSequence = (String) request.get("solutionSequence");
            String algorithmUsed = (String) request.get("algorithmUsed");
            Boolean isCorrect = (Boolean) request.get("isCorrect");
            Long timeTakenMs = ((Number) request.get("timeTakenMs")).longValue();
            Integer movesMade = (Integer) request.get("movesMade");
            
            knightsTourService.saveGameResult(
                playerName, boardSize, startPosition,
                Arrays.asList(solutionSequence.split(",")),
                algorithmUsed, isCorrect, timeTakenMs, movesMade
            );
            
            return Map.of("status", "success", "message", "Game result saved");
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("status", "error", "message", e.getMessage());
        }
    }
}