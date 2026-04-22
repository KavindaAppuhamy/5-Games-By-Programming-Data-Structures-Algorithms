package com.pdsagame.backend.TrafficSimulation.exception;

public class GameValidationException extends RuntimeException {

    public GameValidationException(String message) {
        super(message);
    }

    public GameValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
