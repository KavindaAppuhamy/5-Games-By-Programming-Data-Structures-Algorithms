import React, { useState, useEffect, useRef } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';
import Scoreboard from './Scoreboard.jsx';
import Analytics from './Analytics.jsx';

const nodesInit = [
    { id: 'A', position: { x: 100, y: 200 }, data: { label: '🚦 Source' } },
    { id: 'B', position: { x: 300, y: 50 }, data: { label: 'B' } },
    { id: 'C', position: { x: 300, y: 200 }, data: { label: 'C' } },
    { id: 'D', position: { x: 300, y: 350 }, data: { label: 'D' } },
    { id: 'E', position: { x: 500, y: 100 }, data: { label: 'E' } },
    { id: 'F', position: { x: 500, y: 300 }, data: { label: 'F' } },
    { id: 'G', position: { x: 700, y: 100 }, data: { label: 'G' } },
    { id: 'H', position: { x: 700, y: 300 }, data: { label: 'H' } },
    { id: 'T', position: { x: 900, y: 200 }, data: { label: '🏁 Sink' } },
];

// Custom Toast Component
const Toast = ({ type, message, correctAnswer, onClose }) => {
    const isWin = type === 'win';

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            animation: 'slideDown 0.3s ease-out',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 24px',
                borderRadius: '16px',
                background: isWin
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.1)',
                color: 'white',
                minWidth: '320px',
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                }}>
                    {isWin ? '🏆' : '💡'}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '4px'
                    }}>
                        {isWin ? 'Congratulations!' : 'Not quite right'}
                    </div>
                    <div style={{
                        fontSize: '14px',
                        opacity: 0.9
                    }}>
                        {message}
                        {!isWin && correctAnswer && (
                            <span style={{
                                display: 'block',
                                marginTop: '4px',
                                fontWeight: '600'
                            }}>
                                Correct answer: {correctAnswer}
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'white',
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                >
                    ✕
                </button>
            </div>
            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

// Confirmation Dialog Component
const ConfirmationDialog = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            animation: 'fadeIn 0.2s ease-out',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '28px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                animation: 'slideUp 0.3s ease-out',
            }}>
                <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '12px',
                }}>
                    {title}
                </h3>
                <p style={{
                    fontSize: '14px',
                    color: '#64748b',
                    marginBottom: '24px',
                    lineHeight: '1.5',
                }}>
                    {message}
                </p>
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#64748b',
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e2e8f0';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'white',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

