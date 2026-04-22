package com.pdsagame.backend.TrafficSimulation.dto;

import jakarta.validation.constraints.*;

public class GameSubmitRequest {

    @NotBlank(message = "Player name is required")
    @Size(min = 1, max = 50, message = "Player name must be between 1 and 50 characters")
    private String name;

    @NotNull(message = "Guess is required")
    @Min(value = 0, message = "Guess must be a non-negative number")
    @Max(value = 1000, message = "Guess must be less than or equal to 1000")
    private Integer guess;

    @NotBlank(message = "Algorithm selection is required")
    private String algorithm;

    public GameSubmitRequest() {}

    public GameSubmitRequest(String name, Integer guess, String algorithm) {
        this.name = name;
        this.guess = guess;
        this.algorithm = algorithm;
    }

    // Getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getGuess() { return guess; }
    public void setGuess(Integer guess) { this.guess = guess; }
    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }
}