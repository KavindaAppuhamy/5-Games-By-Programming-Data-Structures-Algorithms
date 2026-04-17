import { useNavigate } from "react-router-dom";

export default function GameMenu() {
  const navigate = useNavigate();

    const games = [
    { name: "Minimum Cost Assignment", path: "/min-cost", color: "from-purple-500 to-pink-500" },
    { name: "Snake & Ladder", path: "/snake-ladder", color: "from-green-400 to-emerald-600" },
    { name: "Traffic Simulation", path: "/traffic", color: "from-yellow-400 to-orange-500" },
    { name: "Knight's Tour", path: "/knight-tour", color: "from-blue-500 to-cyan-500" },
    { name: "Sixteen Queens", path: "/sixteen-queens", color: "from-red-500 to-rose-600" },
    ];

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-gray-900 to-black text-white flex flex-col items-center justify-center p-6">

      {/* Title */}
      <h1 className="text-5xl font-extrabold mb-12 tracking-wide text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500 drop-shadow-lg">
        🎮 GAME HUB
      </h1>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {games.map((game, index) => (
          <div
            key={index}
            onClick={() => navigate(game.path)}
            className="relative group cursor-pointer"
          >
            {/* Glow Effect */}
            <div className={`absolute inset-0 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-300 bg-linear-to-r ${game.color}`}></div>

            {/* Card */}
            <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-8 h-40 flex flex-col justify-between transform group-hover:scale-105 group-hover:-translate-y-2 transition duration-300 shadow-xl">

              <h2 className="text-xl font-bold">
                {game.name}
              </h2>

              <span className="text-sm text-gray-400 group-hover:text-white transition">
                ▶ Play Game
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="mt-12 text-gray-500 text-sm">
        Select a game to start playing 🚀
      </p>
    </div>
  );
}