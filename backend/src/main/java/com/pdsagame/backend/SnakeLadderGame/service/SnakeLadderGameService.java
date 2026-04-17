package com.pdsagame.backend.SnakeLadderGame.service;

import com.pdsagame.backend.SnakeLadderGame.algorithm.BfsAlgorithm;
import com.pdsagame.backend.SnakeLadderGame.algorithm.DijkstraAlgorithm;
import com.pdsagame.backend.SnakeLadderGame.dto.GameDtos.*;
import com.pdsagame.backend.SnakeLadderGame.exception.GameRoundNotFoundException;
import com.pdsagame.backend.SnakeLadderGame.model.GameRound;
import com.pdsagame.backend.SnakeLadderGame.model.PlayerResult;
import com.pdsagame.backend.SnakeLadderGame.repository.GameRoundRepository;
import com.pdsagame.backend.SnakeLadderGame.repository.PlayerResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SnakeLadderGameService {

    private final BoardGeneratorService boardGeneratorService;
    private final BfsAlgorithm bfsAlgorithm;
    private final DijkstraAlgorithm dijkstraAlgorithm;
    private final GameRoundRepository gameRoundRepository;
    private final PlayerResultRepository playerResultRepository;

    /**
     * Create a new game round:
     *  1. Generate random board.
     *  2. Run both algorithms and time them.
     *  3. Persist the round.
     *  4. Return board + 3 multiple-choice options.
     */
    @Transactional
    public NewGameResponse createNewGame(int boardSize) {
        log.info("Creating new game with board size: {}x{}", boardSize, boardSize);

        // Generate board
        BoardGeneratorService.BoardConfig board = boardGeneratorService.generateBoard(boardSize);

        // Run BFS
        BfsAlgorithm.Result bfsResult = bfsAlgorithm.findMinThrows(
            board.totalCells(), board.snakes(), board.ladders());

        // Run Dijkstra
        DijkstraAlgorithm.Result dijkstraResult = dijkstraAlgorithm.findMinThrows(
            board.totalCells(), board.snakes(), board.ladders());

        int minThrows = bfsResult.minThrows(); // Both should agree
        log.info("BFS result: {} throws in {}ns | Dijkstra result: {} throws in {}ns",
            bfsResult.minThrows(), bfsResult.timeNs(),
            dijkstraResult.minThrows(), dijkstraResult.timeNs());

        // Persist round
        GameRound round = GameRound.builder()
            .boardSize(boardSize)
            .minDiceThrows(minThrows)
            .bfsTimeNs(bfsResult.timeNs())
            .dijkstraTimeNs(dijkstraResult.timeNs())
            .snakesConfig(boardGeneratorService.serializeMap(board.snakes()))
            .laddersConfig(boardGeneratorService.serializeMap(board.ladders()))
            .build();

        round = gameRoundRepository.save(round);

        // Generate 3 choices: correct + 2 distractors
        List<Integer> choices = generateChoices(minThrows);

        return NewGameResponse.builder()
            .gameRoundId(round.getId())
            .boardSize(boardSize)
            .totalCells(board.totalCells())
            .snakes(board.snakes())
            .ladders(board.ladders())
            .choices(choices)
            .correctAnswer(minThrows)
            .bfsTimeNs(bfsResult.timeNs())
            .dijkstraTimeNs(dijkstraResult.timeNs())
            .build();
    }

    /**
     * Process a player's submitted answer.
     * Records result in DB; if correct, saves player name + answer.
     */
    @Transactional
    public SubmitAnswerResponse submitAnswer(SubmitAnswerRequest request) {
        log.info("Processing answer from player: {}", request.getPlayerName());

        GameRound round = gameRoundRepository.findById(request.getGameRoundId())
            .orElseThrow(() -> new GameRoundNotFoundException(
                "Game round not found with id: " + request.getGameRoundId()));

        int correctAnswer = round.getMinDiceThrows();
        int playerAnswer = request.getPlayerAnswer();
        boolean isCorrect = playerAnswer == correctAnswer;

        // Determine result
        String result;
        String message;
        if (isCorrect) {
            result = "WIN";
            message = "🎉 Correct! You nailed it, " + request.getPlayerName() + "!";
        } else if (Math.abs(playerAnswer - correctAnswer) == 1) {
            result = "DRAW";
            message = "😅 So close! You were just 1 throw off!";
        } else {
            result = "LOSE";
            message = "❌ Not quite! The correct answer was " + correctAnswer + " throws.";
        }

        // Save player result
        PlayerResult playerResult = PlayerResult.builder()
            .playerName(request.getPlayerName().trim())
            .gameRoundId(round.getId())
            .playerAnswer(playerAnswer)
            .correctAnswer(correctAnswer)
            .correct(isCorrect)
            .boardSize(round.getBoardSize())
            .timeTakenSeconds(request.getTimeTakenSeconds())
            .build();

        playerResultRepository.save(playerResult);

        // Build algorithm stats
        AlgorithmStats stats = buildAlgorithmStats(round);

        return SubmitAnswerResponse.builder()
            .correct(isCorrect)
            .result(result)
            .correctAnswer(correctAnswer)
            .playerAnswer(playerAnswer)
            .playerName(request.getPlayerName())
            .message(message)
            .algorithmStats(stats)
            .build();
    }

    /**
     * Fetch leaderboard: players with most correct answers.
     */
    public List<LeaderboardEntry> getLeaderboard() {
        List<PlayerResult> correct = playerResultRepository.findCorrectAnswersOrderByDate();

        Map<String, Long> counts = correct.stream()
            .collect(Collectors.groupingBy(
                pr -> pr.getPlayerName().toLowerCase(),
                Collectors.counting()
            ));

        Map<String, PlayerResult> lastAnswered = correct.stream()
            .collect(Collectors.toMap(
                pr -> pr.getPlayerName().toLowerCase(),
                pr -> pr,
                (a, b) -> a.getAnsweredAt().isAfter(b.getAnsweredAt()) ? a : b
            ));

        return counts.entrySet().stream()
            .map(e -> LeaderboardEntry.builder()
                .playerName(lastAnswered.get(e.getKey()).getPlayerName())
                .correctAnswers(e.getValue())
                .lastAnswered(lastAnswered.get(e.getKey()).getAnsweredAt())
                .build())
            .sorted((a, b) -> Long.compare(b.getCorrectAnswers(), a.getCorrectAnswers()))
            .limit(10)
            .collect(Collectors.toList());
    }

    /**
     * Get algorithm performance stats for a specific game round.
     */
    public AlgorithmStats getAlgorithmStats(Long roundId) {
        GameRound round = gameRoundRepository.findById(roundId)
            .orElseThrow(() -> new GameRoundNotFoundException("Game round not found: " + roundId));
        return buildAlgorithmStats(round);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Generate 3 multiple-choice options: the correct answer + 2 close distractors.
     * Options are shuffled so correct answer is not always at the same index.
     */
    public List<Integer> generateChoices(int correct) {
        Set<Integer> choices = new LinkedHashSet<>();
        choices.add(correct);

        Random rand = new Random();
        int[] offsets = {-2, -1, 1, 2, 3, -3};
        List<Integer> offsetList = new ArrayList<>();
        for (int o : offsets) offsetList.add(o);
        Collections.shuffle(offsetList, rand);

        for (int offset : offsetList) {
            if (choices.size() >= 3) break;
            int candidate = correct + offset;
            if (candidate >= 1) {
                choices.add(candidate);
            }
        }

        // Ensure we always have 3 options
        while (choices.size() < 3) {
            choices.add(correct + choices.size() * 2);
        }

        List<Integer> result = new ArrayList<>(choices);
        Collections.shuffle(result, rand);
        return result;
    }

    private AlgorithmStats buildAlgorithmStats(GameRound round) {
        long bfs = round.getBfsTimeNs();
        long dijkstra = round.getDijkstraTimeNs();
        String faster = bfs <= dijkstra ? "BFS" : "Dijkstra";

        return AlgorithmStats.builder()
            .minDiceThrows(round.getMinDiceThrows())
            .bfsTimeNs(bfs)
            .dijkstraTimeNs(dijkstra)
            .bfsTimeFormatted(formatNs(bfs))
            .dijkstraTimeFormatted(formatNs(dijkstra))
            .fasterAlgorithm(faster)
            .build();
    }

    private String formatNs(long ns) {
        if (ns < 1_000) return ns + " ns";
        if (ns < 1_000_000) return String.format("%.2f µs", ns / 1_000.0);
        if (ns < 1_000_000_000) return String.format("%.2f ms", ns / 1_000_000.0);
        return String.format("%.2f s", ns / 1_000_000_000.0);
    }
}
