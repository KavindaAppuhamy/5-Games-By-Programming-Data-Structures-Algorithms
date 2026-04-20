package com.pdsagame.backend.queens.exception;

public class InvalidSolutionException extends RuntimeException {
    public InvalidSolutionException(String message) { super(message); }
}