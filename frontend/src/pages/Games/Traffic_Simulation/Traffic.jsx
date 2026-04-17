import React, { useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Scoreboard from './Scoreboard'; // ADDED: Import Scoreboard

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

export default function App() {
    const [nodes] = useNodesState(nodesInit);
    const [edges, setEdges] = useEdgesState([]);

    const [name, setName] = useState('');
    const [guess, setGuess] = useState('');
    const [answer, setAnswer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [showScoreboard, setShowScoreboard] = useState(false); // ADDED: Scoreboard state

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

    const startGame = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8081/api/game/start");

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
                    strokeWidth: 1,
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
            setValidationErrors({}); // Clear any previous errors
            showToast('info', '🎮 New game started! Enter your guess.');
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

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8081/api/game/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), guess: parseInt(guess) })
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

            if (data.win) {
                showToast('win', `Amazing, ${name}! Your guess of ${guess} was spot on! 🎉`, data.correct);
            } else {
                showToast('lose', `Nice try, ${name}! Your guess was ${guess}.`, data.correct);
            }

            // Clear validation errors on success
            setValidationErrors({});
        } catch (error) {
            console.error('Submit error:', error);
            showToast('error', 'Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

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

            {/* ADDED: Scoreboard Modal */}
            {showScoreboard && (
                <Scoreboard onClose={() => setShowScoreboard(false)} />
            )}

            {/* Flow Diagram Panel */}
            <div style={{
                width: '70%',
                margin: '12px',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                background: 'white',
            }}>
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
            </div>

            {/* Control Panel */}
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
                            Guess the maximum flow from source to sink
                        </p>
                    </div>

                    {/* ADDED: Scoreboard Button */}
                    <button
                        onClick={() => setShowScoreboard(true)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#64748b',
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e2e8f0';
                            e.currentTarget.style.color = '#1e293b';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.color = '#64748b';
                        }}
                    >
                        <span>🏆</span> View Scoreboard
                    </button>

                    {/* Name Input */}
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
                        <input
                            placeholder="Enter your name"
                            value={name}
                            onChange={e => {
                                setName(e.target.value);
                                if (validationErrors.name) {
                                    setValidationErrors(prev => ({ ...prev, name: '' }));
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: '14px',
                                border: `2px solid ${validationErrors.name ? '#ef4444' : '#e2e8f0'}`,
                                borderRadius: '12px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                background: 'white',
                                color: '#1e293b',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = validationErrors.name ? '#ef4444' : '#e2e8f0'}
                        />
                        {validationErrors.name && (
                            <div style={{
                                color: '#ef4444',
                                fontSize: '12px',
                                marginTop: '4px',
                                fontWeight: '500',
                            }}>
                                {validationErrors.name}
                            </div>
                        )}
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={startGame}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'white',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            marginBottom: '24px',
                            opacity: loading ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {loading ? '⏳ Loading...' : '🚀 Start New Game'}
                    </button>

                    {gameStarted && (
                        <>
                            <div style={{
                                height: '1px',
                                background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
                                marginBottom: '24px',
                            }} />

                            {/* Guess Input */}
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
                                        padding: '12px 16px',
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
                                />
                                {validationErrors.guess && (
                                    <div style={{
                                        color: '#ef4444',
                                        fontSize: '12px',
                                        marginTop: '4px',
                                        fontWeight: '500',
                                    }}>
                                        {validationErrors.guess}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
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
                                {loading ? '⏳ Submitting...' : '✓ Submit Guess'}
                            </button>

                            {/* Answer Display */}
                            {answer && (
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
                                        Last Game Result
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}