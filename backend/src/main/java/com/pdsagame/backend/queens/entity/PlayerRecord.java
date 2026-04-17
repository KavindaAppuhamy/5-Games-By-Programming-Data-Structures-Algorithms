package com.pdsagame.backend.queens.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "queens_player_records")
public class PlayerRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "player_name", nullable = false, length = 100)
    private String playerName;

    @Column(name = "solution_key", nullable = false, length = 100)
    private String solutionKey;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }

    public PlayerRecord() {}

    public PlayerRecord(String playerName, String solutionKey) {
        this.playerName = playerName;
        this.solutionKey = solutionKey;
    }

}