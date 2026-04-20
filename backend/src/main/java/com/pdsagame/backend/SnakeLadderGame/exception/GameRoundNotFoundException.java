package com.pdsagame.backend.SnakeLadderGame.exception;

public class GameRoundNotFoundException extends RuntimeException {
    public GameRoundNotFoundException(String message) {
        super(message);
    }
}
