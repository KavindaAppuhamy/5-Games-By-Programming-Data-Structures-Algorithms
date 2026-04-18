package com.pdsagame.backend.SnakeLadderGame.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "player_results")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlayerResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK to players table
    @Column(name = "player_id", nullable = false)
    private Long playerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", insertable = false, updatable = false)
    private Player player;

    @Column(name = "game_round_id", nullable = false)
    private Long gameRoundId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_round_id", insertable = false, updatable = false)
    private GameRound gameRound;

    @Column(name = "player_answer", nullable = false)
    private int playerAnswer;

    @Column(name = "correct_answer", nullable = false)
    private int correctAnswer;

    @Column(name = "is_correct", nullable = false)
    private boolean correct;

    @Column(name = "board_size", nullable = false)
    private int boardSize;

    @Column(name = "time_taken_seconds")
    private long timeTakenSeconds;

    @CreationTimestamp
    @Column(name = "answered_at", nullable = false, updatable = false)
    private OffsetDateTime answeredAt;
}