package com.pdsagame.backend.service;

import com.pdsagame.backend.SnakeLadderGame.dto.GameDtos.*;
import com.pdsagame.backend.SnakeLadderGame.exception.GameRoundNotFoundException;
import com.pdsagame.backend.SnakeLadderGame.exception.InvalidBoardConfigException;
import com.pdsagame.backend.SnakeLadderGame.model.GameRound;
import com.pdsagame.backend.SnakeLadderGame.model.PlayerResult;
import com.pdsagame.backend.SnakeLadderGame.repository.GameRoundRepository;
import com.pdsagame.backend.SnakeLadderGame.repository.PlayerResultRepository;
import com.pdsagame.backend.SnakeLadderGame.service.BoardGeneratorService;
import com.pdsagame.backend.SnakeLadderGame.service.GameService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GameService Tests")
class GameServiceTest {

    @Mock private BoardGeneratorService boardGeneratorService;
    @Mock private BfsAlgorithm bfsAlgorithm;
    @Mock private DijkstraAlgorithm dijkstraAlgorithm;
    @Mock private GameRoundRepository gameRoundRepository;
    @Mock private PlayerResultRepository playerResultRepository;

    @InjectMocks
    private GameService gameService;

    private Map<Integer, Integer> mockSnakes;
    private Map<Integer, Integer> mockLadders;
    private BoardGeneratorService.BoardConfig mockBoard;
    private GameRound mockRound;

    @BeforeEach
    void setUp() {
        mockSnakes = Map.of(15, 4, 30, 10);
        mockLadders = Map.of(3, 18, 8, 25);
        mockBoard = new BoardGeneratorService.BoardConfig(6, 36, mockSnakes, mockLadders);

        mockRound = GameRound.builder()
            .id(1L)
            .boardSize(6)
            .minDiceThrows(7)
            .bfsTimeNs(50000L)
            .dijkstraTimeNs(80000L)
            .snakesConfig("15:4,30:10")
            .laddersConfig("3:18,8:25")
            .createdAt(LocalDateTime.now())
            .build();
    }

    // ─── createNewGame tests ──────────────────────────────────────────────────

    @Test
    @DisplayName("createNewGame returns valid response with 3 choices")
    void testCreateNewGame_returnsThreeChoices() {
        when(boardGeneratorService.generateBoard(6)).thenReturn(mockBoard);
        when(bfsAlgorithm.findMinThrows(anyInt(), anyMap(), anyMap()))
            .thenReturn(new BfsAlgorithm.Result(7, 50000L));
        when(dijkstraAlgorithm.findMinThrows(anyInt(), anyMap(), anyMap()))
            .thenReturn(new DijkstraAlgorithm.Result(7, 80000L));
        when(boardGeneratorService.serializeMap(anyMap())).thenReturn("dummy");
        when(gameRoundRepository.save(any(GameRound.class))).thenReturn(mockRound);

        NewGameResponse response = gameService.createNewGame(6);

        assertNotNull(response);
        assertEquals(3, response.getChoices().size());
        assertEquals(7, response.getCorrectAnswer());
        assertEquals(6, response.getBoardSize());
        assertEquals(36, response.getTotalCells());
        assertNotNull(response.getSnakes());
        assertNotNull(response.getLadders());
    }

    @Test
    @DisplayName("createNewGame choices always contain the correct answer")
    void testCreateNewGame_choicesContainCorrectAnswer() {
        when(boardGeneratorService.generateBoard(6)).thenReturn(mockBoard);
        when(bfsAlgorithm.findMinThrows(anyInt(), anyMap(), anyMap()))
            .thenReturn(new BfsAlgorithm.Result(7, 50000L));
        when(dijkstraAlgorithm.findMinThrows(anyInt(), anyMap(), anyMap()))
            .thenReturn(new DijkstraAlgorithm.Result(7, 80000L));
        when(boardGeneratorService.serializeMap(anyMap())).thenReturn("dummy");
        when(gameRoundRepository.save(any(GameRound.class))).thenReturn(mockRound);

        NewGameResponse response = gameService.createNewGame(6);

        assertTrue(response.getChoices().contains(response.getCorrectAnswer()),
            "Choices must always include the correct answer");
    }

    @Test
    @DisplayName("createNewGame persists round to repository")
    void testCreateNewGame_persistsRound() {
        when(boardGeneratorService.generateBoard(6)).thenReturn(mockBoard);
        when(bfsAlgorithm.findMinThrows(anyInt(), anyMap(), anyMap()))
            .thenReturn(new BfsAlgorithm.Result(7, 50000L));
        when(dijkstraAlgorithm.findMinThrows(anyInt(), anyMap(), anyMap()))
            .thenReturn(new DijkstraAlgorithm.Result(7, 80000L));
        when(boardGeneratorService.serializeMap(anyMap())).thenReturn("dummy");
        when(gameRoundRepository.save(any(GameRound.class))).thenReturn(mockRound);

        gameService.createNewGame(6);

        verify(gameRoundRepository, times(1)).save(any(GameRound.class));
    }

    @Test
    @DisplayName("createNewGame propagates InvalidBoardConfigException")
    void testCreateNewGame_invalidBoard_throwsException() {
        when(boardGeneratorService.generateBoard(anyInt()))
            .thenThrow(new InvalidBoardConfigException("Cannot generate board"));
        assertThrows(InvalidBoardConfigException.class, () -> gameService.createNewGame(6));
    }

