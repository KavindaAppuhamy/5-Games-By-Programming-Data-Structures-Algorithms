// Scoreboard.jsx
import React, { useState, useEffect } from 'react';

const Scoreboard = ({ onClose }) => {
    const [scores, setScores] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, wins, losses
    const [sortBy, setSortBy] = useState('recent'); // recent, wins, name

    useEffect(() => {
        fetchScoreboard();
    }, []);

    const fetchScoreboard = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/scoreboard/all');
            const data = await response.json();
            setScores(data.scores || []);
            setStats(data.statistics);
        } catch (error) {
            console.error('Failed to fetch scoreboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredScores = scores.filter(score => {
        if (filter === 'wins') return score.win;
        if (filter === 'losses') return !score.win;
        return true;
    });

    const sortedScores = [...filteredScores].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === 'wins') {
            return (b.win ? 1 : 0) - (a.win ? 1 : 0);
        }
        if (sortBy === 'name') {
            return a.playerName.localeCompare(b.playerName);
        }
        return 0;
    });

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.2s ease-out',
        }}>
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
                .scoreboard-row:hover {
                    background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, transparent 100%);
                }
            `}</style>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                width: '90%',
                maxWidth: '1000px',
                maxHeight: '85vh',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                animation: 'slideUp 0.3s ease-out',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px 32px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '28px' }}>🏆</span>
                        <h2 style={{
                            margin: 0,
                            color: 'white',
                            fontSize: '24px',
                            fontWeight: '700',
                        }}>
                            Scoreboard
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            color: 'white',
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                    >
                        ✕
                    </button>
                </div>

                {/* Statistics Cards */}
                {stats && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '16px',
                        padding: '24px 32px',
                        background: '#f8fafc',
                    }}>
                        <StatCard
                            title="Total Games"
                            value={stats.totalGames}
                            icon="🎮"
                            color="#6366f1"
                        />
                        <StatCard
                            title="Wins"
                            value={stats.totalWins}
                            icon="🏆"
                            color="#10b981"
                        />
                        <StatCard
                            title="Losses"
                            value={stats.totalLosses}
                            icon="💪"
                            color="#ef4444"
                        />
                        <StatCard
                            title="Win Rate"
                            value={`${stats.winRate}%`}
                            icon="📊"
                            color="#f59e0b"
                        />
                        <StatCard
                            title="Top Player"
                            value={stats.topPlayer || 'N/A'}
                            icon="👑"
                            color="#8b5cf6"
                        />
                    </div>
                )}

                {/* Filters and Controls */}
                <div style={{
                    padding: '16px 32px',
                    display: 'flex',
                    gap: '12px',
                    borderBottom: '1px solid #e2e8f0',
                }}>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            fontSize: '14px',
                            cursor: 'pointer',
                            outline: 'none',
                        }}
                    >
                        <option value="all">All Games</option>
                        <option value="wins">Wins Only</option>
                        <option value="losses">Losses Only</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            fontSize: '14px',
                            cursor: 'pointer',
                            outline: 'none',
                        }}
                    >
                        <option value="recent">Most Recent</option>
                        <option value="wins">Wins First</option>
                        <option value="name">Player Name</option>
                    </select>

                    <button
                        onClick={fetchScoreboard}
                        style={{
                            marginLeft: 'auto',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                    >
                        🔄 Refresh
                    </button>
                </div>

                {/* Scoreboard Table */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0',
                }}>
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '60px',
                            color: '#64748b',
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '4px solid #e2e8f0',
                                    borderTopColor: '#6366f1',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 16px',
                                }} />
                                <style>{`
                                    @keyframes spin {
                                        to { transform: rotate(360deg); }
                                    }
                                `}</style>
                                Loading scoreboard...
                            </div>
                        </div>
                    ) : sortedScores.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px',
                            color: '#64748b',
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                                No games played yet
                            </div>
                            <div style={{ fontSize: '14px' }}>
                                Start playing to see your scores here!
                            </div>
                        </div>
                    ) : (
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                        }}>
                            <thead style={{
                                position: 'sticky',
                                top: 0,
                                background: '#f8fafc',
                                borderBottom: '2px solid #e2e8f0',
                            }}>
                            <tr>
                                <th style={thStyle}>#</th>
                                <th style={thStyle}>Player</th>
                                <th style={thStyle}>Guess</th>
                                <th style={thStyle}>Correct</th>
                                <th style={thStyle}>Result</th>
                                <th style={thStyle}>EK Time</th>
                                <th style={thStyle}>Dinic Time</th>
                                <th style={thStyle}>Date</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedScores.map((score, index) => (
                                <tr
                                    key={score.id}
                                    className="scoreboard-row"
                                    style={{
                                        borderBottom: '1px solid #f1f5f9',
                                        transition: 'background 0.2s',
                                    }}
                                >
                                    <td style={tdStyle}>
                                            <span style={{
                                                display: 'inline-block',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '6px',
                                                background: index < 3 ? '#fbbf24' : '#e2e8f0',
                                                color: index < 3 ? '#1e293b' : '#64748b',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                lineHeight: '24px',
                                                textAlign: 'center',
                                            }}>
                                                {index + 1}
                                            </span>
                                    </td>
                                    <td style={{
                                        ...tdStyle,
                                        fontWeight: '600',
                                        color: '#1e293b',
                                    }}>
                                        {score.playerName}
                                    </td>
                                    <td style={tdStyle}>{score.guessedValue}</td>
                                    <td style={{
                                        ...tdStyle,
                                        fontWeight: '600',
                                        color: '#6366f1',
                                    }}>
                                        {score.correctValue}
                                    </td>
                                    <td style={tdStyle}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: score.win ? '#d1fae5' : '#fee2e2',
                                                color: score.win ? '#059669' : '#dc2626',
                                            }}>
                                                {score.win ? '🏆 WIN' : '❌ LOSE'}
                                            </span>
                                    </td>
                                    <td style={tdStyle}>
                                            <span style={{
                                                fontFamily: 'monospace',
                                                fontSize: '12px',
                                                color: '#64748b',
                                            }}>
                                                {score.edmondsKarpTimeMs}ms
                                            </span>
                                    </td>
                                    <td style={tdStyle}>
                                            <span style={{
                                                fontFamily: 'monospace',
                                                fontSize: '12px',
                                                color: '#64748b',
                                            }}>
                                                {score.dinicTimeMs}ms
                                            </span>
                                    </td>
                                    <td style={tdStyle}>
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#94a3b8',
                                            }}>
                                                {formatDate(score.createdAt)}
                                            </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 32px',
                    borderTop: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: '12px',
                    color: '#64748b',
                    textAlign: 'center',
                }}>
                    Total {filteredScores.length} {filteredScores.length === 1 ? 'game' : 'games'} displayed
                </div>
            </div>
        </div>
    );
};

// Helper Components
const StatCard = ({ title, value, icon, color }) => (
    <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    }}>
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
        }}>
            {icon}
        </div>
        <div>
            <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#64748b',
                marginBottom: '4px',
            }}>
                {title}
            </div>
            <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
            }}>
                {value}
            </div>
        </div>
    </div>
);

// Styles
const thStyle = {
    padding: '16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const tdStyle = {
    padding: '16px',
    fontSize: '14px',
    color: '#475569',
};

// Helper function
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

export default Scoreboard;