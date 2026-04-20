# Sixteen Queens Algorithm Report

## 1. Scope

This report covers only the **Sixteen Queens** module implemented in this project.
It explains:

- the algorithm used to solve the 16-Queens puzzle,
- the difference between **sequential** and **multithreaded** solving,
- and the full flow of the application from UI to backend to database.

Code references used:

- `backend/src/main/java/com/pdsagame/backend/queens/algorithm/SequentialQueensSolver.java`
- `backend/src/main/java/com/pdsagame/backend/queens/algorithm/ThreadedQueensSolver.java`
- `backend/src/main/java/com/pdsagame/backend/queens/service/QueensService.java`
- `backend/src/main/java/com/pdsagame/backend/queens/controller/QueensController.java`
- `frontend/src/pages/Games/Sixteen_Queens/`

---

## 2. Problem Definition

In the 16-Queens puzzle, we must place 16 queens on a 16x16 chessboard so that:

- no two queens are in the same column,
- no two queens are on the same diagonal,
- and there is exactly one queen per row.

The project stores a placement as an integer array:

- `placement[row] = column`
- Example: `[1, 3, 0, 2, ...]`

This representation is compact and efficient for conflict checks.

---

## 3. Core Algorithm: Backtracking

The main solving technique is **backtracking with pruning**.

### 3.1 How it works (simple idea)

1. Start at row 0.
2. Try each column in that row.
3. If a position is safe, place the queen and move to next row.
4. If no column works for a row, go back to previous row and try another column.
5. When row 16 is reached, a full valid solution is found.

### 3.2 Safety rule (`isSafe`)

A candidate queen at `(row, col)` is valid only if for every previous row `i`:

- `board[i] != col` (not same column)
- `abs(board[i] - col) != abs(i - row)` (not same diagonal)

This pruning avoids exploring impossible branches.

### 3.3 Complexity

- Worst-case time: very high (commonly described as `O(N!)` style growth)
- Practical performance is improved by pruning.
- Space: `O(N)` recursion/board + storage for found solutions.

---

## 4. Sequential Solver

Implementation: `SequentialQueensSolver.solve(int n, int limit)`

### 4.1 Behavior

- Uses one thread.
- Searches the entire solution tree recursively.
- Stops early when `limit` solutions are collected (`queens.solver.solution-limit=500`).
- Measures execution time and returns `SolveResult`.

### 4.2 Simplified pseudocode

```text
solve(n, limit):
  board = new int[n]
  solutions = []
  backtrack(row=0)

backtrack(row):
  if limit reached: return
  if row == n: save clone(board); return

  for col in 0..n-1:
    if isSafe(row, col):
      board[row] = col
      backtrack(row + 1)
```

### 4.3 Extra utility in this class

The sequential solver class also provides:

- `isValidSolution(int[])` for validating a user-submitted board.
- `toKey(int[])` and `fromKey(String)` for DB-friendly key conversion.

---

## 5. Multithreaded Solver

Implementation: `ThreadedQueensSolver.solve(int n, int limit)`

### 5.1 Parallel strategy

- Uses a fixed thread pool (`queens.solver.thread-count=4`).
- Splits work by first-row column choices (`0..15`).
- Each task explores one independent subtree.
- Each task keeps local board and local solution list.
- Main thread merges all partial results.

### 5.2 Why this is thread-safe

During search, workers do not share mutable board state.
Only the final merge step combines results.

### 5.3 Simplified pseudocode

```text
solveThreaded(n, limit):
  create fixed thread pool
  for startCol in 0..n-1:
    submit task:
      board[0] = startCol
      backtrack from row 1
      return partialSolutions

  wait for tasks
  merge partial solutions
  apply global limit if needed
```

---

## 6. Sequential vs Threaded (Practical Comparison)

| Aspect | Sequential | Threaded |
|---|---|---|
| Execution model | Single worker | Multiple workers |
| Work split | One recursive tree | Tree split by first row column |
| Overhead | Low | Higher (thread pool + futures + merge) |
| Typical benefit | Stable baseline | Better CPU use on multi-core systems |
| Can be slower? | Less likely due to overhead | Yes, for small workloads or cold JVM |

