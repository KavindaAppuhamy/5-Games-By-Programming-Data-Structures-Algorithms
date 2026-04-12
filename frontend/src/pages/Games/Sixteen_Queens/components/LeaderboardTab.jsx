import { useEffect, useState, useCallback } from "react";
import { FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";
import {getLeaderboard} from "../api/queensApi.js";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function LeaderboardTab() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchBoard = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getLeaderboard();
            setEntries(data);
        } catch {
            toast.error("Failed to load leaderboard.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBoard(); }, [fetchBoard]);

    return (
        <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xs font-semibold text-red-400 uppercase tracking-widest">Player Rankings</h2>
                    <button
                        onClick={fetchBoard}
                        disabled={loading}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition cursor-pointer"
                    >
                        <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {entries.length === 0 ? (
                    <div className="text-center py-14 text-gray-500">
                        <div className="text-5xl mb-4">🏆</div>
                        <p className="font-medium">No solutions identified yet.</p>
                        <p className="text-sm mt-2">Head to the Play tab and find a valid arrangement!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {entries.map((e, i) => (
                            <div
                                key={e.playerName}
                                className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition
                  ${i === 0 ? "bg-yellow-900/20 border-yellow-700/40" :
                                    i === 1 ? "bg-gray-500/10 border-gray-600/40" :
                                        i === 2 ? "bg-orange-900/15 border-orange-800/30" :
                                            "bg-gray-800/40 border-gray-700/30"}`}
                            >
                                {/* Rank */}
                                <div className="text-xl w-8 text-center shrink-0">
                                    {i < 3 ? MEDAL[i] : <span className="text-sm text-gray-500">{i + 1}</span>}
                                </div>

                                {/* Name */}
                                <div className={`flex-1 font-medium ${i < 3 ? "text-white" : "text-gray-300"}`}>
                                    {e.playerName}
                                </div>

                                {/* Score */}
                                <div className="text-right shrink-0">
                                    <div className={`text-xl font-bold ${
                                        i === 0 ? "text-yellow-400" :
                                            i === 1 ? "text-gray-300"   :
                                                i === 2 ? "text-orange-400" :
                                                    "text-red-400"
                                    }`}>
                                        {e.solutionsFound}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        solution{e.solutionsFound !== 1 ? "s" : ""}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Scoring rules */}
            <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6 text-sm text-gray-400 leading-relaxed space-y-2">
                <h2 className="text-xs font-semibold text-red-400 uppercase tracking-widest">Scoring rules</h2>
                <p>Each player earns one point per unique valid solution they are the <span className="text-white">first</span> to identify.</p>
                <p>If a solution was already claimed by another player, it will not count — try a different arrangement.</p>
                <p>Once all loaded solutions are claimed, the system <span className="text-white">automatically resets</span> and players can start again.</p>
            </div>
        </div>
    );
}