package com.pdsagame.backend;  

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
        System.out.println("========================================");
        System.out.println("🐴 KNIGHT'S TOUR GAME BACKEND STARTED! 🐴");
        System.out.println("========================================");
        System.out.println("📍 API available at: http://localhost:8082");
        System.out.println("========================================");
    }
}