import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {FiArrowLeft, FiSettings} from "react-icons/fi";
import { GiChessQueen } from "react-icons/gi";
import SolverTab from "./components/SolverTab.jsx";
import CompareTab from "./components/CompareTab.jsx";
import PlayTab from "./components/PlayTab.jsx";
import LeaderboardTab from "./components/LeaderboardTab.jsx";
import {FaChessBoard, FaTrophy} from "react-icons/fa";
import {BiGitCompare} from "react-icons/bi";

const TABS = [
    { id: "play",        label: "Play",        icon: FaChessBoard },
    { id: "leaderboard", label: "Leaderboard", icon: FaTrophy },
    { id: "solver",      label: "Solver",      icon: FiSettings },
    { id: "compare",     label: "Compare",     icon: BiGitCompare },
];

export default function SixteenQueens() {
    const navigate = useNavigate();
    const [active,    setActive]    = useState("play");
    const [seqResult, setSeqResult] = useState(null);
    const [thrResult, setThrResult] = useState(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">

            {/* ── Header ── */}
            <header className="bg-gray-900/80 border-b border-gray-700/60 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm cursor-pointer"
                    >
                        <FiArrowLeft size={16} /> Back
                    </button>


                    <div className="flex items-center gap-3 ml-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                            <GiChessQueen size={22} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">Sixteen Queens Puzzle</h1>
                            <p className="text-xs text-gray-400">16×16 board · 14,772,512 solutions</p>
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="max-w-6xl mx-auto px-6 flex gap-1 border-t border-gray-700/40">
                    {TABS.map((t) => {
                        const Icon = t.icon;

                        return (
                            <button
                                key={t.id}
                                onClick={() => setActive(t.id)}
                                className={`px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-2
                                ${
                                    active === t.id
                                        ? "border-red-400 text-white"
                                        : "border-transparent text-gray-400 hover:text-white"
                                }`}
                            >
                                <span
                                    className={`p-1 rounded-md flex items-center justify-center
                                    ${
                                        active === t.id
                                            ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/30"
                                            : "text-gray-400"
                                    }`}
                                >
                                    <Icon size={16} />
                                </span>
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* ── Content ── */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                {active === "play"        && <PlayTab />}
                {active === "leaderboard" && <LeaderboardTab />}
                {active === "solver"      && <SolverTab      onSeqDone={setSeqResult} onThrDone={setThrResult} />}
                {active === "compare"     && <CompareTab      seqResult={seqResult}   thrResult={thrResult} />}
            </main>
        </div>
    );
}