// Algorithm Hint Component
const AlgorithmHint = ({ algorithm, onClose }) => {
    const hints = {
        'EDMONDS_KARP': {
            title: '🚀 Edmonds-Karp Algorithm',
            description: 'Uses BFS to find augmenting paths',
            steps: [
                '1. Start with zero flow in all edges',
                '2. Use BFS to find the shortest augmenting path from source to sink',
                '3. The path with minimum residual capacity becomes the bottleneck',
                '4. Add bottleneck flow to all edges in the path',
                '5. Update residual capacities (forward edges decrease, backward edges increase)',
                '6. Repeat until no more augmenting paths exist',
                '💡 Tip: Look for paths with the fewest edges first!'
            ],
            complexity: 'O(V × E²)',
            color: '#6366f1'
        },
        'DINIC': {
            title: '⚡ Dinic\'s Algorithm',
            description: 'Uses level graphs and blocking flows',
            steps: [
                '1. Build a level graph using BFS (assign distances from source)',
                '2. Only allow edges that go to the next level (distance + 1)',
                '3. Use DFS to find blocking flows in the level graph',
                '4. A blocking flow saturates at least one edge in every path',
                '5. Rebuild level graph with updated residual capacities',
                '6. Repeat until sink is unreachable from source',
                '💡 Tip: Multiple paths can be found in one phase - look for combinations!'
            ],
            complexity: 'O(V² × E)',
            color: '#10b981'
        },
        'BOTH': {
            title: '🔄 Comparing Both Algorithms',
            description: 'Two different approaches to the same problem',
            steps: [
                'Edmonds-Karp:',
                '• Finds one augmenting path at a time using BFS',
                '• Simpler to understand and implement',
                '• Good for sparse graphs',
                '',
                'Dinic\'s Algorithm:',
                '• Uses level graphs to find multiple paths simultaneously',
                '• Generally faster for dense graphs',
                '• More complex but more efficient',
                '',
                '💡 Tip: For this graph size, both should give the same max flow value!'
            ],
            complexity: 'EK: O(V×E²) | Dinic: O(V²×E)',
            color: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)'
        }
    };

    const hint = hints[algorithm];

    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            animation: 'fadeIn 0.3s ease-out',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '28px',
                maxWidth: '500px',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative',
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.color = '#1e293b';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                    }}
                >
                    ✕
                </button>

                <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    background: hint.color,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    {hint.title}
                </div>

                <p style={{
                    color: '#64748b',
                    fontSize: '14px',
                    marginBottom: '20px',
                }}>
                    {hint.description}
                </p>

                <div style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                }}>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '12px',
                    }}>
                        How it works:
                    </div>
                    {hint.steps.map((step, index) => (
                        <div key={index} style={{
                            fontSize: '13px',
                            color: '#475569',
                            marginBottom: '8px',
                            lineHeight: '1.5',
                        }}>
                            {step}
                        </div>
                    ))}
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                    borderRadius: '12px',
                }}>
                    <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#6b7280',
                    }}>
                        Time Complexity:
                    </span>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#1e293b',
                        fontFamily: 'monospace',
                    }}>
                        {hint.complexity}
                    </span>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -48%);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                }
            `}</style>
        </div>
    );
};

export default function App() {
    const navigate = useNavigate();
    const [nodes] = useNodesState(nodesInit);
    const [edges, setEdges] = useEdgesState([]);

    const [name, setName] = useState('');
    const [guess, setGuess] = useState('');
    const [answer, setAnswer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [showScoreboard, setShowScoreboard] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showStopDialog, setShowStopDialog] = useState(false);

    // Timer states
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef(null);

    const [selectedAlgorithm, setSelectedAlgorithm] = useState('BOTH');
    const [playerStats, setPlayerStats] = useState(null);
    const [currentRound, setCurrentRound] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [roundCompleted, setRoundCompleted] = useState(false);
    const [isGameCompleted, setIsGameCompleted] = useState(false);
    const [playerExists, setPlayerExists] = useState(false);
    const [checkingName, setCheckingName] = useState(false);
    const [nameChecked, setNameChecked] = useState(false);

    // Timer functions
    const startTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setIsTimerRunning(true);
        timerRef.current = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsTimerRunning(false);
    };

    const resetTimer = () => {
        stopTimer();
        setTimer(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!name.trim()) {
            setPlayerExists(false);
            setIsGameCompleted(false);
            setCurrentRound(0);
            setTotalScore(0);
            setPlayerStats(null);
            setNameChecked(false);
        }
    }, [name]);

    const checkPlayerStatus = async () => {
        if (!name.trim()) return;

        setCheckingName(true);
        try {
            const response = await fetch(`http://localhost:8080/api/game/player-stats?playerName=${encodeURIComponent(name.trim())}`);
            if (response.ok) {
                const data = await response.json();
                setPlayerStats(data);
                setCurrentRound(data.roundsPlayed || 0);
                setTotalScore(data.totalScore || 0);
                setPlayerExists(true);

                if (data.roundsPlayed >= 20) {
                    setIsGameCompleted(true);
                    setValidationErrors(prev => ({
                        ...prev,
                        name: 'This player has already completed all 20 rounds. Please use a different name.'
                    }));
                } else {
                    setIsGameCompleted(false);
                }
            } else if (response.status === 404) {
                setPlayerExists(false);
                setIsGameCompleted(false);
                setCurrentRound(0);
                setTotalScore(0);
                setPlayerStats(null);
            }
            setNameChecked(true);
        } catch (error) {
            console.error('Failed to check player status:', error);
            setNameChecked(true);
        } finally {
            setCheckingName(false);
        }
    };

    const fetchPlayerStats = async () => {
        if (!name.trim()) return;
        try {
            const response = await fetch(`http://localhost:8080/api/game/player-stats?playerName=${encodeURIComponent(name.trim())}`);
            if (response.ok) {
                const data = await response.json();
                setPlayerStats(data);
                setCurrentRound(data.roundsPlayed || 0);
                setTotalScore(data.totalScore || 0);
                setPlayerExists(true);

                if (data.roundsPlayed >= 20) {
                    setIsGameCompleted(true);
                } else {
                    setIsGameCompleted(false);
                }
            }
        } catch (error) {
            console.error('Failed to fetch player stats:', error);
        }
    };

    const showToast = (type, message, correctAnswer = null) => {
        setToast({ type, message, correctAnswer });
        setTimeout(() => setToast(null), 5000);
    };

    const validateInputs = () => {
        const errors = {};

        if (!name.trim()) {
            errors.name = 'Player name is required';
        } else if (name.trim().length > 50) {
            errors.name = 'Player name must be less than 50 characters';
        } else if (isGameCompleted) {
            errors.name = 'This player has already completed all 20 rounds. Please use a different name.';
        }

        if (!guess) {
            errors.guess = 'Guess is required';
        } else {
            const guessNum = parseInt(guess);
            if (isNaN(guessNum) || guessNum < 0) {
                errors.guess = 'Guess must be a non-negative number';
            } else if (guessNum > 1000) {
                errors.guess = 'Guess must be less than or equal to 1000';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const stopGame = () => {
        stopTimer();
        setGameStarted(false);
        setRoundCompleted(false);
        setEdges([]);
        setAnswer(null);
        setGuess('');
        setValidationErrors({});
        setShowStopDialog(false);
        showToast('info', '⏸️ Game stopped. You can start a new round when ready.');
    };

    const startGame = async () => {
        if (isGameCompleted) {
            showToast('error', `Player "${name.trim()}" has already completed all 20 rounds. Please use a different name to play again.`);
            return;
        }

        if (!name.trim()) {
            showToast('error', 'Please enter your name first');
            return;
        }

        if (!nameChecked) {
            await checkPlayerStatus();
            if (isGameCompleted) {
                showToast('error', `Player "${name.trim()}" has already completed all 20 rounds. Please use a different name to play again.`);
                return;
            }
        }

        if (currentRound >= 20) {
            showToast('error', 'You have already completed all 20 rounds! Check the analytics to see your performance.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/game/start?algorithm=${selectedAlgorithm}`);

            if (!res.ok) {
                const errorData = await res.json();
                showToast('error', errorData.message || 'Failed to start game');
                return;
            }

            const data = await res.json();

            const e = data.edges.map(edge => ({
                id: `${edge.from}-${edge.to}`,
                source: edge.from,
                target: edge.to,
                label: `${edge.capacity}`,
                animated: true,
                style: {
                    stroke: '#6366f1',
                    strokeWidth: 2,
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#6366f1',
                },
                labelStyle: {
                    fill: '#1e293b',
                    fontWeight: 600,
                    fontSize: 12,
                },
                labelBgStyle: {
                    fill: '#f1f5f9',
                    fillOpacity: 0.9,
                },
            }));

            setEdges(e);
            setAnswer(null);
            setGameStarted(true);
            setRoundCompleted(false);
            setValidationErrors({});
            setGuess('');
            resetTimer();
            startTimer();

            const algoNames = {
                'EDMONDS_KARP': 'Edmonds-Karp',
                'DINIC': 'Dinic',
                'BOTH': 'Both algorithms'
            };

            showToast('info', `🎮 Round ${currentRound + 1}/20 started! Using ${algoNames[selectedAlgorithm]}. Enter your guess.`);
        } catch (error) {
            console.error('Start game error:', error);
            showToast('error', 'Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const submit = async () => {
        if (!validateInputs()) {
            showToast('error', 'Please fix the validation errors below');
            return;
        }

        if (currentRound >= 20 || isGameCompleted) {
            showToast('error', 'You have completed all 20 rounds! Check the analytics to see your performance.');
            return;
        }

        stopTimer();
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/api/game/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    guess: parseInt(guess),
                    algorithm: selectedAlgorithm,
                    timeSpent: timer
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                if (errorData.type === 'VALIDATION_ERROR') {
                    if (errorData.fieldErrors) {
                        setValidationErrors(errorData.fieldErrors);
                        showToast('error', 'Please fix the validation errors');
                    } else {
                        showToast('error', errorData.message || 'Validation failed');
                    }
                } else {
                    showToast('error', errorData.message || 'Failed to submit guess');
                }
                return;
            }

            const data = await res.json();
            setAnswer(data.correct);
            setRoundCompleted(true);
            setGameStarted(false);

            await fetchPlayerStats();

            let message = '';
            if (data.win) {
                message = `Amazing, ${name}! Round ${data.roundNumber}/20 - You earned 10 points! Total score: ${data.totalScore} (Time: ${formatTime(timer)})`;
                showToast('win', message, data.correct);
            } else {
                message = `Nice try, ${name}! Round ${data.roundNumber}/20 - Correct answer was ${data.correct}. Total score: ${data.totalScore} (Time: ${formatTime(timer)})`;
                showToast('lose', message, data.correct);
            }

            setValidationErrors({});

            if (data.roundNumber >= 20) {
                setIsGameCompleted(true);
                setTimeout(() => {
                    showToast('info', `🎉 Congratulations! You've completed all 20 rounds! Final score: ${data.totalScore}/200 points!`);
                }, 1000);
            }
        } catch (error) {
            console.error('Submit error:', error);
            showToast('error', 'Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const backToGameMenu = () => {
        stopTimer();
        navigate('/');
    };

    const resetAndNextRound = async () => {
        if (isGameCompleted || currentRound >= 20) {
            showToast('error', 'You have already completed all 20 rounds! Cannot start more rounds.');
            return;
        }

        setLoading(true);

        setEdges([]);
        setAnswer(null);
        setGameStarted(false);
        setRoundCompleted(false);
        setGuess('');
        setValidationErrors({});

        if (currentRound >= 20) {
            showToast('info', '🎉 All rounds completed! Great job!');
            setIsGameCompleted(true);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/api/game/start?algorithm=${selectedAlgorithm}`);

            if (!res.ok) {
                const errorData = await res.json();
                showToast('error', errorData.message || 'Failed to start next round');
                setLoading(false);
                return;
            }

            const data = await res.json();

            const e = data.edges.map(edge => ({
                id: `${edge.from}-${edge.to}`,
                source: edge.from,
                target: edge.to,
                label: `${edge.capacity}`,
                animated: true,
                style: {
                    stroke: '#6366f1',
                    strokeWidth: 2,
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#6366f1',
                },
                labelStyle: {
                    fill: '#1e293b',
                    fontWeight: 600,
                    fontSize: 12,
                },
                labelBgStyle: {
                    fill: '#f1f5f9',
                    fillOpacity: 0.9,
                },
            }));

            setEdges(e);
            setGameStarted(true);
            resetTimer();
            startTimer();

            const algoNames = {
                'EDMONDS_KARP': 'Edmonds-Karp',
                'DINIC': 'Dinic',
                'BOTH': 'Both algorithms'
            };

            showToast('info', `🎮 Round ${currentRound + 1}/20 started! Using ${algoNames[selectedAlgorithm]}. Enter your guess.`);
        } catch (error) {
            console.error('Start next round error:', error);
            showToast('error', 'Network error starting next round. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getAlgorithmColor = (algo) => {
        const colors = {
            'EDMONDS_KARP': '#6366f1',
            'DINIC': '#10b981',
            'BOTH': 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)'
        };
        return colors[algo] || '#6366f1';
    };

    const handleNameChange = (e) => {
        const newName = e.target.value;
        setName(newName);
        setNameChecked(false);

        if (validationErrors.name) {
            setValidationErrors(prev => ({ ...prev, name: '' }));
        }
    };

    const handleNameBlur = async () => {
        if (name.trim()) {
            await checkPlayerStatus();
        }
    };

    const handleNameKeyPress = async (e) => {
        if (e.key === 'Enter' && name.trim()) {
            e.target.blur();
            await checkPlayerStatus();
        }
    };

    if (showScoreboard) {
        return (
            <>
                {toast && (
                    <Toast
                        type={toast.type}
                        message={toast.message}
                        correctAnswer={toast.correctAnswer}
                        onClose={() => setToast(null)}
                    />
                )}
                <Scoreboard onClose={() => setShowScoreboard(false)} />
            </>
        );
    }

    if (showAnalytics) {
        return (
            <>
                {toast && (
                    <Toast
                        type={toast.type}
                        message={toast.message}
                        correctAnswer={toast.correctAnswer}
                        onClose={() => setToast(null)}
                    />
                )}
                <Analytics
                    onClose={() => setShowAnalytics(false)}
                    playerName={name.trim()}
                />
            </>
        );
    }

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}>
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    correctAnswer={toast.correctAnswer}
                    onClose={() => setToast(null)}
                />
            )}

            {showHint && (
                <AlgorithmHint
                    algorithm={selectedAlgorithm}
                    onClose={() => setShowHint(false)}
                />
            )}

            {showStopDialog && (
                <ConfirmationDialog
                    title="Stop Current Game?"
                    message="Are you sure you want to stop the current round? Your progress in this round will be lost, but you can start a new round anytime."
                    onConfirm={stopGame}
                    onCancel={() => setShowStopDialog(false)}
                />
            )}

            <div style={{
                width: '70%',
                margin: '12px',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                background: 'white',
                position: 'relative',
            }}>
                <button
                    onClick={backToGameMenu}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        zIndex: 10,
                        padding: '10px 18px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#64748b',
                        background: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.color = '#1e293b';
                        e.currentTarget.style.transform = 'translateX(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = '#64748b';
                        e.currentTarget.style.transform = 'translateX(0)';
                    }}
                >
                    <span>←</span> Back to Game Menu
                </button>

                <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    zIndex: 10,
                    display: 'flex',
                    gap: '8px',
                }}>
                    {/* Stop Game Button - Only visible when game is active */}
                    {gameStarted && (
                        <button
                            onClick={() => setShowStopDialog(true)}
                            style={{
                                padding: '10px 16px',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#ef4444',
                                background: 'white',
                                border: '2px solid #ef4444',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#ef4444';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.color = '#ef4444';
                            }}
                        >
                            <span>⏹️</span> Stop Game
                        </button>
                    )}

                    <button
                        onClick={() => setShowHint(true)}
                        style={{
                            padding: '10px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#64748b',
                            background: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.color = '#1e293b';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = '#64748b';
                        }}
                    >
                        <span>💡</span> Hint
                    </button>
                    <button
                        onClick={() => setShowScoreboard(true)}
                        style={{
                            padding: '10px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#64748b',
                            background: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.color = '#1e293b';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = '#64748b';
                        }}
                    >
                        <span>🏆</span> Scoreboard
                    </button>
                    <button
                        onClick={() => setShowAnalytics(true)}
                        style={{
                            padding: '10px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#64748b',
                            background: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.color = '#1e293b';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = '#64748b';
                        }}
                    >
                        <span>📊</span> Analytics
                    </button>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    fitView
                    proOptions={{ hideAttribution: true }}
                >
                    <Background color="#e2e8f0" gap={16} />
                    <Controls
                        style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                    />
                    <MiniMap
                        style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        nodeColor="#6366f1"
                        maskColor="rgba(102, 126, 234, 0.1)"
                    />
                </ReactFlow>

                {/* Timer Display */}
                {gameStarted && (
                    <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        padding: '12px 24px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: '40px',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: '700',
                        fontFamily: 'monospace',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        <span>⏱️</span>
                        <span style={{
                            color: timer > 120 ? '#fbbf24' : '#10b981',
                            transition: 'color 0.3s',
                        }}>
                            {formatTime(timer)}
                        </span>
                    </div>
                )}
            </div>

            <div style={{
                width: '30%',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '24px',
                    padding: '32px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    backdropFilter: 'blur(10px)',
                }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '8px',
                        }}>
                            Traffic Flow Game
                        </h2>
                        <p style={{
                            color: '#64748b',
                            fontSize: '14px',
                            margin: 0,
                        }}>
                            Round {currentRound}/20 • Score: {totalScore}/200
                        </p>
                        {isGameCompleted && (
                            <div style={{
                                marginTop: '12px',
                                padding: '10px 14px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}>
                                <span>🎉</span>
                                <span>Game Completed! All 20 rounds finished!</span>
                            </div>
                        )}
                    </div>

                    <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#e2e8f0',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: `${Math.min((currentRound / 20) * 100, 100)}%`,
                            height: '100%',
                            background: isGameCompleted
                                ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                            transition: 'width 0.3s ease',
                        }} />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '8px',
                        }}>
                            Player Name
                        </label>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <span style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '16px',
                                color: '#94a3b8',
                                pointerEvents: 'none',
                                zIndex: 1,
                            }}>
                                👤
                            </span>
                            <input
                                placeholder="Enter your name"
                                value={name}
                                onChange={handleNameChange}
                                onBlur={handleNameBlur}
                                onKeyPress={handleNameKeyPress}
                                disabled={gameStarted || checkingName}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 44px',
                                    fontSize: '14px',
                                    border: `2px solid ${validationErrors.name ? '#ef4444' : isGameCompleted ? '#f59e0b' : '#e2e8f0'}`,
                                    borderRadius: '12px',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    background: (gameStarted || checkingName) ? '#f8fafc' : 'white',
                                    color: '#1e293b',
                                    boxSizing: 'border-box',
                                    cursor: (gameStarted || checkingName) ? 'not-allowed' : 'text',
                                }}
                                onFocus={(e) => {
                                    if (!validationErrors.name) {
                                        e.target.style.borderColor = '#667eea';
                                    }
                                }}
                            />
                            {checkingName && (
                                <span style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '14px',
                                    color: '#94a3b8',
                                }}>
                                    Checking...
                                </span>
                            )}
                            {!checkingName && !nameChecked && name.trim() && (
                                <span style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '14px',
                                    color: '#f59e0b',
                                }}>
                                    Press Enter to verify
                                </span>
                            )}
                            {!checkingName && nameChecked && name.trim() && !isGameCompleted && (
                                <span style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '14px',
                                    color: '#10b981',
                                }}>
                                    ✓ Verified
                                </span>
                            )}
                        </div>
                        {validationErrors.name && (
                            <div style={{
                                color: '#ef4444',
                                fontSize: '12px',
                                marginTop: '4px',
                                marginLeft: '4px',
                                fontWeight: '500',
                            }}>
                                {validationErrors.name}
                            </div>
                        )}
                        {isGameCompleted && !validationErrors.name && (
                            <div style={{
                                color: '#f59e0b',
                                fontSize: '12px',
                                marginTop: '4px',
                                marginLeft: '4px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}>
                                <span>⚠️</span>
                                <span>This player has completed all 20 rounds</span>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '8px',
                        }}>
                            Select Algorithm
                        </label>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <span style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '16px',
                                color: '#667eea',
                                pointerEvents: 'none',
                                zIndex: 1,
                            }}>
                                ⚡
                            </span>
                            <select
                                value={selectedAlgorithm}
                                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                                disabled={gameStarted || isGameCompleted}
                                style={{
                                    width: '100%',
                                    padding: '12px 40px 12px 44px',
                                    fontSize: '14px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    background: (gameStarted || isGameCompleted) ? '#f8fafc' : 'white',
                                    color: '#1e293b',
                                    boxSizing: 'border-box',
                                    cursor: (gameStarted || isGameCompleted) ? 'not-allowed' : 'pointer',
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    MozAppearance: 'none',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            >
                                <option value="EDMONDS_KARP">🚀 Edmonds-Karp Algorithm</option>
                                <option value="DINIC">⚡ Dinic's Algorithm</option>
                                <option value="BOTH">🔄 Both Algorithms (Compare)</option>
                            </select>
                            <span style={{
                                position: 'absolute',
                                right: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '12px',
                                color: '#94a3b8',
                                pointerEvents: 'none',
                                transition: 'transform 0.2s',
                            }}>
                                ▼
                            </span>
                        </div>
                    </div>

                    {/* Start Button */}
                    {!gameStarted && !roundCompleted && (
                        <button
                            onClick={startGame}
                            disabled={loading || currentRound >= 20 || isGameCompleted || !nameChecked || !name.trim()}
                            style={{
                                width: '100%',
                                padding: '14px',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'white',
                                background: (loading || currentRound >= 20 || isGameCompleted || !nameChecked || !name.trim()) ? '#94a3b8' : getAlgorithmColor(selectedAlgorithm),
                                border: 'none',
                                borderRadius: '12px',
                                cursor: (loading || currentRound >= 20 || isGameCompleted || !nameChecked || !name.trim()) ? 'not-allowed' : 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                marginBottom: '24px',
                                opacity: loading ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                            onMouseEnter={(e) => {
                                if (!loading && currentRound < 20 && !isGameCompleted && nameChecked && name.trim()) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <span>🚀</span>
                            {loading ? 'Loading...' :
                                currentRound >= 20 || isGameCompleted ? 'All Rounds Complete' :
                                    !name.trim() ? 'Enter Name' :
                                        !nameChecked ? 'Verifying Name...' :
                                            'Start New Round'}
                        </button>
                    )}

                    {/* Next Round Button */}
                    {roundCompleted && currentRound < 20 && !isGameCompleted && (
                        <button
                            onClick={resetAndNextRound}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'white',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                marginBottom: '24px',
                                opacity: loading ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(245, 158, 11, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <span>🔄</span>
                            {loading ? 'Loading...' : 'Next Round'}
                        </button>
                    )}

                    {gameStarted && !isGameCompleted && (
                        <>
                            <div style={{
                                height: '1px',
                                background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
                                marginBottom: '24px',
                            }} />

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#1e293b',
                                    marginBottom: '8px',
                                }}>
                                    Your Guess
                                </label>
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '16px',
                                        color: '#94a3b8',
                                        pointerEvents: 'none',
                                        zIndex: 1,
                                    }}>
                                        🎯
                                    </span>
                                    <input
                                        type="number"
                                        placeholder="Enter max flow"
                                        value={guess}
                                        onChange={e => {
                                            setGuess(e.target.value);
                                            if (validationErrors.guess) {
                                                setValidationErrors(prev => ({ ...prev, guess: '' }));
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px 12px 44px',
                                            fontSize: '14px',
                                            border: `2px solid ${validationErrors.guess ? '#ef4444' : '#e2e8f0'}`,
                                            borderRadius: '12px',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            background: 'white',
                                            color: '#1e293b',
                                            boxSizing: 'border-box',
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = validationErrors.guess ? '#ef4444' : '#e2e8f0'}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                submit();
                                            }
                                        }}
                                    />
                                </div>
                                {validationErrors.guess && (
                                    <div style={{
                                        color: '#ef4444',
                                        fontSize: '12px',
                                        marginTop: '4px',
                                        marginLeft: '4px',
                                        fontWeight: '500',
                                    }}>
                                        {validationErrors.guess}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={submit}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#667eea',
                                    background: 'white',
                                    border: '2px solid #667eea',
                                    borderRadius: '12px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    opacity: loading ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.background = '#667eea';
                                        e.currentTarget.style.color = 'white';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.color = '#667eea';
                                }}
                            >
                                <span>✓</span>
                                {loading ? 'Submitting...' : 'Submit Guess'}
                            </button>
                        </>
                    )}

                    {answer !== null && !gameStarted && (
                        <div style={{
                            marginTop: '20px',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                            borderRadius: '12px',
                            textAlign: 'center',
                        }}>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#6b7280',
                                marginBottom: '4px',
                            }}>
                                Last Round Result
                            </div>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#1e293b',
                            }}>
                                {answer}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}