import React, { useState, useEffect } from 'react';

const Scoreboard = ({ onClose }) => {
    const [scores, setScores] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');

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
        if (sortBy === 'score') {
            return (b.totalScore || 0) - (a.totalScore || 0);
        }
        if (sortBy === 'wins') {
            return (b.win ? 1 : 0) - (a.win ? 1 : 0);
        }
        if (sortBy === 'name') {
            return a.playerName.localeCompare(b.playerName);
        }
        return 0;
    });

    const getAlgorithmBadge = (algorithm) => {
        const badges = {
            'EDMONDS_KARP': { text: 'EK', color: '#6366f1', bg: '#e0e7ff' },
            'DINIC': { text: 'Dinic', color: '#10b981', bg: '#d1fae5' },
            'BOTH': { text: 'Both', color: '#8b5cf6', bg: '#ede9fe' }
        };
        const badge = badges[algorithm] || { text: algorithm, color: '#64748b', bg: '#f1f5f9' };
        return (
            <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                background: badge.bg,
                color: badge.color,
                marginLeft: '8px',
                letterSpacing: '0.3px',
            }}>
                {badge.text}
            </span>
        );
    };

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
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .scoreboard-row:hover {
                    background: linear-gradient(90deg, rgba(102, 126, 234, 0.08) 0%, transparent 100%) !important;
                }
            `}</style>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                width: '90%',
                maxWidth: '1300px',
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
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
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
                            title="Total Wins"
                            value={stats.totalWins}
                            icon="🏆"
                            color="#10b981"
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
                        <StatCard
                            title="Highest Score"
                            value={stats.highestScore || 0}
                            icon="⭐"
                            color="#ef4444"
                        />
                    </div>
                )}

                {/* Filters and Controls */}
                <div style={{
                    padding: '18px 32px',
                    display: 'flex',
                    gap: '12px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#ffffff',
                    alignItems: 'center',
                }}>
                    {/* Filter Select */}
                    <div style={{ position: 'relative', minWidth: '160px' }}>
                        <span style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '14px',
                            color: '#6366f1',
                            pointerEvents: 'none',
                            zIndex: 1,
                        }}>
                            🔍
                        </span>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '9px 36px 9px 42px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                fontSize: '14px',
                                cursor: 'pointer',
                                outline: 'none',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                            }}
                        >
                            <option value="all">📋 All Rounds</option>
                            <option value="wins">🏆 Wins Only</option>
                            <option value="losses">💪 Losses Only</option>
                        </select>
                        <span style={{
                            position: 'absolute',
                            right: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '12px',
                            color: '#94a3b8',
                            pointerEvents: 'none',
                        }}>
                            ▼
                        </span>
                    </div>

                    {/* Sort Select */}
                    <div style={{ position: 'relative', minWidth: '160px' }}>
                        <span style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '14px',
                            color: '#10b981',
                            pointerEvents: 'none',
                            zIndex: 1,
                        }}>
                            📊
                        </span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '9px 36px 9px 42px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                fontSize: '14px',
                                cursor: 'pointer',
                                outline: 'none',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                            }}
                        >
                            <option value="recent">🕐 Most Recent</option>
                            <option value="score">⭐ Highest Score</option>
                            <option value="wins">🏆 Wins First</option>
                            <option value="name">👤 Player Name</option>
                        </select>
                        <span style={{
                            position: 'absolute',
                            right: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '12px',
                            color: '#94a3b8',
                            pointerEvents: 'none',
                        }}>
                            ▼
                        </span>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={fetchScoreboard}
                        style={{
                            marginLeft: 'auto',
                            padding: '9px 18px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            color: '#64748b',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.color = '#1e293b';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.color = '#64748b';
                        }}
                    >
                        <span>🔄</span> Refresh
                    </button>
                </div>

                {/* Scoreboard Table */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0',
                    background: '#ffffff',
                }}>
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '80px',
                            color: '#64748b',
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    border: '4px solid #e2e8f0',
                                    borderTopColor: '#6366f1',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 20px',
                                }} />
                                <div style={{ fontSize: '16px', fontWeight: '500' }}>
                                    Loading scoreboard...
                                </div>
                            </div>
                        </div>
                    ) : sortedScores.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 20px',
                            color: '#64748b',
                        }}>
                            <div style={{ fontSize: '56px', marginBottom: '20px' }}>📊</div>
                            <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
                                No games played yet
                            </div>
                            <div style={{ fontSize: '15px', lineHeight: '1.6' }}>
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
                                zIndex: 10,
                            }}>
                            <tr>
                                <th style={thStyle}>#</th>
                                <th style={thStyle}>Round</th>
                                <th style={thStyle}>Player</th>
                                <th style={thStyle}>Algorithm</th>
                                <th style={thStyle}>Guess</th>
                                <th style={thStyle}>Correct</th>
                                <th style={thStyle}>Points</th>
                                <th style={thStyle}>Total</th>
                                <th style={thStyle}>Time</th>
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
                                        background: score.win ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                                    }}
                                >
                                    <td style={{ ...tdStyle, width: '50px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            minWidth: '28px',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            background: index < 3 ? '#fbbf24' : '#e2e8f0',
                                            color: index < 3 ? '#1e293b' : '#64748b',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textAlign: 'center',
                                        }}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            display: 'inline-block',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '8px',
                                            background: score.win ? '#d1fae5' : '#f1f5f9',
                                            color: score.win ? '#059669' : '#64748b',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            lineHeight: '36px',
                                            textAlign: 'center',
                                        }}>
                                            {score.roundNumber || '-'}
                                        </span>
                                    </td>
                                    <td style={{
                                        ...tdStyle,
                                        fontWeight: '600',
                                        color: '#1e293b',
                                    }}>
                                        {score.playerName}
                                    </td>
                                    <td style={tdStyle}>
                                        {getAlgorithmBadge(score.algorithmUsed)}
                                    </td>
                                    <td style={{
                                        ...tdStyle,
                                        fontWeight: '500',
                                    }}>
                                        {score.guessedValue}
                                    </td>
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
                                            {score.win ? '+10' : '+0'}
                                        </span>
                                    </td>
                                    <td style={{
                                        ...tdStyle,
                                        fontWeight: '700',
                                        color: '#8b5cf6',
                                    }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            background: '#ede9fe',
                                        }}>
                                            {score.totalScore || 0}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            fontFamily: 'monospace',
                                            fontSize: '12px',
                                            color: '#64748b',
                                        }}>
                                            {score.algorithmTimeMs || '-'}ms
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
                    padding: '14px 32px',
                    borderTop: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: '13px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <span>
                        <span style={{ fontWeight: '600', color: '#6366f1' }}>
                            {filteredScores.length}
                        </span> {filteredScores.length === 1 ? 'round' : 'rounds'} displayed
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#10b981' }}>🏆</span>
                        {stats?.totalWins || 0} total wins
                    </span>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const StatCard = ({ title, value, icon, color }) => (
    <div style={{
        background: 'white',
        padding: '18px 20px',
        borderRadius: '12px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        border: '1px solid #f1f5f9',
        transition: 'transform 0.2s, box-shadow 0.2s',
    }}
         onMouseEnter={(e) => {
             e.currentTarget.style.transform = 'translateY(-2px)';
             e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
         }}
         onMouseLeave={(e) => {
             e.currentTarget.style.transform = 'translateY(0)';
             e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
         }}>
        <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
        }}>
            {icon}
        </div>
        <div style={{ flex: 1 }}>
            <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#64748b',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
            }}>
                {title}
            </div>
            <div style={{
                fontSize: '26px',
                fontWeight: '700',
                color: '#1e293b',
                lineHeight: '1.2',
            }}>
                {value}
            </div>
        </div>
    </div>
);

// Styles
const thStyle = {
    padding: '16px 12px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
};

const tdStyle = {
    padding: '14px 12px',
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