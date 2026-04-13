import { useEffect, useState, useCallback } from "react";
import { FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";
import {getLeaderboard} from "../api/queensApi.js";
import {FaMedal, FaTrophy} from "react-icons/fa";

const MEDAL = ["🥇", "🥈", "🥉"];

const getRankStyles = (rank) => {
    switch (rank) {
        case 0:
            return "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-yellow-500/30";
        case 1:
            return "bg-gradient-to-r from-gray-300 to-gray-400 text-black shadow-gray-400/30";
        case 2:
            return "bg-gradient-to-r from-orange-400 to-amber-600 text-white shadow-orange-500/30";
        default:
            return "";
    }
};

const getRankIcon = (rank) => {
    switch (rank) {
        case 0:
            return <FaTrophy className="text-white" size={14} />;
        case 1:
            return <FaMedal className="text-black" size={14} />;
        case 2:
            return <FaMedal className="text-white" size={14} />;
        default:
            return null;
    }
};

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
                    <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30 mb-4 animate-pulse">
                            <FaTrophy size={28} className="text-white" />
                        </div>

                        <p className="text-lg font-medium text-white">
                            No solutions identified yet
                        </p>

                        <p className="text-sm mt-2 text-gray-400 text-center max-w-sm">
                            Head to the Play tab and find a valid arrangement!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {entries.map((e, i) => (
                            <div
                                key={e.playerName}
                                className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition
                                ${
                                    i === 0 ? "bg-yellow-900/20 border-yellow-700/40" :
                                        i === 1 ? "bg-gray-500/10 border-gray-600/40" :
                                            i === 2 ? "bg-orange-900/15 border-orange-800/30" :
                                                "bg-gray-800/40 border-gray-700/30"
                                }`}
                            >
                                {/* Rank Badge */}
                                <div className="w-10 flex justify-center shrink-0">
                                    {i < 3 ? (
                                        <div
                                            className={`px-3 h-8 flex items-center gap-2 rounded-full text-xs font-bold shadow-md ${getRankStyles(i)}`}
                                        >
                                            {getRankIcon(i)}
                                            <span className={'fill-black font-extrabold'}>{i + 1}</span>
                                        </div>
                                    ) : (
                                        <div className="px-2.5 h-7 flex items-center justify-center rounded-md text-xs font-semibold
                                            bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200
                                            border border-gray-600/40 shadow-sm"
                                        >
                                            {i + 1}
                                        </div>
                                    )}
                                </div>

                                {/* Name */}
                                <div className={`flex-1 font-medium ${i < 3 ? "text-white" : "text-gray-300"}`}>
                                    {e.playerName}
                                </div>

                                {/* Score */}
                                <div className="text-right shrink-0">
                                    <div
                                        className={`text-xl font-bold ${
                                            i === 0 ? "text-yellow-400" :
                                                i === 1 ? "text-gray-300" :
                                                    i === 2 ? "text-orange-400" :
                                                        "text-red-400"
                                        }`}
                                    >
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