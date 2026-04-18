package com.pdsagame.backend.SnakeLadderGame.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoundSummaryDto {
    private Long   gameRoundId;
    private int    boardSize;
    private int    minDiceThrows;
    private long   bfsTimeNs;
    private long   dijkstraTimeNs;
    private int    playerAnswer;
    private boolean correct;
    private Long   playerId;

    // Derived — populated in service layer
    private String playerName;

    // Constructor matching JPQL new() — no playerName (fetched separately)
    public RoundSummaryDto(Long gameRoundId, int boardSize, int minDiceThrows,
                           long bfsTimeNs, long dijkstraTimeNs,
                           int playerAnswer, boolean correct, Long playerId) {
        this.gameRoundId    = gameRoundId;
        this.boardSize      = boardSize;
        this.minDiceThrows  = minDiceThrows;
        this.bfsTimeNs      = bfsTimeNs;
        this.dijkstraTimeNs = dijkstraTimeNs;
        this.playerAnswer   = playerAnswer;
        this.correct        = correct;
        this.playerId       = playerId;
    }
}
