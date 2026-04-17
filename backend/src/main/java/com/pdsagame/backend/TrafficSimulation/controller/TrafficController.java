package com.pdsagame.backend.TrafficSimulation.controller;

import com.pdsagame.backend.TrafficSimulation.service.TrafficGameService;
import com.pdsagame.backend.TrafficSimulation.repository.Repository;
import com.pdsagame.backend.TrafficSimulation.dto.GameSubmitRequest;
import com.pdsagame.backend.TrafficSimulation.algorithm.MaxFlowResult;
import com.pdsagame.backend.TrafficSimulation.model.GameResult;
import com.pdsagame.backend.TrafficSimulation.exception.GameException;
import com.pdsagame.backend.TrafficSimulation.exception.GameValidationException;

import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.*;

@RestController
@RequestMapping("/api/traffic")
@CrossOrigin("*")
public class TrafficController {

    private final TrafficGameService trafficGameService;
    private final Repository repository;

    public TrafficController(TrafficGameService trafficGameService, Repository repository) {
        this.trafficGameService = trafficGameService;
        this.repository = repository;
    }

    // ---------------- START GAME ----------------
    @GetMapping("/start")
    public Map<String, Object> startGame() {
        try {
            Map<String, Object> res = new HashMap<>();
            res.put("edges", trafficGameService.startGame());
            return res;
        } catch (GameException e) {
            throw e; // Let GlobalExceptionHandler handle it
        } catch (Exception e) {
            throw new GameException("Unexpected error starting game", e);
        }
    }

    // ---------------- SUBMIT GUESS ----------------
    @PostMapping("/submit")
    public Map<String, Object> submit(@Valid @RequestBody GameSubmitRequest request) {
        try {
            String name = request.getName();
            int guess = request.getGuess();

            // 🔥 calculate max flow
            MaxFlowResult result = trafficGameService.calculateMaxFlow();
            int correct = result.getMaxFlow();

            boolean win = (guess == correct);

            // 🔍 DEBUG (IMPORTANT)
            System.out.println("EK TIME = " + result.getEkTimeMs());
            System.out.println("DINIC TIME = " + result.getDinicTimeMs());

            // ---------------- SAVE ----------------
            GameResult gameResult = new GameResult();
            gameResult.setPlayerName(name);
            gameResult.setGuessedValue(guess);
            gameResult.setCorrectValue(correct);
            gameResult.setWin(win);
            gameResult.setEdmondsKarpTimeMs(result.getEkTimeMs());
            gameResult.setDinicTimeMs(result.getDinicTimeMs());

            repository.save(gameResult);

            // ---------------- RESPONSE ----------------
            Map<String, Object> res = new HashMap<>();
            res.put("correct", correct);
            res.put("win", win);
            res.put("ekTime", result.getEkTimeMs());
            res.put("dinicTime", result.getDinicTimeMs());

            return res;
        } catch (GameValidationException | GameException e) {
            throw e; // Let GlobalExceptionHandler handle it
        } catch (Exception e) {
            throw new GameException("Unexpected error submitting guess", e);
        }
    }
}
