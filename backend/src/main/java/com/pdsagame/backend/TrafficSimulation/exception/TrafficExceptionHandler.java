package com.pdsagame.backend.TrafficSimulation.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class TrafficExceptionHandler {

    @ExceptionHandler(GameValidationException.class)
    public ResponseEntity<Map<String, Object>> handleGameValidationException(GameValidationException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Validation Error");
        response.put("message", ex.getMessage());
        response.put("type", "VALIDATION_ERROR");
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(GameException.class)
    public ResponseEntity<Map<String, Object>> handleGameException(GameException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Game Error");
        response.put("message", ex.getMessage());
        response.put("type", "GAME_ERROR");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        response.put("error", "Validation Failed");
        response.put("message", "Input validation failed");
        response.put("fieldErrors", errors);
        response.put("type", "VALIDATION_ERROR");

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Internal Server Error");
        response.put("message", "An unexpected error occurred");
        response.put("type", "INTERNAL_ERROR");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
