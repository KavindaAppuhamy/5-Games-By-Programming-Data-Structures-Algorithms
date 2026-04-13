package com.knightstour.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("status", "error");
        error.put("message", "An unexpected error occurred: " + e.getMessage());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        Map<String, String> error = new HashMap<>();
        error.put("status", "error");
        error.put("message", "Invalid input: " + e.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<Map<String, String>> handleNullPointer(NullPointerException e) {
        Map<String, String> error = new HashMap<>();
        error.put("status", "error");
        error.put("message", "Data not found: " + e.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
}