### Key observation in this project

Because the solver is capped at 500 stored solutions, workload may be too small to always show strong parallel speedup. JVM warmup can also make first runs slower.

---

## 7. Application Flow (End-to-End)

## 7.1 UI structure

Main page: `frontend/src/pages/Games/Sixteen_Queens/SixteenQueens.jsx`

Tabs:

- `PlayTab.jsx` (board interaction and submission)
- `LeaderboardTab.jsx` (player ranking)
- `SolverTab.jsx` (run sequential/threaded)
- `CompareTab.jsx` (timing comparison)

API client: `frontend/src/pages/Games/Sixteen_Queens/api/queensApi.js`

## 7.2 Solver run flow

1. User clicks **Run Sequential** or **Run Threaded** in `SolverTab`.
2. Frontend sends POST request to backend endpoint.
3. `QueensController` forwards call to `QueensService`.
4. Service runs the selected solver.
5. New solutions are persisted in DB (if not already present).
6. Run metrics (solver type, solution count, execution time, timestamp) are saved.
7. Response is returned and shown in UI logs/cards.

## 7.3 Submission flow (gameplay)

1. User places queens in `Chessboard` and submits with player name.
2. Backend validates name and placement length/range.
3. Backend validates queen correctness (`isValidSolution`).
4. Backend checks whether this solution key is already claimed.
5. If valid and new/unclaimed:
   - mark solution as claimed,
   - save claimant details,
   - insert player record for leaderboard.
6. UI receives one of: `SUCCESS`, `ALREADY_CLAIMED`, `ALL_FOUND`.

## 7.4 Compare flow

1. `CompareTab` calls `/solve/compare`.
2. Backend returns latest sequential and threaded run entries.
3. UI computes ratio and explains which approach was faster.

---

## 8. REST API (Sixteen Queens)

Controller: `backend/src/main/java/com/pdsagame/backend/queens/controller/QueensController.java`

- `POST /api/queens/solve/sequential` -> run sequential solver
- `POST /api/queens/solve/threaded` -> run threaded solver
- `GET /api/queens/solve/compare` -> latest sequential vs threaded results
- `POST /api/queens/submit` -> validate and store player solution
- `GET /api/queens/solutions` -> all loaded solutions + claim status
- `GET /api/queens/leaderboard` -> ranked players by unique solutions found

---

## 9. Data Model (Database)

### 9.1 `queens_solutions` (`QueensSolution`)

- stores canonical solution key,
- stores claim status and claimant info,
- prevents duplicate solutions via unique key.

### 9.2 `queens_player_records` (`PlayerRecord`)

- stores each successful player submission,
- used for leaderboard aggregation.

### 9.3 `queens_solver_runs` (`SolverRun`)

- stores solver type,
- number of solutions found,
- execution time,
- run timestamp.

---

## 10. Validation and Error Handling

Validation in `QueensService`:

- player name cannot be blank and max length is enforced,
- placement must have exact board size (16),
- each column value must be in range `0..15`,
- board must be a true non-attacking queens arrangement.

Global error mapping in `GlobalExceptionHandler`:

- `ValidationException` -> HTTP 400
- `InvalidSolutionException` -> HTTP 422
- `SolverException` -> HTTP 500
- unexpected errors -> HTTP 500

---

## 11. Current Constraints and Notes

- Board size is configured for 16 (`queens.board.size=16`).
- Solver stores up to 500 solutions per run (`queens.solver.solution-limit=500`).
- Thread count is fixed by config (`queens.solver.thread-count=4`).
- Performance results depend on CPU cores, JVM warmup, and machine load.

---

## 12. Conclusion

The Sixteen Queens module demonstrates a complete applied algorithm system:

- mathematically correct backtracking search,
- parallelized variant for performance comparison,
- full-stack flow from React UI to Spring Boot API to database persistence,
- and gameplay logic with duplicate prevention and leaderboard tracking.
