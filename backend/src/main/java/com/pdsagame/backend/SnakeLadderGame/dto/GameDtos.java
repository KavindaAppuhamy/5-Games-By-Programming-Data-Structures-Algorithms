package com.pdsagame.backend.SnakeLadderGame.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// ─── Request DTOs ────────────────────────────────────────────────────────────

public class GameDtos {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class NewGameRequest {
        @NotNull(message = "Board size is required")
        @Min(value = 6, message = "Board size must be at least 6")
        @Max(value = 12, message = "Board size must be at most 12")
        private Integer boardSize;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SubmitAnswerRequest {
        @NotNull(message = "Game round ID is required")
        private Long gameRoundId;

        @NotBlank(message = "Player name is required")
        @Size(min = 2, max = 100, message = "Player name must be between 2 and 100 characters")
        private String playerName;

        @NotNull(message = "Player answer is required")
        @Min(value = 1, message = "Answer must be a positive number")
        private Integer playerAnswer;

        @Min(value = 0, message = "Time taken cannot be negative")
        private long timeTakenSeconds;
    }

    // ─── Response DTOs ───────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BoardCell {
        private int cellNumber;
        private String type;   // "snake", "ladder", "normal"
        private Integer target; // target cell (snake tail or ladder top)
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class NewGameResponse {
        private Long gameRoundId;
        private int boardSize;
        private int totalCells;
        private Map<Integer, Integer> snakes;   // mouth -> tail
        private Map<Integer, Integer> ladders;  // base -> top
        private List<Integer> choices;          // 3 multiple-choice options
        private int correctAnswer;              // index of correct choice (0,1,2)
        private long bfsTimeNs;
        private long dijkstraTimeNs;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SubmitAnswerResponse {
        private boolean correct;
        private String result;           // "WIN", "LOSE", "DRAW"
        private int correctAnswer;
        private int playerAnswer;
        private String playerName;
        private String message;
        private AlgorithmStats algorithmStats;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AlgorithmStats {
        private int minDiceThrows;
        private long bfsTimeNs;
        private long dijkstraTimeNs;
        private String bfsTimeFormatted;
        private String dijkstraTimeFormatted;
        private String fasterAlgorithm;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LeaderboardEntry {
        private String playerName;
        private long correctAnswers;
        private LocalDateTime lastAnswered;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public static <T> ApiResponse<T> success(T data) {
            return ApiResponse.<T>builder()
                    .success(true)
                    .message("Success")
                    .data(data)
                    .build();
        }

        public static <T> ApiResponse<T> success(String message, T data) {
            return ApiResponse.<T>builder()
                    .success(true)
                    .message(message)
                    .data(data)
                    .build();
        }

        public static <T> ApiResponse<T> error(String message) {
            return ApiResponse.<T>builder()
                    .success(false)
                    .message(message)
                    .build();
        }
    }
}