    // ─── submitAnswer tests ───────────────────────────────────────────────────

    @Test
    @DisplayName("submitAnswer with correct answer returns WIN")
    void testSubmitAnswer_correct_returnsWin() {
        when(gameRoundRepository.findById(1L)).thenReturn(Optional.of(mockRound));
        when(playerResultRepository.save(any(PlayerResult.class))).thenReturn(new PlayerResult());

        SubmitAnswerRequest request = SubmitAnswerRequest.builder()
            .gameRoundId(1L)
            .playerName("Alice")
            .playerAnswer(7)
            .timeTakenSeconds(30L)
            .build();

        SubmitAnswerResponse response = gameService.submitAnswer(request);

        assertTrue(response.isCorrect());
        assertEquals("WIN", response.getResult());
        assertEquals(7, response.getCorrectAnswer());
    }

    @Test
    @DisplayName("submitAnswer with wrong answer by 1 returns DRAW")
    void testSubmitAnswer_offByOne_returnsDraw() {
        when(gameRoundRepository.findById(1L)).thenReturn(Optional.of(mockRound));
        when(playerResultRepository.save(any(PlayerResult.class))).thenReturn(new PlayerResult());

        SubmitAnswerRequest request = SubmitAnswerRequest.builder()
            .gameRoundId(1L)
            .playerName("Bob")
            .playerAnswer(8) // off by 1
            .timeTakenSeconds(45L)
            .build();

        SubmitAnswerResponse response = gameService.submitAnswer(request);

        assertFalse(response.isCorrect());
        assertEquals("DRAW", response.getResult());
    }

    @Test
    @DisplayName("submitAnswer with wrong answer returns LOSE")
    void testSubmitAnswer_wrong_returnsLose() {
        when(gameRoundRepository.findById(1L)).thenReturn(Optional.of(mockRound));
        when(playerResultRepository.save(any(PlayerResult.class))).thenReturn(new PlayerResult());

        SubmitAnswerRequest request = SubmitAnswerRequest.builder()
            .gameRoundId(1L)
            .playerName("Charlie")
            .playerAnswer(3) // very wrong
            .timeTakenSeconds(60L)
            .build();

        SubmitAnswerResponse response = gameService.submitAnswer(request);

        assertFalse(response.isCorrect());
        assertEquals("LOSE", response.getResult());
    }

    @Test
    @DisplayName("submitAnswer throws GameRoundNotFoundException for unknown round")
    void testSubmitAnswer_unknownRound_throwsException() {
        when(gameRoundRepository.findById(999L)).thenReturn(Optional.empty());

        SubmitAnswerRequest request = SubmitAnswerRequest.builder()
            .gameRoundId(999L)
            .playerName("Dave")
            .playerAnswer(5)
            .build();

        assertThrows(GameRoundNotFoundException.class, () -> gameService.submitAnswer(request));
    }

    @Test
    @DisplayName("submitAnswer always saves player result regardless of correctness")
    void testSubmitAnswer_alwaysSavesResult() {
        when(gameRoundRepository.findById(1L)).thenReturn(Optional.of(mockRound));
        when(playerResultRepository.save(any(PlayerResult.class))).thenReturn(new PlayerResult());

        SubmitAnswerRequest request = SubmitAnswerRequest.builder()
            .gameRoundId(1L).playerName("Eve").playerAnswer(2).build();

        gameService.submitAnswer(request);

        verify(playerResultRepository, times(1)).save(any(PlayerResult.class));
    }

    // ─── generateChoices tests ────────────────────────────────────────────────

    @Test
    @DisplayName("generateChoices produces exactly 3 unique options")
    void testGenerateChoices_threeUniqueOptions() {
        List<Integer> choices = gameService.generateChoices(10);
        assertEquals(3, choices.size());
        assertEquals(3, new HashSet<>(choices).size(), "All choices must be unique");
    }

    @Test
    @DisplayName("generateChoices always includes the correct answer")
    void testGenerateChoices_includesCorrectAnswer() {
        for (int correct = 1; correct <= 20; correct++) {
            List<Integer> choices = gameService.generateChoices(correct);
            assertTrue(choices.contains(correct),
                "Choices must include correct answer: " + correct);
        }
    }

    @Test
    @DisplayName("generateChoices all options are positive integers")
    void testGenerateChoices_allPositive() {
        List<Integer> choices = gameService.generateChoices(1);
        choices.forEach(c -> assertTrue(c >= 1, "All choices must be >= 1"));
    }

    // ─── getAlgorithmStats tests ──────────────────────────────────────────────

    @Test
    @DisplayName("getAlgorithmStats returns correct stats for known round")
    void testGetAlgorithmStats_returnsStats() {
        when(gameRoundRepository.findById(1L)).thenReturn(Optional.of(mockRound));

        AlgorithmStats stats = gameService.getAlgorithmStats(1L);

        assertNotNull(stats);
        assertEquals(7, stats.getMinDiceThrows());
        assertEquals(50000L, stats.getBfsTimeNs());
        assertEquals(80000L, stats.getDijkstraTimeNs());
        assertEquals("BFS", stats.getFasterAlgorithm()); // BFS is faster here
    }

    @Test
    @DisplayName("getAlgorithmStats throws for unknown round")
    void testGetAlgorithmStats_unknownRound_throwsException() {
        when(gameRoundRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(GameRoundNotFoundException.class, () -> gameService.getAlgorithmStats(999L));
    }
}
