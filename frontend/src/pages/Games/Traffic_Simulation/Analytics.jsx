import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { exportChartAsImage } from './chartExportUtils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const ALGORITHM_COLORS = {
    'EDMONDS_KARP': '#6366f1',
    'DINIC': '#10b981',
    'BOTH': '#f59e0b'
};

const Analytics = ({ onClose, playerName }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('individual');
    const [selectedPlayer, setSelectedPlayer] = useState(playerName || '');
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [activeChartRefs] = useState({
        timeComparison: React.createRef(),
        timeTrend: React.createRef(),
        pieChart: React.createRef(),
        algorithmTimeBar: React.createRef()
    });

    useEffect(() => {
        // Don't auto-fetch on mount - wait for user to search
        setAnalyticsData(null);
        setLoading(false);
        setHasSearched(false);
    }, []);

    const fetchAnalytics = async () => {
        // Don't fetch if no player name in individual mode
        if (viewMode === 'individual' && (!selectedPlayer || selectedPlayer.trim() === '')) {
            setError('Please enter a player name');
            setAnalyticsData(null);
            setHasSearched(true);
            return;
        }

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            let endpoint;
            if (viewMode === 'individual') {
                endpoint = `http://localhost:8080/api/analytics/player/${encodeURIComponent(selectedPlayer.trim())}`;
            } else {
                endpoint = 'http://localhost:8080/api/analytics/all-players';
            }

            const response = await fetch(endpoint);

            if (!response.ok) {
                if (response.status === 404) {
                    setAnalyticsData(null);
                    setError(viewMode === 'individual'
                        ? `No records found for player "${selectedPlayer}"`
                        : 'No player records found in the system');
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Failed to fetch analytics');
                    setAnalyticsData(null);
                }
                setLoading(false);
                return;
            }

            const data = await response.json();

            // Check if data is empty
            if (!data || !data.roundsData || data.roundsData.length === 0) {
                setAnalyticsData(null);
                setError(viewMode === 'individual'
                    ? `Player "${selectedPlayer}" hasn't played any games yet.`
                    : 'No games have been played yet.');
                setLoading(false);
                return;
            }

            // Process the real data
            const processedData = {
                ...data,
                roundsData: data.roundsData.map(round => ({
                    ...round,
                    time: Number(round.time) || 0,
                    score: Number(round.score) || 0
                })),
                summary: {
                    totalRounds: Number(data.summary?.totalRounds) || data.roundsData.length || 0,
                    totalTime: Number(data.summary?.totalTime) || 0,
                    avgTime: Number(data.summary?.avgTime) || 0,
                    wins: Number(data.summary?.wins) || 0
                }
            };

            // Recalculate if values are invalid
            if (isNaN(processedData.summary.totalTime) || processedData.summary.totalTime === 0) {
                processedData.summary.totalTime = processedData.roundsData.reduce((sum, r) => sum + (Number(r.time) || 0), 0);
            }
            if (isNaN(processedData.summary.avgTime) || processedData.summary.avgTime === 0) {
                processedData.summary.avgTime = processedData.roundsData.length > 0
                    ? Math.round(processedData.summary.totalTime / processedData.roundsData.length)
                    : 0;
            }
            if (isNaN(processedData.summary.wins) || processedData.summary.wins === 0) {
                processedData.summary.wins = processedData.roundsData.filter(r => r.correct).length;
            }

            setAnalyticsData(processedData);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            setError('Network error. Please check your connection and try again.');
            setAnalyticsData(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePlayerSearch = () => {
        if (viewMode === 'individual' && (!selectedPlayer || !selectedPlayer.trim())) {
            setError('Please enter a player name');
            setAnalyticsData(null);
            setHasSearched(true);
            return;
        }
        fetchAnalytics();
    };

    const handleExportChart = (chartRef, chartName) => {
        if (chartRef.current) {
            exportChartAsImage(chartRef.current, `${selectedPlayer || 'all-players'}-${chartName}`);
        }
    };

    // Algorithm Time Comparison Bar Chart
    const renderAlgorithmTimeBarChart = () => {
        if (!analyticsData?.roundsData || analyticsData.roundsData.length === 0) return null;

        const algoStats = analyticsData.roundsData.reduce((acc, round) => {
            const algo = round.algorithm || 'UNKNOWN';
            if (!acc[algo]) {
                acc[algo] = {
                    algorithm: algo,
                    times: [],
                    totalTime: 0,
                    count: 0,
                    wins: 0
                };
            }
            const timeValue = Number(round.time) || 0;
            acc[algo].times.push(timeValue);
            acc[algo].totalTime += timeValue;
            acc[algo].count++;
            if (round.correct) acc[algo].wins++;
            return acc;
        }, {});

        const chartData = Object.values(algoStats).map(item => ({
            algorithm: getAlgorithmDisplayName(item.algorithm),
            avgTime: item.count > 0 ? Math.round(item.totalTime / item.count) : 0,
            minTime: item.times.length > 0 ? Math.min(...item.times) : 0,
            maxTime: item.times.length > 0 ? Math.max(...item.times) : 0,
            medianTime: calculateMedian(item.times),
            stdDev: calculateStdDev(item.times),
            rounds: item.count,
            winRate: item.count > 0 ? ((item.wins / item.count) * 100).toFixed(1) : '0.0',
            rawAlgorithm: item.algorithm
        })).sort((a, b) => a.avgTime - b.avgTime);

        return (
            <div ref={activeChartRefs.algorithmTimeBar}>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="algorithm"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: '#e2e8f0' }}
                            label={{
                                value: 'Time (milliseconds)',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fontSize: 12, fill: '#64748b' },
                                offset: -10
                            }}
                        />
                        <Tooltip content={<AlgorithmTimeTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                            iconSize={8}
                        />
                        <Bar
                            dataKey="avgTime"
                            name="Average Time"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={ALGORITHM_COLORS[entry.rawAlgorithm] || COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Bar>
                        <Bar
                            dataKey="minTime"
                            name="Minimum Time"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                        />
                        <Bar
                            dataKey="maxTime"
                            name="Maximum Time"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    // Time Trend Line Chart (Round by Round)
    const renderTimeTrendChart = () => {
        if (!analyticsData?.roundsData || analyticsData.roundsData.length === 0) return null;

        // Group by algorithm for multiple lines
        const algorithmGroups = {};
        analyticsData.roundsData.forEach(round => {
            const algo = round.algorithm;
            if (!algorithmGroups[algo]) {
                algorithmGroups[algo] = [];
            }
            algorithmGroups[algo].push({
                round: round.round,
                time: Number(round.time) || 0,
                algorithm: algo
            });
        });

        // Prepare data for all rounds
        const maxRound = Math.max(...analyticsData.roundsData.map(r => r.round));
        const trendData = [];
        for (let i = 1; i <= maxRound; i++) {
            const roundData = { round: i };
            Object.keys(algorithmGroups).forEach(algo => {
                const algoRound = algorithmGroups[algo].find(r => r.round === i);
                roundData[algo] = algoRound ? algoRound.time : null;
            });
            trendData.push(roundData);
        }

        return (
            <div ref={activeChartRefs.timeTrend}>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="round"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: '#e2e8f0' }}
                            label={{
                                value: 'Game Round',
                                position: 'insideBottom',
                                offset: -5,
                                style: { fontSize: 12, fill: '#64748b' }
                            }}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: '#e2e8f0' }}
                            label={{
                                value: 'Time (ms)',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fontSize: 12, fill: '#64748b' },
                                offset: -10
                            }}
                        />
                        <Tooltip content={<TimeTrendTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                            iconSize={8}
                        />
                        {Object.keys(algorithmGroups).map((algo, index) => (
                            <Line
                                key={algo}
                                type="monotone"
                                dataKey={algo}
                                name={getAlgorithmDisplayName(algo)}
                                stroke={ALGORITHM_COLORS[algo] || COLORS[index]}
                                strokeWidth={2}
                                dot={{ r: 4, strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                                connectNulls={true}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    };

    // Pie Chart for Time Distribution
    const renderPieChart = () => {
        if (!analyticsData?.roundsData || analyticsData.roundsData.length === 0) return null;

        const algoStats = analyticsData.roundsData.reduce((acc, round) => {
            const algo = round.algorithm || 'UNKNOWN';
            if (!acc[algo]) {
                acc[algo] = {
                    algorithm: algo,
                    totalTime: 0,
                    count: 0,
                    wins: 0
                };
            }
            acc[algo].totalTime += (Number(round.time) || 0);
            acc[algo].count++;
            if (round.correct) acc[algo].wins++;
            return acc;
        }, {});

        const totalTime = Object.values(algoStats).reduce((sum, stat) => sum + stat.totalTime, 0);

        const pieData = Object.values(algoStats).map(stat => ({
            name: getAlgorithmDisplayName(stat.algorithm),
            value: stat.totalTime,
            count: stat.count,
            wins: stat.wins,
            winRate: stat.count > 0 ? ((stat.wins / stat.count) * 100).toFixed(1) : '0.0',
            percentage: totalTime > 0 ? ((stat.totalTime / totalTime) * 100).toFixed(1) : '0.0',
            rawAlgorithm: stat.algorithm
        }));

        return (
            <div ref={activeChartRefs.pieChart}>
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percentage }) => `${name} (${percentage}%)`}
                            labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                        >
                            {pieData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={ALGORITHM_COLORS[entry.rawAlgorithm] || COLORS[index % COLORS.length]}
                                    strokeWidth={2}
                                    stroke="#fff"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<PieChartTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                            iconSize={8}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    };

    // Time Comparison by Round
    const renderTimeComparisonChart = () => {
        if (!analyticsData?.roundsData || analyticsData.roundsData.length === 0) return null;

        const chartData = analyticsData.roundsData.map(round => ({
            ...round,
            time: Number(round.time) || 0
        }));

        return (
            <div ref={activeChartRefs.timeComparison}>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="round"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: '#e2e8f0' }}
                            label={{
                                value: 'Round Number',
                                position: 'insideBottom',
                                offset: -5,
                                style: { fontSize: 12, fill: '#64748b' }
                            }}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: '#e2e8f0' }}
                            label={{
                                value: 'Time (ms)',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fontSize: 12, fill: '#64748b' },
                                offset: -10
                            }}
                        />
                        <Tooltip content={<RoundTimeTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                            iconSize={8}
                        />
                        <Bar
                            dataKey="time"
                            name="Execution Time"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={ALGORITHM_COLORS[entry.algorithm] || COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    // Custom Tooltips
    const AlgorithmTimeTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    minWidth: '250px',
                }}>
                    <p style={{ margin: '0 0 12px 0', fontWeight: '600', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                        {label}
                    </p>
                    <div style={{ display: 'grid', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Average Time:</span>
                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{data.avgTime} ms</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Minimum Time:</span>
                            <span style={{ fontWeight: '600', color: '#10b981' }}>{data.minTime} ms</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Maximum Time:</span>
                            <span style={{ fontWeight: '600', color: '#ef4444' }}>{data.maxTime} ms</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Median Time:</span>
                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{data.medianTime} ms</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Std Deviation:</span>
                            <span style={{ fontWeight: '600', color: '#1e293b' }}>±{data.stdDev} ms</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                            <span style={{ color: '#64748b' }}>Total Rounds:</span>
                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{data.rounds}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Win Rate:</span>
                            <span style={{ fontWeight: '600', color: parseFloat(data.winRate) > 50 ? '#10b981' : '#ef4444' }}>
                                {data.winRate}%
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const TimeTrendTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    minWidth: '200px',
                }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                        Round {label}
                    </p>
                    {payload.map((item, index) => (
                        item.value && (
                            <p key={index} style={{ margin: '4px 0', color: '#64748b', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }}></span>
                                    {item.name}:
                                </span>
                                <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                    {item.value} ms
                                </span>
                            </p>
                        )
                    ))}
                </div>
            );
        }
        return null;
    };

    const RoundTimeTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    minWidth: '200px',
                }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                        Round {label}
                    </p>
                    <p style={{ margin: '4px 0', color: '#64748b', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Algorithm:</span>
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>
                            {getAlgorithmDisplayName(data.algorithm)}
                        </span>
                    </p>
                    <p style={{ margin: '4px 0', color: '#64748b', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Time:</span>
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>
                            {data.time} ms
                        </span>
                    </p>
                    <p style={{ margin: '4px 0', color: '#64748b', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Score:</span>
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>
                            {data.score}/10
                        </span>
                    </p>
                    <p style={{ margin: '4px 0', color: '#64748b', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Result:</span>
                        <span style={{
                            fontWeight: '600',
                            color: data.correct ? '#10b981' : '#ef4444'
                        }}>
                            {data.correct ? '✓ Win' : '✗ Loss'}
                        </span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const PieChartTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    minWidth: '220px',
                }}>
                    <p style={{ margin: '0 0 12px 0', fontWeight: '600', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                        {data.name}
                    </p>
                    <div style={{ display: 'grid', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Total Time:</span>
                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{formatTime(data.value)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Percentage:</span>
                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{data.percentage}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                            <span style={{ color: '#64748b' }}>Total Rounds:</span>
                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{data.count}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Wins:</span>
                            <span style={{ fontWeight: '600', color: '#10b981' }}>{data.wins}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Win Rate:</span>
                            <span style={{ fontWeight: '600', color: parseFloat(data.winRate) > 50 ? '#10b981' : '#ef4444' }}>
                                {data.winRate}%
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Avg Time/Round:</span>
                            <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                {data.count > 0 ? formatTime(Math.round(data.value / data.count)) : '0 ms'}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Utility functions
    const calculateMedian = (numbers) => {
        if (!numbers || numbers.length === 0) return 0;
        const sorted = numbers.slice().sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
        }
        return sorted[middle];
    };

    const calculateStdDev = (numbers) => {
        if (!numbers || numbers.length === 0) return 0;
        const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const squareDiffs = numbers.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
        return Math.round(Math.sqrt(avgSquareDiff));
    };

    const getAlgorithmDisplayName = (algorithm) => {
        const names = {
            'EDMONDS_KARP': 'Edmonds-Karp',
            'DINIC': 'Dinic',
            'BOTH': 'Both'
        };
        return names[algorithm] || algorithm;
    };

    const formatTime = (ms) => {
        if (ms === undefined || ms === null || isNaN(ms) || ms === 0) {
            return '0 ms';
        }
        const numMs = Number(ms);
        if (numMs < 1000) return `${Math.round(numMs)} ms`;
        return `${(numMs / 1000).toFixed(2)} s`;
    };

    // Summary Statistics Card
    const renderSummaryStats = () => {
        if (!analyticsData?.summary) return null;

        const { totalRounds, totalTime, avgTime, wins } = analyticsData.summary;

        // Ensure values are numbers and provide defaults
        const safeTotalRounds = Number(totalRounds) || 0;
        const safeTotalTime = Number(totalTime) || 0;
        const safeAvgTime = Number(avgTime) || 0;
        const safeWins = Number(wins) || 0;

        const winRate = safeTotalRounds > 0 ? ((safeWins / safeTotalRounds) * 100).toFixed(1) : '0.0';

        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '20px',
            }}>
                <StatCard
                    title="Total Rounds"
                    value={safeTotalRounds}
                    icon="🎮"
                    color="#6366f1"
                />
                <StatCard
                    title="Total Time"
                    value={formatTime(safeTotalTime)}
                    icon="⏱️"
                    color="#10b981"
                />
                <StatCard
                    title="Average Time"
                    value={formatTime(safeAvgTime)}
                    icon="📊"
                    color="#f59e0b"
                />
                <StatCard
                    title="Win Rate"
                    value={`${winRate}%`}
                    icon="🏆"
                    color="#ef4444"
                />
            </div>
        );
    };

    const ChartCard = ({ title, children, chartType, chartRef }) => (
        <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #f1f5f9',
            position: 'relative',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span style={{
                        width: '4px',
                        height: '20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '2px',
                    }} />
                    {title}
                </h3>
                {analyticsData && (
                    <button
                        onClick={() => handleExportChart(chartRef, chartType)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#64748b',
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
                        <span>⬇️</span> Export
                    </button>
                )}
            </div>
            {children}
        </div>
    );

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
        }}>
            <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                width: '95%',
                maxWidth: '1400px',
                maxHeight: '90vh',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 28px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>⏱️</span>
                        <div>
                            <h2 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '600' }}>
                                Algorithm Performance Analytics
                            </h2>
                            <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>
                                Analyze algorithm execution times and performance
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: 'none',
                            color: 'white',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                    >
                        ✕
                    </button>
                </div>

                {/* Controls */}
                <div style={{
                    padding: '16px 28px',
                    background: 'white',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                }}>
                    <select
                        value={viewMode}
                        onChange={(e) => {
                            setViewMode(e.target.value);
                            setError(null);
                            setAnalyticsData(null);
                            setHasSearched(false);
                            if (e.target.value === 'all') {
                                setSelectedPlayer('');
                            }
                        }}
                        style={{
                            padding: '8px 32px 8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            fontSize: '13px',
                            cursor: 'pointer',
                            outline: 'none',
                        }}
                    >
                        <option value="individual">👤 Individual Player</option>
                        <option value="all">👥 All Players</option>
                    </select>

                    {viewMode === 'individual' && (
                        <>
                            <input
                                type="text"
                                placeholder="Enter player name"
                                value={selectedPlayer}
                                onChange={(e) => {
                                    setSelectedPlayer(e.target.value);
                                    setAnalyticsData(null);
                                    setHasSearched(false);
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handlePlayerSearch()}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    fontSize: '13px',
                                    outline: 'none',
                                    minWidth: '200px',
                                }}
                            />
                            <button
                                onClick={handlePlayerSearch}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: '#667eea',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    color: 'white',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
                            >
                                Analyze
                            </button>
                        </>
                    )}

                    {viewMode === 'all' && (
                        <button
                            onClick={fetchAnalytics}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '6px',
                                border: 'none',
                                background: '#667eea',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                color: 'white',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#5a67d8'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
                        >
                            Load All Players
                        </button>
                    )}
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    padding: '24px',
                    overflowY: 'auto',
                    background: '#f8fafc',
                }}>
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '400px'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '3px solid #e2e8f0',
                                    borderTopColor: '#6366f1',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 12px',
                                }} />
                                <div style={{ fontSize: '14px', color: '#64748b' }}>Loading analytics data...</div>
                            </div>
                        </div>
                    ) : error && hasSearched ? (
                        <EmptyState message="No Data Available" icon="🔍" subMessage={error} />
                    ) : !analyticsData && !hasSearched ? (
                        <EmptyState
                            message="Search for Player Analytics"
                            icon="📊"
                            subMessage={viewMode === 'individual'
                                ? "Enter a player name and click 'Analyze' to view their performance data."
                                : "Click 'Load All Players' to view analytics for all players."}
                        />
                    ) : analyticsData ? (
                        <>
                            {renderSummaryStats()}

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '20px',
                                marginBottom: '20px',
                            }}>
                                <ChartCard
                                    title="Algorithm Time Comparison"
                                    chartType="algorithm-time-bar"
                                    chartRef={activeChartRefs.algorithmTimeBar}
                                >
                                    {renderAlgorithmTimeBarChart()}
                                </ChartCard>

                                <ChartCard
                                    title="Time Distribution (Pie Chart)"
                                    chartType="pie-chart"
                                    chartRef={activeChartRefs.pieChart}
                                >
                                    {renderPieChart()}
                                </ChartCard>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '20px',
                            }}>
                                <ChartCard
                                    title="Time Trend (Round by Round)"
                                    chartType="time-trend"
                                    chartRef={activeChartRefs.timeTrend}
                                >
                                    {renderTimeTrendChart()}
                                </ChartCard>

                                <ChartCard
                                    title="Per-Round Execution Time"
                                    chartType="time-comparison"
                                    chartRef={activeChartRefs.timeComparison}
                                >
                                    {renderTimeComparisonChart()}
                                </ChartCard>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '12px 28px',
                    borderTop: '1px solid #e2e8f0',
                    background: 'white',
                    fontSize: '12px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <span>
                        {analyticsData
                            ? `📊 Showing data for ${analyticsData.summary?.totalRounds || 0} game rounds`
                            : '📊 Enter player name to view analytics'}
                    </span>
                    <span>💡 Hover over charts for detailed information</span>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        border: '1px solid #f1f5f9',
    }}>
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
        }}>
            {icon}
        </div>
        <div style={{ flex: 1 }}>
            <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#64748b',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
            }}>
                {title}
            </div>
            <div style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1e293b',
                lineHeight: '1.2',
            }}>
                {value}
            </div>
        </div>
    </div>
);

const EmptyState = ({ message, icon = "📊", subMessage }) => (
    <div style={{
        textAlign: 'center',
        padding: '80px 20px',
        color: '#64748b',
        background: 'white',
        borderRadius: '12px',
    }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>{icon}</div>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
            {message}
        </div>
        {subMessage && (
            <div style={{ fontSize: '14px', lineHeight: '1.6', maxWidth: '400px', margin: '0 auto', color: '#94a3b8' }}>
                {subMessage}
            </div>
        )}
    </div>
);

export default Analytics;