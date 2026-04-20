import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

// --- SVG Icons for each game ---
const MinCostIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
        <circle cx="12" cy="12" r="5" stroke="#c084fc" strokeWidth="1.5" fill="none"/>
        <circle cx="52" cy="12" r="5" stroke="#c084fc" strokeWidth="1.5" fill="none"/>
        <circle cx="12" cy="52" r="5" stroke="#ec4899" strokeWidth="1.5" fill="none"/>
        <circle cx="52" cy="52" r="5" stroke="#ec4899" strokeWidth="1.5" fill="none"/>
        <circle cx="32" cy="32" r="5" stroke="#f0abfc" strokeWidth="1.5" fill="rgba(192,132,252,0.15)"/>
        <line x1="17" y1="12" x2="47" y2="12" stroke="#c084fc" strokeWidth="1" strokeDasharray="3 2" opacity="0.6"/>
        <line x1="12" y1="17" x2="12" y2="47" stroke="#ec4899" strokeWidth="1" strokeDasharray="3 2" opacity="0.6"/>
        <line x1="17" y1="52" x2="47" y2="52" stroke="#ec4899" strokeWidth="1" strokeDasharray="3 2" opacity="0.6"/>
        <line x1="52" y1="17" x2="52" y2="47" stroke="#c084fc" strokeWidth="1" strokeDasharray="3 2" opacity="0.6"/>
        <line x1="16" y1="16" x2="28" y2="28" stroke="#f0abfc" strokeWidth="1.5" opacity="0.8"/>
        <line x1="48" y1="16" x2="36" y2="28" stroke="#f0abfc" strokeWidth="1.5" opacity="0.8"/>
        <line x1="16" y1="48" x2="28" y2="36" stroke="#f0abfc" strokeWidth="1.5" opacity="0.8"/>
        <line x1="48" y1="48" x2="36" y2="36" stroke="#f0abfc" strokeWidth="1.5" opacity="0.8"/>
        <text x="25" y="36" fill="#f0abfc" fontSize="10" fontFamily="monospace">$</text>
    </svg>
);

const SnakeLadderIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
        {/* Grid */}
        {[0,1,2,3].map(r => [0,1,2,3].map(c => (
            <rect key={`${r}-${c}`} x={4+c*14} y={4+r*14} width="12" height="12"
                  fill={((r+c)%2===0)?"rgba(52,211,153,0.08)":"rgba(16,185,129,0.15)"}
                  stroke="#34d399" strokeWidth="0.5" rx="1"/>
        )))}
        {/* Ladder */}
        <line x1="10" y1="46" x2="24" y2="18" stroke="#6ee7b7" strokeWidth="2"/>
        <line x1="16" y1="46" x2="30" y2="18" stroke="#6ee7b7" strokeWidth="2"/>
        <line x1="11" y1="40" x2="17" y2="40" stroke="#6ee7b7" strokeWidth="1.5"/>
        <line x1="13" y1="33" x2="19" y2="33" stroke="#6ee7b7" strokeWidth="1.5"/>
        <line x1="15" y1="26" x2="21" y2="26" stroke="#6ee7b7" strokeWidth="1.5"/>
        {/* Snake */}
        <path d="M44 10 Q54 14 50 22 Q46 30 56 34 Q60 42 50 46"
              stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <circle cx="44" cy="10" r="3" fill="#34d399" opacity="0.8"/>
        <circle cx="50" cy="46" r="2" fill="#059669"/>
        <line x1="50" y1="46" x2="48" y2="50" stroke="#059669" strokeWidth="1.5"/>
        <line x1="50" y1="46" x2="52" y2="50" stroke="#059669" strokeWidth="1.5"/>
    </svg>
);

const TrafficIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
        {/* Roads */}
        <rect x="28" y="0" width="8" height="64" fill="rgba(234,179,8,0.1)" rx="1"/>
        <rect x="0" y="28" width="64" height="8" fill="rgba(249,115,22,0.1)" rx="1"/>
        {/* Dashes */}
        {[4,14,42,52].map(y => <rect key={y} x="31" y={y} width="2" height="6" fill="#fbbf24" opacity="0.5" rx="1"/>)}
        {[4,14,42,52].map(x => <rect key={x} x={x} y="31" width="6" height="2" fill="#f97316" opacity="0.5" rx="1"/>)}
        {/* Traffic light */}
        <rect x="36" y="8" width="10" height="22" fill="#1a1a2e" stroke="#fbbf24" strokeWidth="1" rx="2"/>
        <circle cx="41" cy="14" r="3" fill="#ef4444" opacity="0.9"/>
        <circle cx="41" cy="22" r="3" fill="#facc15" opacity="0.5"/>
        <circle cx="41" cy="30" r="3" fill="#22c55e" opacity="0.4"/>
        {/* Cars */}
        <rect x="4" y="29" width="14" height="6" fill="#f97316" opacity="0.9" rx="1.5"/>
        <rect x="6" y="27" width="8" height="4" fill="#fed7aa" opacity="0.5" rx="1"/>
        <circle cx="7" cy="35" r="1.5" fill="#374151"/>
        <circle cx="15" cy="35" r="1.5" fill="#374151"/>
        <rect x="29" y="44" width="6" height="12" fill="#facc15" opacity="0.9" rx="1.5"/>
        <rect x="30" y="42" width="4" height="4" fill="#fef9c3" opacity="0.5" rx="1"/>
        <circle cx="30" cy="56" r="1.5" fill="#374151"/>
        <circle cx="34" cy="56" r="1.5" fill="#374151"/>
    </svg>
);

const KnightIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
        {/* Chess board */}
        {[0,1,2,3].map(r => [0,1,2,3].map(c => (
            <rect key={`${r}-${c}`} x={2+c*15} y={2+r*15} width="14" height="14"
                  fill={((r+c)%2===0)?"rgba(96,165,250,0.05)":"rgba(34,211,238,0.12)"}
                  stroke="#3b82f6" strokeWidth="0.5"/>
        )))}
        {/* Knight path */}
        <path d="M9 9 L24 24 L9 39 L24 54" stroke="#60a5fa" strokeWidth="1"
              strokeDasharray="2 2" opacity="0.5"/>
        {/* Knight piece */}
        <g transform="translate(30, 10)">
            <path d="M10 30 L4 30 L4 26 Q2 22 4 18 Q6 14 10 12 Q8 10 10 8 Q14 6 16 10 Q20 8 20 14 Q22 18 18 22 L18 30 Z"
                  fill="rgba(96,165,250,0.2)" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="13" cy="11" r="1.5" fill="#93c5fd"/>
        </g>
        {/* L-shape move indicator */}
        <path d="M9 47 L9 56 L24 56" stroke="#06b6d4" strokeWidth="1.5"
              strokeLinecap="round" opacity="0.8"/>
        <circle cx="24" cy="56" r="2.5" fill="#06b6d4" opacity="0.7"/>
    </svg>
);

const QueensIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
        {/* Board hint */}
        {[0,1,2,3].map(r => [0,1,2,3].map(c => (
            <rect key={`${r}-${c}`} x={2+c*15} y={2+r*15} width="14" height="14"
                  fill={((r+c)%2===0)?"rgba(239,68,68,0.04)":"rgba(251,113,133,0.1)"}
                  stroke="#f43f5e" strokeWidth="0.4" opacity="0.6"/>
        )))}
        {/* Queens (4 placed out of 16) */}
        {[[2,2],[17,32],[47,17],[32,47]].map(([x,y],i) => (
            <g key={i} transform={`translate(${x},${y})`}>
                <path d="M7 14 L2 14 L0 8 L4 10 L7 4 L10 10 L14 8 L12 14 Z"
                      fill="rgba(251,113,133,0.3)" stroke="#fb7185" strokeWidth="1" strokeLinejoin="round"/>
                <path d="M2 14 L12 14 L11 16 L3 16 Z" fill="#fb7185" opacity="0.7"/>
                <circle cx="7" cy="4" r="1" fill="#fda4af"/>
                <circle cx="0" cy="8" r="1" fill="#fda4af"/>
                <circle cx="14" cy="8" r="1" fill="#fda4af"/>
            </g>
        ))}
        {/* Attack lines */}
        <line x1="9" y1="9" x2="55" y2="55" stroke="#f43f5e" strokeWidth="0.8" opacity="0.3" strokeDasharray="2 3"/>
        <line x1="9" y1="9" x2="9" y2="55" stroke="#f43f5e" strokeWidth="0.8" opacity="0.3" strokeDasharray="2 3"/>
        <line x1="9" y1="9" x2="55" y2="9" stroke="#f43f5e" strokeWidth="0.8" opacity="0.3" strokeDasharray="2 3"/>
    </svg>
);

