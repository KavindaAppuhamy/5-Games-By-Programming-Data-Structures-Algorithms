package com.pdsagame.backend.SnakeLadderGame.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "player_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Player name is required")
    @Size(min = 2, max = 100, message = "Player name must be between 2 and 100 characters")
    @Column(name = "player_name", nullable = false, length = 100)
    private String playerName;

    @Column(name = "game_round_id", nullable = false)
    private Long gameRoundId;

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
    @Column(name = "answered_at", updatable = false)
    private LocalDateTime answeredAt;
}
