import { useState, useRef, useEffect } from "react";
import { FiPlay, FiZap, FiInfo } from "react-icons/fi";
import toast from "react-hot-toast";
import { runSequential, runThreaded } from "../api/queensApi.js";

export default function SolverTab({ onSeqDone, onThrDone }) {
    const [seqResult, setSeqResult]   = useState(null);
    const [thrResult, setThrResult]   = useState(null);
    const [seqLoading, setSeqLoading] = useState(false);
    const [thrLoading, setThrLoading] = useState(false);
    const [progress,  setProgress]    = useState(0);
    const [logs, setLogs]             = useState([{ text: "Ready — run a solver to begin.", type: "info" }]);
    const [runCount,  setRunCount]    = useState({ seq: 0, thr: 0 });
    const logRef = useRef(null);

    const addLog = (text, type = "info") =>
        setLogs((l) => [...l, { text, type }]);

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [logs]);

    const handleSequential = async () => {
        setSeqLoading(true);
        setProgress(20);
        const run = runCount.seq + 1;
        setRunCount((c) => ({ ...c, seq: run }));
        addLog(`Sequential solver started (run #${run})…`, "info");
        if (run === 1) addLog("Note: first run may be slower due to JVM warmup.", "warn");
        try {
            setProgress(60);
            const { data } = await runSequential();
            setProgress(100);
            setSeqResult(data);
            onSeqDone(data);
            addLog(`✓ Done — ${data.solutionsFound} solutions in ${data.executionTimeMs}ms`, "ok");
            toast.success(`Sequential: ${data.executionTimeMs}ms`);
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            addLog(`✗ ${msg}`, "err");
            toast.error(msg);
        } finally {
            setSeqLoading(false);
        }
    };

    const handleThreaded = async () => {
        setThrLoading(true);
        setProgress(20);
        const run = runCount.thr + 1;
        setRunCount((c) => ({ ...c, thr: run }));
        addLog(`Threaded solver started (run #${run})…`, "info");
        try {
            setProgress(60);
            const { data } = await runThreaded();
            setProgress(100);
            setThrResult(data);
            onThrDone(data);
            addLog(`✓ Done — ${data.solutionsFound} solutions in ${data.executionTimeMs}ms`, "ok");
            if (seqResult) {
                const ratio = seqResult.executionTimeMs / data.executionTimeMs;
                if (ratio >= 1) {
                    addLog(`⚡ Threaded was ${ratio.toFixed(2)}x faster than last sequential run.`, "ok");
                } else {
                    addLog(`⚠ Threaded was ${(1 / ratio).toFixed(2)}x slower — thread overhead exceeded gain.`, "warn");
                }
            }
            toast.success(`Threaded: ${data.executionTimeMs}ms`);
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            addLog(`✗ ${msg}`, "err");
            toast.error(msg);
        } finally {
            setThrLoading(false);
        }
    };

    const busy = seqLoading || thrLoading;

    const speedupLabel = (() => {
        if (!seqResult || !thrResult) return null;
        const ratio = seqResult.executionTimeMs / thrResult.executionTimeMs;
        if (ratio >= 1) return { text: `Threaded ${ratio.toFixed(2)}x faster`, positive: true };
        return { text: `Sequential ${(1 / ratio).toFixed(2)}x faster this run`, positive: false };
    })();

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Known solutions",  value: "14,772,512",  accent: "text-red-400"     },
                    { label: "Seq — solutions",  value: seqResult ? seqResult.solutionsFound : "—" },
                    { label: "Seq — time",       value: seqResult ? `${seqResult.executionTimeMs}ms` : "—" },
                    { label: "Threaded — time",  value: thrResult ? `${thrResult.executionTimeMs}ms` : "—", accent: "text-emerald-400" },
                ].map((s) => (
                    <div key={s.label} className="bg-gray-900 border border-gray-700/60 rounded-xl p-4">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{s.label}</div>
                        <div className={`text-2xl font-bold ${s.accent || "text-white"}`}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* JVM warmup notice */}
            <div className="flex items-start gap-3 bg-yellow-950/40 border border-yellow-700/40 rounded-xl px-4 py-3 text-xs text-yellow-300/80">
                <FiInfo size={14} className="shrink-0 mt-0.5 text-yellow-400" />
                <span>
                    <span className="font-semibold text-yellow-300">JVM warmup effect:</span> the first run of each
                    solver is typically slower because the JIT compiler hasn't optimised the bytecode yet.
                    Run each solver at least twice for representative timings. Threaded may sometimes be
                    slower on a warmed JVM due to thread-management overhead on small workloads.
                </span>
            </div>

            {/* Controls */}
            <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6">
                <h2 className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-1">Run Solvers</h2>
                <p className="text-sm text-gray-400 mb-5">
                    Each run stores up to 500 verified solutions in Database and records execution time.
                    Run both to unlock the Compare tab.
                </p>

                <div className="flex flex-wrap gap-3 mb-5">
                    <button
                        onClick={handleSequential}
                        disabled={busy}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm transition cursor-pointer shadow-lg shadow-blue-500/20"
                    >
                        {seqLoading
                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <FiPlay size={14} />}
                        Run Sequential
                        {runCount.seq > 0 && (
                            <span className="ml-1 text-blue-300/60 text-xs font-normal">×{runCount.seq}</span>
                        )}
                    </button>

                    <button
                        onClick={handleThreaded}
                        disabled={busy}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm transition cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                        {thrLoading
                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <FiZap size={14} />}
                        Run Threaded (4 workers)
                        {runCount.thr > 0 && (
                            <span className="ml-1 text-emerald-300/60 text-xs font-normal">×{runCount.thr}</span>
                        )}
                    </button>
                </div>

                {/* Inline speedup hint */}
                {speedupLabel && (
                    <div className={`flex items-center gap-2 text-xs mb-4 px-3 py-2 rounded-lg border
                        ${speedupLabel.positive
                        ? "bg-emerald-950/40 border-emerald-700/40 text-emerald-300"
                        : "bg-orange-950/40 border-orange-700/40 text-orange-300"}`}>
                        <span>{speedupLabel.positive ? "⚡" : "⚠"}</span>
                        <span>{speedupLabel.text} — see Compare tab for full breakdown.</span>
                    </div>
                )}

                {/* Progress */}
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-5">
                    <div
                        className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Log */}
                <div
                    ref={logRef}
                    className="bg-black/50 border border-gray-700/40 rounded-xl p-4 h-36 overflow-y-auto font-mono text-xs space-y-1"
                >
                    {logs.map((l, i) => (
                        <div
                            key={i}
                            className={
                                l.type === "ok"   ? "text-emerald-400" :
                                    l.type === "err"  ? "text-red-400"     :
                                        l.type === "warn" ? "text-yellow-400"  :
                                            "text-gray-400"
                            }
                        >
                            {l.text}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}