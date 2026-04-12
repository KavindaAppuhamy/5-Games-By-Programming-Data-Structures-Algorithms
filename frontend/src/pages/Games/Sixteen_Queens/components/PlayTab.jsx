import { useState, useEffect, useCallback } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { GiChessQueen } from "react-icons/gi";
import toast from "react-hot-toast";
import Chessboard from "./Chessboard";
import {getSolutions, submitSolution} from "../api/queensApi.js";

const N = 16;
const emptyBoard = () => new Array(N).fill(-1);

function countConflicts(board) {
    let n = 0;
    for (let i = 0; i < N; i++) {
        if (board[i] < 0) continue;
        for (let j = i + 1; j < N; j++) {
            if (board[j] < 0) continue;
            if (board[i] === board[j] || Math.abs(board[i] - board[j]) === Math.abs(i - j)) n++;
        }
    }
    return n;
}

export default function PlayTab() {
    const [board,       setBoard]       = useState(emptyBoard());
    const [playerName,  setName]        = useState("");
    const [solutions,   setSolutions]   = useState([]);
    const [loadingSols, setLoadingSols] = useState(false);
    const [submitting,  setSubmitting]  = useState(false);

    const queensPlaced = board.filter((c) => c >= 0).length;
    const conflicts    = countConflicts(board);
    const isValid      = queensPlaced === N && conflicts === 0;

    const fetchSolutions = useCallback(async () => {
        setLoadingSols(true);
        try {
            const { data } = await getSolutions();
            setSolutions(data);
        } catch {
            toast.error("Could not load solutions.");
        } finally {
            setLoadingSols(false);
        }
    }, []);

    useEffect(() => { fetchSolutions(); }, [fetchSolutions]);

    const handleCell = (r, c) => {
        setBoard((prev) => {
            const next = [...prev];
            next[r] = next[r] === c ? -1 : c;
            return next;
        });
    };

    const handleClear = () => setBoard(emptyBoard());

    const handleHint = async () => {
        try {
            const { data } = await getSolutions();
            const unclaimed = data.find((s) => !s.claimed);
            if (!unclaimed) { toast("All loaded solutions are already claimed!", { icon: "⚠️" }); return; }
            const cols = unclaimed.solutionKey.split(",").map(Number);
            const hint = emptyBoard();
            for (let r = 0; r < 5; r++) hint[r] = cols[r];
            setBoard(hint);
            toast("Hint: first 5 rows revealed. Complete the rest!", { icon: "💡" });
        } catch {
            toast.error("Run the solver first to load solutions.");
        }
    };

    const handleSubmit = async () => {
        if (!playerName.trim())     { toast.error("Enter your name first.");                           return; }
        if (queensPlaced !== N)     { toast.error(`Place all 16 queens (${queensPlaced} placed).`);   return; }
        if (conflicts > 0)          { toast.error(`${conflicts} conflict(s) detected — shown in red.`); return; }

        setSubmitting(true);
        try {
            const { data } = await submitSolution(playerName.trim(), board);
            if (data.status === "SUCCESS") {
                toast.success(`✓ Correct! Saved for "${data.playerName}"`);
                setBoard(emptyBoard());
                await fetchSolutions();
            } else if (data.status === "ALREADY_CLAIMED") {
                toast(data.message, { icon: "⚠️" });
            } else if (data.status === "ALL_FOUND") {
                toast.success(data.message);
                await fetchSolutions();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const claimed   = solutions.filter((s) => s.claimed).length;
    const unclaimed = solutions.filter((s) => !s.claimed).length;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Solutions in DB",  value: solutions.length,   accent: "text-red-400"     },
                    { label: "Claimed",          value: claimed,            accent: "text-emerald-400" },
                    { label: "Remaining",        value: unclaimed,          accent: "text-yellow-400"  },
                    { label: "Queens placed",    value: `${queensPlaced}/16` },
                ].map((s) => (
                    <div key={s.label} className="bg-gray-900 border border-gray-700/60 rounded-xl p-4">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{s.label}</div>
                        <div className={`text-2xl font-bold ${s.accent || "text-white"}`}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Board card */}
            <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6">
                <h2 className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-4">Your Move</h2>

                {/* Name + actions */}
                <div className="flex flex-wrap gap-3 mb-4">
                    <input
                        value={playerName}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        maxLength={100}
                        className="flex-1 min-w-40 bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !isValid}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition cursor-pointer shadow-lg shadow-red-500/20"
                    >
                        {submitting
                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <GiChessQueen size={15} />}
                        Submit
                    </button>
                    <button
                        onClick={handleClear}
                        className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm transition cursor-pointer"
                    >
                        ↺ Clear
                    </button>
                    <button
                        onClick={handleHint}
                        className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm transition cursor-pointer"
                    >
                        💡 Hint
                    </button>
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span>
            Queens: <span className="text-white font-medium">{queensPlaced}</span>/16
              {conflicts > 0 && (
                  <span className="text-red-400 ml-3">⚠ {conflicts} conflict{conflicts > 1 ? "s" : ""}</span>
              )}
              {isValid && (
                  <span className="text-emerald-400 ml-3">✓ Valid — ready to submit</span>
              )}
          </span>
                    <span className="hidden sm:block">Click a cell to place / remove a queen</span>
                </div>

                <Chessboard board={board} onCellClick={handleCell} />
            </div>

            {/* Solutions list */}
            <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-semibold text-red-400 uppercase tracking-widest">
                        Solutions ({claimed} found / {solutions.length} loaded)
                    </h2>
                    <button
                        onClick={fetchSolutions}
                        disabled={loadingSols}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition cursor-pointer"
                    >
                        <FiRefreshCw size={12} className={loadingSols ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {solutions.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <div className="text-4xl mb-3">⚙</div>
                        <p>No solutions loaded. Run the solver first.</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {solutions.map((s, i) => (
                            <div
                                key={s.id}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm
                  ${s.claimed
                                    ? "bg-emerald-900/20 border-emerald-700/40"
                                    : "bg-gray-800/50 border-gray-700/40"}`}
                            >
                                <span className="text-xs text-gray-500 w-7 shrink-0">#{i + 1}</span>
                                <span className="font-mono text-xs text-gray-400 flex-1 truncate">[{s.solutionKey}]</span>
                                {s.claimed
                                    ? <span className="text-xs text-emerald-400 shrink-0">✓ {s.claimedBy}</span>
                                    : <span className="text-xs text-gray-600 shrink-0">not found</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}