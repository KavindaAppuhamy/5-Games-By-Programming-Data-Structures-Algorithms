package com.pdsagame.backend;

public class GameValidationException extends RuntimeException {

    public GameValidationException(String message) {
        super(message);
    }

    public GameValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}