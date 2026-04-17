package com.pdsagame.backend.TrafficSimulation.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Setter
@Entity
@Table(name = "traffic_results")
public class GameResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String playerName;
    private int guessedValue;
    private int correctValue;
    private boolean win;

    private long edmondsKarpTimeMs;
    private long dinicTimeMs;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
