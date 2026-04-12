import { useEffect, useState } from "react";
import {getComparison} from "../api/queensApi.js";


export default function CompareTab({ seqResult, thrResult }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        getComparison()
            .then(({ data: d }) => setData(d))
            .catch(() => setData({ sequential: seqResult, threaded: thrResult }));
    }, [seqResult, thrResult]);

    const seq = data?.sequential;
    const thr = data?.threaded;

    if (!seq || !thr) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-lg font-medium">Run both solvers first</p>
                <p className="text-sm mt-2">Go to the Solver tab and run Sequential then Threaded.</p>
            </div>
        );
    }

    const maxTime  = Math.max(seq.executionTimeMs, thr.executionTimeMs);
    const speedup  = (seq.executionTimeMs / thr.executionTimeMs).toFixed(2);

    return (
        <div className="space-y-6">
            {/* Speedup banner */}
            <div className="bg-gradient-to-r from-emerald-900/60 to-green-900/40 border border-emerald-700/50 rounded-2xl p-5 text-center">
                <p className="text-3xl font-extrabold text-emerald-400">⚡ {speedup}x faster</p>
                <p className="text-sm text-emerald-300/70 mt-1">Threaded vs Sequential</p>
            </div>

            {/* Side-by-side cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Sequential */}
                <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6 border-t-4 border-t-blue-500">
                    <h3 className="text-sm font-semibold text-blue-400 mb-4">Sequential</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="text-3xl font-bold">{seq.executionTimeMs}<span className="text-base font-normal text-gray-400 ml-1">ms</span></div>
                            <div className="text-xs text-gray-400 mt-0.5">Execution time</div>
                        </div>
                        <div className="border-t border-gray-700/60 pt-4">
                            <div className="text-3xl font-bold">{seq.solutionsFound}</div>
                            <div className="text-xs text-gray-400 mt-0.5">Solutions stored</div>
                        </div>
                        <div className="border-t border-gray-700/60 pt-4 text-xs text-gray-500">
                            Single-threaded backtracking · explores entire tree row by row
                        </div>
                    </div>
                </div>

                {/* Threaded */}
                <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6 border-t-4 border-t-emerald-500">
                    <h3 className="text-sm font-semibold text-emerald-400 mb-4">Threaded</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="text-3xl font-bold">{thr.executionTimeMs}<span className="text-base font-normal text-gray-400 ml-1">ms</span></div>
                            <div className="text-xs text-gray-400 mt-0.5">Execution time</div>
                        </div>
                        <div className="border-t border-gray-700/60 pt-4">
                            <div className="text-3xl font-bold">{thr.solutionsFound}</div>
                            <div className="text-xs text-gray-400 mt-0.5">Solutions stored</div>
                        </div>
                        <div className="border-t border-gray-700/60 pt-4 text-xs text-gray-500">
                            4-worker parallel backtracking · first-row columns split across threads
                        </div>
                    </div>
                </div>
            </div>

            {/* Bar chart */}
            <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6">
                <h2 className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-5">Relative performance</h2>
                <div className="space-y-4">
                    {[
                        { label: "Sequential", time: seq.executionTimeMs, cls: "bg-blue-500" },
                        { label: "Threaded",   time: thr.executionTimeMs, cls: "bg-emerald-500" },
                    ].map((row) => (
                        <div key={row.label} className="flex items-center gap-4">
                            <div className="text-sm text-gray-400 w-24 shrink-0">{row.label}</div>
                            <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${row.cls}`}
                                    style={{ width: `${(row.time / maxTime) * 100}%` }}
                                />
                            </div>
                            <div className="text-sm text-gray-400 w-16 text-right shrink-0">{row.time}ms</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Explanation */}
            <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6 space-y-3 text-sm text-gray-400 leading-relaxed">
                <h2 className="text-xs font-semibold text-red-400 uppercase tracking-widest">How it works</h2>
                <p>
                    <span className="text-blue-400 font-medium">Sequential</span> — one thread explores the
                    entire search tree using backtracking. Simple and predictable but bounded by a single CPU core.
                </p>
                <p>
                    <span className="text-emerald-400 font-medium">Threaded</span> — fixes the first-row queen
                    to one of 16 columns and distributes those 16 starting points across 4 worker threads via a
                    fixed thread pool. Each worker runs its own independent subtree with no shared mutable state,
                    then results are merged. Speedup scales with available CPU cores.
                </p>
            </div>
        </div>
    );
}