const games = [
    { name: "Minimum Cost Assignment", path: "/min-cost", color: "from-purple-500 to-pink-500", glow: "#c084fc", Icon: MinCostIcon, tag: "GRAPH · OPTIMIZATION" },
    { name: "Snake & Ladder", path: "/snake-ladder", color: "from-green-400 to-emerald-600", glow: "#34d399", Icon: SnakeLadderIcon, tag: "BOARD · DICE" },
    { name: "Traffic Simulation", path: "/traffic", color: "from-yellow-400 to-orange-500", glow: "#fbbf24", Icon: TrafficIcon, tag: "AI · SIMULATION" },
    { name: "Knight's Tour", path: "/knight-tour", color: "from-blue-500 to-cyan-500", glow: "#60a5fa", Icon: KnightIcon, tag: "CHESS · BACKTRACKING" },
    { name: "Sixteen Queens", path: "/sixteen-queens", color: "from-red-500 to-rose-500", glow: "#f43f5e", Icon: QueensIcon, tag: "PUZZLE · CONSTRAINT" },
];

// Animated sci-fi canvas background
function SciFiBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Particles / nodes
        const nodes = Array.from({ length: 70 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.5 + 0.5,
            pulse: Math.random() * Math.PI * 2,
        }));

        // Grid lines
        const gridSize = 60;

        let t = 0;
        const draw = () => {
            t += 0.005;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Background
            const bg = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width * 0.8
            );
            bg.addColorStop(0, "#050510");
            bg.addColorStop(0.5, "#080820");
            bg.addColorStop(1, "#02020a");
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Perspective grid
            ctx.save();
            ctx.globalAlpha = 0.06;
            ctx.strokeStyle = "#4f46e5";
            ctx.lineWidth = 0.5;
            const horizonY = canvas.height * 0.55;
            const vp = { x: canvas.width / 2, y: horizonY };
            for (let x = 0; x <= canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, canvas.height);
                ctx.lineTo(vp.x, vp.y);
                ctx.stroke();
            }
            const rows = 20;
            for (let i = 0; i <= rows; i++) {
                const frac = i / rows;
                const perspY = horizonY + (canvas.height - horizonY) * frac;
                const scaleX = 0.1 + frac * 0.9;
                const lx = vp.x - (canvas.width / 2) * scaleX;
                const rx = vp.x + (canvas.width / 2) * scaleX;
                ctx.beginPath();
                ctx.moveTo(lx, perspY);
                ctx.lineTo(rx, perspY);
                ctx.stroke();
            }
            ctx.restore();

            // Moving horizontal scan lines
            ctx.save();
            ctx.globalAlpha = 0.03;
            for (let y = 0; y < canvas.height; y += 4) {
                const wave = Math.sin(y * 0.02 + t * 3) * 0.5 + 0.5;
                ctx.fillStyle = `rgba(99,102,241,${wave * 0.5})`;
                ctx.fillRect(0, y, canvas.width, 1);
            }
            ctx.restore();

            // Node connections
            nodes.forEach(n => {
                n.x += n.vx;
                n.y += n.vy;
                n.pulse += 0.02;
                if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
                if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
            });

            nodes.forEach((a, i) => {
                nodes.slice(i + 1).forEach(b => {
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 130) {
                        ctx.save();
                        ctx.globalAlpha = (1 - dist / 130) * 0.25;
                        ctx.strokeStyle = "#818cf8";
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                        ctx.restore();
                    }
                });
            });

            // Nodes
            nodes.forEach(n => {
                const pulse = Math.sin(n.pulse) * 0.4 + 0.6;
                ctx.save();
                ctx.globalAlpha = pulse * 0.8;
                ctx.fillStyle = "#a5b4fc";
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // Floating orbs
            [[0.25, 0.3, "#7c3aed"], [0.75, 0.6, "#0e7490"], [0.5, 0.8, "#be185d"]].forEach(([fx, fy, c]) => {
                const ox = canvas.width * fx + Math.sin(t + fx * 10) * 40;
                const oy = canvas.height * fy + Math.cos(t * 0.7 + fy * 10) * 30;
                const orb = ctx.createRadialGradient(ox, oy, 0, ox, oy, 120);
                orb.addColorStop(0, c + "33");
                orb.addColorStop(1, "transparent");
                ctx.fillStyle = orb;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            });

            animId = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}

export default function GameMenu() {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-16 overflow-hidden"
             style={{ fontFamily: "'Courier New', monospace" }}>

            <SciFiBackground />

            {/* HUD top bar */}
            <div className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-3"
                 style={{ zIndex: 10, borderBottom: "1px solid rgba(99,102,241,0.2)", background: "rgba(2,2,10,0.7)", backdropFilter: "blur(10px)" }}>
                <div className="text-xs text-indigo-400 tracking-widest opacity-70">SYS://GAME_HUB/v2.0</div>
                <div className="flex gap-4 text-xs text-indigo-400 opacity-60">
                    <span>◈ ONLINE</span>
                    <span>PKT: 5</span>
                </div>
            </div>

            {/* Content */}
            <div className="relative w-full max-w-6xl flex flex-col items-center" style={{ zIndex: 5 }}>

                {/* Title block */}
                <div className="mb-12 text-center">

                    <h1 className="text-6xl font-black tracking-tight mb-2" style={{
                        background: "linear-gradient(135deg, #a5b4fc 0%, #818cf8 40%, #e879f9 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        textShadow: "none",
                        filter: "drop-shadow(0 0 30px rgba(165,180,252,0.5))"
                    }}>
                        GAME HUB
                    </h1>
                    <div className="text-xs tracking-[0.4em] text-indigo-400 mb-3 opacity-70">◈ SELECT MODULE ◈</div>
                    <div className="flex items-center justify-center gap-3 mt-2">
                        <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, #6366f1)" }}/>
                        <span className="text-xs text-indigo-400 tracking-widest opacity-60">NEURAL ARCADE SYSTEM</span>
                        <div className="h-px w-16" style={{ background: "linear-gradient(to left, transparent, #6366f1)" }}/>
                    </div>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {games.map((game, index) => (
                        <GameCard key={index} game={game} onClick={() => navigate(game.path)} />
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-xs tracking-widest opacity-40 text-indigo-300">
                        ▸ TAP TO INITIALIZE GAME MODULE ▸
                    </p>
                </div>
            </div>
        </div>
    );
}

function GameCard({ game, onClick }) {
    const { name, color, glow, Icon, tag } = game;

    return (
        <div
            onClick={onClick}
            className="group relative cursor-pointer"
            style={{ height: "260px" }}
        >
            {/* Outer glow */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                style={{
                    boxShadow: `0 0 40px ${glow}55, 0 0 80px ${glow}22`,
                    background: `radial-gradient(ellipse at center, ${glow}15 0%, transparent 70%)`,
                    borderRadius: "16px",
                }}
            />

            {/* Card */}
            <div
                className="relative w-full h-full rounded-2xl flex flex-col justify-between p-6 overflow-hidden"
                style={{
                    background: "rgba(5,5,20,0.85)",
                    backdropFilter: "blur(20px)",
                    border: `1px solid rgba(255,255,255,0.07)`,
                    borderTop: `1px solid rgba(255,255,255,0.12)`,
                    transform: "translateZ(0)",
                    transition: "transform 0.3s ease, border-color 0.3s ease",
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-4px) scale(1.01)";
                    e.currentTarget.style.borderColor = `${glow}50`;
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                }}
            >
                {/* Corner scan line accent */}
                <div className="absolute top-0 left-0 w-8 h-8 opacity-60" style={{
                    borderTop: `2px solid ${glow}`,
                    borderLeft: `2px solid ${glow}`,
                    borderTopLeftRadius: "16px",
                }}/>
                <div className="absolute bottom-0 right-0 w-8 h-8 opacity-60" style={{
                    borderBottom: `2px solid ${glow}`,
                    borderRight: `2px solid ${glow}`,
                    borderBottomRightRadius: "16px",
                }}/>

                {/* Gradient sheen on hover */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: `linear-gradient(135deg, ${glow}08 0%, transparent 60%)`,
                        pointerEvents: "none",
                    }}
                />

                {/* Top row: icon + index */}
                <div className="flex items-start justify-between relative z-10">
                    <div
                        className="p-2 rounded-xl"
                        style={{ background: `${glow}15`, border: `1px solid ${glow}30` }}
                    >
                        <Icon />
                    </div>
                    <span className="text-xs opacity-20 font-mono" style={{ color: glow }}>
            {String(games.findIndex(g => g.name === game.name) + 1).padStart(2, "0")}
          </span>
                </div>

                {/* Bottom row: name + cta */}
                <div className="relative z-10">
                    <div className="text-xs tracking-widest mb-1 opacity-50" style={{ color: glow }}>
                        {tag}
                    </div>
                    <h2 className="text-lg font-bold leading-tight text-white mb-2 group-hover:text-white transition">
                        {name}
                    </h2>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-px transition-all duration-300 group-hover:w-10"
                            style={{ background: glow }}
                        />
                        <span
                            className="text-xs tracking-widest font-mono opacity-60 group-hover:opacity-100 transition-opacity"
                            style={{ color: glow }}
                        >
              LAUNCH
            </span>
                    </div>
                </div>

                {/* Animated scan line */}
                <div
                    className="absolute left-0 right-0 h-px opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                    style={{
                        background: `linear-gradient(to right, transparent, ${glow}, transparent)`,
                        top: "50%",
                        animation: "none",
                    }}
                />
            </div>
        </div>
    );
}