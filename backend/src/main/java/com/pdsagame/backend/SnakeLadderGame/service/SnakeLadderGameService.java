package com.pdsagame.backend.SnakeLadderGame.service;

import com.pdsagame.backend.SnakeLadderGame.algorithm.BfsAlgorithm;
import com.pdsagame.backend.SnakeLadderGame.algorithm.DijkstraAlgorithm;
import com.pdsagame.backend.SnakeLadderGame.dto.GameDtos.*;
import com.pdsagame.backend.SnakeLadderGame.dto.RoundSummaryDto;
import com.pdsagame.backend.SnakeLadderGame.exception.GameRoundNotFoundException;
import com.pdsagame.backend.SnakeLadderGame.model.GameRound;
import com.pdsagame.backend.SnakeLadderGame.model.Player;
import com.pdsagame.backend.SnakeLadderGame.model.PlayerResult;
import com.pdsagame.backend.SnakeLadderGame.repository.GameRoundRepository;
import com.pdsagame.backend.SnakeLadderGame.repository.PlayerRepository;
import com.pdsagame.backend.SnakeLadderGame.repository.PlayerResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Collator;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
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

    @Autowired
    private PlayerRepository playerRepository;


    private Player findOrCreatePlayer(String name) {
        return playerRepository.findByName(name.trim())
                .orElseGet(() -> playerRepository.save(
                        Player.builder().name(name.trim()).build()
                ));
    }

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
    // Updated submitAnswer — uses player FK
    @Transactional
    public SubmitAnswerResponse submitAnswer(SubmitAnswerRequest request) {
        GameRound round = gameRoundRepository.findById(request.getGameRoundId())
                .orElseThrow(() -> new GameRoundNotFoundException(
                        "Game round not found: " + request.getGameRoundId()));

        Player player = findOrCreatePlayer(request.getPlayerName());

        int correctAnswer = round.getMinDiceThrows();
        int playerAnswer  = request.getPlayerAnswer();
        boolean isCorrect = playerAnswer == correctAnswer;

        String result  = isCorrect ? "WIN"
                : Math.abs(playerAnswer - correctAnswer) == 1 ? "DRAW" : "LOSE";
        String message = isCorrect
                ? "🎉 Correct! You nailed it, " + player.getName() + "!"
                : result.equals("DRAW")
                ? "😅 So close! You were just 1 throw off!"
                : "❌ Not quite! The correct answer was " + correctAnswer + " throws.";

        playerResultRepository.save(PlayerResult.builder()
                .playerId(player.getId())
                .gameRoundId(round.getId())
                .playerAnswer(playerAnswer)
                .correctAnswer(correctAnswer)
                .correct(isCorrect)
                .boardSize(round.getBoardSize())
                .timeTakenSeconds(request.getTimeTakenSeconds())
                .build());

        return SubmitAnswerResponse.builder()
                .correct(isCorrect).result(result)
                .correctAnswer(correctAnswer).playerAnswer(playerAnswer)
                .playerName(player.getName()).message(message)
                .algorithmStats(buildAlgorithmStats(round))
                .build();
    }

    /**
     * Fetch leaderboard: players with most correct answers.
     */
    // ✅ NEW — uses player.getName() via the Player relation
    public List<LeaderboardEntry> getLeaderboard() {
        // Use a JPQL query that joins PlayerResult → Player directly
        List<Object[]> rows = playerResultRepository.findCorrectAnswersWithPlayerName();

        Map<String, Long> counts = new LinkedHashMap<>();
        Map<String, OffsetDateTime> lastDates = new LinkedHashMap<>();

        for (Object[] row : rows) {
            String name = (String) row[0];
            OffsetDateTime date = (OffsetDateTime) row[1]; // ✅ FIXED

            String key = name.toLowerCase();
            counts.merge(key, 1L, Long::sum);
            lastDates.merge(key, date, (a, b) -> a.isAfter(b) ? a : b);
        }

        return counts.entrySet().stream()
                .map(e -> {
                    // find the original-cased name from rows
                    String originalName = rows.stream()
                            .filter(r -> ((String) r[0]).equalsIgnoreCase(e.getKey()))
                            .map(r -> (String) r[0])
                            .findFirst().orElse(e.getKey());
                    return LeaderboardEntry.builder()
                            .playerName(originalName)
                            .correctAnswers(e.getValue())
                            .lastAnswered(lastDates.get(e.getKey()))
                            .build();
                })
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

    // Rounds by player name — matches your SQL query
    public List<RoundSummaryDto> getRoundsByPlayer(String playerName, int limit) {
        return playerResultRepository
                .findRoundsByPlayerName(playerName)
                .stream()
                .limit(limit)
                .map(dto -> { dto.setPlayerName(playerName); return dto; })
                .collect(Collectors.toList());
    }

    // All rounds
    public List<RoundSummaryDto> getAllRounds(int limit) {
        Map<Long, String> playerNames = playerRepository.findAll()
                .stream().collect(Collectors.toMap(Player::getId, Player::getName));

        return playerResultRepository
                .findAllRoundsWithPlayers()
                .stream()
                .limit(limit)
                .map(dto -> {
                    dto.setPlayerName(playerNames.getOrDefault(dto.getPlayerId(), "Unknown"));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // All player names (for frontend dropdown)
    public List<String> getAllPlayerNames() {
        Collator collator = Collator.getInstance();
        collator.setStrength(Collator.SECONDARY); // case-insensitive sort ORDER only
        return playerRepository.findAll()
                .stream()
                .map(Player::getName)   // preserves exact casing: "Kavinda", "KAvinda"
                .sorted(collator)       // sorts them together alphabetically
                .collect(Collectors.toList());
    }
}
