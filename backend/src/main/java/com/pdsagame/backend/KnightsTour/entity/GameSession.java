package com.pdsagame.backend.KnightsTour.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "knights_tour_games")
public class GameSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "player_name", nullable = false)
    private String playerName;
    
    @Column(name = "board_size", nullable = false)
    private Integer boardSize;
    
    @Column(name = "start_position", nullable = false)
    private String startPosition;
    
    @Column(name = "solution_sequence", nullable = false, columnDefinition = "TEXT")
    private String solutionSequence;
    
    @Column(name = "algorithm_used", nullable = false)
    private String algorithmUsed;
    
    @Column(name = "is_correct")
    private Boolean isCorrect = true;
    
    @Column(name = "time_taken_ms", nullable = false)
    private Long timeTakenMs;
    
    @Column(name = "moves_made")
    private Integer movesMade;
    
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
    
    // Getters and Setters
    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }
    
    public String getPlayerName() { 
        return playerName; 
    }
    
    public void setPlayerName(String playerName) { 
        this.playerName = playerName; 
    }
    
    public Integer getBoardSize() { 
        return boardSize; 
    }
    
    public void setBoardSize(Integer boardSize) { 
        this.boardSize = boardSize; 
    }
    
    public String getStartPosition() { 
        return startPosition; 
    }
    
    public void setStartPosition(String startPosition) { 
        this.startPosition = startPosition; 
    }
    
    public String getSolutionSequence() { 
        return solutionSequence; 
    }
    
    public void setSolutionSequence(String solutionSequence) { 
        this.solutionSequence = solutionSequence; 
    }
    
    public String getAlgorithmUsed() { 
        return algorithmUsed; 
    }
    
    public void setAlgorithmUsed(String algorithmUsed) { 
        this.algorithmUsed = algorithmUsed; 
    }
    
    public Boolean getIsCorrect() { 
        return isCorrect; 
    }
    
    public void setIsCorrect(Boolean isCorrect) { 
        this.isCorrect = isCorrect; 
    }
    
    public Long getTimeTakenMs() { 
        return timeTakenMs; 
    }
    
    public void setTimeTakenMs(Long timeTakenMs) { 
        this.timeTakenMs = timeTakenMs; 
    }
    
    public Integer getMovesMade() { 
        return movesMade; 
    }
    
    public void setMovesMade(Integer movesMade) { 
        this.movesMade = movesMade; 
    }
    
    public Instant getCreatedAt() { 
        return createdAt; 
    }
    
    public void setCreatedAt(Instant createdAt) { 
        this.createdAt = createdAt; 
    }
}