package com.pdsagame.backend.SnakeLadderGame.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "game_rounds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameRound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "board_size", nullable = false)
    private int boardSize;

    @Column(name = "min_dice_throws", nullable = false)
    private int minDiceThrows;

    // Algorithm timing in nanoseconds
    @Column(name = "bfs_time_ns", nullable = false)
    private long bfsTimeNs;

    @Column(name = "dijkstra_time_ns", nullable = false)
    private long dijkstraTimeNs;

    // Snakes and Ladders stored as JSON strings: "from:to,from:to,..."
    @Column(name = "snakes_config", nullable = false, length = 1000)
    private String snakesConfig;

    @Column(name = "ladders_config", nullable = false, length = 1000)
    private String laddersConfig;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
