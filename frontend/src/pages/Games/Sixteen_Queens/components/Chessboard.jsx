const N = 16;

function getConflicts(board) {
    const conflicts = new Set();
    for (let i = 0; i < N; i++) {
        if (board[i] < 0) continue;
        for (let j = i + 1; j < N; j++) {
            if (board[j] < 0) continue;
            if (board[i] === board[j] || Math.abs(board[i] - board[j]) === Math.abs(i - j)) {
                conflicts.add(`${i},${board[i]}`);
                conflicts.add(`${j},${board[j]}`);
            }
        }
    }
    return conflicts;
}

export default function Chessboard({ board, onCellClick, readOnly = false }) {
    const conflicts = getConflicts(board);

    return (
        <div className="overflow-x-auto">
            <div
                className="inline-grid border-2 border-gray-600 rounded overflow-hidden"
                style={{ gridTemplateColumns: `repeat(${N}, 1.625rem)` }}
            >
                {Array.from({ length: N }, (_, r) =>
                    Array.from({ length: N }, (_, c) => {
                        const isLight    = (r + c) % 2 === 0;
                        const hasQueen   = board[r] === c;
                        const isConflict = hasQueen && conflicts.has(`${r},${c}`);

                        let bg = isLight ? "bg-amber-100" : "bg-amber-800";
                        if (hasQueen) bg = isConflict ? "bg-red-600" : "bg-emerald-600";

                        return (
                            <div
                                key={`${r}-${c}`}
                                title={`Row ${r + 1}, Col ${c + 1}`}
                                onClick={() => !readOnly && onCellClick?.(r, c)}
                                className={`w-6.5 h-6.5 flex items-center justify-center text-sm
                  ${bg}
                  ${!readOnly ? "cursor-pointer hover:brightness-110" : ""}
                  transition-colors duration-100`}
                                style={{ width: "26px", height: "26px" }}
                            >
                                {hasQueen && (
                                    <span className={isConflict ? "text-red-200" : "text-emerald-100"}>
                    ♛
                  </span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}